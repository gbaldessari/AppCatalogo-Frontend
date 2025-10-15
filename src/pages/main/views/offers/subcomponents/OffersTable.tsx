/**
 * Componente de tabla para mostrar y gestionar ofertas.
 *
 * @remarks
 * Permite filtrar, ordenar, editar, eliminar y visualizar imágenes de ofertas.
 * Incluye filtros por columna, ordenamiento y acciones sobre cada oferta.
 *
 * @param props - Propiedades del componente.
 * @param props.offers - Lista de ofertas a mostrar (con datos extendidos).
 * @param props.loading - Indica si la tabla está cargando datos.
 * @param props.filters - Filtros aplicados por columna.
 * @param props.onFilterChange - Setter para los filtros.
 * @param props.sortField - Campo por el que se ordena la tabla.
 * @param props.sortDirection - Dirección del ordenamiento.
 * @param props.onSort - Función para cambiar el campo de ordenamiento.
 * @param props.onEdit - Función para editar una oferta.
 * @param props.onDelete - Función para eliminar una oferta.
 * @param props.getImageUrlById - Función para obtener la URL de la imagen por su ID.
 * @param props.onImageClick - Función opcional para abrir la imagen en un modal.
 * @returns La tabla de ofertas.
 */
import React, { useState, useMemo, useEffect } from "react";
import type { GetOfferResponse } from "../../../../../services/offers/types/GetOffers.type";

type SortField =
  | "productSku"
  | "productName"
  | "catalogueName"
  | "categoryName"
  | "newPrice"
  | "expiration";
type SortDirection = "asc" | "desc";

