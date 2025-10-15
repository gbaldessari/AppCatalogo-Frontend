/**
 * Tipo de respuesta para obtener una oferta.
 *
 * @remarks
 * Utilizado para representar los datos de una oferta recibidos desde el backend.
 */
export type GetOfferResponse = {
  _id: string;
  productSku: string;
  imageId: string;
  newPrice: number;
  expiration?: Date;
};