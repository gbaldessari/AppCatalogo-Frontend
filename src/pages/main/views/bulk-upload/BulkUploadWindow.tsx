import React, { useState } from "react";
import { productsBulkUpload } from "../../../../services/bulk-upload/bulk-upload.service";
import "./bulkUploadWindow.css";

function BulkUploadWindow() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any[] | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

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
    const res = await productsBulkUpload(token, file);
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

  const fileSize = file ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "";
  const fileDate = file ? new Date(file.lastModified).toLocaleDateString() : "";

  return (
    <div className="bulk-upload-window">
      <div className="bulk-upload-header">
        <h2>Carga masiva de productos</h2>
        <p className="bulk-upload-subtitle">
          Sube un archivo Excel (.xlsx o .xls) con el formato esperado. Revisa el
          ejemplo antes de comenzar.
        </p>
      </div>

      <div className="bulk-upload-action-bar">
        <button
          type="button"
          className="bulk-upload-example-btn"
          onClick={() => handleDownload("ejemplo productos.xlsx")}
        >
          Descargar archivo de ejemplo
        </button>
      </div>

      <div className="bulk-upload-uploader">
        <div
          className={
            "bulk-upload-dropzone" +
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
            <div className="bulk-upload-dropzone-instructions">
              <strong>Arrastra y suelta</strong> el archivo aquí
              <br />
              <div className="hint">Formatos permitidos: .xlsx, .xls</div>
            </div>
          )}
          {file && (
            <div className="bulk-upload-file-info">
              <div className="name" title={file.name}>
                {file.name}
              </div>
              <div className="meta">
                <span>{fileSize}</span>
                <span>Modificado: {fileDate}</span>
              </div>
              <button
                type="button"
                className="bulk-upload-remove-file-btn"
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

        <div className="bulk-upload-controls-inline">
          <button
            onClick={() => document.getElementById("bulkUploadInput")?.click()}
            type="button"
            className="bulk-upload-secondary-btn"
            disabled={loading}
          >
            Seleccionar archivo
          </button>
          <button onClick={handleUpload} disabled={loading || !file}>
            {loading ? "Cargando..." : "Subir archivo"}
          </button>
        </div>
      </div>

      <div className="bulk-upload-status" aria-live="polite">
        {generalError && (
          <div className="bulk-upload-alert bulk-upload-alert-error" role="alert">
            {generalError}
          </div>
        )}
        {success && !generalError && (
          <div className="bulk-upload-alert bulk-upload-alert-success" role="alert">
            Datos cargados correctamente.
          </div>
        )}
        {!errors && !generalError && !loading && file && !success && (
          <div className="bulk-upload-alert bulk-upload-alert-info">
            Archivo listo para cargar.
          </div>
        )}
        {loading && (
          <div className="bulk-upload-alert bulk-upload-alert-loading">
            Procesando archivo, por favor espera...
          </div>
        )}
      </div>

      {errors && (
        <div className="bulk-upload-errors">
          <div className="bulk-upload-errors-header">
            <h3>Errores encontrados</h3>
            <span className="bulk-upload-count">
              {errors.length} fila(s) con problemas
            </span>
          </div>
          <div className="bulk-upload-errors-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Unidades</th>
                  <th>Precio</th>
                  <th>Motivo</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {errors.map((err, idx) => (
                  <tr key={idx}>
                    <td>{err.row?.["Cod."] ?? "-"}</td>
                    <td>{err.row?.["Producto"] ?? "-"}</td>
                    <td>{err.row?.["Categoría"] ?? "-"}</td>
                    <td>{err.row?.["Unidades"] ?? "-"}</td>
                    <td>{err.row?.["Precio"] ?? "-"}</td>
                    <td className="bulk-upload-error-reason">{err.reason}</td>
                    <td>{err.error ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BulkUploadWindow;
