/**
 * Componente principal de la vista de administración.
 *
 * @remarks
 * Permite editar el perfil, cambiar la contraseña, registrar nuevos administradores y gestionar usuarios.
 * Gestiona modales de confirmación y edición, validaciones y alertas.
 *
 * @component
 * @returns La vista de administración de usuarios y perfil.
 */
import { useState } from "react";
import "./adminWindow.css";
import { z } from "zod";
import { ProfileSection } from "./subcomponents/ProfileSection";
import { ChangePasswordSection } from "./subcomponents/ChangePasswordSection";
import { RegisterAdminSection } from "./subcomponents/RegisterAdminSection";
import { UsersManagementSection } from "./subcomponents/UsersManagementSection";
import { ConfirmModal } from "./subcomponents/ConfirmModal";
import { EditProfileModal } from "./subcomponents/EditProfileModal";
import { changePassword, register, updateName } from "../../../../services/auth/auth.service";
import { Alert } from "../../../../commons/Alert";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres.")
  .max(16, "La contraseña no puede tener más de 16 caracteres.")
  .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra.")
  .regex(/\d/, "La contraseña debe incluir al menos un número.");

const emailSchema = z.string().email("Por favor, ingrese un correo electrónico válido.");

/**
 * AdminWindow
 * 
 * Componente principal para la administración de usuarios y perfil.
 * Gestiona el estado de los formularios, modales, validaciones y alertas.
 */
