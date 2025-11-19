/**
 * Componente para registrar un nuevo usuario administrador.
 *
 * @remarks
 * Renderiza un formulario controlado para ingresar email, nombre, apellido y contraseña,
 * mostrando un botón con spinner de carga durante el registro.
 *
 * @param props - Propiedades del componente.
 * @param props.registerForm - Estado del formulario de registro.
 * @param props.setRegisterForm - Setter para el formulario.
 * @param props.loading - Estado de carga del botón.
 * @param props.onRegister - Función para registrar el usuario.
 * @returns El formulario de registro de usuario administrador.
 */
import type { MouseEvent } from "react";

export function RegisterAdminSection({
  registerForm,
  setRegisterForm,
  loading,
  onRegister,
  isOpen,
  onOpenModal,
  onCloseModal,
}: {
  registerForm: { email: string; firstName: string; lastName: string; password: string };
  setRegisterForm: (f: (prev: any) => any) => void;
  loading: boolean;
  onRegister: () => void;
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
        <h2>Registrar Nuevo Usuario</h2>
        <p className="admin-action-description">
          Completa los datos básicos para crear un nuevo acceso administrativo.
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
            <h3>Registro de usuario</h3>
            <div className="admin-modal-form">
              <div className="admin-modal-field">
                <label>Email</label>
                <input
                  type="text"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, email: e.target.value }))}
                  className="admin-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div className="admin-modal-field">
                <label>Nombre</label>
                <input
                  type="text"
                  value={registerForm.firstName}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, firstName: e.target.value }))}
                  className="admin-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div className="admin-modal-field">
                <label>Apellido</label>
                <input
                  type="text"
                  value={registerForm.lastName}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, lastName: e.target.value }))}
                  className="admin-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
              </div>
              <div className="admin-modal-field">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm((f) => ({ ...f, password: e.target.value }))}
                  className="admin-minimal-input"
                  autoComplete="off"
                  disabled={loading}
                />
                <span className="admin-modal-note">
                  La contraseña debe cumplir las mismas reglas de seguridad del sistema.
                </span>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={onCloseModal} disabled={loading}>
                Cancelar
              </button>
              <button
                className={`submit-button ${loading ? "loading" : ""}`}
                onClick={onRegister}
                disabled={loading}
              >
                {loading ? (
                  <div className="spinner">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                ) : (
                  "Registrar usuario"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}