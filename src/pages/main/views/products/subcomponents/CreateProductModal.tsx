/**
 * Componente modal para crear un nuevo producto.
 *
 * @remarks
 * Permite ingresar los datos de un producto, seleccionar una imagen y asociarlo a una categoría.
 * Muestra un spinner de carga durante la creación y una previsualización de la imagen seleccionada.
 *
 * @param props - Propiedades del componente.
 * @param props.open - Si el modal está abierto.
 * @param props.loading - Estado de carga del botón.
 * @param props.fields - Campos del formulario de producto.
 * @param props.categories - Lista de categorías disponibles.
 * @param props.onClose - Función para cerrar el modal.
 * @param props.onChange - Setter para los campos del producto.
 * @param props.onImageChange - Handler para el input de imagen.
 * @param props.onCreate - Función para crear el producto.
 * @param props.imageFile - Archivo de imagen seleccionado.
 * @param props.imageUploading - Indica si está subiendo/comprimiendo imagen.
 * @returns El modal de creación de producto o null si está cerrado.
 */
import React from "react";
import type { CreateProductPayload } from "../../../../../services/products/types/CreateProduct.type";
import type { GetCategoryResponse } from "../../../../../services/categories/types/GetCategory.type";

type CreateProductModalProps = {
  open: boolean;
  loading: boolean;
  fields: Partial<CreateProductPayload>;
  categories: GetCategoryResponse[];
  onClose: () => void;
  onChange: (field: keyof CreateProductPayload, value: string | number) => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreate: () => void;
  imageFile: File | null;
  imageUploading?: boolean; // NUEVO: indica si está subiendo/comprimiendo imagen
};

export const CreateProductModal: React.FC<CreateProductModalProps> = ({
  open,
  loading,
  fields,
  categories,
  onClose,
  onChange,
  onImageChange,
  onCreate,
  imageFile,
  imageUploading = false, // por defecto false
}) => {
  // Vista previa de la imagen seleccionada
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

  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal admin-modal">
        <h2>Crear Producto</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input placeholder="SKU" value={fields.sku || ""} onChange={e => onChange("sku", e.target.value)} />
          <input placeholder="Nombre" value={fields.name || ""} onChange={e => onChange("name", e.target.value)} />
          <input placeholder="Catálogo" value={fields.catalogueName || ""} onChange={e => onChange("catalogueName", e.target.value)} />
          <input placeholder="Unidades" type="number" value={fields.units || ""} onChange={e => onChange("units", Number(e.target.value))} />
          <select
            value={fields.categoryId || ""}
            onChange={e => onChange("categoryId", e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
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
                  {imageFile ? "Cambiando imagen..." : "Subiendo imagen..."}
                </span>
              ) : (
                imageFile ? "Cambiar imagen" : "Elegir imagen"
              )}
            </span>
          </label>
          {imageFile && previewUrl && (
            <img
              src={previewUrl}
              alt="Vista previa"
              style={{ maxWidth: 120, maxHeight: 120, margin: "8px 0" }}
            />
          )}
          <input placeholder="Precio" type="number" value={fields.price || ""} onChange={e => onChange("price", Number(e.target.value))} />
        </div>
        <div className="modal-actions modal-confirm-actions" style={{ marginTop: 16 }}>
          <button className={loading ? "submit-button loading" : "submit-button"} onClick={onClose} disabled={loading}>Cancelar</button>
          <button className={loading ? "submit-button loading" : "submit-button"} onClick={onCreate} disabled={loading || !imageFile}>
            {loading ? (
              <div className="spinner">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            ) : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
};
