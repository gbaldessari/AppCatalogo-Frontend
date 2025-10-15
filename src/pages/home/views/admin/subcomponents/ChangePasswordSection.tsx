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
export function ChangePasswordSection({
  currentPassword,
  newPassword,
  setCurrentPassword,
  setNewPassword,
  loading,
  onChangePassword,
}: {
  currentPassword: string;
  newPassword: string;
  setCurrentPassword: (v: string) => void;
  setNewPassword: (v: string) => void;
  loading: boolean;
  onChangePassword: () => void;
}) {
  return (
    <div className="admin-minimal-section">
      <h2>Cambiar Contraseña</h2>
      <div className="admin-minimal-row">
        <label>Contraseña Actual:</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="admin-minimal-input"
          autoComplete="off"
        />
      </div>
      <div className="admin-minimal-row">
        <label>Nueva Contraseña:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="admin-minimal-input"
          autoComplete="off"
        />
      </div>
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
          "Cambiar Contraseña"
        )}
      </button>
    </div>
  );
}