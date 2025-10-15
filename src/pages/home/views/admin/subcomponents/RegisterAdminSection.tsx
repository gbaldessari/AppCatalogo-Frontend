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
export function RegisterAdminSection({
  registerForm,
  setRegisterForm,
  loading,
  onRegister,
}: {
  registerForm: { email: string; firstName: string; lastName: string; password: string };
  setRegisterForm: (f: (prev: any) => any) => void;
  loading: boolean;
  onRegister: () => void;
}) {
  return (
    <div className="admin-minimal-section">
      <h2>Registrar Nuevo Usuario</h2>
      <div className="admin-minimal-row">
        <label>Email:</label>
        <input
          type="text"
          value={registerForm.email}
          onChange={(e) => setRegisterForm(f => ({ ...f, email: e.target.value }))}
          className="admin-minimal-input"
          autoComplete="off"
        />
      </div>
      <div className="admin-minimal-row">
        <label>Nombre:</label>
        <input
          type="text"
          value={registerForm.firstName}
          onChange={(e) => setRegisterForm(f => ({ ...f, firstName: e.target.value }))}
          className="admin-minimal-input"
          autoComplete="off"
        />
      </div>
      <div className="admin-minimal-row">
        <label>Apellido:</label>
        <input
          type="text"
          value={registerForm.lastName}
          onChange={(e) => setRegisterForm(f => ({ ...f, lastName: e.target.value }))}
          className="admin-minimal-input"
          autoComplete="off"
        />
      </div>
      <div className="admin-minimal-row">
        <label>Contraseña:</label>
        <input
          type="password"
          value={registerForm.password}
          onChange={(e) => setRegisterForm(f => ({ ...f, password: e.target.value }))}
          className="admin-minimal-input"
          autoComplete="off"
        />
      </div>
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
          "Registrar Usuario"
        )}
      </button>
    </div>
  );
}