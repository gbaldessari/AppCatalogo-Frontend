/**
 * Tipo para el payload de creación de un producto.
 *
 * @remarks
 * Utilizado para enviar los datos necesarios para registrar un nuevo producto en el backend.
 */
export type CreateProductPayload = {
  sku: string;
  name: string;
  catalogueName: string;
  units: number;
  categoryId: string;
  imageId: string;
  price: number;
}