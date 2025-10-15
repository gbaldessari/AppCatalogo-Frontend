/**
 * Servicio para la gestión de productos.
 *
 * @remarks
 * Proporciona funciones para crear, obtener, actualizar y eliminar productos mediante peticiones HTTP al backend.
 * Utiliza axiosInstance para la comunicación y tipado estricto para los payloads y respuestas.
 */

import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { CreateProductPayload } from "./types/CreateProduct.type";
import type { DeleteManyProductsPayload, DeleteProductPayload } from "./types/DeleteProduct.type";
import type { GetProductResponse } from "./types/GetProducts.type";
import type { UpdateProductPayload } from "./types/UpdateProduct.type";

export const createProduct = async (token: string, payload: CreateProductPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.post('/products/create', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const getProducts = async (token: string): Promise<ServiceResponse<GetProductResponse[]>> => {
  try {
    const response = await axiosInstance.get('/products/get', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as GetProductResponse[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteProduct = async (token: string, payload:DeleteProductPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`/products/delete`, {
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

export const deleteManyProducts = async (token: string, payload: DeleteManyProductsPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.post(`/products/delete-many`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const updateProduct = async (token: string, payload: UpdateProductPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/products/update', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
