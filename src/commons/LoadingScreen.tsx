/**
 * Componente de pantalla de carga animada.
 *
 * @remarks
 * Muestra un spinner de bolas giratorias para indicar que la aplicación está procesando o cargando información.
 *
 * @component
 * @returns El componente visual de pantalla de carga.
 */
import type { FC } from "react";
import "./loadingScreen.css";

/**
 * LoadingScreen
 * 
 * Renderiza una pantalla de carga animada.
 */
const LoadingScreen: FC = () => {

  return (
    <div className="loading-screen">
      <div className="spinner-balls spinner-balls-white">
        {/* Bolas animadas del spinner */}
        <div className="ball ball1"></div>
        <div className="ball ball2"></div>
        <div className="ball ball3"></div>
        <div className="ball ball4"></div>
        <div className="ball ball5"></div>
        <div className="ball ball6"></div>
        <div className="ball ball7"></div>
        <div className="ball ball8"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;
