/**
 * Componente modal de confirmación para acciones críticas sobre productos.
 *
 * @remarks
 * Muestra un modal para confirmar o cancelar una acción, con estado de carga y mensajes personalizados.
 *
 * @param props - Propiedades del componente.
 * @param props.isOpen - Si el modal está abierto.
 * @param props.loading - Estado de carga del botón de confirmación.
 * @param props.title - Título del modal.
 * @param props.message - Mensaje del modal.
 * @param props.onCancel - Función para cancelar la acción.
 * @param props.onConfirm - Función para confirmar la acción.
 * @returns El modal de confirmación o null si está cerrado.
 */
import React from "react";

type ConfirmModalProps = {
  isOpen: boolean;
  loading?: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  loading = false,
  title,
  message,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="modal admin-modal">
        <h2>{title}</h2>
        <p>{message}</p>
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
      </div>
    </div>
  );
};
