/**
 * Tipo de respuesta para obtener un producto.
 *
 * @remarks
 * Utilizado para representar los datos de un producto recibidos desde el backend.
 */
export type GetProductResponse = {
  _id: string;
  sku: string;
  name: string;
  catalogueName: string;
  isActive: boolean;
  units: number;
  categoryId: string;
  imageId: string;
  price: number;
};