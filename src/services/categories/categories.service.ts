/**
 * Servicio para la gestión de categorías.
 *
 * @remarks
 * Proporciona funciones para crear, obtener, actualizar y eliminar categorías mediante peticiones HTTP al backend.
 * Utiliza axiosInstance para la comunicación y tipado estricto para los payloads y respuestas.
 */

import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { CreateCategoryPayload } from "./types/CreateCategory.type";
import type { DeleteCategoryPayload } from "./types/DeleteCategory.type";
import type { GetCategoriesDesigns, GetCategoryResponse } from "./types/GetCategory.type";
import type { UpdateCategoryPayload } from "./types/UpdateCategory.type";

export const createCategories = async (token: string, payload: CreateCategoryPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.post('/categories/create', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Category created successfully");
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: String(error) };
  }
};

export const getCategories = async (token: string): Promise<ServiceResponse<GetCategoryResponse[]>> => {
  try {
    const response = await axiosInstance.get('/categories/get', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as GetCategoryResponse[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const getCategoriesDesigns = async (token: string): Promise<ServiceResponse<GetCategoriesDesigns[]>> => {
  try {
    const response = await axiosInstance.get('/categories/get-designs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as GetCategoriesDesigns[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteCategories = async (token: string, payload:DeleteCategoryPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`/categories/delete`, {
      params: payload,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateCategories = async (token: string, payload: UpdateCategoryPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/categories/update', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
