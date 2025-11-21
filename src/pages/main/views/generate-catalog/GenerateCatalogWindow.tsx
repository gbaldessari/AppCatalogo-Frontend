/**
 * Componente principal para la generación de catálogos en PDF.
 *
 * @remarks
 * Permite seleccionar imágenes principales, imágenes extra y configurar colores e imágenes de portada/fondo para cada categoría.
 * Gestiona la carga de categorías, la validación de datos y el envío para la generación del catálogo.
 * Muestra alertas de éxito y error, y permite previsualizar imágenes en un modal.
 *
 * @returns La vista de generación de catálogos.
 */
import { useState, useEffect } from "react";
import { createCatalogJob } from "../../../../services/generate-catalog/generate-catalog.service";
import type { GenerateCatalogPayload, CategoryPayload } from "../../../../services/generate-catalog/types/GenerateCatalog.type";
import { getCategories, getCategoriesDesigns } from "../../../../services/categories/categories.service";
import type { GetCategoryResponse } from "../../../../services/categories/types/GetCategory.type";
import { getImageUrlById } from "../../../../services/images/images.service";
import "./generateCatalogWindow.css";
import ImageModal from "../../../../commons/ImageModal";
import MainImagesInput from "./subcomponents/MainImagesInput";
import ExtraImagesInput from "./subcomponents/ExtraImagesInput";
import CategoryConfigTable from "./subcomponents/CategoryConfigTable";
import { Alert } from "../../../../commons/Alert";
import type { GetCategoriesDesigns } from "../../../../services/categories/types/GetCategory.type";

type CategoryPayloadExtended = Omit<CategoryPayload, "frontPage" | "backgroundImage"> & {
  frontPage?: File;
  backgroundImage?: File;
  selected?: boolean;
  frontPageId?: string | null;
  backgroundImageId?: string | null;
};

