/**
 * Tipo para el payload de eliminación de una categoría.
 *
 * @remarks
 * Utilizado para enviar el identificador único de la categoría a eliminar al backend.
 */
export type DeleteCategoryPayload = {
  _id: string;
};