/**
 * Tipo para el payload de creación de una categoría.
 *
 * @remarks
 * Utilizado para enviar el nombre de la nueva categoría al backend.
 */
export type CreateCategoryPayload = {
  name: string;
};