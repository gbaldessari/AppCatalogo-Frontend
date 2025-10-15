/**
 * Servicio para la gestión de imágenes.
 *
 * @remarks
 * Proporciona funciones para subir imágenes al servidor y obtener la URL de una imagen por su ID.
 * Utiliza axiosInstance para la comunicación con el backend y FormData para el envío de archivos.
 */

import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { GetImagePayload } from "./types/GetImage.type";
import type { UploadImagePayload, UploadImageResponse } from "./types/UploadImage.type";

/**
 * Sube una imagen al servidor.
 * @param {string} token - Token de autenticación del usuario.
 * @param {UploadImagePayload} payload - Contiene el archivo de imagen.
 * 
 * @returns {Promise<{ imageId: string }>} - Retorna el ID de la imagen subida.
 */
export const uploadImage = async (token: string, payload: UploadImagePayload): Promise<ServiceResponse<UploadImageResponse>> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  try {
    const response = await axiosInstance.post<{ imageId: string }>(
      "/images/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return { success: true, data: response.data as UploadImageResponse };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

/**
 * Obtiene la URL de una imagen por su ID.
 * @param {GetImagePayload} payload - Contiene el ID de la imagen a recuperar.
 * 
 * @returns {string} - URL para acceder a la imagen.
 */
export const getImageUrlById = (payload: GetImagePayload): string => {
  return `${import.meta.env.VITE_BACK_URL}/images/get-by-id?imageId=${payload.imageId}`;
};
