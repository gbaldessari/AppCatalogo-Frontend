/**
 * Componente de ventana de inicio de sesión.
 *
 * @remarks
 * Renderiza la ventana de login, valida los campos de email y contraseña,
 * muestra alertas de error o éxito y gestiona el flujo de autenticación y navegación.
 *
 * @component
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./loginWindow.css";
import { login } from "../../services/auth/auth.service";
import { z } from "zod";
import { Alert } from "../../commons/Alert";
import { LoginForm } from "./subcomponents/LoginForm";

// Esquemas de validación para email y contraseña usando Zod
const emailSchema = z.string().email("Por favor, ingrese un correo electrónico válido.");
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(16, "La contraseña no puede tener más de 16 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");

/**
 * LoginWindow
 * 
 * Componente principal para el inicio de sesión de usuarios.
 * Gestiona el estado de los campos, validación, alertas y navegación.
 */
function LoginWindow() {
  // Estados para los campos y alertas
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Maneja el envío del formulario de login.
   * Valida los campos y realiza la autenticación.
   */
  const handleSubmit = async () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors?.[0]?.message || "Datos inválidos.");
      } else {
        setError("Datos inválidos.");
      }
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setLoading(true);
    setShowError(false);

    const response = await login({ email, password });

    if (response.success) {
      setSuccess("Inicio de sesión exitoso.");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        localStorage.setItem("accessToken", response.data?.accessToken || "");
        localStorage.setItem("refreshToken", response.data?.refreshToken || "");
        localStorage.setItem("firstName", response.data?.firstName || "");
        localStorage.setItem("lastName", response.data?.lastName || "");
        localStorage.setItem("email", email);
        localStorage.setItem("isAdmin", response.data?.isAdmin ? "true" : "false");
        // Guardar permisos de aplicaciones
        localStorage.setItem("catalogAccess", response.data?.appAccess?.catalog ? "true" : "false");
        localStorage.setItem("geoAccess", response.data?.appAccess?.geo ? "true" : "false");
        localStorage.setItem("formAccess", response.data?.appAccess?.form ? "true" : "false");
        navigate("/home");
        setLoading(false);
      }, 2000);
    } else {
      console.error(response.error);
      setShowError(true);
      setError("Error al iniciar sesión.");
      setTimeout(() => setShowError(false), 2000);
      setLoading(false);
    }
  };

  /**
   * Navega a la pantalla de recuperación de contraseña.
   */
  const handleRecoverPassword = () => {
    navigate("/recover-password");
  };

  return (
    <div>
      {/* Alertas de error y éxito */}
      <Alert type="error" message={error} show={showError} />
      <Alert type="success" message={success} show={showSuccess} />
      {/* Logo de la aplicación */}
      <img
        src="assets/LOGO2.png"
        alt="Logo"
        className="logo"
      />
      <div className="login-window">
        {/* Formulario de login */}
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          handleSubmit={handleSubmit}
        />
        {/* Botón para recuperar contraseña */}
        <button className="recover-password" onClick={handleRecoverPassword}>
          Recuperar Contraseña
        </button>
      </div>
    </div>
  );
}

export default LoginWindow;