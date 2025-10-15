import fileAxiosInstance from "../FileAxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { BulkUploadResponse } from "./types/BulkUpload.types";

export const productsBulkUpload = async (token: string, file: File): Promise<ServiceResponse<BulkUploadResponse[]>> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fileAxiosInstance.post('/bulk-upload/products', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as BulkUploadResponse[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const productsDeactivate = async (token: string, file: File): Promise<ServiceResponse<BulkUploadResponse[]>> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fileAxiosInstance.patch('/bulk-upload/products-deactivate', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as BulkUploadResponse[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const productsActivate = async (token: string, file: File): Promise<ServiceResponse<BulkUploadResponse[]>> => {
  const formData = new FormData();
  formData.append("file", file);
  try {
    const response = await fileAxiosInstance.patch('/bulk-upload/products-activate', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as BulkUploadResponse[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const vendorsBulkUpload = async (token: string, file: File): Promise<ServiceResponse<BulkUploadResponse[]>> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fileAxiosInstance.post('/bulk-upload/vendors', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as BulkUploadResponse[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