function GenerateCatalogWindow() {
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [fileName, setFileName] = useState("catalogo");
  const [frontPage, setFrontPage] = useState<File | null>(null);
  const [backPage, setBackPage] = useState<File | null>(null);
  const [extraImages, setExtraImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<GetCategoryResponse[]>([]);
  const [categoriesPayload, setCategoriesPayload] = useState<CategoryPayloadExtended[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [visiblePrices, setVisiblePrices] = useState(true);
  const [visibleOffers, setVisibleOffers] = useState(true);

  const CATEGORY_ORDER_STORAGE_KEY = "generateCatalogCategoryOrder";

  const loadStoredCategoryOrder = (): string[] => {
    try {
      const stored = localStorage.getItem(CATEGORY_ORDER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const persistCategoryOrder = (orderedIds: string[]) => {
    localStorage.setItem(CATEGORY_ORDER_STORAGE_KEY, JSON.stringify(orderedIds));
  };

  const fetchCategories = async () => {
    const token = localStorage.getItem("accessToken") || "";
    if (!token) {
      setCategories([]);
      setCategoriesPayload([]);
      setCategoriesLoading(false);
      return;
    }
    setCategoriesLoading(true);
    const result = await getCategories(token);
    if (result.success && result.data) {
      const storedOrder = loadStoredCategoryOrder();
      const originalPositions = new Map(result.data.map((cat, index) => [cat._id, index]));
      const orderIndex = (id: string) => {
        const storedIndex = storedOrder.indexOf(id);
        return storedIndex === -1 ? storedOrder.length + (originalPositions.get(id) ?? 0) : storedIndex;
      };
      const sortedCategories = [...result.data].sort((a, b) => orderIndex(a._id) - orderIndex(b._id));
      setCategories(sortedCategories);
      const nextPayload = sortedCategories.map(cat => ({
        _id: cat._id,
        color: "#000000",
        frontPage: undefined,
        backgroundImage: undefined,
        selected: false
      }));
      setCategoriesPayload(nextPayload);
      persistCategoryOrder(sortedCategories.map(cat => cat._id));
    } else {
      setCategories([]);
      setCategoriesPayload([]);
    }
    setCategoriesLoading(false);
  };

  // NUEVO: obtener diseños de categorías y actualizar el payload
  const fetchCategoriesDesigns = async () => {
    const token = localStorage.getItem("accessToken") || "";
    const result = await getCategoriesDesigns(token);
    if (result.success && result.data) {
      // Actualiza el payload con los ids de imagen del diseño
      setCategoriesPayload(prev =>
        prev.map(cat => {
          const design = result.data?.find((d: GetCategoriesDesigns) => d._id === cat._id);
          return {
            ...cat,
            color: design?.color || "#000000",
            frontPageId: design?.frontPageId ?? undefined,
            backgroundImageId: design?.backgroundImageId ?? undefined,
          };
        })
      );
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchCategoriesDesigns();
  }, []);

  useEffect(() => {
    if (frontPage) {
      const url = URL.createObjectURL(frontPage);
      setFrontPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFrontPreview(null);
    }
  }, [frontPage]);

  useEffect(() => {
    if (backPage) {
      const url = URL.createObjectURL(backPage);
      setBackPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBackPreview(null);
    }
  }, [backPage]);

  useEffect(() => {
    if (extraImages.length > 0) {
      const urls = extraImages.map(img => URL.createObjectURL(img));
      setExtraPreviews(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    } else {
      setExtraPreviews([]);
    }
  }, [extraImages]);

  const handleCategoryColorTableChange = (categoryId: string, color: string) => {
    setCategoriesPayload(prev =>
      prev.map(c =>
        c._id === categoryId ? { ...c, color } : c
      )
    );
  };

  const handleCategorySelectChange = (categoryId: string, selected: boolean) => {
    setCategoriesPayload(prev =>
      prev.map(c =>
        c._id === categoryId ? { ...c, selected } : c
      )
    );
  };

  // Modifica la función para cambiar imágenes de categoría
  const handleCategoryImageChange = (categoryId: string, type: "frontPage" | "backgroundImage", file: File | undefined) => {
    setCategoriesPayload(prev =>
      prev.map(c =>
        c._id === categoryId
          ? {
              ...c,
              [type]: file,
              // Si el usuario sube una imagen, se ignora el diseño actual
              ...(type === "frontPage" ? { frontPageId: undefined } : { backgroundImageId: undefined }),
            }
          : c
      )
    );
  };

  // Reordenar categorías por índices (arrastra y suelta)
  const handleReorderCategories = (fromIndex: number, toIndex: number) => {
    setCategoriesPayload(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      persistCategoryOrder(next.map(cat => cat._id));
      return next;
    });
    setCategories(prev => {
      if (!prev.length) return prev;
      const next = [...prev];
      const [movedCat] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, movedCat);
      return next;
    });
  };

  const hasSelectedCategoryWithoutAnyImage = categoriesPayload.some(
    c => c.selected && !(c.frontPage || c.frontPageId) && !(c.backgroundImage || c.backgroundImageId)
  );

  const isMainImagesMissing = !frontPage || !backPage;
  const isFileNameMissing = fileName.trim().length === 0;
  // El botón solo se deshabilita si falta el nombre o las imágenes principales
  const generateBtnDisabled = loading || isMainImagesMissing || isFileNameMissing;
  const generateBtnStyle: React.CSSProperties = {
    opacity: generateBtnDisabled ? 0.5 : 1,
    pointerEvents: generateBtnDisabled ? "none" : "auto"
  };

  // Mostrar alerta de éxito
  const showSuccessAlert = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  // Mostrar alerta de error
  const showErrorAlert = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 2000);
  };

  const handleGenerateCatalog = async () => {
    setLoading(true);
    setErrorMessage("");
    setShowError(false);
    setSuccessMessage("");
    setShowSuccess(false);
    try {
      const token = localStorage.getItem("accessToken") || "";
      if (!frontPage || !backPage) {
        showErrorAlert("Por favor selecciona todas las imágenes requeridas.");
        setLoading(false);
        return;
      }
      // Filtra categorías seleccionadas que tengan al menos una imagen (archivo o id) para portada y fondo
      const selectedCategories = categoriesPayload.filter(
        c => c.selected && ((c.frontPage || c.frontPageId) || (c.backgroundImage || c.backgroundImageId))
      );
      if (hasSelectedCategoryWithoutAnyImage) {
        showErrorAlert("Por favor sube o selecciona portada y fondo para cada categoría seleccionada o deselecciona las que no tengan imágenes.");
        setLoading(false);
        return;
      }
      // Construye el payload: si no hay imagen, no la envía
      const payload: GenerateCatalogPayload = {
        fileName,
        frontPage,
        backPage,
        extraImages,
        categoriesPayload: selectedCategories.map(({ _id, color, frontPage, backgroundImage, frontPageId, backgroundImageId }) => {
          const obj: any = { _id, color };
          if (frontPage) obj.frontPage = frontPage;
          else if (frontPageId) obj.frontPage = frontPageId;
          if (backgroundImage) obj.backgroundImage = backgroundImage;
          else if (backgroundImageId) obj.backgroundImage = backgroundImageId;
          return obj;
        }),
        visiblePrices,
        visibleOffers
      };
      const result = await createCatalogJob(token, payload);
      if (!result.success) {
        showErrorAlert(result.error || "Error desconocido");
      } else {
        showSuccessAlert("Petición generada exitosamente!");
      }
    } catch (e) {
      showErrorAlert("Error al generar el catálogo");
    } finally {
      setLoading(false);
    }
  };

  // Ejemplo para obtener la URL de la portada:
  const getFrontPageUrl = (cat: CategoryPayloadExtended) => {
    if (cat.frontPage) {
      return URL.createObjectURL(cat.frontPage);
    }
    if (cat.frontPageId) {
      return getImageUrlById({ imageId: cat.frontPageId });
    }
    return null;
  };
  // Ejemplo para fondo:
  const getBackgroundImageUrl = (cat: CategoryPayloadExtended) => {
    if (cat.backgroundImage) {
      return URL.createObjectURL(cat.backgroundImage);
    }
    if (cat.backgroundImageId) {
      return getImageUrlById({ imageId: cat.backgroundImageId });
    }
    return null;
  };

  return (
    <div className="generate-catalog-main-container">
      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}
      {/* Alertas personalizadas */}
      <Alert
        type="success"
        message={successMessage}
        show={showSuccess}
      />
      <Alert
        type="error"
        message={errorMessage}
        show={showError}
      />
      <div className="filename-card">
        <div className="filename-input-row">
          <label htmlFor="catalog-filename">Nombre del archivo</label>
          <input
            id="catalog-filename"
            type="text"
            className="filename-text-input"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="Ej: catalogo_noviembre"
          />
        </div>
      </div>
      <div className="image-inputs-grid">
        <MainImagesInput
          frontPage={frontPage}
          setFrontPage={f => setFrontPage(f)}
          frontPreview={frontPreview}
          backPage={backPage}
          setBackPage={f => setBackPage(f)}
          backPreview={backPreview}
          setModalImg={setModalImg}
        />
        <ExtraImagesInput
          extraImages={extraImages}
          setExtraImages={setExtraImages}
          extraPreviews={extraPreviews}
          setModalImg={setModalImg}
        />
      </div>
      <CategoryConfigTable
        categories={categories}
        categoriesPayload={categoriesPayload}
        onColorChange={handleCategoryColorTableChange}
        onSelectChange={handleCategorySelectChange}
        onImageChange={handleCategoryImageChange}
        categoriesLoading={categoriesLoading}
        onReorder={handleReorderCategories}
        getFrontPageUrl={getFrontPageUrl}
        getBackgroundImageUrl={getBackgroundImageUrl}
      />
      <div style={{ display: "flex", gap: "32px", marginBottom: 24 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            className="category-color-table-checkbox"
            checked={visiblePrices}
            onChange={e => setVisiblePrices(e.target.checked)}
          />
          Mostrar precios
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            className="category-color-table-checkbox"
            checked={visibleOffers}
            onChange={e => setVisibleOffers(e.target.checked)}
          />
          Mostrar ofertas
        </label>
      </div>
      <button
        onClick={handleGenerateCatalog}
        disabled={generateBtnDisabled}
        className="catalog-submit-btn"
        style={generateBtnStyle}
      >
        {loading ? "Generando..." : "Generar Catálogo PDF"}
      </button>
    </div>
  );
}

export default GenerateCatalogWindow;