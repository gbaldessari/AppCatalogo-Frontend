/**
 * Componente modal para mostrar una imagen en vista previa.
 *
 * @remarks
 * Recibe la URL de la imagen y una función para cerrar el modal.
 *
 * @param props - Propiedades del componente.
 * @param props.src - URL de la imagen a mostrar.
 * @param props.onClose - Función que se ejecuta al cerrar el modal.
 * @returns El modal de imagen.
 */
import React from "react";
import "./imageModal.css";

interface Props {
  src: string;
  onClose: () => void;
}

const ImageModal: React.FC<Props> = ({ src, onClose }) => (
  <div className="image-modal-overlay" onClick={onClose}>
    <img
      src={src}
      alt="Vista previa"
      className="image-modal-img"
      onClick={onClose}
    />
  </div>
);

export default ImageModal;
