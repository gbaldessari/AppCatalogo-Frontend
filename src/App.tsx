/**
 * Componente principal de la aplicación React.
 *
 * @remarks
 * - Gestiona la autenticación del usuario y el refresco automático de tokens.
 * - Controla la pantalla de carga durante las transiciones de ruta.
 * - Define las rutas principales de la aplicación utilizando React Router.
 */
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Routes, Route } from "react-router-dom";
import LoginWindow from "./pages/login/LoginWindow";
import LoadingScreen from "./commons/LoadingScreen";
import { validateRefreshToken, validateToken } from "./services/auth/auth.service";
import MainWindow from "./pages/main/MainWindow";
import CatalogWelcomeWindow from "./pages/main/views/catalog-welcome/CatalogWelcomeWindow";
import ProductsWindow from "./pages/main/views/products/ProductsWindow";
import CategoriesWindow from "./pages/main/views/categories/CategoriesWindow";
import OffersWindow from "./pages/main/views/offers/OffersWindow";
import GenerateCatalogWindow from "./pages/main/views/generate-catalog/GenerateCatalogWindow";
import BulkUploadWindow from "./pages/main/views/bulk-upload/BulkUploadWindow";
import CatalogsWindow from "./pages/main/views/catalogs/CatalogsWindow";
import HomeWindow from "./pages/home/HomeWindow";
import HomeWelcomeWindow from "./pages/home/views/home-welcome/HomeWelcomeWindow";
import AdminWindow from "./pages/home/views/admin/AdminWindow";
import ResetPasswordWindow from "./pages/reset/ResetPasswordWindow";
import RecoverPasswordWindow from "./pages/recover/RecoverPasswordWindow";
import DeactivateProductsWindow from "./pages/main/views/deactivate-products/DeactivateProductsWindow";
import ActivateProductsWindow from "./pages/main/views/activate-products/ActivateProductsWindow";

/**
 * Componente funcional que representa la aplicación principal.
 * 
 * - Controla la autenticación y el refresco de tokens.
 * - Gestiona la pantalla de carga durante los cambios de ruta.
 * - Define las rutas principales de la aplicación.
 */
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  // Muestra pantalla de carga al cambiar de ruta
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Verifica autenticación y redirige según corresponda
  useEffect(() => {
    const checkAuth = async () => {
      if ((location.pathname === "/login" || location.pathname === "/" ||
        location.pathname === "/recover-password" ||
        location.pathname === "/reset-password") && !localStorage.getItem("accessToken")) {
        return;
      }
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken) {
        const tokenValidation = await validateToken(accessToken);
        if (tokenValidation.success) {
          if (!location.pathname.startsWith("/catalog") && !location.pathname.startsWith("/home")) {
            navigate("/home");
          }
          return;
        }
      }
      if (refreshToken) {
        const refreshValidation = await validateRefreshToken({ refreshToken });
        if (refreshValidation.success) {
          localStorage.setItem("accessToken", refreshValidation.data?.accessToken || "");
          localStorage.setItem("refreshToken", refreshValidation.data?.refreshToken || "");
          if (!location.pathname.startsWith("/catalog") && !location.pathname.startsWith("/home")) {
            navigate("/home");
          }
          return;
        }
        else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      }

      navigate("/login");
    };
    checkAuth();
  }, [navigate, location.pathname]);

  // Programa el refresco automático del token antes de su expiración
  useEffect(() => {
    const scheduleTokenRefresh = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const tokenValidation = await validateToken(accessToken);
        if (tokenValidation.success) {
          const expiresAtStr = tokenValidation.data?.expiresAt;
          const expiresAt = expiresAtStr ? new Date(expiresAtStr).getTime() : 0;
          const now = Date.now();
          const timeUntilExpiration = expiresAt - now;

          if (timeUntilExpiration > 0) {
            setTimeout(async () => {
              const refreshToken = localStorage.getItem("refreshToken");
              if (refreshToken) {
                const refreshValidation = await validateRefreshToken({ refreshToken });
                if (refreshValidation.success) {
                  localStorage.setItem("accessToken", refreshValidation.data?.accessToken || "");
                  localStorage.setItem("refreshToken", refreshValidation.data?.refreshToken || "");
                } else {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                  navigate("/login");
                }
              }
            }, timeUntilExpiration - 60000);
          }
        }
      }
    };

    scheduleTokenRefresh();
  }, [navigate]);

  return (
    <>
      {/* Pantalla de carga durante transiciones */}
      {loading && <LoadingScreen />}
      {/* Definición de rutas principales */}
      <Routes>
        <Route path="/" element={<LoginWindow />} />
        <Route path="/login" element={<LoginWindow />} />
        <Route path="/home/*" element={<HomeWindow />}>
          <Route path="" element={<HomeWelcomeWindow />} />
          <Route path="profile" element={<AdminWindow />} />
        </Route>
        <Route path="/catalog/*" element={<MainWindow />}>
          <Route path="" element={<CatalogWelcomeWindow />} />
          <Route path="products" element={<ProductsWindow />} />
          <Route path="offers" element={<OffersWindow />} />
          <Route path="categories" element={<CategoriesWindow />} />
          <Route path="generate-catalog" element={<GenerateCatalogWindow />} />
          <Route path="bulk-upload" element={<BulkUploadWindow />} />
          <Route path="deactivate-products" element={<DeactivateProductsWindow />} />
          <Route path="activate-products" element={<ActivateProductsWindow />} />
          <Route path="catalogs" element={<CatalogsWindow />} />
        </Route>
        <Route path="/recover-password" element={<RecoverPasswordWindow />} />
        <Route path="/reset-password" element={<ResetPasswordWindow />} />
      </Routes>
    </>
  );
}

export default App;
