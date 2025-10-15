/**
 * Tipo de respuesta al subir una imagen.
 *
 * @remarks
 * Devuelve el identificador único de la imagen almacenada en el backend.
 */
export type UploadImageResponse = {
  imageId: string;
};

/**
 * Tipo para el payload de subida de una imagen.
 *
 * @remarks
 * Utilizado para enviar el archivo de imagen al backend.
 */
export type UploadImagePayload = {
  file: File;
};