/**
 * Componente principal de la ventana de la aplicación.
 *
 * @remarks
 * Gestiona la barra de navegación superior, el cierre de sesión y el renderizado de las vistas hijas mediante Outlet.
 * Muestra una alerta de éxito al cerrar sesión correctamente.
 *
 * @returns La estructura principal de la aplicación tras autenticación.
 */
import "./mainWindow.css";
import { Outlet, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { ProtectedRoute } from "../../commons/ProtectedRoute";
import { handleLogout } from "../../commons/HandleLogout";

function MainWindow() {
  const navigate = useNavigate();

  return (
    <>
      <ProtectedRoute requiresAccess="catalog">
        <div className="main-window">
          {/* Barra superior */}
          <div className="main-navbar">
            <button className="main-logo-button" onClick={() => navigate(-1)}>
              <img src="/assets/LOGO2.png" alt="Logo" className="main-logo" />
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <MdLogout size={30} />
            </button>
          </div>
          <div>
            <Outlet />
          </div>
        </div>
      </ProtectedRoute>
    </>
  );
}

export default MainWindow;
