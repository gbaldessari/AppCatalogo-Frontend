/**
 * Componente modal para editar o eliminar una categoría.
 *
 * @remarks
 * Permite editar el nombre de una categoría o confirmar su eliminación, mostrando un spinner de carga durante la operación.
 *
 * @param props - Propiedades del componente.
 * @param props.modal - Estado del modal (tipo, categoría y loading).
 * @param props.editFields - Campos editables de la categoría.
 * @param props.setEditFields - Setter para los campos editables.
 * @param props.onClose - Función para cerrar el modal.
 * @param props.onEdit - Función para editar la categoría.
 * @param props.onDelete - Función para eliminar la categoría.
 * @returns El modal de edición/eliminación de categoría o null si está cerrado.
 */
import React from "react";
import type { GetCategoryResponse } from "../../../../../services/categories/types/GetCategory.type";

type ModalState = null | {
  type: "edit" | "delete";
  category: GetCategoryResponse;
  loading: boolean;
};

type EditDeleteCategoryModalProps = {
  modal: ModalState;
  editFields: Partial<GetCategoryResponse>;
  setEditFields: React.Dispatch<React.SetStateAction<Partial<GetCategoryResponse>>>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

export const EditDeleteCategoryModal: React.FC<EditDeleteCategoryModalProps> = ({
  modal,
  editFields,
  setEditFields,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!modal) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal admin-modal">
        <h2>
          {modal.type === "edit" ? "Editar Categoría" : "Eliminar Categoría"}
        </h2>
        {modal.type === "edit" ? (
          <input
            type="text"
            value={editFields.name ?? modal.category.name}
            onChange={e => setEditFields(f => ({ ...f, name: e.target.value }))}
            style={{ marginBottom: 12 }}
          />
        ) : (
          <>
            <p>¿Deseas eliminar la categoría "{modal.category.name}"?</p>
            <p>Esto eliminara permanentemente la categoría y los productos asociados.</p>
          </>
        )}
        <div className="modal-actions modal-confirm-actions">
          <button className={modal.loading ? "submit-button loading" : "submit-button"} onClick={onClose} disabled={modal.loading}>Cancelar</button>
          <button
            className={modal.loading ? "submit-button loading" : "submit-button"}
            onClick={modal.type === "edit" ? onEdit : onDelete}
            disabled={modal.loading}
          >
            {modal.loading ? (
              <div className="spinner">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            ) : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};
