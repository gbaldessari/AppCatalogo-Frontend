import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "./Alert";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresAccess: "catalog" | "geo" | "form";
  fallbackPath?: string;
}

/**
 * Componente que protege rutas basado en los permisos de aplicación del usuario.
 * 
 * @param children - Componentes hijos a renderizar si tiene acceso
 * @param requiresAccess - Tipo de acceso requerido ("catalog", "geo" o "form")
 * @param fallbackPath - Ruta a la que redirigir si no tiene acceso (por defecto "/home")
 */
export function ProtectedRoute({ 
  children, 
  requiresAccess, 
  fallbackPath = "/home" 
}: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [showAlert, setShowAlert] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      const accessMap = {
        catalog: "catalogAccess",
        geo: "geoAccess",
        form: "formAccess"
      };
      
      const accessKey = accessMap[requiresAccess];
      const hasAppAccess = localStorage.getItem(accessKey) === "true";
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      
      // Los administradores tienen acceso a todo
      if (isAdmin || hasAppAccess) {
        setHasAccess(true);
        setChecking(false);
      } else {
        setHasAccess(false);
        setShowAlert(true);
        
        // Mostrar alerta por 3 segundos y luego redirigir
        setTimeout(() => {
          setShowAlert(false);
          navigate(fallbackPath);
          setChecking(false);
        }, 3000);
      }
    };

    checkAccess();
  }, [requiresAccess, navigate, fallbackPath]);

  if (checking) {
    return null;
  }

  if (!hasAccess) {
    const appNames = {
      catalog: "Catálogo",
      geo: "Geo",
      form: "Formularios"
    };
    
    return (
      <Alert 
        type="error" 
        message={`No tienes acceso a la aplicación ${appNames[requiresAccess]}. Contacta al administrador.`}
        show={showAlert} 
      />
    );
  }

  return <>{children}</>;
}
