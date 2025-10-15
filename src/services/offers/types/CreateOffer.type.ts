/**
 * Tipo para el payload de creación de una oferta.
 *
 * @remarks
 * Utilizado para enviar los datos necesarios para crear una nueva oferta sobre un producto al backend.
 */
export type CreateOfferPayload = {
  productSku: string;
  imageId: string;
  newPrice: number;
  expiration?: Date;
}