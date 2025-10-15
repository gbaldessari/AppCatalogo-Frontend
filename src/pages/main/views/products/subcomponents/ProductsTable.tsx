/**
 * Componente de tabla para mostrar y gestionar productos.
 *
 * @remarks
 * Permite filtrar, ordenar, editar y crear ofertas sobre productos.
 * Incluye filtros por columna, ordenamiento, previsualización de imágenes y acciones sobre cada producto.
 *
 * @param props - Propiedades del componente.
 * @param props.products - Lista de productos a mostrar.
 * @param props.categories - Lista de categorías para mostrar el nombre de la categoría.
 * @param props.loading - Indica si la tabla está cargando datos.
 * @param props.onEdit - Función para editar un producto.
 * @param props.onOffer - Función para crear una oferta sobre un producto.
 * @param props.getImageUrlById - Función para obtener la URL de la imagen por su ID.
 * @param props.onImageClick - Función opcional para abrir la imagen en un modal.
 * @param props.handleOpenCreate - Función para abrir el formulario de creación de producto.
 * @returns La tabla de productos.
 */
import React, { useState, useMemo, useEffect } from "react";
import type { GetProductResponse } from "../../../../../services/products/types/GetProducts.type";
import type { GetCategoryResponse } from "../../../../../services/categories/types/GetCategory.type";
import "../productsWindow.css";

type ProductsTableProps = {
  products: GetProductResponse[];
  categories: GetCategoryResponse[];
  loading: boolean;
  onEdit: (product: GetProductResponse) => void;
  onOffer: (product: GetProductResponse) => void;
  getImageUrlById: (payload: { imageId: string }) => string;
  onImageClick?: (src: string) => void;
  handleOpenCreate: () => void;
  selectedProducts?: string[];
  onSelectProduct?: (sku: string, checked: boolean) => void;
  onSelectAll?: (skus: string[], checked: boolean) => void;
  onDeleteSelected?: () => void; // <-- Agregado
};

type SortField = keyof Omit<GetProductResponse, "imageId" | "_id"> | "categoryName";
type SortDirection = "asc" | "desc";

