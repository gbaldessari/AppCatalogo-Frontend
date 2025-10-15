import { useState, useEffect } from "react";
import { getUsers, giveAppAccess, deleteUser } from "../../../../../services/auth/auth.service";
import type { GetUsersResponse } from "../../../../../services/auth/types/GetUsers.type";

interface UsersManagementSectionProps {
  onShowAlert: (type: "success" | "error", message: string) => void;
}

export function UsersManagementSection({ onShowAlert }: UsersManagementSectionProps) {
  const [users, setUsers] = useState<GetUsersResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    userId: string;
    userName: string;
    loading: boolean;
  } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const accessToken = localStorage.getItem("accessToken") || "";
    const response = await getUsers(accessToken);
    
    if (response.success && response.data) {
      setUsers(response.data);
    } else {
      onShowAlert("error", "Error al cargar usuarios");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAppAccessToggle = async (userId: string, app: "catalog", currentValue: boolean) => {
    setActionLoading(userId + app);
    const accessToken = localStorage.getItem("accessToken") || "";
    
    const user = users.find(u => u._id === userId);
    if (!user) {
      onShowAlert("error", "Usuario no encontrado");
      setActionLoading(null);
      return;
    }

    const payload = {
      userId,
      catalog: app === "catalog" ? !currentValue : user.appAccess.catalog,
    };

    const response = await giveAppAccess(accessToken, payload);
    
    if (response.success) {
      // Actualizar estado local inmediatamente
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u._id === userId 
            ? {
                ...u,
                appAccess: {
                  ...u.appAccess,
                  [app]: !currentValue
                }
              }
            : u
        )
      );
      
      onShowAlert("success", `Acceso a ${app} ${!currentValue ? "otorgado" : "revocado"} correctamente`);
    } else {
      onShowAlert("error", `Error al modificar acceso a ${app}`);
    }
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setDeleteModal({ userId, userName, loading: false });
  };

  const confirmDeleteUser = async () => {
    if (!deleteModal) return;

    setDeleteModal({ ...deleteModal, loading: true });
    const accessToken = localStorage.getItem("accessToken") || "";
    
    const response = await deleteUser(accessToken, { _id: deleteModal.userId });
    
    if (response.success) {
      setUsers(prevUsers => prevUsers.filter(u => u._id !== deleteModal.userId));
      onShowAlert("success", "Usuario eliminado correctamente");
    } else {
      onShowAlert("error", "Error al eliminar usuario");
    }
    setDeleteModal(null);
  };

  return (
    <div className="admin-section">
      <h3 className="admin-section-title">Gestión de Usuarios</h3>
      
      <div className="users-table-container">
        {loading ? (
          <div className="loading-text">
            <div className="loading-spinner"></div>
            Cargando usuarios...
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nombre Completo</th>
                  <th>Correo Electrónico</th>
                  <th>Acceso Catálogo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-info">
                        <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
                      </div>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td>
                      <button
                        className={`access-toggle ${user.appAccess.catalog ? "granted" : "denied"}`}
                        onClick={() => handleAppAccessToggle(user._id, "catalog", user.appAccess.catalog)}
                        disabled={actionLoading === user._id + "catalog"}
                      >
                        {actionLoading === user._id + "catalog" ? (
                          <div className="button-spinner"></div>
                        ) : (
                          <>
                            <span className="toggle-icon">{user.appAccess.catalog ? "✓" : "✕"}</span>
                            {user.appAccess.catalog ? "Activo" : "Inactivo"}
                          </>
                        )}
                      </button>
                    </td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                        disabled={!!actionLoading}
                        title="Eliminar usuario"
                      >
                        <span className="delete-icon">🗑️</span>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && users.length === 0 && (
          <div className="no-users">
            <div className="no-users-icon">👥</div>
            <p>No hay usuarios registrados</p>
            <small>Los nuevos usuarios aparecerán aquí una vez registrados</small>
          </div>
        )}
      </div>

      {/* Modal de confirmación para eliminar usuario */}
      {deleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <div className="modal-header">
              <h4>Confirmar eliminación</h4>
            </div>
            <div className="modal-body">
              <div className="warning-icon">⚠️</div>
              <p>¿Está seguro de que desea eliminar al usuario:</p>
              <strong>{deleteModal.userName}</strong>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => setDeleteModal(null)}
                disabled={deleteModal.loading}
              >
                Cancelar
              </button>
              <button 
                className="confirm-delete-btn"
                onClick={confirmDeleteUser}
                disabled={deleteModal.loading}
              >
                {deleteModal.loading ? (
                  <>
                    <div className="button-spinner"></div>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar usuario"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
