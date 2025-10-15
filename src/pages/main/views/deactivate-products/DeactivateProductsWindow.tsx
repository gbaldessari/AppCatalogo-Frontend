import React, { useState, useEffect } from "react";
import "./deactivateProductsWindow.css";
import { productsDeactivate } from "../../../../services/bulk-upload/bulk-upload.service";

function DeactivateProductsWindow() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[] | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSuccess(false);
      setErrors(null);
      setGeneralError(null);
    }
  };

  // Drag & Drop
  const preventDefaults = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragOver = (e: React.DragEvent) => {
    preventDefaults(e);
    if (!dragActive) setDragActive(true);
  };
  const handleDragEnter = (e: React.DragEvent) => {
    preventDefaults(e);
    if (!dragActive) setDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    preventDefaults(e);
    setDragActive(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    preventDefaults(e);
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      setSuccess(false);
      setErrors(null);
      setGeneralError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setErrors(null);
    setSuccess(false);
    setGeneralError(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setErrors(null);
    setGeneralError(null);
    setSuccess(false);
    const token = localStorage.getItem("accessToken") || "";
    const res = await productsDeactivate(token, file);
    if (res.success) {
      const errorRows = (res.data || []).filter((row: any) => row.reason);
      setErrors(errorRows.length > 0 ? errorRows : null);
      setSuccess(errorRows.length === 0);
    } else {
      setGeneralError("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleDownload = (filename: string) => {
    const link = document.createElement("a");
    link.href = `/files/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onKeyActivateDrop = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      document.getElementById("bulkUploadInput")?.click();
    }
  };

  const handleOpenConfirm = () => {
    if (!file || loading) return;
    setShowConfirm(true);
  };
  const handleCancelConfirm = () => setShowConfirm(false);
  const handleConfirmUpload = async () => {
    setShowConfirm(false);
    await handleUpload();
  };

  useEffect(() => {
    if (!showConfirm) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowConfirm(false);
      if (e.key === "Enter") {
        e.preventDefault();
        handleConfirmUpload();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showConfirm, file, loading]);

  const fileSize = file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "";
  const fileDate = file ? new Date(file.lastModified).toLocaleDateString() : "";

  return (
    <div className="deactivate-products-window">
      <div className="deactivate-products-header">
        <h2>Desactivar Productos</h2>
        <p className="deactivate-products-subtitle">
          Sube un archivo Excel (.xlsx o .xls) con el formato esperado. Revisa el
          ejemplo antes de comenzar.
        </p>
      </div>

      <div className="deactivate-products-action-bar">
        <button
          type="button"
          className="deactivate-products-example-btn"
          onClick={() => handleDownload("ejemplo activar-desactivar.xlsx")}
        >
          Descargar archivo de ejemplo
        </button>
      </div>

      <div className="deactivate-products-uploader">
        <div
          className={
            "deactivate-products-dropzone" +
            (dragActive ? " is-drag-active" : "") +
            (file ? " has-file" : "")
          }
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={onKeyActivateDrop}
          aria-label="Zona para arrastrar y soltar el archivo o hacer clic para seleccionarlo"
        >
          {!file && (
            <div className="deactivate-products-dropzone-instructions">
              <strong>Arrastra y suelta</strong> el archivo aquí
              <br />
              <div className="hint">Formatos permitidos: .xlsx, .xls</div>
            </div>
          )}
          {file && (
            <div className="deactivate-products-file-info">
              <div className="name" title={file.name}>
                {file.name}
              </div>
              <div className="meta">
                <span>{fileSize}</span>
                <span>Modificado: {fileDate}</span>
              </div>
              <button
                type="button"
                className="deactivate-products-remove-file-btn"
                onClick={handleRemoveFile}
                aria-label="Quitar archivo"
                disabled={loading}
              >
                ×
              </button>
            </div>
          )}
          <input
            id="bulkUploadInput"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
        </div>

        <div className="deactivate-products-controls-inline">
          <button
            onClick={() => document.getElementById("bulkUploadInput")?.click()}
            type="button"
            className="deactivate-products-secondary-btn"
            disabled={loading}
          >
            Seleccionar archivo
          </button>
          <button onClick={handleOpenConfirm} disabled={loading || !file}>
            {loading ? "Cargando..." : "Subir archivo"}
          </button>
        </div>
      </div>

      <div className="deactivate-products-status" aria-live="polite">
        {generalError && (
          <div className="deactivate-products-alert deactivate-products-alert-error" role="alert">
            {generalError}
          </div>
        )}
        {success && !generalError && (
          <div className="deactivate-products-alert deactivate-products-alert-success" role="alert">
            Datos actualizados correctamente.
          </div>
        )}
        {!errors && !generalError && !loading && file && !success && (
          <div className="deactivate-products-alert deactivate-products-alert-info">
            Archivo listo para cargar.
          </div>
        )}
        {loading && (
          <div className="deactivate-products-alert deactivate-products-alert-loading">
            Procesando archivo, por favor espera...
          </div>
        )}
      </div>

      {errors && (
        <div className="deactivate-products-errors">
          <div className="deactivate-products-errors-header">
            <h3>Errores encontrados</h3>
            <span className="deactivate-products-count">
              {errors.length} fila(s) con problemas
            </span>
          </div>
          <div className="deactivate-products-errors-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Motivo</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, idx) => (
                  <tr key={idx}>
                    <td>{err.row?.["Cod."] ?? "-"}</td>
                    <td className="deactivate-products-error-reason">{err.reason}</td>
                    <td>{err.error ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showConfirm && (
        <div
          className="deactivate-products-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmUploadTitle"
        >
          <div className="deactivate-products-modal">
            <h4 id="confirmUploadTitle">Confirmar carga</h4>
            <p>
              ¿Deseas subir el archivo "{file?.name}"? Esta acción desactivará los
              productos incluidos en el archivo.
            </p>
            <div className="deactivate-products-modal-actions">
              <button
                type="button"
                className="deactivate-products-secondary-btn"
                onClick={handleCancelConfirm}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="deactivate-products-primary-btn"
                onClick={handleConfirmUpload}
                disabled={loading}
              >
                {loading ? "Cargando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DeactivateProductsWindow;
