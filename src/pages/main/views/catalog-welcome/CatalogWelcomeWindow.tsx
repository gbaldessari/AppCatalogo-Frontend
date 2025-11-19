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
  const quickActions = [
    { icon: "🛒", label: "Productos", description: "Administra el inventario", path: "/catalog/products" },
    { icon: "💸", label: "Ofertas", description: "Gestiona promociones y descuentos", path: "/catalog/offers" },
    { icon: "🗂️", label: "Categorías", description: "Gestiona categorías", path: "/catalog/categories" },
    { icon: "⚙️", label: "Generar Catálogo", description: "Genera nuevos catálogos", path: "/catalog/generate-catalog" },
    { icon: "📚", label: "Catálogos", description: "Consulta catálogos generados", path: "/catalog/catalogs" },
    { icon: "📦", label: "Carga Masiva", description: "Importa productos desde archivos", path: "/catalog/bulk-upload" },
    { icon: "✅", label: "Activar Productos", description: "Habilita artículos disponibles", path: "/catalog/activate-products" },
    { icon: "🚫", label: "Desactivar Productos", description: "Retira artículos disponibles", path: "/catalog/deactivate-products" }
  ];

  return (
    <div className="catalog-welcome-body">
      <div className="catalog-welcome-content">
        <h1 className="catalog-welcome-title">Centro de Catálogo</h1>
        <p className="catalog-welcome-subtitle">Selecciona la operación que necesitas realizar</p>

        <div className="catalog-welcome-grid">
          {quickActions.map(({ icon, label, description, path }) => (
            <button
              key={path}
              type="button"
              className="catalog-welcome-card"
              onClick={() => navigate(path)}
            >
              <span className="catalog-welcome-card-icon">{icon}</span>
              <span className="catalog-welcome-card-title">{label}</span>
              <span className="catalog-welcome-card-description">{description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CatalogWelcomeWindow;