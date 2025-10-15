import React, { useEffect, useState } from "react";
import {
  getAllCatalogJobs,
  downloadCatalogJob,
  deleteCatalogJob,
} from "../../../../services/generate-catalog/generate-catalog.service";
import "./catalogsWindow.css";
import { Alert } from "../../../../commons/Alert"; // Importa el componente Alert

const statusMap: Record<string, string> = {
  pending: "Pendiente",
  processing: "Procesando",
  done: "Completado",
  failed: "Fallido",
};

// Función para formatear fecha en HH:MM DD/MM/AAAA
function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

const CatalogsWindow: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para alertas
  const [alert, setAlert] = useState<{
    type: "error" | "success";
    message: string;
    show: boolean;
  }>({
    type: "success",
    message: "",
    show: false,
  });

  // Estado para controlar descarga por job
  const [downloading, setDownloading] = useState<{ [jobId: string]: boolean }>({});

  const fetchJobs = async () => {
    const token = localStorage.getItem("accessToken") || "";
    setLoading(true);
    setError(null);
    const res = await getAllCatalogJobs(token);
    console.log("Jobs obtenidos:", res);
    if (res.success) setJobs(res.data ?? []);
    else setError(res.error || "Error al cargar los catálogos");
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDownload = async (jobId: string, fileName: string) => {
    const token = localStorage.getItem("accessToken") || "";
    setDownloading((prev) => ({ ...prev, [jobId]: true }));
    try {
      await downloadCatalogJob(token, jobId, fileName);
      setAlert({
        type: "success",
        message: "Catálogo descargado correctamente.",
        show: true,
      });
    } catch (e) {
      setAlert({
        type: "error",
        message: "Error al descargar el catálogo.",
        show: true,
      });
    }
    setDownloading((prev) => ({ ...prev, [jobId]: false }));
  };

  const handleDelete = async (jobId: string) => {
    const token = localStorage.getItem("accessToken") || "";
    try {
      await deleteCatalogJob(token, jobId);
      setAlert({
        type: "success",
        message: "Catálogo eliminado correctamente.",
        show: true,
      });
      fetchJobs();
    } catch (e) {
      setAlert({
        type: "error",
        message: "Error al eliminar el catálogo.",
        show: true,
      });
    }
  };

  // Oculta la alerta después de 3 segundos
  React.useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(
        () => setAlert((a) => ({ ...a, show: false })),
        3000
      );
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  return (
    <div className="catalogs-window">
      <h2>Catálogos Generados</h2>
      <Alert type={alert.type} message={alert.message} show={alert.show} />
      {loading && <div className="catalogs-loading">Cargando...</div>}
      {error && <div className="catalogs-error">{error}</div>}
      <div className="catalogs-table-container">
        <table className="catalogs-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Creación</th>
              <th>Finalización</th>
              <th>Estado</th>
              <th>Error</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && !loading && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#888" }}>
                  No hay catálogos generados.
                </td>
              </tr>
            )}
            {jobs.map((job) => (
              <tr key={job._id}>
                <td>{job.fileName}</td>
                <td>{formatDate(job.createdAt)}</td>
                <td>
                  {(job.status === "done" || job.status === "failed")
                    ? formatDate(job.updatedAt)
                    : "-"}
                </td>
                <td>{statusMap[job.status] || job.status}</td>
                <td>{job.error || "-"}</td>
                <td>
                  {job.status === "done" && (
                    <button
                      onClick={() => handleDownload(job._id, job.fileName)}
                      disabled={!!downloading[job._id]}
                      className={downloading[job._id] ? "catalogs-btn-disabled" : ""}
                    >
                      {downloading[job._id] ? "Descargando..." : "Descargar"}
                    </button>
                  )}
                  <button onClick={() => handleDelete(job._id)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CatalogsWindow;