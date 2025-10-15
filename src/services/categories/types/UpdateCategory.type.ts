/**
 * Tipo para el payload de actualización de una categoría.
 *
 * @remarks
 * Utilizado para enviar el identificador y el nuevo nombre de la categoría al backend.
 */
export type UpdateCategoryPayload = {
  _id: string;
  name: string;
};