/**
 * Componente para cambiar la contraseña del usuario.
 *
 * @remarks
 * Permite al usuario ingresar su contraseña actual y una nueva contraseña, mostrando un botón con spinner de carga.
 *
 * @param props - Propiedades del componente.
 * @param props.currentPassword - Contraseña actual.
 * @param props.newPassword - Nueva contraseña.
 * @param props.setCurrentPassword - Setter para la contraseña actual.
 * @param props.setNewPassword - Setter para la nueva contraseña.
 * @param props.loading - Estado de carga del botón.
 * @param props.onChangePassword - Función para cambiar la contraseña.
 * @returns El formulario para cambiar la contraseña.
 */
import type { MouseEvent } from "react";

export function ChangePasswordSection({
  currentPassword,
  newPassword,
  setCurrentPassword,
  setNewPassword,
  loading,
  onChangePassword,
  isOpen,
  onOpenModal,
  onCloseModal,
}: {
  currentPassword: string;
  newPassword: string;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  loading: boolean;
  onChangePassword: () => void;
  isOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
}) {
  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !loading) {
      onCloseModal();
    }
  };

  return (
    <>
      <div className="admin-minimal-section">
        <h2>Cambiar Contraseña</h2>
        <p className="admin-action-description">
          Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
        </p>
        <button
          className="submit-button admin-action-trigger"
          onClick={onOpenModal}
          disabled={loading}
        >
          Abrir formulario
        </button>
      </div>

      {isOpen && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal admin-modal">
            <h3>Actualizar contraseña</h3>
            <div className="admin-modal-form">
              <div className="admin-modal-field">
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="admin-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div className="admin-modal-field">
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="admin-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
                <span className="admin-modal-note">
                  Debe tener 8-16 caracteres e incluir letras y números.
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={onCloseModal} disabled={loading}>
                Cancelar
              </button>
              <button
                className={`submit-button ${loading ? "loading" : ""}`}
                onClick={onChangePassword}
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                ) : (
                  "Cambiar contraseña"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}