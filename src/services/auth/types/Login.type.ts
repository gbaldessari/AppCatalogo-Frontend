import type { Apps } from "./GetUsers.type";

/**
 * Define el tipo de datos para la carga útil de inicio de sesión.
 * Este tipo se utiliza para enviar la información necesaria al servidor al iniciar sesión.
 * 
 * @property string email - Correo electrónico del usuario.
 * @property string password - Contraseña del usuario.
 */
export type LoginPayload = {
  email: string;
  password: string;
};

/**
 * Define el tipo de datos para la respuesta de inicio de sesión.
 * Este tipo se utiliza para recibir la información de inicio de sesión desde el servidor.
 * 
 * @property string accessToken - Token de acceso del usuario.
 * @property string refreshToken - Token de actualización del usuario.
 * @property string firstName - Primer nombre del usuario.
 * @property string lastName - Apellido del usuario.
 * @property boolean isAdmin - Indica si el usuario es administrador.
 * @property Apps appAccess - Acceso a las aplicaciones del usuario.
 */
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  appAccess: Apps;
};
