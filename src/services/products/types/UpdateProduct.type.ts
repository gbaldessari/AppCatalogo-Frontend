/**
 * Tipo para el payload de actualización de un producto.
 *
 * @remarks
 * Utilizado para enviar los datos necesarios para modificar un producto existente en el backend.
 */
export type UpdateProductPayload = {
  sku: string;
  name: string;
  catalogueName: string;
  isActive: boolean;
  units: number;
  categoryId: string;
  imageId: string;
  price: number;
}