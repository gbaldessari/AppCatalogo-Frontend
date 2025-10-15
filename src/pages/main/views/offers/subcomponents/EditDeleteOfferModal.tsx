/**
 * Componente modal para editar o eliminar una oferta.
 *
 * @remarks
 * Permite editar los campos de una oferta (SKU, imagen, precio, expiración) o confirmar su eliminación.
 * Gestiona la carga y previsualización de imágenes, así como el estado de carga durante la operación.
 *
 * @param props - Propiedades del componente.
 * @param props.modal - Estado del modal (tipo, oferta y loading).
 * @param props.editFields - Campos editables de la oferta.
 * @param props.setEditFields - Setter para los campos editables.
 * @param props.onClose - Función para cerrar el modal.
 * @param props.onEdit - Función para editar la oferta.
 * @param props.onDelete - Función para eliminar la oferta.
 * @returns El modal de edición/eliminación de oferta o null si está cerrado.
 */
import React, { useState, useEffect } from "react";
import type { GetOfferResponse } from "../../../../../services/offers/types/GetOffers.type";
import { uploadImage } from "../../../../../services/images/images.service";
import type { UploadImagePayload } from "../../../../../services/images/types/UploadImage.type";
import { getImageUrlById } from "../../../../../services/images/images.service";
import imageCompression from "browser-image-compression";

type ModalState = null | {
  type: "edit" | "delete";
  offer: GetOfferResponse;
  loading: boolean;
};

type EditDeleteOfferModalProps = {
  modal: ModalState;
  editFields: Partial<GetOfferResponse>;
  setEditFields: React.Dispatch<React.SetStateAction<Partial<GetOfferResponse>>>;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  imageFile?: File | null; // NUEVO
  imageUploading?: boolean; // NUEVO
  onImageChange?: (e: React.ChangeEvent<HTMLInputElement>) => void; // NUEVO
};

export const EditDeleteOfferModal: React.FC<EditDeleteOfferModalProps> = ({
  modal,
  editFields,
  setEditFields,
  onClose,
  onEdit,
  onDelete,
  imageFile,
  imageUploading = false,
  onImageChange,
}) => {
  // Estado para archivo de imagen temporal y vista previa
  // Si recibe imageFile/onImageChange por props, los usa, si no usa el estado interno (para compatibilidad)
  const [internalEditImageFile, setInternalEditImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileToUse = imageFile !== undefined ? imageFile : internalEditImageFile;
  const handleImageChange = onImageChange || (async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Opciones de compresión
      const options = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };
      try {
        const compressedFile = await imageCompression(file, options);
        setInternalEditImageFile(compressedFile);
      } catch {
        alert("Error al comprimir la imagen");
      }
    }
  });

  useEffect(() => {
    if (fileToUse) {
      const url = URL.createObjectURL(fileToUse);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [fileToUse]);

  // Handler para subir imagen antes de confirmar edición
  const handleUploadImage = async () => {
    if (!internalEditImageFile) return;
    const token = localStorage.getItem("accessToken") || "";
    try {
      const uploadPayload: UploadImagePayload = { file: internalEditImageFile };
      const response = await uploadImage(token, uploadPayload);
      if (response.data?.imageId) {
        setEditFields(f => ({ ...f, imageId: response.data!.imageId }));
      }
    } finally {
      // No cambia el estado de carga de imagen, ya que se controla desde afuera
    }
  };

  const handleEdit = async () => {
    if (internalEditImageFile) {
      await handleUploadImage();
      setInternalEditImageFile(null);
    }
    onEdit();
  };

  if (!modal) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal admin-modal">
        <h2>
          {modal.type === "edit" ? "Editar Oferta" : "Eliminar Oferta"}
        </h2>
        {modal.type === "edit" ? (
          <div className="edit-offer-modal-fields">
            <label className="file-upload-label">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
                disabled={imageUploading || modal.loading}
              />
              <span className="file-upload-btn" style={{ position: "relative" }}>
                {imageUploading ? (
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="spinner" style={{ marginRight: 8 }}>
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                    {fileToUse ? "Cambiando imagen..." : "Subiendo imagen..."}
                  </span>
                ) : (
                  fileToUse ? "Cambiar imagen" : "Elegir imagen"
                )}
              </span>
            </label>
            <div className="edit-offer-image-preview">
              {fileToUse && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Vista previa"
                  className="edit-offer-img"
                />
              ) : (editFields.imageId || modal.offer.imageId) ? (
                <img
                  src={getImageUrlById({ imageId: editFields.imageId || modal.offer.imageId })}
                  alt="Imagen actual"
                  className="edit-offer-img"
                />
              ) : null}
            </div>
            <input
              type="number"
              value={editFields.newPrice ?? modal.offer.newPrice}
              onChange={e => setEditFields(f => ({ ...f, newPrice: Number(e.target.value) }))}
              placeholder="Nuevo precio"
            />
            <input
              type="date"
              value={editFields.expiration ? String(editFields.expiration).substring(0, 10) : (modal.offer.expiration ? String(modal.offer.expiration).substring(0, 10) : "")}
              onChange={e => setEditFields(f => ({ ...f, expiration: e.target.value ? new Date(e.target.value) : undefined }))}
              placeholder="Expiración"
            />
          </div>
        ) : (
          <p>¿Deseas eliminar la oferta del producto SKU "{modal.offer.productSku}"?</p>
        )}
        <div className="modal-actions modal-confirm-actions">
          <button className={modal.loading ? "submit-button loading" : "submit-button"} onClick={onClose} disabled={modal.loading || imageUploading}>Cancelar</button>
          <button
            className={modal.loading || imageUploading ? "submit-button loading" : "submit-button"}
            onClick={modal.type === "edit" ? handleEdit : onDelete}
            disabled={modal.loading || imageUploading}
          >
            {(modal.loading || imageUploading) ? (
              <div className="spinner">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            ) : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};

