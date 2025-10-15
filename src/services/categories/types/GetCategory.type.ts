/**
 * Tipo de respuesta para obtener una categoría.
 *
 * @remarks
 * Utilizado para representar los datos de una categoría recibidos desde el backend.
 */
export type GetCategoryResponse = {
  _id: string;
  name: string;
};

export type GetCategoriesDesigns = {
  _id: string;
  color: string;
  frontPageId: string | null;
  backgroundImageId: string | null;
}