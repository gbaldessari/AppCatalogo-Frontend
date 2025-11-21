/**
 * Componente de tabla para configurar colores e imágenes de categorías en la generación de catálogos.
 *
 * @remarks
 * Permite seleccionar categorías, asignar colores y subir imágenes de portada y fondo para cada categoría.
 * Incluye previsualización de imágenes y selección global.
 *
 * @param props - Propiedades del componente.
 * @param props.categories - Lista de categorías disponibles.
 * @param props.categoriesPayload - Estado extendido de cada categoría (color, imágenes, selección).
 * @param props.onColorChange - Función para cambiar el color de una categoría.
 * @param props.onSelectChange - Función para seleccionar/deseleccionar una categoría.
 * @param props.onImageChange - Función para subir imágenes de portada o fondo.
 * @returns La tabla de configuración de categorías para el catálogo.
 */
import React, { useMemo, useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { CategoryPayload } from "../../../../../services/generate-catalog/types/GenerateCatalog.type";
import type { GetCategoryResponse } from "../../../../../services/categories/types/GetCategory.type";
import { ChromePicker, type ColorResult } from "react-color";

interface CategoryPayloadExtended extends Omit<CategoryPayload, "frontPage" | "backgroundImage"> {
  selected?: boolean;
  frontPage?: File;
  backgroundImage?: File;
}

interface Props {
  categories: GetCategoryResponse[];
  categoriesPayload: CategoryPayloadExtended[];
  onColorChange: (categoryId: string, color: string) => void;
  onSelectChange: (categoryId: string, selected: boolean) => void;
  onImageChange: (categoryId: string, type: "frontPage" | "backgroundImage", file: File | undefined) => void;
  onReorder: (fromIndex: number, toIndex: number) => void; // NUEVO
  getFrontPageUrl: (cat: any) => string | null;
  getBackgroundImageUrl: (cat: any) => string | null;
}

const CategoryColorTable: React.FC<Props> = ({
  categories = [],
  categoriesPayload = [],
  onColorChange,
  onSelectChange,
  onImageChange,
  onReorder,
  getFrontPageUrl,
  getBackgroundImageUrl,
}) => {
  // Previews de imágenes por categoría
  const previews = useMemo(() => {
    const map: Record<string, { frontPage?: string; backgroundImage?: string }> = {};
    categoriesPayload.forEach(cat => {
      if (cat.frontPage) {
        map[cat._id] = map[cat._id] || {};
        map[cat._id].frontPage = URL.createObjectURL(cat.frontPage);
      }
      if (cat.backgroundImage) {
        map[cat._id] = map[cat._id] || {};
        map[cat._id].backgroundImage = URL.createObjectURL(cat.backgroundImage);
      }
    });
    return map;
    // eslint-disable-next-line
  }, [categoriesPayload.map(c => `${c._id}-${c.frontPage?.name}-${c.backgroundImage?.name}` ).join(",")]);

  React.useEffect(() => {
    return () => {
      Object.values(previews).forEach(obj => {
        if (obj.frontPage) URL.revokeObjectURL(obj.frontPage);
        if (obj.backgroundImage) URL.revokeObjectURL(obj.backgroundImage);
      });
    };
  }, [previews]);

  if (!categories.length) {
    return <div>No hay categorías para mostrar.</div>;
  }

  // --- Estilo para el botón personalizado ---
  const uploadBtnStyle: React.CSSProperties = {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "6px 16px",
    fontSize: "0.98em",
    fontWeight: 500,
    marginTop: 0,
    marginBottom: 0,
    cursor: "pointer",
    transition: "background 0.18s",
    boxShadow: "0 2px 8px rgba(37,99,235,0.07)",
    outline: "none",
    display: "inline-block"
  };

  // Estado para el modal de imagen
  const [modalImg, setModalImg] = useState<string | null>(null);

  // --- NUEVO: Selección global basada en el payload (respeta orden actual) ---
  const allSelected = categoriesPayload.length > 0 && categoriesPayload.every(c => c.selected);
  const someSelected = categoriesPayload.some(c => c.selected);

  const handleSelectAll = (checked: boolean) => {
    categoriesPayload.forEach(cat => {
      onSelectChange(cat._id, checked);
    });
  };

  // Modal de imagen
  const ImageModal = ({ src, onClose }: { src: string; onClose: () => void }) => (
    <div
      style={{
        position: "fixed",
        zIndex: 9999,
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onClick={onClose}
    >
      <img
        src={src}
        alt="Vista previa"
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          borderRadius: 12,
          boxShadow: "0 4px 32px rgba(0,0,0,0.25)",
          background: "#fff",
          cursor: "pointer"
        }}
        onClick={onClose}
      />
    </div>
  );

  // Estado para mostrar el picker de color por categoría
  const [colorPickerOpen, setColorPickerOpen] = useState<{ [catId: string]: boolean }>({});
  const pickerRefs = useRef<{ [catId: string]: HTMLDivElement | null }>({});
  const [pickerPosition, setPickerPosition] = useState<{ [catId: string]: { top: number; left: number } }>({});
  const portalTarget = typeof document !== "undefined" ? document.body : null;

  // Cierra el picker si se hace clic fuera
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      Object.keys(colorPickerOpen).forEach(catId => {
        if (colorPickerOpen[catId]) {
          const ref = pickerRefs.current[catId];
          if (ref && !ref.contains(e.target as Node)) {
            setColorPickerOpen(prev => ({ ...prev, [catId]: false }));
          }
        }
      });
    };
    if (Object.values(colorPickerOpen).some(Boolean)) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [colorPickerOpen]);


  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragCursorY, setDragCursorY] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [dragRowTop, setDragRowTop] = useState(0);
  const [dragRowHeight, setDragRowHeight] = useState(0);

  const handlePointerDown = (event: React.PointerEvent<HTMLSpanElement>, index: number) => {
    if (dragIndex !== null) return;
    const row = rowRefs.current[index];
    if (!row) return;
    const rect = row.getBoundingClientRect();
    setDragIndex(index);
    setDragOverIndex(index);
    setDragCursorY(event.clientY);
    setDragOffsetY(event.clientY - rect.top);
    setDragRowTop(rect.top);
    setDragRowHeight(rect.height);
    event.preventDefault();
    event.stopPropagation();
  };

  React.useEffect(() => {
    if (dragIndex === null || !categoriesPayload.length) return;
    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault();
      const clientY = event.clientY;
      setDragCursorY(clientY);
      let nextIndex = dragIndex;
      let found = false;
      for (let idx = 0; idx < categoriesPayload.length; idx++) {
        if (idx === dragIndex) continue;
        const ref = rowRefs.current[idx];
        if (!ref) continue;
        const rect = ref.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        if (clientY < midpoint) {
          nextIndex = idx < dragIndex ? idx : idx - 1;
          found = true;
          break;
        }
      }
      if (!found) {
        nextIndex = categoriesPayload.length - 1;
      }
      nextIndex = Math.max(0, Math.min(categoriesPayload.length - 1, nextIndex));
      setDragOverIndex(prev => (prev === nextIndex ? prev : nextIndex));
    };
    const handlePointerUp = () => {
      if (dragIndex !== null && dragOverIndex !== null && dragOverIndex !== dragIndex) {
        onReorder(dragIndex, dragOverIndex);
      }
      setDragIndex(null);
      setDragOverIndex(null);
      setDragCursorY(0);
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    const prevSelect = document.body.style.userSelect;
    const prevCursor = document.body.style.cursor;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "grabbing";
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      document.body.style.userSelect = prevSelect;
      document.body.style.cursor = prevCursor;
    };
  }, [categoriesPayload.length, dragIndex, dragOverIndex, onReorder]);

  return (
    <div className="category-color-table-container">
      {modalImg && <ImageModal src={modalImg} onClose={() => setModalImg(null)} />}
      <div className="category-color-table-scroll-wrapper">
        <table className="category-color-table">
          <thead>
            <tr>
              <th>
                {/* Checkbox para seleccionar/deseleccionar todas */}
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={el => {
                    if (el) el.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={e => handleSelectAll(e.target.checked)}
                  title="Seleccionar/Deseleccionar todas"
                />
                Incluir
              </th>
              <th>Nombre</th>
              <th>Color</th>
              <th>Hex</th>
              <th>Portada</th>
              <th>Fondo</th>
            </tr>
          </thead>
          <tbody>
            {categoriesPayload.map((catPayload, index) => {
              const cat = categories.find(c => c._id === catPayload._id);
              // --- Color actual para ChromePicker ---
              let colorValue = catPayload.color || "#000000";
              // Si es hex con alfa, conviértelo a rgba para ChromePicker
              const hexToRgba = (hex: string) => {
                if (/^#([A-Fa-f0-9]{8})$/.test(hex)) {
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  const a = parseInt(hex.slice(7, 9), 16) / 255;
                  return { r, g, b, a };
                }
                if (/^#([A-Fa-f0-9]{6})$/.test(hex)) {
                  const r = parseInt(hex.slice(1, 3), 16);
                  const g = parseInt(hex.slice(3, 5), 16);
                  const b = parseInt(hex.slice(5, 7), 16);
                  return { r, g, b, a: 1 };
                }
                // Si es rgba, intenta parsear
                const match = colorValue.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
                if (match) {
                  return {
                    r: Number(match[1]),
                    g: Number(match[2]),
                    b: Number(match[3]),
                    a: match[4] !== undefined ? Number(match[4]) : 1
                  };
                }
                // Por defecto negro
                return { r: 0, g: 0, b: 0, a: 1 };
              };
              const rgba = hexToRgba(colorValue);

              // Agrega la función aquí:
              const rgbaToString = (rgba: { r: number; g: number; b: number; a: number }) =>
                `rgba(${rgba.r},${rgba.g},${rgba.b},${Number(rgba.a.toFixed(2))})`;

              return (
                <tr
                  ref={el => { rowRefs.current[index] = el; }}
                  key={catPayload._id}
                  className={[
                    "category-color-row",
                    dragIndex === index ? "is-dragging" : "",
                    dragIndex !== null &&
                      dragOverIndex !== null &&
                      index !== dragIndex &&
                      (
                        (dragIndex < dragOverIndex && index > dragIndex && index <= dragOverIndex) ||
                        (dragIndex > dragOverIndex && index >= dragOverIndex && index < dragIndex)
                      )
                      ? "is-shifting"
                      : ""
                  ].filter(Boolean).join(" ")}
                  style={(() => {
                    const style: React.CSSProperties = {};
                    const currentRect = rowRefs.current[index]?.getBoundingClientRect();
                    const shiftAmount = dragRowHeight || currentRect?.height || 0;
                    if (dragIndex === index) {
                      style.transform = `translateY(${dragCursorY - dragRowTop - dragOffsetY}px)`;
                      style.pointerEvents = "none";
                      style.transition = "none";
                      style.zIndex = 3;
                    } else if (dragIndex !== null && dragOverIndex !== null && shiftAmount) {
                      if (dragIndex < dragOverIndex && index > dragIndex && index <= dragOverIndex) {
                        style.transform = `translateY(${-shiftAmount}px)`;
                      } else if (dragIndex > dragOverIndex && index >= dragOverIndex && index < dragIndex) {
                        style.transform = `translateY(${shiftAmount}px)`;
                      }
                    }
                    return style;
                  })()}
                  title="Arrastra para reordenar"
                >
                  <td>
                    {/* Handle + checkbox */}
                    <span
                      className="drag-handle"
                      title="Arrastrar para reordenar"
                      onPointerDown={e => handlePointerDown(e, index)}
                    >
                      ≡
                    </span>
                    <input
                      type="checkbox"
                      checked={!!catPayload.selected}
                      onChange={e => onSelectChange(catPayload._id, e.target.checked)}
                      style={{ marginLeft: 6 }}
                    />
                  </td>
                  <td>{cat?.name ?? catPayload._id}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          border: "1px solid #bbb",
                          background: (() => {
                            if (
                              /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(colorValue) ||
                              /^rgba?\(\d+,\s*\d+,\s*\d+(?:,\s*[\d.]+)?\)$/.test(colorValue)
                            ) {
                              return colorValue;
                            }
                            // Si no, usa el valor convertido a rgba
                            return rgbaToString(rgba);
                          })(),
                          cursor: catPayload.selected ? "pointer" : "not-allowed",
                          transition: "box-shadow 0.15s",
                          boxShadow: colorPickerOpen[catPayload._id] ? "0 0 0 2px #2563eb55" : "none"
                        }}
                        title="Seleccionar color"
                        onClick={e => {
                          if (catPayload.selected) {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            const pickerHeight = 220;
                            const pickerWidth = 240;
                            const viewportHeight = window.innerHeight;
                            const viewportWidth = window.innerWidth;
                            let top = rect.bottom + window.scrollY + 8;
                            if (rect.bottom + pickerHeight > viewportHeight) {
                              top = rect.top + window.scrollY - pickerHeight - 8;
                            }
                            let left = rect.left + window.scrollX;
                            if (left + pickerWidth > viewportWidth) {
                              left = window.scrollX + viewportWidth - pickerWidth - 16;
                            }
                            setPickerPosition(prev => ({
                              ...prev,
                              [catPayload._id]: { top, left }
                            }));
                            setColorPickerOpen(prev => ({
                              ...prev,
                              [catPayload._id]: !prev[catPayload._id]
                            }));
                          }
                        }}
                      />
                      {/* Mostrar el picker si está abierto */}
                      {colorPickerOpen[catPayload._id] && catPayload.selected && pickerPosition[catPayload._id] && portalTarget &&
                        createPortal(
                          <div
                            ref={el => { pickerRefs.current[catPayload._id] = el; }}
                            style={{
                              position: "absolute",
                              top: pickerPosition[catPayload._id].top,
                              left: pickerPosition[catPayload._id].left,
                              zIndex: 1000
                            }}
                          >
                            <ChromePicker
                              color={rgba}
                              onChange={(color: ColorResult) => {
                                const { r, g, b, a } = color.rgb;
                                onColorChange(
                                  catPayload._id,
                                  `rgba(${r},${g},${b},${a !== undefined ? Number(a.toFixed(2)) : 1})`
                                );
                              }}
                              disableAlpha={false}
                            />
                          </div>,
                          portalTarget
                        )
                      }
                    </div>
                  </td>
                  {/* Mostrar siempre el color en hexadecimal */}
                  <td>
                    {/* Mostrar siempre el color en hexadecimal */}
                    {(() => {
                      // Si el color es rgba, conviértelo a hex con alfa
                      const match = colorValue.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
                      if (match) {
                        const r = Number(match[1]);
                        const g = Number(match[2]);
                        const b = Number(match[3]);
                        const a = match[4] !== undefined ? Math.round(Number(match[4]) * 255) : 255;
                        const toHex = (v: number) => v.toString(16).padStart(2, "0");
                        return `#${toHex(r)}${toHex(g)}${toHex(b)}${a !== 255 ? toHex(a) : ""}`.toUpperCase();
                      }
                      // Si es hex, muéstralo tal cual
                      return colorValue;
                    })()}
                  </td>
                  <td>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 80,
                      position: "relative"
                    }}>
                      <label style={{ display: "inline-block" }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={e =>
                            onImageChange(
                              catPayload._id,
                              "frontPage",
                              e.target.files && e.target.files[0] ? e.target.files[0] : undefined
                            )
                          }
                          disabled={!catPayload.selected}
                        />
                        <span
                          style={{
                            ...uploadBtnStyle,
                            opacity: catPayload.selected ? 1 : 0.5,
                            pointerEvents: catPayload.selected ? "auto" : "none"
                          }}
                        >
                          Subir imagen
                        </span>
                      </label>
                      {/* Mostrar imagen guardada o seleccionada */}
                      {catPayload.selected && getFrontPageUrl(catPayload) && (
                        <img
                          src={getFrontPageUrl(catPayload)!}
                          alt="Portada"
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 6,
                            marginTop: 8,
                            border: "1px solid #ccc",
                            cursor: "pointer"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            setModalImg(getFrontPageUrl(catPayload) ?? null);
                          }}
                        />
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 80,
                      position: "relative"
                    }}>
                      <label style={{ display: "inline-block" }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={e =>
                            onImageChange(
                              catPayload._id,
                              "backgroundImage",
                              e.target.files && e.target.files[0] ? e.target.files[0] : undefined
                            )
                          }
                          disabled={!catPayload.selected}
                        />
                        <span
                          style={{
                            ...uploadBtnStyle,
                            opacity: catPayload.selected ? 1 : 0.5,
                            pointerEvents: catPayload.selected ? "auto" : "none"
                          }}
                        >
                          Subir imagen
                        </span>
                      </label>
                      {/* Mostrar imagen guardada o seleccionada */}
                      {catPayload.selected && getBackgroundImageUrl(catPayload) && (
                        <img
                          src={getBackgroundImageUrl(catPayload)!}
                          alt="Fondo"
                          style={{
                            width: 56,
                            height: 56,
                            objectFit: "cover",
                            borderRadius: 6,
                            marginTop: 8,
                            border: "1px solid #ccc",
                            cursor: "pointer"
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            setModalImg(getBackgroundImageUrl(catPayload) ?? null);
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryColorTable;