function AdminWindow() {
  const [firstName, setFirstName] = useState(localStorage.getItem("firstName") || "");
  const [lastName, setLastName] = useState(localStorage.getItem("lastName") || "");
  const [email] = useState(localStorage.getItem("email") || "");
  const [isAdmin] = useState(localStorage.getItem("isAdmin") || "false");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);

  // Estados para modales de confirmación
  const [confirmModal, setConfirmModal] = useState<null | {
    type: "profile" | "password" | "register";
    onConfirm: () => void;
    loading: boolean;
  }>(null);

  // Estado para el modal de edición de perfil
  const [editProfileModal, setEditProfileModal] = useState<null | {
    firstName: string;
    lastName: string;
    loading: boolean;
  }>(null);

  // Función para abrir el modal de edición de perfil
  const handleOpenEditProfile = () => {
    setEditProfileModal({
      firstName,
      lastName,
      loading: false,
    });
  };

  // Función para guardar cambios desde el modal
  const handleSaveProfileModal = async () => {
    if (!editProfileModal) return;
    setEditProfileModal({ ...editProfileModal, loading: true });
    if (!editProfileModal.firstName || !editProfileModal.lastName) {
      setErrorMessage("Por favor, complete ambos campos de nombre.");
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      setEditProfileModal(editProfileModal => editProfileModal && { ...editProfileModal, loading: false });
      return;
    }
    const accessToken = localStorage.getItem("accessToken") || "";
    const response = await updateName(accessToken, {
      firstName: editProfileModal.firstName,
      lastName: editProfileModal.lastName,
    });
    if (response.success) {
      setSuccessMessage("Perfil actualizado con éxito.");
      setShowSuccess(true);
      setFirstName(editProfileModal.firstName);
      setLastName(editProfileModal.lastName);
      localStorage.setItem("firstName", editProfileModal.firstName);
      localStorage.setItem("lastName", editProfileModal.lastName);
    } else {
      setErrorMessage("Error al actualizar el perfil.");
      setShowError(true);
    }
    setEditProfileModal(null);
    setTimeout(() => {
      setShowSuccess(false);
      setShowError(false);
    }, 2000);
  };

  const handleChangePassword = async () => {
    setConfirmModal({
      type: "password",
      onConfirm: async () => {
        setConfirmModal((prev) => prev && { ...prev, loading: true });
        try {
          passwordSchema.parse(newPassword);
        } catch (e) {
          if (e instanceof z.ZodError) {
            setErrorMessage(e.errors?.[0]?.message || "Contraseña inválida.");
          } else {
            setErrorMessage("Contraseña inválida.");
          }
          setShowError(true);
          setTimeout(() => setShowError(false), 2000);
          setConfirmModal(null);
          return;
        }
        if (!currentPassword || !newPassword) {
          setErrorMessage("Por favor, complete ambos campos de contraseña.");
          setShowError(true);
          setTimeout(() => setShowError(false), 2000);
          setConfirmModal(null);
          return;
        }
        const accessToken = localStorage.getItem("accessToken") || "";
        const response = await changePassword(accessToken, { currentPassword, newPassword });
        if (response.success) {
          setSuccessMessage("Contraseña cambiada con éxito.");
          setShowSuccess(true);
          setCurrentPassword("");
          setNewPassword("");
        } else {
          setErrorMessage("Error al cambiar la contraseña.");
          setShowError(true);
        }
        setLoadingPassword(false);
        setTimeout(() => {
          setShowSuccess(false);
          setShowError(false);
        }, 2000);
        setConfirmModal(null);
      },
      loading: false,
    });
  };

  const handleRegisterUser = async () => {
    setConfirmModal({
      type: "register",
      onConfirm: async () => {
        setConfirmModal((prev) => prev && { ...prev, loading: true });
        setErrorMessage("");
        setSuccessMessage("");
        try {
          emailSchema.parse(registerForm.email);
          passwordSchema.parse(registerForm.password);
          if (!registerForm.firstName || !registerForm.lastName) {
            setErrorMessage("Por favor, complete nombre y apellido.");
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
            setConfirmModal(null);
            return;
          }
        } catch (e) {
          if (e instanceof z.ZodError) {
            setErrorMessage(e.errors?.[0]?.message || "Datos inválidos.");
          } else {
            setErrorMessage("Datos inválidos.");
          }
          setShowError(true);
          setTimeout(() => setShowError(false), 2000);
          setConfirmModal(null);
          return;
        }
        const accessToken = localStorage.getItem("accessToken") || "";
        const response = await register(accessToken, registerForm);
        if (response.success) {
          setSuccessMessage("Usuario registrado exitosamente.");
          setShowSuccess(true);
          setRegisterForm({ email: "", firstName: "", lastName: "", password: "" });
        } else {
          setErrorMessage("Error al registrar usuario.");
          setShowError(true);
        }
        setRegisterLoading(false);
        setTimeout(() => {
          setShowSuccess(false);
          setShowError(false);
        }, 2000);
        setConfirmModal(null);
      },
      loading: false,
    });
  };

  // Nueva función para mostrar alertas desde componentes hijos
  const handleShowAlert = (type: "success" | "error", message: string) => {
    if (type === "success") {
      setSuccessMessage(message);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setErrorMessage(message);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    }
  };

  return (
    <>
      {/* Alertas de éxito y error */}
      <Alert type="success" message={successMessage} show={showSuccess} />
      <Alert type="error" message={errorMessage} show={showError} />
      <div className="admin-body">
        <div className="admin-minimal">
          {/* Sección de perfil - siempre visible */}
          <ProfileSection
            firstName={firstName}
            lastName={lastName}
            email={email}
            setFirstName={setFirstName}
            setLastName={setLastName}
            loading={editProfileModal?.loading || false}
            onUpdate={handleOpenEditProfile}
          />
          {/* Sección para cambiar contraseña - siempre visible */}
          <ChangePasswordSection
            currentPassword={currentPassword}
            newPassword={newPassword}
            setCurrentPassword={setCurrentPassword}
            setNewPassword={setNewPassword}
            loading={loadingPassword}
            onChangePassword={handleChangePassword}
          />
          {/* Sección para registrar nuevo administrador - solo para admins */}
          {isAdmin === "true" && (
            <RegisterAdminSection
              registerForm={registerForm}
              setRegisterForm={setRegisterForm}
              loading={registerLoading}
              onRegister={handleRegisterUser}
            />)}
          {/* Modal de confirmación para acciones críticas */}
          <ConfirmModal
            confirmModal={confirmModal}
            setConfirmModal={setConfirmModal}
          />
        </div>
        {/* Sección para gestión de usuarios - solo para admins */}
        {isAdmin === "true" && (
          <div className="admin-section">
            <h3 className="admin-section-title">Panel de Administración</h3>
            <p className="admin-section-description">
              Como administrador, puedes gestionar todos los usuarios del sistema y sus permisos de acceso a las aplicaciones.
            </p>
            <UsersManagementSection
              onShowAlert={handleShowAlert}
            />
          </div>
        )}
        {/* Información para usuarios normales */}
        {isAdmin === "false" && (
          <div className="admin-section">
            <h3 className="admin-section-title">Mi Cuenta</h3>
            <div className="user-info-section">
              <div className="user-info-card">
                <div className="user-info-header">
                  <div className="user-avatar-large">
                    {firstName.charAt(0)}{lastName.charAt(0)}
                  </div>
                  <div className="user-details">
                    <h4>{firstName} {lastName}</h4>
                    <p>{email}</p>
                    <span className="user-role">Usuario</span>
                  </div>
                </div>
                <div className="user-permissions">
                  <h5>Permisos de Aplicaciones</h5>
                  <div className="permissions-list">
                    <div className={`permission-item ${localStorage.getItem("catalogAccess") === "true" ? "granted" : "denied"}`}>
                      <span className="permission-icon">📚</span>
                      <span>Catálogo</span>
                      <span className="permission-status">
                        {localStorage.getItem("catalogAccess") === "true" ? "✅ Acceso" : "❌ Sin acceso"}
                      </span>
                    </div>
                  </div>
                  <p className="permissions-note">
                    Si necesitas acceso a alguna aplicación, contacta al administrador del sistema.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Modal de edición de perfil */}
        <EditProfileModal
          open={!!editProfileModal}
          firstName={editProfileModal?.firstName || ""}
          lastName={editProfileModal?.lastName || ""}
          loading={editProfileModal?.loading || false}
          onClose={() => setEditProfileModal(null)}
          onChangeFirstName={v => setEditProfileModal(modal => modal && { ...modal, firstName: v })}
          onChangeLastName={v => setEditProfileModal(modal => modal && { ...modal, lastName: v })}
          onSave={handleSaveProfileModal}
        />
      </div>
    </>
  );
}

export default AdminWindow;