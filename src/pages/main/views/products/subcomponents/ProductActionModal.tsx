/**
 * Componente modal para editar o eliminar un producto.
 *
 * @remarks
 * Permite editar los campos de un producto, seleccionar una imagen y asociarlo a una categoría,
 * o confirmar su eliminación. Muestra un spinner de carga durante la operación y previsualización de la imagen.
 *
 * @param props - Propiedades del componente.
 * @param props.open - Si el modal está abierto.
 * @param props.type - Tipo de acción ("edit" o "delete").
 * @param props.loading - Estado de carga del botón de confirmación.
 * @param props.onConfirm - Función para confirmar la acción.
 * @param props.onCancel - Función para cancelar la acción.
 * @param props.categories - Lista de categorías disponibles.
 * @param props.editFields - Campos editables del producto.
 * @param props.setEditFields - Setter para los campos editables.
 * @param props.actionModal - Estado del modal (tipo, producto y loading).
 * @param props.handleDeleteFromEdit - Función para eliminar el producto desde la edición.
 * @param props.onImageChange - Handler para el input de imagen.
 * @param props.imageFile - Archivo de imagen seleccionado.
 * @param props.imageUploading - Indica si está subiendo/comprimiendo imagen.
 * @returns El modal de edición/eliminación de producto o null si está cerrado.
 */
import React from "react";
import type { GetProductResponse } from "../../../../../services/products/types/GetProducts.type";
import type { GetCategoryResponse } from "../../../../../services/categories/types/GetCategory.type";

type ProductActionModalProps = {
  open: boolean;
  type: "edit" | "delete";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  categories: GetCategoryResponse[];
  editFields: Partial<GetProductResponse>;
  setEditFields: React.Dispatch<React.SetStateAction<Partial<GetProductResponse>>>;
  actionModal: {
    type: "edit" | "delete";
    product: GetProductResponse;
    loading: boolean;
  } | null;
  handleDeleteFromEdit: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageFile: File | null;
  imageUploading?: boolean; // NUEVO: indica si está subiendo/comprimiendo imagen
};

export const ProductActionModal: React.FC<ProductActionModalProps> = ({
  open,
  type,
  loading = false,
  onConfirm,
  onCancel,
  categories,
  editFields,
  setEditFields,
  actionModal,
  handleDeleteFromEdit,
  onImageChange,
  imageFile,
  imageUploading = false, // por defecto false
}) => {
  // Vista previa de imagen
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [imageFile]);

  if (!open || !actionModal) return null;
  let title = "";
  let message = "";
  if (type === "edit") {
    title = "Edición de producto";
  } else if (type === "delete") {
    title = "Eliminación de producto";
    message = "¿Deseas eliminar este producto?";
  }
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal admin-modal">
        <h2>{title}</h2>
        {type === "delete" && <p>{message}</p>}
        {type === "edit" && (
          <div style={{ margin: "16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="text"
              value={editFields.name ?? actionModal.product.name}
              onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
              placeholder="Nombre"
            />
            <input
              type="text"
              value={editFields.sku ?? actionModal.product.sku}
              onChange={e => setEditFields(f => ({ ...f, sku: e.target.value }))}
              placeholder="SKU"
            />
            <input
              type="text"
              value={editFields.catalogueName ?? actionModal.product.catalogueName}
              onChange={e => setEditFields(f => ({ ...f, catalogueName: e.target.value }))}
              placeholder="Catálogo"
            />
            <input
              type="number"
              value={editFields.units ?? actionModal.product.units}
              onChange={e => setEditFields(f => ({ ...f, units: Number(e.target.value) }))}
              placeholder="Unidades"
            />
            <select
              value={editFields.categoryId ?? actionModal.product.categoryId}
              onChange={e => setEditFields(f => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              value={editFields.price ?? actionModal.product.price}
              onChange={e => setEditFields(f => ({ ...f, price: Number(e.target.value) }))}
              placeholder="Precio"
            />
            <label className="file-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={onImageChange}
                style={{ display: "none" }}
                disabled={imageUploading}
              />
              <span className="file-upload-btn" style={{ position: "relative" }}>
                {imageUploading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="spinner" style={{ marginRight: 8 }}>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    {imageFile ? "Cambiando imagen..." : "Subiendo imagen..."}
                  </span>
                ) : (
                  imageFile ? "Cambiar imagen" : "Elegir imagen"
                )}
              </span>
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0" }}>
              {imageFile && previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    style={{ maxWidth: 90, maxHeight: 90, border: "1px solid #e1e1e1", borderRadius: 4 }}
                  />
                </>
              ) : (editFields.imageId || actionModal.product.imageId) ? (
                <>
                  <img
                    src={`${import.meta.env.VITE_BACK_URL}/images/get-by-id?imageId=${editFields.imageId || actionModal.product.imageId}`}
                    alt="Imagen actual"
                    style={{ maxWidth: 90, maxHeight: 90, border: "1px solid #e1e1e1", borderRadius: 4 }}
                  />
                </>
              ) : null}
            </div>
            <label>
              <input
                type="checkbox"
                checked={editFields.isActive ?? actionModal.product.isActive}
                onChange={e => setEditFields(f => ({ ...f, isActive: e.target.checked }))}
              />
              Activo
            </label>
            <div className="modal-actions modal-confirm-actions" style={{ marginTop: 10 }}>
              <button
                style={{ background: "#e74c3c", color: "#fff" }}
                className="submit-button"
                onClick={handleDeleteFromEdit}
                disabled={loading}
                type="button"
              >
                Eliminar
              </button>
              <button
                className={loading ? "submit-button loading" : "submit-button"}
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className={loading ? "submit-button loading" : "submit-button"}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                ) : "Confirmar"}
              </button>
            </div>
          </div>
        )}
        {type === "delete" && (
          <div className="modal-actions modal-confirm-actions">
            <button
              className={loading ? "submit-button loading" : "submit-button"}
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              className={loading ? "submit-button loading" : "submit-button"}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className="spinner">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              ) : "Confirmar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
