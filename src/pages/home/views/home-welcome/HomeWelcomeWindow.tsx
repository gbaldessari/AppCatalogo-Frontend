/**
 * Componente de bienvenida para la vista principal.
 *
 * @remarks
 * Muestra una cuadrícula de botones para navegar a las principales secciones de la aplicación.
 *
 * @returns El menú de navegación principal.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./homeWelcomeWindow.css";

function HomeWelcomeWindow() {
  const navigate = useNavigate();
  const [availableApps, setAvailableApps] = useState({
    catalog: false,
    isAdmin: false
  });

  useEffect(() => {
    // Verificar qué aplicaciones están disponibles para el usuario
    const catalogAccess = localStorage.getItem("catalogAccess") === "true";
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    setAvailableApps({
      catalog: isAdmin || catalogAccess,
      isAdmin
    });
  }, []);

  const handleNavigateToApp = (app: string) => {
    navigate(`/${app}`);
  };

  const handleNavigateToProfile = () => {
    navigate("/home/profile");
  };

  const hasAnyAppAccess = availableApps.catalog;

  return (
    <div className="home-welcome-container">
      <div className="home-welcome-content">
        <h1 className="home-welcome-title">Bienvenido</h1>
        <p className="home-welcome-subtitle">
          Selecciona la opción que deseas usar
        </p>

        <div className="applications-grid">
          {availableApps.catalog && (
            <div
              className="application-card catalog-application"
              onClick={() => handleNavigateToApp("catalog")}
            >
              <div className="application-icon">📚</div>
              <h3>Catálogo</h3>
              <p>Gestiona productos, categorías y genera catálogos</p>
            </div>
          )}

          {/* Perfil/Administración - siempre disponible */}
          <div
            className="application-card profile-application"
            onClick={handleNavigateToProfile}
          >
            <div className="application-icon">{availableApps.isAdmin ? "⚙️" : "👤"}</div>
            <h3>{availableApps.isAdmin ? "Administración" : "Mi Perfil"}</h3>
            <p>
              {availableApps.isAdmin
                ? "Gestiona usuarios, perfiles y configuración del sistema"
                : "Edita tu perfil y cambia tu contraseña"
              }
            </p>
          </div>

          {!hasAnyAppAccess && (
            <div className="access-denied-message">
              <div className="access-denied-icon">🔒</div>
              <h3>Sin acceso a aplicaciones</h3>
              <p>No tienes permisos para acceder a las aplicaciones principales. Contacta al administrador para obtener acceso.</p>
            </div>
          )}
        </div>

        <div className="user-permissions-info">
          <p>
            <strong>Opciones disponibles:</strong>
            {availableApps.catalog && " Catálogo"}
            {hasAnyAppAccess && " |"}

            {availableApps.isAdmin ? " Administración" : " Mi Perfil"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomeWelcomeWindow;