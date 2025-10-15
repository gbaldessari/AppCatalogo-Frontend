/**
 * Tipo para el payload de obtención de una imagen.
 *
 * @remarks
 * Utilizado para enviar el identificador único de la imagen al backend y recuperar la imagen correspondiente.
 */
export type GetImagePayload = {
  imageId: string;
};