type OffersTableProps = {
  offers: (GetOfferResponse & {
    productName: string;
    catalogueName: string;
    categoryName: string;
    imageId: string;
  })[];
  loading: boolean;
  filters: Record<SortField, string>;
  onFilterChange: (field: SortField, value: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onEdit: (offer: GetOfferResponse) => void;
  onDelete: (offer: GetOfferResponse) => void;
  getImageUrlById: (payload: { imageId: string }) => string;
  onImageClick?: (src: string) => void;
};

export const OffersTable: React.FC<OffersTableProps> = ({
  offers,
  loading,
  filters,
  onFilterChange,
  sortField,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
  getImageUrlById,
  onImageClick
}) => {
  // Paginación
  const [rowsLimit, setRowsLimit] = useState<number | 'all'>(50);
  const [page, setPage] = useState(1);

  const totalPages = useMemo(() => {
    if (rowsLimit === 'all') return 1;
    return Math.max(1, Math.ceil(offers.length / (rowsLimit || 1)));
  }, [offers.length, rowsLimit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [totalPages]);

  useEffect(() => {
    setPage(1);
  }, [rowsLimit, offers.length]);

  const pageSize = rowsLimit === 'all' ? offers.length : (rowsLimit as number);
  const startIndex = rowsLimit === 'all' ? 0 : (page - 1) * (rowsLimit as number);
  const endIndex = rowsLimit === 'all'
    ? offers.length
    : Math.min(offers.length, startIndex + (rowsLimit as number));

  const displayedOffers = useMemo(() => {
    if (rowsLimit === 'all') return offers;
    return offers.slice(startIndex, endIndex);
  }, [offers, rowsLimit, startIndex, endIndex]);

  return (
    <div className="offers-table-container">
      {/* Toolbar: selector de filas */}
      <div className="offers-table-toolbar">
        <div className="offers-rows-control">
          <span>Mostrar</span>
          <select
            className="offers-rows-select"
            value={rowsLimit === 'all' ? 'all' : String(rowsLimit)}
            onChange={(e) => {
              const val = e.target.value;
              setRowsLimit(val === 'all' ? 'all' : Number(val));
            }}
            title="Cantidad máxima de ofertas a mostrar"
          >
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
            <option value="all">Todas</option>
          </select>
        </div>
      </div>

      <table className="offers-table">
        <thead>
          <tr>
            <th style={{ cursor: "pointer" }} onClick={() => onSort("productSku")}>
              SKU Producto
              {sortField === "productSku" && (
                <span style={{ marginLeft: 4 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => onSort("productName")}>
              Nombre
              {sortField === "productName" && (
                <span style={{ marginLeft: 4 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => onSort("catalogueName")}>
              Catálogo
              {sortField === "catalogueName" && (
                <span style={{ marginLeft: 4 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => onSort("categoryName")}>
              Categoría
              {sortField === "categoryName" && (
                <span style={{ marginLeft: 4 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => onSort("newPrice")}>
              Nuevo Precio
              {sortField === "newPrice" && (
                <span style={{ marginLeft: 4 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => onSort("expiration")}>
              Expiración
              {sortField === "expiration" && (
                <span style={{ marginLeft: 4 }}>{sortDirection === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
          <tr>
            <th>
              <input
                type="text"
                value={filters.productSku}
                onChange={e => onFilterChange("productSku", e.target.value)}
                placeholder="Filtrar"
                style={{ width: "90%", fontSize: "0.95em" }}
              />
            </th>
            <th>
              <input
                type="text"
                value={filters.productName}
                onChange={e => onFilterChange("productName", e.target.value)}
                placeholder="Filtrar"
                style={{ width: "90%", fontSize: "0.95em" }}
              />
            </th>
            <th>
              <input
                type="text"
                value={filters.catalogueName}
                onChange={e => onFilterChange("catalogueName", e.target.value)}
                placeholder="Filtrar"
                style={{ width: "90%", fontSize: "0.95em" }}
              />
            </th>
            <th>
              <input
                type="text"
                value={filters.categoryName}
                onChange={e => onFilterChange("categoryName", e.target.value)}
                placeholder="Filtrar"
                style={{ width: "90%", fontSize: "0.95em" }}
              />
            </th>
            <th>
              <input
                type="text"
                value={filters.newPrice}
                onChange={e => onFilterChange("newPrice", e.target.value)}
                placeholder="Filtrar"
                style={{ width: "90%", fontSize: "0.95em" }}
              />
            </th>
            <th>
              <input
                type="text"
                value={filters.expiration}
                onChange={e => onFilterChange("expiration", e.target.value)}
                placeholder="Filtrar"
                style={{ width: "90%", fontSize: "0.95em" }}
              />
            </th>
            <th />
            <th />
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8}>Cargando...</td>
            </tr>
          ) : offers.length === 0 ? (
            <tr>
              <td colSpan={8}>Sin ofertas</td>
            </tr>
          ) : (
            displayedOffers.map(offer => (
              <tr key={offer._id}>
                <td>{offer.productSku}</td>
                <td>{offer.productName}</td>
                <td>{offer.catalogueName}</td>
                <td>{offer.categoryName}</td>
                <td>{offer.newPrice}</td>
                <td>{offer.expiration ? String(offer.expiration).substring(0, 10) : "-"}</td>
                <td>
                  {offer.imageId && (
                    <img
                      src={getImageUrlById({ imageId: offer.imageId })}
                      alt="Oferta"
                      style={{
                        width: 56,
                        height: 56,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        cursor: "pointer"
                      }}
                      onClick={() => {
                        if (onImageClick) onImageClick(getImageUrlById({ imageId: offer.imageId }));
                      }}
                    />
                  )}
                </td>
                <td className="actions-cell">
                  <button onClick={() => onEdit(offer)}>Editar</button>
                  <button onClick={() => onDelete(offer)}>Eliminar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      {rowsLimit !== 'all' && totalPages > 1 && (
        <div className="offers-pagination">
          <div className="offers-page-info">
            Página {page} de {totalPages} — Mostrando {offers.length === 0 ? 0 : startIndex + 1}
            -
            {endIndex} de {offers.length}
          </div>
          <div className="offers-page-actions">
            <button
              className="offers-btn-page"
              onClick={() => setPage(1)}
              disabled={page === 1}
              title="Primera página"
            >
              « Primero
            </button>
            <button
              className="offers-btn-page"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              title={`Mostrar ${pageSize} anteriores`}
            >
              ‹ Anterior {pageSize}
            </button>
            <button
              className="offers-btn-page"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              title={`Mostrar ${pageSize} siguientes`}
            >
              Siguiente {pageSize} ›
            </button>
            <button
              className="offers-btn-page"
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
