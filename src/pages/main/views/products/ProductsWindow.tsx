/**
 * Componente principal para la gestión de productos.
 *
 * @remarks
 * Permite listar, crear, editar y eliminar productos, así como crear ofertas sobre productos.
 * Gestiona el estado de los modales, alertas, formularios y previsualización de imágenes.
 * Incluye lógica para la carga y edición de imágenes, validación de campos y manejo de categorías.
 *
 * @returns La vista de administración de productos.
 */
import { useState, useEffect } from "react";
import { getImageUrlById, uploadImage } from "../../../../services/images/images.service";
import type { UploadImagePayload } from "../../../../services/images/types/UploadImage.type";
import { getProducts, deleteProduct, updateProduct, createProduct, deleteManyProducts } from "../../../../services/products/products.service";
import type { GetProductResponse } from "../../../../services/products/types/GetProducts.type";
import type { UpdateProductPayload } from "../../../../services/products/types/UpdateProduct.type";
import type { CreateProductPayload } from "../../../../services/products/types/CreateProduct.type";
import { ProductActionModal } from "./subcomponents/ProductActionModal";
import { CreateProductModal } from "./subcomponents/CreateProductModal";
import { ProductsTable } from "./subcomponents/ProductsTable";
import { getCategories } from "../../../../services/categories/categories.service";
import type { GetCategoryResponse } from "../../../../services/categories/types/GetCategory.type";
import { createOffer } from "../../../../services/offers/offers.service";
import { OfferModal } from "./subcomponents/OfferModal";
import "./productsWindow.css";
import { ConfirmModal } from "./subcomponents/ConfirmModal";
import type { CreateOfferPayload } from "../../../../services/offers/types/CreateOffer.type";
import ImageModal from "../../../../commons/ImageModal";
import { Alert } from "../../../../commons/Alert";
import imageCompression from "browser-image-compression";

