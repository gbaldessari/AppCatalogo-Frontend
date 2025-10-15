/**
 * Componente para seleccionar y previsualizar imágenes extra para el catálogo.
 *
 * @remarks
 * Permite seleccionar múltiples imágenes, muestra previsualizaciones y permite abrirlas en un modal.
 *
 * @param props - Propiedades del componente.
 * @param props.extraImages - Lista de archivos de imágenes extra seleccionadas.
 * @param props.setExtraImages - Setter para actualizar las imágenes extra.
 * @param props.extraPreviews - URLs de previsualización de las imágenes extra.
 * @param props.setModalImg - Setter para mostrar una imagen en el modal de previsualización.
 * @returns El bloque de selección y previsualización de imágenes extra.
 */
import React from "react";

interface Props {
  extraImages: File[];
  setExtraImages: (files: File[]) => void;
  extraPreviews: string[];
  setModalImg: (url: string) => void;
}

const ExtraImagesInput: React.FC<Props> = ({
  setExtraImages, extraPreviews, setModalImg
}) => {
  const handleExtraImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setExtraImages(Array.from(e.target.files));
    }
  };
  return (
    <div className="image-input-block">
      <label className="image-label">
        Imágenes extra
        <input
          type="file"
          accept="image/*"
          multiple
          className="image-input"
          onChange={handleExtraImagesChange}
        />
        <span className="image-btn">Seleccionar imágenes</span>
      </label>
      <div className="extra-images-preview">
        {extraPreviews.map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Extra ${idx + 1}`}
            className="image-preview clickable-image-preview"
            onClick={() => setModalImg(url)}
          />
        ))}
      </div>
    </div>
  );
};

export default ExtraImagesInput;
