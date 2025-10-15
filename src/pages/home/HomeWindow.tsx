/**
 * Componente principal de la ventana de la aplicación.
 *
 * @remarks
 * Gestiona la barra de navegación superior, el cierre de sesión y el renderizado de las vistas hijas mediante Outlet.
 * Muestra una alerta de éxito al cerrar sesión correctamente.
 *
 * @returns La estructura principal de la aplicación tras autenticación.
 */
import "./homeWindow.css";
import { Outlet, useNavigate } from "react-router-dom";
import { MdLogout } from "react-icons/md";
import { handleLogout } from "../../commons/HandleLogout";

function HomeWindow() {
  const navigate = useNavigate();

  return (
    <>
      <div className="home-window">
        {/* Barra superior */}
        <div className="home-navbar">
          <button className="home-logo-button" onClick={() => navigate("/home")}>
            <img src="/assets/LOGO2.png" alt="Logo" className="home-logo" />
          </button>
          <button className="home-logout-button" onClick={handleLogout}>
            <MdLogout size={30} />
          </button>
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default HomeWindow;
