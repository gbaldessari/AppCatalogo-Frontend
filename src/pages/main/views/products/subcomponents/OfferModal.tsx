/**
 * Componente modal para crear una nueva oferta sobre un producto.
 *
 * @remarks
 * Permite ingresar el nuevo precio, seleccionar una imagen y una fecha de expiración opcional.
 * Muestra un spinner de carga durante la creación y una previsualización de la imagen seleccionada.
 *
 * @param props - Propiedades del componente.
 * @param props.offerModal - Estado del modal de oferta (campos, loading, imagen, etc).
 * @param props.setOfferModal - Setter para el estado del modal.
 * @param props.handleOfferImageChange - Handler para el input de imagen.
 * @param props.handleCreateOffer - Función para crear la oferta.
 * @returns El modal de creación de oferta o null si está cerrado.
 */
import React, { useState, useEffect } from "react";
import type { GetProductResponse } from "../../../../../services/products/types/GetProducts.type";

type OfferModalProps = {
  offerModal: {
    isOpen: boolean;
    loading: boolean;
    product: GetProductResponse | null;
    newPrice: number | "";
    imageId: string;
    expiration?: string;
    imageUploading: boolean;
  };
  setOfferModal: React.Dispatch<React.SetStateAction<OfferModalProps["offerModal"]>>;
  handleOfferImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateOffer: () => void;
};

export const OfferModal: React.FC<OfferModalProps> = ({
  offerModal,
  setOfferModal,
  handleOfferImageChange,
  handleCreateOffer,
}) => {
  // Vista previa de imagen SOLO de la imagen subida para la oferta
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    // Solo mostrar la imagen si hay imageId (de la oferta) y no está subiendo
    if (offerModal.imageId && !offerModal.imageUploading) {
      setPreviewUrl(`${import.meta.env.VITE_BACK_URL}/images/get-by-id?imageId=${offerModal.imageId}`);
    } else {
      setPreviewUrl(null);
    }
  }, [offerModal.imageId, offerModal.imageUploading]);

  if (!offerModal.isOpen) return null;
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setOfferModal(modal => ({ ...modal, isOpen: false })); }}>
      <div className="modal admin-modal">
        <h2>Crear Oferta</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            placeholder="Nuevo precio"
            type="number"
            min="0.01"
            step="0.01"
            value={offerModal.newPrice}
            onChange={e => setOfferModal(modal => ({ ...modal, newPrice: e.target.value === "" ? "" : Number(e.target.value) }))}
          />
          <label className="file-upload-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleOfferImageChange}
              disabled={offerModal.imageUploading}
              style={{ display: "none" }}
            />
            <span className="file-upload-btn">
              {offerModal.imageId ? "Cambiar imagen (opcional)" : "Elegir imagen (opcional)"}
            </span>
          </label>
          {/* Sugerencia: si no hay imagen de oferta, se usará la del producto */}
          <small style={{ color: "#64748b" }}>
            Si no subes imagen, se usará la del producto.
          </small>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Vista previa"
              style={{ maxWidth: 120, maxHeight: 120, margin: "8px 0", border: "1px solid #e1e1e1", borderRadius: 4 }}
            />
          )}
          <label style={{ fontSize: "0.98em", color: "#475569", marginTop: 6 }}>
            Fecha de caducidad del producto (opcional)
          </label>
          <input
            placeholder="Expiración (opcional, formato YYYY-MM-DD)"
            type="date"
            value={offerModal.expiration || ""}
            onChange={e => setOfferModal(modal => ({ ...modal, expiration: e.target.value }))}
          />
        </div>
        <div className="modal-actions modal-confirm-actions" style={{ marginTop: 16 }}>
          <button className={offerModal.loading ? "submit-button loading" : "submit-button"} onClick={() => setOfferModal(modal => ({ ...modal, isOpen: false }))} disabled={offerModal.loading}>Cancelar</button>
          <button
            className={offerModal.loading ? "submit-button loading" : "submit-button"}
            onClick={handleCreateOffer}
            disabled={offerModal.loading || offerModal.newPrice === "" || Number(offerModal.newPrice) <= 0}
          >
            {offerModal.loading ? (
              <div className="spinner">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            ) : "Crear Oferta"}
          </button>
        </div>
      </div>
    </div>
  );
};
