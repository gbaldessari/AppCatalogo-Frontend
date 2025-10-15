/**
 * Componente de tabla para mostrar y gestionar categorías.
 *
 * @remarks
 * Permite filtrar, ordenar, editar, eliminar y crear categorías.
 *
 * @param props - Propiedades del componente.
 * @param props.categories - Lista de categorías a mostrar.
 * @param props.loading - Indica si la tabla está cargando datos.
 * @param props.filter - Valor del filtro de búsqueda.
 * @param props.setFilter - Setter para el filtro de búsqueda.
 * @param props.sortAsc - Indica el orden de la columna (ascendente/descendente).
 * @param props.setSortAsc - Setter para el orden de la columna.
 * @param props.onEdit - Función para editar una categoría.
 * @param props.onDelete - Función para eliminar una categoría.
 * @param props.handleOpenCreate - Función para abrir el formulario de creación de categoría.
 * @returns La tabla de categorías.
 */
import React, { useState, useMemo, useEffect } from "react";
import type { GetCategoryResponse } from "../../../../../services/categories/types/GetCategory.type";

type CategoriesTableProps = {
  categories: GetCategoryResponse[];
  loading: boolean;
  filter: string;
  setFilter: (v: string) => void;
  sortAsc: boolean;
  setSortAsc: (v: boolean) => void;
  onEdit: (cat: GetCategoryResponse) => void;
  onDelete: (cat: GetCategoryResponse) => void;
  handleOpenCreate: () => void;
};

export const CategoriesTable: React.FC<CategoriesTableProps> = ({
  categories,
  loading,
  filter,
  setFilter,
  sortAsc,
  setSortAsc,
  onEdit,
  onDelete,
  handleOpenCreate
}) => {
  // Paginación
  const [rowsLimit, setRowsLimit] = useState<number | 'all'>(50);
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    if (rowsLimit === 'all') return 1;
    return Math.max(1, Math.ceil(categories.length / (rowsLimit || 1)));
  }, [categories.length, rowsLimit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [rowsLimit, categories.length]);

  const pageSize = rowsLimit === 'all' ? categories.length : (rowsLimit as number);
  const startIndex = rowsLimit === 'all' ? 0 : (page - 1) * (rowsLimit as number);
  const endIndex = rowsLimit === 'all'
    ? categories.length
    : Math.min(categories.length, startIndex + (rowsLimit as number));

  const displayedCategories = useMemo(() => {
    if (rowsLimit === 'all') return categories;
    return categories.slice(startIndex, endIndex);
  }, [categories, rowsLimit, startIndex, endIndex]);

  return (
    <div className="categories-table-container">
      <div className="create-category-header">
        <button className="create-category-btn" onClick={handleOpenCreate}>Crear Categoría</button>
        {/* Control de cantidad de filas */}
        <div className="categories-rows-control">
          <span>Mostrar</span>
          <select
            className="categories-rows-select"
            value={rowsLimit === 'all' ? 'all' : String(rowsLimit)}
            onChange={(e) => {
              const val = e.target.value;
              setRowsLimit(val === 'all' ? 'all' : Number(val));
            }}
            title="Cantidad máxima de categorías a mostrar"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>
      <table className="categories-table">
        <thead>
          <tr>
            <th
              className="categories-table-sortable"
              onClick={() => setSortAsc(!sortAsc)}
            >
              Nombre
              <span className="categories-table-sort-arrow">
                {sortAsc ? "▲" : "▼"}
              </span>
            </th>
            <th>Acciones</th>
          </tr>
          <tr>
            <th>
              <input
                type="text"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filtrar"
                className="categories-table-filter-input"
              />
            </th>
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={2}>Cargando...</td>
            </tr>
          ) : categories.length === 0 ? (
            <tr>
              <td colSpan={2}>Sin categorías</td>
            </tr>
          ) : (
            displayedCategories.map(cat => (
              <tr key={cat._id}>
                <td>{cat.name}</td>
                <td className="actions-cell">
                  <button onClick={() => onEdit(cat)}>Editar</button>
                  <button onClick={() => onDelete(cat)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {rowsLimit !== 'all' && totalPages > 1 && (
        <div className="categories-pagination">
          <div className="categories-page-info">
            Página {page} de {totalPages} — Mostrando {categories.length === 0 ? 0 : startIndex + 1}
            -
            {endIndex} de {categories.length}
          </div>
          <div className="categories-page-actions">
            <button
              className="categories-btn-page"
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="Primera página"
            >
              « Primero
            </button>
            <button
              className="categories-btn-page"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              title={`Mostrar ${pageSize} anteriores`}
            >
              ‹ Anterior {pageSize}
            </button>
            <button
              className="categories-btn-page"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              title={`Mostrar ${pageSize} siguientes`}
            >
              Siguiente {pageSize} ›
            </button>
            <button
              className="categories-btn-page"
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
  );
};
