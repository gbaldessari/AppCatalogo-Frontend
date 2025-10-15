import type { JSX } from "react";

/**
 * Componente de formulario de inicio de sesión.
 *
 * @remarks
 * Renderiza campos controlados para email y contraseña, y un botón de envío con spinner de carga.
 *
 * @param props - Propiedades del componente.
 * @param props.email - Valor del campo email.
 * @param props.setEmail - Setter para el campo email.
 * @param props.password - Valor del campo contraseña.
 * @param props.setPassword - Setter para el campo contraseña.
 * @param props.loading - Indica si el formulario está en estado de carga.
 * @param props.handleSubmit - Función para manejar el envío del formulario.
 * @returns El formulario de login.
 */
export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  handleSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  handleSubmit: () => void;
}): JSX.Element {
  return (
    <div className="login-form">
      {/* Campo de email */}
      <input className="login-form-input"
        type="text"
        value={email}
        placeholder="Ingrese su email"
        onChange={(e) => setEmail(e.target.value)}
      />
      {/* Campo de contraseña */}
      <input className="login-form-input"
        type="password"
        value={password}
        placeholder="Ingrese su contraseña"
        onChange={(e) => setPassword(e.target.value)}
      />
      {/* Botón de envío con spinner si loading */}
      <button
        className={`login-submit-button ${loading ? "loading" : ""}`}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <div className="login-spinner">
            <div className="login-dot"></div>
            <div className="login-dot"></div>
            <div className="login-dot"></div>
          </div>
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </div>
  );
}