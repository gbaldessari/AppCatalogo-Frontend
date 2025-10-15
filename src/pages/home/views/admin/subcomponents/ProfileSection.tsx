/**
 * Componente para mostrar la información del perfil del usuario.
 *
 * @remarks
 * Muestra el email, nombre y apellido del usuario, y permite abrir el modal de edición.
 *
 * @param props - Propiedades del componente.
 * @param props.firstName - Nombre del usuario.
 * @param props.lastName - Apellido del usuario.
 * @param props.email - Email del usuario.
 * @param props.onUpdate - Función para abrir el modal de edición.
 * @param props.loading - Estado de carga del botón.
 * @returns El formulario de perfil del usuario.
 */
export function ProfileSection({
  firstName,
  lastName,
  email,
  onUpdate,
  loading,
}: {
  firstName: string;
  lastName: string;
  email: string;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  onUpdate: () => void;
  loading: boolean;
}) {
  return (
    <div className="admin-minimal-section">
      <h2>Perfil</h2>
      <div className="admin-minimal-row">
        <label>Email:</label>
        <input type="text" value={email} disabled className="admin-minimal-input" />
      </div>
      <div className="admin-minimal-row">
        <label>Nombre:</label>
        <input
          type="text"
          value={firstName}
          className="admin-minimal-input"
          disabled
        />
      </div>
      <div className="admin-minimal-row">
        <label>Apellido:</label>
        <input
          type="text"
          value={lastName}
          className="admin-minimal-input"
          disabled
        />
      </div>
      <button
        className={`submit-button ${loading ? "loading" : ""}`}
        onClick={onUpdate}
        disabled={loading}
      >
        {loading ? (
          <div className="spinner">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        ) : (
          "Actualizar Perfil"
        )}
      </button>
    </div>
  );
}