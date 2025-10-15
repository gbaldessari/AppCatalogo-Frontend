/**
 * Componente modal para crear una nueva categoría.
 *
 * @remarks
 * Permite ingresar el nombre de la categoría y muestra un spinner de carga durante la creación.
 *
 * @param props - Propiedades del componente.
 * @param props.open - Si el modal está abierto.
 * @param props.loading - Estado de carga del botón.
 * @param props.name - Valor del campo nombre.
 * @param props.onClose - Función para cerrar el modal.
 * @param props.onChange - Setter para el nombre de la categoría.
 * @param props.onCreate - Función para crear la categoría.
 * @returns El modal de creación de categoría o null si está cerrado.
 */
import React from "react";

type CreateCategoryModalProps = {
  open: boolean;
  loading: boolean;
  name: string;
  onClose: () => void;
  onChange: (name: string) => void;
  onCreate: () => void;
};

export const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  open,
  loading,
  name,
  onClose,
  onChange,
  onCreate,
}) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal admin-modal">
        <h2>Crear Categoría</h2>
        <input
          placeholder="Nombre"
          value={name}
          onChange={e => onChange(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <div className="modal-actions modal-confirm-actions">
          <button className={loading ? "submit-button loading" : "submit-button"} onClick={onClose} disabled={loading}>Cancelar</button>
          <button className={loading ? "submit-button loading" : "submit-button"} onClick={onCreate} disabled={loading}>
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
