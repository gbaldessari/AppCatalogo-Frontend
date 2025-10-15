import axios from 'axios';

/**
 * Instancia de Axios para peticiones relacionadas con archivos.
 *
 * @remarks
 * - Usa la URL base definida en las variables de entorno (`VITE_BACK_URL`).
 * - Utiliza esta instancia para realizar llamadas a la API que devuelvan archivos.
 */
const fileAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACK_URL,
});

export default fileAxiosInstance;