/**
 * Componente para seleccionar y previsualizar las imágenes de portada y contraportada del catálogo.
 *
 * @remarks
 * Permite seleccionar archivos de imagen para portada y contraportada, mostrando una previsualización y permitiendo abrirlas en un modal.
 *
 * @param props - Propiedades del componente.
 * @param props.frontPage - Archivo de imagen de portada seleccionado.
 * @param props.setFrontPage - Setter para la imagen de portada.
 * @param props.frontPreview - URL de previsualización de la portada.
 * @param props.backPage - Archivo de imagen de contraportada seleccionado.
 * @param props.setBackPage - Setter para la imagen de contraportada.
 * @param props.backPreview - URL de previsualización de la contraportada.
 * @param props.setModalImg - Setter para mostrar una imagen en el modal de previsualización.
 * @returns El bloque de selección y previsualización de portada y contraportada.
 */
import React from "react";

interface Props {
  frontPage: File | null;
  setFrontPage: (f: File) => void;
  frontPreview: string | null;
  backPage: File | null;
  setBackPage: (f: File) => void;
  backPreview: string | null;
  setModalImg: (url: string) => void;
}

const MainImagesInput: React.FC<Props> = ({
  setFrontPage, frontPreview, setBackPage, backPreview,
  setModalImg
}) => {
  const handleFileChange =
    (setter: (file: File) => void) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          setter(e.target.files[0]);
        }
      };
  return (
    <>
      <div className="image-input-block">
        <label className="image-label">
          Portada
          <input
            type="file"
            accept="image/*"
            className="image-input"
            onChange={handleFileChange(setFrontPage)}
          />
          <span className="image-btn">Seleccionar imagen</span>
        </label>
        {frontPreview && (
          <img
            src={frontPreview}
            alt="Portada"
            className="image-preview clickable-image-preview"
            onClick={() => setModalImg(frontPreview)}
          />
        )}
      </div>
      <div className="image-input-block">
        <label className="image-label">
          Contraportada
          <input
            type="file"
            accept="image/*"
            className="image-input"
            onChange={handleFileChange(setBackPage)}
          />
          <span className="image-btn">Seleccionar imagen</span>
        </label>
        {backPreview && (
          <img
            src={backPreview}
            alt="Contraportada"
            className="image-preview clickable-image-preview"
            onClick={() => setModalImg(backPreview)}
          />
        )}
      </div>
    </>
  );
};

export default MainImagesInput;
