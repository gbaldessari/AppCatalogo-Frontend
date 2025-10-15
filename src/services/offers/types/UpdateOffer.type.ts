/**
 * Tipo para el payload de actualización de una oferta.
 *
 * @remarks
 * Utilizado para enviar los datos necesarios para modificar una oferta existente en el backend.
 */
export type UpdateOfferPayload = {
  productSku: string;
  imageId: string;
  newPrice: number;
  expiration?: Date;
}