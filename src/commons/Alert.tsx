/**
 * Componente de alerta visual.
 *
 * @remarks
 * Muestra una alerta de tipo "error" o "success" según la prop `type`.
 * El mensaje y la visibilidad se controlan mediante las props `message` y `show`.
 *
 * @param props - Propiedades del componente.
 * @param props.type - Tipo de alerta a mostrar ("error" | "success").
 * @param props.message - Mensaje a mostrar en la alerta.
 * @param props.show - Controla la visibilidad de la alerta.
 * @returns El componente de alerta.
 */

import './alert.css'

export function Alert({
  type,
  message,
  show,
}: {
  type: "error" | "success";
  message: string;
  show: boolean;
}) {
  return (
    <div className={`${type}-alert ${show ? "show" : "hide"}`}>
      {/* Mensaje de la alerta */}
      <span>{message}</span>
    </div>
  );
}