const HEADERS: { key: SortField | "imageId" | "actions" | "select"; label: string }[] = [
  { key: "select", label: "" }, // NUEVO: columna de selección
  { key: "sku", label: "SKU" },
  { key: "name", label: "Nombre" },
  { key: "catalogueName", label: "Catálogo" },
  { key: "isActive", label: "Activo" },
  { key: "units", label: "Unidades" },
  { key: "categoryName", label: "Categoría" },
  { key: "price", label: "Precio" },
  { key: "imageId", label: "Imagen" },
  { key: "actions", label: "Acciones" },
];

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  categories,
  loading,
  onEdit,
  onOffer,
  getImageUrlById,
  onImageClick,
  handleOpenCreate,
  selectedProducts = [],
  onSelectProduct,
  onSelectAll,
  onDeleteSelected,
}) => {
  // Estado para ordenamiento
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  // Estado para filtros
  const [filters, setFilters] = useState<Record<SortField, string>>({
    sku: "",
    name: "",
    catalogueName: "",
    isActive: "",
    units: "",
    categoryName: "",
    price: "",
    categoryId: "",
  });
  // Paginación
  const [rowsLimit, setRowsLimit] = useState<number | 'all'>(50);
  const [page, setPage] = useState(1);

  // Memo para productos con nombre de categoría
  const productsWithCategory = useMemo(() => {
    return products.map(prod => ({
      ...prod,
      categoryName: categories.find(c => c._id === prod.categoryId)?.name || prod.categoryId,
    }));
  }, [products, categories]);

  // Filtrado
  const filteredProducts = useMemo(() => {
    return productsWithCategory.filter(prod =>
      Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === "isActive") {
          const norm = value.toLowerCase().replace("í", "i");
            if (norm === "si") return prod.isActive === true;
            if (norm === "no") return prod.isActive === false;
            return true;
        }
        const prodValue = prod[key as SortField];
        return prodValue !== undefined && String(prodValue).toLowerCase().includes(value.toLowerCase());
      })
    );
  }, [productsWithCategory, filters]);

  // Ordenamiento
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      // Convertir a string para comparar (excepto units y price)
      if (sortField === "units" || sortField === "price") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredProducts, sortField, sortDirection]);

  // Handler para ordenar
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(dir => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handler para filtros
  const handleFilterChange = (field: SortField, value: string) => {
    setFilters(f => ({ ...f, [field]: value }));
  };

  const totalPages = useMemo(() => {
    if (rowsLimit === 'all') return 1;
    return Math.max(1, Math.ceil(sortedProducts.length / (rowsLimit || 1)));
  }, [sortedProducts.length, rowsLimit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages]); // ensure valid page

  // Resetear a la primera página cuando cambien filtros/orden/límite
  useEffect(() => {
    setPage(1);
  }, [rowsLimit, filters, sortField, sortDirection]);

  const pageSize = rowsLimit === 'all' ? sortedProducts.length : (rowsLimit as number);
  const startIndex = rowsLimit === 'all' ? 0 : (page - 1) * (rowsLimit as number);
  const endIndex = rowsLimit === 'all'
    ? sortedProducts.length
    : Math.min(sortedProducts.length, startIndex + (rowsLimit as number));

  const displayedProducts = useMemo(() => {
    if (rowsLimit === 'all') return sortedProducts;
    return sortedProducts.slice(startIndex, endIndex);
  }, [sortedProducts, rowsLimit, startIndex, endIndex]);

  // Para seleccionar todos los productos de la página actual
  const allDisplayedSkus = useMemo(() => displayedProducts.map(prod => prod.sku), [displayedProducts]);
  const allSelectedOnPage = allDisplayedSkus.every(sku => selectedProducts.includes(sku));
  const someSelectedOnPage = allDisplayedSkus.some(sku => selectedProducts.includes(sku));

  return (
    <div className="products-table-container">
      <div className="products-rows-control">
        <button
          className="create-product-btn"
          onClick={handleOpenCreate}>
          Crear Producto
        </button>
        {/* Botón para eliminar productos seleccionados */}
        <button
          className="delete-product-btn"
          disabled={selectedProducts.length === 0}
          onClick={onDeleteSelected}
          id="delete-selected-btn"
        >
          Eliminar seleccionados ({selectedProducts.length})
        </button>
        <span>Mostrar</span>
        <select
          className="products-rows-select"
          value={rowsLimit === 'all' ? 'all' : String(rowsLimit)}
          onChange={(e) => {
            const val = e.target.value;
            setRowsLimit(val === 'all' ? 'all' : Number(val));
          }}
          title="Cantidad máxima de productos a mostrar"
        >
          <option value="50">50</option>
          <option value="100">100</option>
          <option value="200">200</option>
          <option value="500">500</option>
          <option value="all">Todos</option>
        </select>
      </div>
      {/* Contenedor y wrapper similares a Vendors */}
      <div className="products-data-table-container">
        <div className="products-table-wrapper">
          <table className="products-table">
            <thead>
              <tr>
                {HEADERS.map(header => (
                  <th
                    key={header.key}
                    style={{
                      cursor:
                        header.key !== "imageId" && header.key !== "actions" && header.key !== "select"
                          ? "pointer"
                          : "default",
                      userSelect: "none",
                      width: header.key === "select" ? 32 : undefined,
                      textAlign: header.key === "select" ? "center" : undefined,
                    }}
                    onClick={() =>
                      header.key !== "imageId" &&
                      header.key !== "actions" &&
                      header.key !== "select" &&
                      handleSort(header.key as SortField)
                    }
                  >
                    {header.key === "select" ? (
                      <input
                        type="checkbox"
                        checked={allSelectedOnPage && displayedProducts.length > 0}
                        ref={el => {
                          if (el) el.indeterminate = !allSelectedOnPage && someSelectedOnPage;
                        }}
                        onChange={e => onSelectAll && onSelectAll(allDisplayedSkus, e.target.checked)}
                        title="Seleccionar todos"
                      />
                    ) : (
                      <>
                        {header.label}
                        {header.key === sortField && (
                          <span style={{ marginLeft: 4 }}>
                            {sortDirection === "asc" ? "▲" : "▼"}
                          </span>
                        )}
                      </>
                    )}
                  </th>
                ))}
              </tr>
              <tr>
                {HEADERS.map(header =>
                  header.key !== "imageId" && header.key !== "actions" && header.key !== "select" ? (
                    <th key={header.key + "-filter"}>
                      {header.key === "isActive" ? (
                        <select
                          className="products-filter-active"
                          value={filters.isActive}
                          onChange={e => handleFilterChange("isActive", e.target.value)}
                          style={{ width: "95%", fontSize: "0.9em" }}
                        >
                          <option value="">Todos</option>
                          <option value="si">Sí</option>
                          <option value="no">No</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={filters[header.key as SortField] || ""}
                          onChange={e =>
                            handleFilterChange(header.key as SortField, e.target.value)
                          }
                          placeholder="Filtrar"
                          style={{ width: "90%", fontSize: "0.95em" }}
                        />
                      )}
                    </th>
                  ) : (
                    <th key={header.key + "-filter"} />
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={HEADERS.length}>Cargando...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={HEADERS.length}>Sin Productos</td>
                </tr>
              ) : (displayedProducts.map(prod => (
                <tr key={prod._id}>
                  <td style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(prod.sku)}
                      onChange={e => onSelectProduct && onSelectProduct(prod.sku, e.target.checked)}
                      title="Seleccionar producto"
                    />
                  </td>
                  <td>{prod.sku}</td>
                  <td>{prod.name}</td>
                  <td>{prod.catalogueName}</td>
                  <td>{prod.isActive ? "Sí" : "No"}</td>
                  <td>{prod.units}</td>
                  <td>{prod.categoryName}</td>
                  <td>{prod.price}</td>
                  <td>
                    {prod.imageId ? (
                      <img
                        src={getImageUrlById({ imageId: prod.imageId })}
                        alt={prod.name}
                        style={{ maxWidth: 60, maxHeight: 60, cursor: "pointer" }}
                        onClick={() => {
                          if (onImageClick) onImageClick(getImageUrlById({ imageId: prod.imageId }));
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="actions-cell">
                    <button onClick={() => onEdit(prod)}>Editar</button>
                    <button onClick={() => onOffer(prod)}>Crear Oferta</button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>

        {/* Controles de paginación */}
        {rowsLimit !== 'all' && totalPages > 1 && (
          <div className="products-pagination">
            <div className="products-page-info">
              Página {page} de {totalPages} — Mostrando {sortedProducts.length === 0 ? 0 : startIndex + 1}
              -
              {endIndex} de {sortedProducts.length}
            </div>
            <div className="products-page-actions">
              <button
                className="products-btn-page"
                onClick={() => setPage(1)}
                disabled={page === 1}
                title="Primera página"
              >
                « Primero
              </button>
              <button
                className="products-btn-page"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                title={`Mostrar ${pageSize} anteriores`}
              >
                ‹ Anterior {pageSize}
              </button>
              <button
                className="products-btn-page"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                title={`Mostrar ${pageSize} siguientes`}
              >
                Siguiente {pageSize} ›
              </button>
              <button
                className="products-btn-page"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                title="Última página"
              >
                Último »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
