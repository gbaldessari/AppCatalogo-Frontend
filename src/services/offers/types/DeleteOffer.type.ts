/**
 * Tipo para el payload de eliminación de una oferta.
 *
 * @remarks
 * Utilizado para enviar el SKU del producto cuya oferta se desea eliminar al backend.
 */
export type DeleteOfferPayload = {
  productSku: string;
}