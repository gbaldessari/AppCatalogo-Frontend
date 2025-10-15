/**
 * Servicio para la gestión de ofertas.
 *
 * @remarks
 * Proporciona funciones para crear, obtener, actualizar y eliminar ofertas mediante peticiones HTTP al backend.
 * Utiliza axiosInstance para la comunicación y tipado estricto para los payloads y respuestas.
 */

import axiosInstance from "../AxiosInstance";
import type { ServiceResponse } from "../ServiceResponce.type";
import type { CreateOfferPayload } from "./types/CreateOffer.type";
import type { DeleteOfferPayload } from "./types/DeleteOffer.type";
import type { GetOfferResponse } from "./types/GetOffers.type";
import type { UpdateOfferPayload } from "./types/UpdateOffer.type";

export const createOffer = async (token: string, payload: CreateOfferPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.post('/offers/create', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const getOffer = async (token: string): Promise<ServiceResponse<GetOfferResponse[]>> => {
  try {
    const response = await axiosInstance.get('/offers/get', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, data: response.data as GetOfferResponse[] };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};

export const deleteOffer = async (token: string, payload:DeleteOfferPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.delete(`/offers/delete`, {
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

export const updateOffer = async (token: string, payload: UpdateOfferPayload): Promise<ServiceResponse<void>> => {
  try {
    await axiosInstance.patch('/offers/update', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
};
