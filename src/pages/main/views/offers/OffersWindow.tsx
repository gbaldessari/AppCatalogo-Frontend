/**
 * Componente principal para la gestión de ofertas.
 *
 * @remarks
 * Permite listar, editar y eliminar ofertas, mostrando una tabla con filtros, ordenamiento y previsualización de imágenes.
 * Gestiona el estado de los modales, alertas y filtros.
 *
 * @returns La vista de administración de ofertas.
 */
import { useEffect, useState, useMemo } from "react";
import { getOffer, deleteOffer, updateOffer } from "../../../../services/offers/offers.service";
import { getProducts } from "../../../../services/products/products.service";
import { getCategories } from "../../../../services/categories/categories.service";
import { getImageUrlById } from "../../../../services/images/images.service";
import type { GetOfferResponse } from "../../../../services/offers/types/GetOffers.type";
import type { GetProductResponse } from "../../../../services/products/types/GetProducts.type";
import type { GetCategoryResponse } from "../../../../services/categories/types/GetCategory.type";
import type { DeleteOfferPayload } from "../../../../services/offers/types/DeleteOffer.type";
import type { UpdateOfferPayload } from "../../../../services/offers/types/UpdateOffer.type";
import { Alert } from "../../../../commons/Alert";
import "./offersWindow.css";
import { EditDeleteOfferModal } from "./subcomponents/EditDeleteOfferModal";
import { OffersTable } from "./subcomponents/OffersTable";
import ImageModal from "../../../../commons/ImageModal";
import imageCompression from "browser-image-compression";

type ModalState = null | {
  type: "edit" | "delete";
  offer: GetOfferResponse;
  loading: boolean;
};

type SortField =
  | "productSku"
  | "productName"
  | "catalogueName"
  | "categoryName"
  | "newPrice"
  | "expiration";

type SortDirection = "asc" | "desc";

export default function OffersWindow() {
  const [offers, setOffers] = useState<GetOfferResponse[]>([]);
  const [products, setProducts] = useState<GetProductResponse[]>([]);
  const [categories, setCategories] = useState<GetCategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [editFields, setEditFields] = useState<Partial<GetOfferResponse>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [filters, setFilters] = useState<Record<SortField, string>>({
    productSku: "",
    productName: "",
    catalogueName: "",
    categoryName: "",
    newPrice: "",
    expiration: "",
  });
  const [sortField, setSortField] = useState<SortField>("productSku");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImageUploading, setEditImageUploading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("accessToken") || "";
      const [offersRes, productsRes, categoriesRes] = await Promise.all([
        getOffer(token),
        getProducts(token),
        getCategories(token),
      ]);
      if (offersRes.success && offersRes.data) setOffers(offersRes.data);
      if (productsRes.success && productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.success && categoriesRes.data) setCategories(categoriesRes.data);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleEdit = (offer: GetOfferResponse) => {
    setEditFields(offer);
    setModal({ type: "edit", offer, loading: false });
  };

  const handleDelete = (offer: GetOfferResponse) => {
    setModal({ type: "delete", offer, loading: false });
  };

  const showSuccessAlert = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const showErrorAlert = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 2000);
  };

  const confirmEdit = async () => {
    if (!modal) return;
    setModal(m => m && { ...m, loading: true });
    const token = localStorage.getItem("accessToken") || "";
    const payload: UpdateOfferPayload = {
      productSku: editFields.productSku || modal.offer.productSku,
      imageId: editFields.imageId || modal.offer.imageId,
      newPrice: editFields.newPrice ?? modal.offer.newPrice,
      expiration: editFields.expiration || modal.offer.expiration,
    };
    const res = await updateOffer(token, payload);
    if (res.success) {
      setOffers(offers.map(o => o._id === modal.offer._id ? { ...o, ...payload } : o));
      showSuccessAlert("Oferta editada correctamente");
    } else {
      showErrorAlert("Error al editar oferta");
    }
    setModal(null);
  };

  const confirmDelete = async () => {
    if (!modal) return;
    setModal(m => m && { ...m, loading: true });
    const token = localStorage.getItem("accessToken") || "";
    const payload: DeleteOfferPayload = { productSku: modal.offer.productSku };
    const res = await deleteOffer(token, payload);
    if (res.success) {
      setOffers(offers.filter(o => o._id !== modal.offer._id));
      showSuccessAlert("Oferta eliminada correctamente");
    } else {
      showErrorAlert("Error al eliminar oferta");
    }
    setModal(null);
  };

  const filteredOffers = useMemo(() => {
    let mapped = offers.map(o => {
      const prod = products.find(p => p.sku === o.productSku);
      const cat = prod ? categories.find(c => c._id === prod.categoryId) : undefined;
      return {
        ...o,
        productName: prod?.name || "",
        catalogueName: prod?.catalogueName || "",
        categoryName: cat?.name || "",
      };
    });
    mapped = mapped.filter(o =>
      (!filters.productSku || o.productSku.toLowerCase().includes(filters.productSku.toLowerCase())) &&
      (!filters.productName || o.productName.toLowerCase().includes(filters.productName.toLowerCase())) &&
      (!filters.catalogueName || o.catalogueName.toLowerCase().includes(filters.catalogueName.toLowerCase())) &&
      (!filters.categoryName || o.categoryName.toLowerCase().includes(filters.categoryName.toLowerCase())) &&
      (!filters.newPrice || String(o.newPrice).includes(filters.newPrice)) &&
      (!filters.expiration || (o.expiration ? String(o.expiration).toLowerCase().includes(filters.expiration.toLowerCase()) : false))
    );
    mapped = [...mapped].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];
      if (sortField === "newPrice") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === "expiration") {
        aValue = aValue ? String(aValue) : "";
        bValue = bValue ? String(bValue) : "";
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return mapped;
  }, [offers, products, categories, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilterChange = (field: SortField, value: string) => {
    setFilters(f => ({ ...f, [field]: value }));
  };

  // Handler para input de imagen en edición de oferta (con animación de carga)
  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageUploading(true);
      const file = e.target.files[0];
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        setEditImageFile(compressedFile);
      } catch (error) {
        showErrorAlert("Error al comprimir la imagen");
      }
      setEditImageUploading(false);
    }
  };

  return (
    <div>
      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}
      <Alert type="success" message={successMessage} show={showSuccess} />
      <Alert type="error" message={errorMessage} show={showError} />
      <EditDeleteOfferModal
        modal={modal}
        editFields={editFields}
        setEditFields={setEditFields}
        onClose={() => setModal(null)}
        onEdit={confirmEdit}
        onDelete={confirmDelete}
        imageFile={editImageFile}
        imageUploading={editImageUploading}
        onImageChange={handleEditImageChange}
      />
      <OffersTable
        offers={filteredOffers}
        loading={loading}
        filters={filters}
        onFilterChange={handleFilterChange}
        sortField={sortField}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getImageUrlById={getImageUrlById}
        onImageClick={setModalImg}
      />
    </div>
  );
}
