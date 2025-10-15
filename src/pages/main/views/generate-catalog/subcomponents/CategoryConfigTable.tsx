/**
 * Componente para configurar colores e imágenes de las categorías seleccionadas.
 *
 * @remarks
 * Muestra una tabla para seleccionar, asignar colores y subir imágenes para cada categoría.
 * Indica el estado de carga mientras se obtienen las categorías.
 *
 * @param props - Propiedades del componente.
 * @param props.categories - Lista de categorías disponibles.
 * @param props.categoriesPayload - Estado extendido de cada categoría.
 * @param props.onColorChange - Función para cambiar el color de una categoría.
 * @param props.onSelectChange - Función para seleccionar/deseleccionar una categoría.
 * @param props.onImageChange - Función para subir imágenes de portada o fondo.
 * @param props.categoriesLoading - Indica si las categorías están cargando.
 * @returns El componente de configuración de categorías.
 */
import React from "react";
import CategoryColorTable from "./CategoryColorTable";
import type { GetCategoryResponse } from "../../../../../services/categories/types/GetCategory.type";
import type { CategoryPayload } from "../../../../../services/generate-catalog/types/GenerateCatalog.type";

type CategoryPayloadExtended = Omit<CategoryPayload, "frontPage" | "backgroundImage"> & {
  frontPage?: File;
  backgroundImage?: File;
  selected?: boolean;
  frontPageId?: string | null; // <-- Agregado
  backgroundImageId?: string | null; // <-- Agregado
};

interface Props {
  categories: GetCategoryResponse[];
  categoriesPayload: CategoryPayloadExtended[];
  onColorChange: (categoryId: string, color: string) => void;
  onSelectChange: (categoryId: string, selected: boolean) => void;
  onImageChange: (categoryId: string, type: "frontPage" | "backgroundImage", file: File | undefined) => void;
  categoriesLoading: boolean;
  onReorder: (fromIndex: number, toIndex: number) => void; // NUEVO
  getFrontPageUrl: (cat: any) => string | null;
  getBackgroundImageUrl: (cat: any) => string | null;
}

const CategoryConfigTable: React.FC<Props> = ({
  categories, categoriesPayload,
  onColorChange, onSelectChange, onImageChange, categoriesLoading,
  onReorder,
  getFrontPageUrl,
  getBackgroundImageUrl,
}) => (
  <div>
    <h3 className="generate-catalog-subtitle">Colores y configuración de categorías</h3>
    {categoriesLoading ? (
      <div>Cargando categorías...</div>
    ) : (
      <CategoryColorTable
        categories={categories}
        categoriesPayload={categoriesPayload}
        onColorChange={onColorChange}
        onSelectChange={onSelectChange}
        onImageChange={onImageChange}
        onReorder={onReorder}
        getFrontPageUrl={getFrontPageUrl} // <-- Agregado
        getBackgroundImageUrl={getBackgroundImageUrl} // <-- Agregado
      />
    )}
  </div>
);

export default CategoryConfigTable;
