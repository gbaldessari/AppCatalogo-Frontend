/**
 * Componente de bienvenida para la vista principal.
 *
 * @remarks
 * Muestra una cuadrícula de botones para navegar a las principales secciones de la aplicación.
 *
 * @returns El menú de navegación principal.
 */
import "./catalogWelcomeWindow.css";
import { useNavigate } from "react-router-dom";

function CatalogWelcomeWindow() {
  const navigate = useNavigate();
  return (
    <div className="welcome-body">
      {/* Cuerpo con botones en cuadrícula */}
      < div className="welcome-grid" >
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/products")}
        >
          Productos
        </button>
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/offers")}
        >
          Ofertas
        </button>
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/categories")}
        >
          Categorías
        </button>
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/generate-catalog")}
        >
          Generar Catálogo
        </button>
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/catalogs")}
        >
          Catálogos
        </button>
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/bulk-upload")}
        >
          Carga Masiva de Productos
        </button>
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/activate-products")}
        >
          Activar Productos
        </button>
        <button className="welcome-grid-btn"
          onClick={() => navigate("/catalog/deactivate-products")}
        >
          Desactivar Productos
        </button>
      </div >
    </div >
  );
}

export default CatalogWelcomeWindow;