function ProductsWindow() {
  const [products, setProducts] = useState<GetProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState<null | {
    type: "edit" | "delete";
    product: GetProductResponse;
    loading: boolean;
  }>(null);
  const [createModal, setCreateModal] = useState<{
    open: boolean;
    loading: boolean;
    fields: Partial<CreateProductPayload>;
  }>({ open: false, loading: false, fields: {} });

  // Estado para edición rápida (puedes expandirlo según tus necesidades)
  const [editFields, setEditFields] = useState<Partial<GetProductResponse>>({});
  const [categories, setCategories] = useState<GetCategoryResponse[]>([]);

  // Estado para crear oferta
  const [offerModal, setOfferModal] = useState<{
    isOpen: boolean;
    loading: boolean;
    product: GetProductResponse | null;
    newPrice: number | "";
    imageId: string;
    expiration?: string;
    imageUploading: boolean;
  }>({ isOpen: false, loading: false, product: null, newPrice: "", imageId: "", expiration: "", imageUploading: false });

  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);

  const [deleteModal, setDeleteModal] = useState<null | {
    product: GetProductResponse;
    loading: boolean;
  }>(null);
  // Estado para productos seleccionados
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  // Estado para modal de confirmación de eliminación múltiple
  const [deleteManyModal, setDeleteManyModal] = useState<{ open: boolean, loading: boolean }>(
    { open: false, loading: false }
  );

  const fetchProducts = async () => {
    const token = localStorage.getItem("accessToken") || "";
    const res = await getProducts(token);
    if (res.success && res.data) {
      setProducts(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Cargar categorías
    const fetchCategories = async () => {
      const token = localStorage.getItem("accessToken") || "";
      const res = await getCategories(token);
      if (res.success && res.data) {
        setCategories(res.data);
      }
    };
    fetchCategories();
  }, []);

  const handleEdit = (product: GetProductResponse) => {
    setEditFields(product);
    setActionModal({ type: "edit", product, loading: false });
  };

  const handleOpenCreate = () => {
    setCreateModal({ open: true, loading: false, fields: {} });
  };

  const handleCreateChange = (field: keyof CreateProductPayload, value: string | number) => {
    setCreateModal(modal => ({
      ...modal,
      fields: { ...modal.fields, [field]: value }
    }));
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

  // Elimina imageId del estado de createModal.fields, y usa un estado temporal para el archivo seleccionado
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  // Para edición, igual: archivo temporal
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  // NUEVO: estado para saber si está subiendo/comprimiendo imagen en creación
  const [createImageUploading, setCreateImageUploading] = useState(false);
  // NUEVO: estado para saber si está subiendo/comprimiendo imagen en edición
  const [editImageUploading, setEditImageUploading] = useState(false);

  // Cambia la lógica: solo guarda el archivo seleccionado, no sube la imagen aún
  const handleCreateImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCreateImageUploading(true);
      const file = e.target.files[0];
      // Opciones de compresión
      const options = {
        maxSizeMB: 0.1, // Tamaño máximo en MB
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        setCreateImageFile(compressedFile);
      } catch (error) {
        showErrorAlert("Error al comprimir la imagen");
      }
      setCreateImageUploading(false);
    }
  };

  // Para edición, igual
  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageUploading(true);
      const file = e.target.files[0];
      // Opciones de compresión
      const options = {
        maxSizeMB: 0.1, // Tamaño máximo en MB
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

  // Confirmación real de eliminación
  const confirmDelete = async () => {
    if (!deleteModal) return;
    setDeleteModal(modal => modal && { ...modal, loading: true });
    const token = localStorage.getItem("accessToken") || "";
    const res = await deleteProduct(token, { sku: deleteModal.product.sku });
    if (res.success) {
      fetchProducts();
      showSuccessAlert("Producto eliminado correctamente");
    } else {
      showErrorAlert("Error al eliminar producto");
    }
    setDeleteModal(null);
    setActionModal(null);
  };

  // Cambia la lógica de edición: sube la imagen solo si se seleccionó una nueva
  const confirmEdit = async () => {
    if (!actionModal) return;
    setActionModal(modal => modal && { ...modal, loading: true });
    const token = localStorage.getItem("accessToken") || "";
    let imageId = editFields.imageId || actionModal.product.imageId;
    if (editImageFile) {
      try {
        const uploadPayload: UploadImagePayload = { file: editImageFile };
        const response = await uploadImage(token, uploadPayload);
        if (response.data?.imageId) {
          imageId = response.data.imageId;
        } else {
          showErrorAlert("Error al subir la imagen");
          setActionModal(modal => modal && { ...modal, loading: false });
          return;
        }
      } catch {
        showErrorAlert("Error al subir la imagen");
        setActionModal(modal => modal && { ...modal, loading: false });
        return;
      }
    }
    const payload: UpdateProductPayload = {
      sku: editFields.sku || actionModal.product.sku,
      name: editFields.name || actionModal.product.name,
      catalogueName: editFields.catalogueName || actionModal.product.catalogueName,
      isActive: editFields.isActive ?? actionModal.product.isActive,
      units: editFields.units ?? actionModal.product.units,
      categoryId: editFields.categoryId || actionModal.product.categoryId,
      imageId,
      price: editFields.price ?? actionModal.product.price,
    };
    const res = await updateProduct(token, payload);
    if (res.success) {
      fetchProducts();
      showSuccessAlert("Producto editado correctamente");
      setEditImageFile(null);
    } else {
      showErrorAlert("Error al editar producto");
    }
    setActionModal(null);
  };

  const handleCreateProduct = async () => {
    setCreateModal(modal => ({ ...modal, loading: true }));
    const token = localStorage.getItem("accessToken") || "";
    const fields = createModal.fields;
    // Validación básica
    if (!fields.sku || !fields.name || !fields.catalogueName || !fields.units || !fields.categoryId || !createImageFile || !fields.price) {
      showErrorAlert("Completa todos los campos");
      setCreateModal(modal => ({ ...modal, loading: false }));
      return;
    }
    // Subir imagen aquí
    let imageId = "";
    try {
      const uploadPayload: UploadImagePayload = { file: createImageFile };
      const response = await uploadImage(token, uploadPayload);
      if (response.data?.imageId) {
        imageId = response.data.imageId;
      } else {
        showErrorAlert("Error al subir la imagen");
        setCreateModal(modal => ({ ...modal, loading: false }));
        return;
      }
    } catch {
      showErrorAlert("Error al subir la imagen");
      setCreateModal(modal => ({ ...modal, loading: false }));
      return;
    }
    const payload: CreateProductPayload = {
      sku: String(fields.sku),
      name: String(fields.name),
      catalogueName: String(fields.catalogueName),
      units: Number(fields.units),
      categoryId: String(fields.categoryId),
      imageId,
      price: Number(fields.price),
    };
    const res = await createProduct(token, payload);
    if (res.success) {
      showSuccessAlert("Producto creado correctamente");
      setCreateModal({ open: false, loading: false, fields: {} });
      setCreateImageFile(null);
      fetchProducts();
    } else {
      showErrorAlert("Error al crear producto");
      setCreateModal(modal => ({ ...modal, loading: false }));
    }
  };

  // Cambia el botón de eliminar para abrir el modal de confirmación
  const handleDeleteFromEdit = () => {
    if (!actionModal) return;
    setDeleteModal({ product: actionModal.product, loading: false });
  };

  // Funciones para crear oferta
  const handleOpenOffer = (product: GetProductResponse) => {
    setOfferModal({
      isOpen: true,
      loading: false,
      product,
      newPrice: "",
      imageId: "",
      expiration: "",
      imageUploading: false,
    });
  };

  // Cambia la función para crear oferta: sube la imagen antes de crear la oferta
  const handleCreateOffer = async () => {
    if (!offerModal.product || !offerModal.newPrice) {
      showErrorAlert("Completa todos los campos de la oferta");
      return;
    }
    setOfferModal(modal => ({ ...modal, loading: true }));

    // Resolver imageId: usar el de la oferta si existe; si no, usar el del producto
    const resolvedImageId = offerModal.imageId || offerModal.product.imageId || "";
    if (!resolvedImageId) {
      showErrorAlert("Debes subir una imagen, el producto no tiene imagen asociada");
      setOfferModal(modal => ({ ...modal, loading: false }));
      return;
    }

    const token = localStorage.getItem("accessToken") || "";
    const payload: CreateOfferPayload = {
      productSku: offerModal.product.sku,
      imageId: resolvedImageId,
      newPrice: Number(offerModal.newPrice),
    };
    if (offerModal.expiration && offerModal.expiration.trim() !== "") {
      payload.expiration = new Date(offerModal.expiration);
    }
    const res = await createOffer(token, payload);
    if (res.success) {
      showSuccessAlert("Oferta creada correctamente");
      setOfferModal({ isOpen: false, loading: false, product: null, newPrice: "", imageId: "", expiration: "", imageUploading: false });
    } else {
      showErrorAlert("Error al crear oferta");
      setOfferModal(modal => ({ ...modal, loading: false }));
    }
  };

  // Cambia el handler de imagen para la oferta: siempre sube la imagen y guarda el imageId
  const handleOfferImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const token = localStorage.getItem("accessToken") || "";
      setOfferModal(modal => ({ ...modal, imageUploading: true }));
      try {
        // Opciones de compresión
        const options = {
          maxSizeMB: 0.1,
          maxWidthOrHeight: 500,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(e.target.files[0], options);
        const uploadPayload: UploadImagePayload = { file: compressedFile };
        const response = await uploadImage(token, uploadPayload);
        if (response.data?.imageId) {
          setOfferModal(modal => ({
            ...modal,
            imageId: response.data!.imageId,
            imageUploading: false,
          }));
        } else {
          showErrorAlert("Error al subir la imagen");
          setOfferModal(modal => ({ ...modal, imageUploading: false }));
        }
      } catch {
        showErrorAlert("Error al subir la imagen");
        setOfferModal(modal => ({ ...modal, imageUploading: false }));
      }
    }
  };

  // Estado para el modal de imagen
  const [modalImg, setModalImg] = useState<string | null>(null);

  // Handler para seleccionar/deseleccionar productos
  const handleSelectProduct = (sku: string, checked: boolean) => {
    setSelectedProducts(prev =>
      checked ? [...prev, sku] : prev.filter(s => s !== sku)
    );
  };

  // Handler para seleccionar todos los productos mostrados
  const handleSelectAll = (skus: string[], checked: boolean) => {
    setSelectedProducts(checked ? skus : []);
  };

  // Handler para eliminar muchos productos
  const handleDeleteMany = () => {
    setDeleteManyModal({ open: true, loading: false });
  };

  // Confirmación de eliminación múltiple
  const confirmDeleteMany = async () => {
    setDeleteManyModal({ open: true, loading: true });
    const token = localStorage.getItem("accessToken") || "";
    const res = await deleteManyProducts(token, { skus: selectedProducts });
    if (res.success) {
      fetchProducts();
      showSuccessAlert("Productos eliminados correctamente");
      setSelectedProducts([]);
    } else {
      showErrorAlert("Error al eliminar productos");
    }
    setDeleteManyModal({ open: false, loading: false });
  };

  return (
    <div>
      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}
      <Alert type="success" message={successMessage} show={showSuccess} />
      <Alert type="error" message={errorMessage} show={showError} />
      <ProductActionModal
        open={!!actionModal}
        type={actionModal?.type || "edit"}
        loading={actionModal?.loading}
        onCancel={() => { setActionModal(null); setEditImageFile(null); }}
        onConfirm={actionModal?.type === "delete" ? confirmDelete : confirmEdit}
        categories={categories}
        editFields={editFields}
        setEditFields={setEditFields}
        actionModal={actionModal}
        handleDeleteFromEdit={handleDeleteFromEdit}
        onImageChange={handleEditImageChange}
        imageFile={editImageFile}
        imageUploading={editImageUploading} // NUEVO: pasa el estado
      />
      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={!!deleteModal}
        loading={!!deleteModal?.loading}
        title="Confirmar eliminación de producto"
        message={`¿Deseas eliminar el producto "${deleteModal?.product.name}"?`}
        onCancel={() => setDeleteModal(null)}
        onConfirm={confirmDelete}
      />
      {/* Modal de confirmación para eliminar muchos */}
      <ConfirmModal
        isOpen={deleteManyModal.open}
        loading={deleteManyModal.loading}
        title="Eliminar productos seleccionados"
        message={`¿Deseas eliminar ${selectedProducts.length} productos seleccionados?`}
        onCancel={() => setDeleteManyModal({ open: false, loading: false })}
        onConfirm={confirmDeleteMany}
      />
      <OfferModal
        offerModal={offerModal}
        setOfferModal={setOfferModal}
        handleOfferImageChange={handleOfferImageChange}
        handleCreateOffer={handleCreateOffer}
      />
      <CreateProductModal
        open={createModal.open}
        loading={createModal.loading}
        fields={createModal.fields}
        categories={categories}
        onClose={() => { setCreateModal({ ...createModal, open: false }); setCreateImageFile(null); }}
        onChange={handleCreateChange}
        onImageChange={handleCreateImageChange}
        onCreate={handleCreateProduct}
        imageFile={createImageFile}
        imageUploading={createImageUploading}
      />
      <ProductsTable
        products={products}
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
        onOffer={handleOpenOffer}
        getImageUrlById={getImageUrlById}
        onImageClick={setModalImg}
        handleOpenCreate={handleOpenCreate}
        selectedProducts={selectedProducts}
        onSelectProduct={handleSelectProduct}
        onSelectAll={handleSelectAll}
        onDeleteSelected={handleDeleteMany}
      />
    </div>
  );
}

export default ProductsWindow;