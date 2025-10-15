/**
 * Tipo para la información de una categoría al generar un catálogo.
 *
 * @remarks
 * Incluye el identificador, color, imagen de portada y fondo de la categoría.
 */
export type CategoryPayload = {
  /**
   * Id de la categoría.
   */
  _id: string;
  /**
   * Color de la categoría en formato hexadecimal.
   */
  color: string;
  /**
   * Imagen de portada de la categoría.
   */
  frontPage: File | string; // No acepta null ni undefined
  /**
   * Imagen de fondo de la categoría.
   */
  backgroundImage: File | string; // No acepta null ni undefined
}

/**
 * Tipo para el payload de generación de un catálogo.
 *
 * @remarks
 * Incluye las imágenes principales y la configuración de las categorías seleccionadas.
 */
export type GenerateCatalogPayload = {
  /**
   * Nombre del archivo a generar.
   */
  fileName: string;
  /**
   * Imagen de portada del catálogo.
   */
  frontPage: File;
  /**
   * Imagenes extra del catálogo.
   */
  extraImages: File[];
  /**
   * Imagen de contraportada del catálogo.
   */
  backPage: File;
  /**
   * Categorías del catálogo con sus colores y archivos de imagen.
   */
  categoriesPayload: CategoryPayload[];
  /**
   * Indica si se deben mostrar los precios de los productos en el catálogo.
   */
  visiblePrices: boolean;
  /**
   * Indica si se deben mostrar las ofertas de los productos en el catálogo.
   */
  visibleOffers: boolean;
}
