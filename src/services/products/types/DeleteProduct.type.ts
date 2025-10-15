/**
 * Tipo para el payload de eliminación de un producto.
 *
 * @remarks
 * Utilizado para enviar el identificador único (SKU) del producto a eliminar al backend.
 */
export type DeleteProductPayload = {
  sku: string;
};

/**
 * Tipo para el payload de eliminación de múltiples productos.
 *
 * @remarks
 * Utilizado para enviar los identificadores únicos (SKU) de los productos a eliminar al backend.
 */
export type DeleteManyProductsPayload = {
  skus: string[];
};