import fileAxiosInstance from "../FileAxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { GenerateCatalogPayload } from "./types/GenerateCatalog.type";

export const createCatalogJob = async (token: string, payload: GenerateCatalogPayload): Promise<ServiceResponse<{ jobId: string }>> => {
  const formData = new FormData();
  formData.append("frontPage", payload.frontPage);
  formData.append("backPage", payload.backPage);
  payload.extraImages.forEach((img) => formData.append("extraImages", img));
  formData.append("categoriesPayload", JSON.stringify(
    payload.categoriesPayload.map(cat => ({
      _id: cat._id,
      color: cat.color
    }))
  ));
  // Adjunta imágenes por categoría
  payload.categoriesPayload.forEach((cat) => {
    formData.append(`categoryFrontPage_${cat._id}`, cat.frontPage);
    formData.append(`categoryBackgroundImage_${cat._id}`, cat.backgroundImage);
  });
  formData.append("visiblePrices", String(payload.visiblePrices));
  formData.append("visibleOffers", String(payload.visibleOffers));
  formData.append("fileName", payload.fileName || "Catalogo-Ventas-Fama.pdf");
  payload.categoriesPayload.forEach((cat) => {
    if (cat.frontPage) {
      formData.append(`categoryFrontPage_${cat._id}`, cat.frontPage);
    }
    if (cat.backgroundImage) {
      formData.append(`categoryBackgroundImage_${cat._id}`, cat.backgroundImage);
    }
  });

  try {
    const response = await fileAxiosInstance.post('/catalog-job/create', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    return { success: true, data: response.data as { jobId: string } };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * Consulta el estado de un job.
 */
export const getCatalogJobStatus = async (token: string, jobId: string): Promise<ServiceResponse<{ status: string, error?: string }>> => {
  try {
    const response = await fileAxiosInstance.get(`/catalog-job/status`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { jobId }
    });
    return { success: true, data: response.data as { fileName: string; status: string; error?: string } };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * Descarga el catálogo generado por el job.
 */
export const downloadCatalogJob = async (token: string, jobId: string, fileName: string): Promise<ServiceResponse<string>> => {
  try {
    const response = await fileAxiosInstance.get(`/catalog-job/download`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { jobId },
      responseType: 'blob'
    });
    const blob = response.data as Blob;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return { success: true, data: `${fileName}.pdf` };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * Obtiene todos los jobs.
 */
export const getAllCatalogJobs = async (token: string): Promise<ServiceResponse<any[]>> => {
  try {
    const response = await fileAxiosInstance.get('/catalog-job/all', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return { success: true, data: response.data as any[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * Elimina un job por su ID.
 */
export const deleteCatalogJob = async (token: string, jobId: string): Promise<ServiceResponse<{ message: string }>> => {
  try {
    const response = await fileAxiosInstance.delete(`/catalog-job/delete`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { jobId }
    });
    return { success: true, data: response.data as { message: string } };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
