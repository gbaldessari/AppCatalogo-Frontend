import { logout } from "../services/auth/auth.service";

/**
 * Maneja el cierre de sesión del usuario.
 */
export const handleLogout = async () => {
  const token = localStorage.getItem("accessToken") || "";
  const response = await logout(token);

  if (response.success) {
    setTimeout(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("firstName");
      localStorage.removeItem("lastName");
      localStorage.removeItem("email");
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("catalogAccess");
      localStorage.removeItem("geoAccess");
      localStorage.removeItem("formAccess");
      window.location.reload();
    }, 2000);
  } else {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
    localStorage.removeItem("email");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("catalogAccess");
    localStorage.removeItem("geoAccess");
    localStorage.removeItem("formAccess");
    window.location.reload();
  }
};