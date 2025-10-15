/**
 * Define el tipo de datos para la carga útil de validación de token de actualización.
 * Este tipo se utiliza para enviar la información necesaria al servidor al validar un token de actualización.
 * 
 * @property string refreshToken - Token de actualización que se va a validar.
 */
export type ValidateRefreshTokenPayload = {
  refreshToken: string;
}

/**
 * Define el tipo de datos para la respuesta de validación de token de actualización.
 * Este tipo se utiliza para recibir la información necesaria del servidor después de validar un token de actualización.
 * 
 * @property string accessToken - Nuevo token de acceso generado al validar el token de actualización.
 * @property string refreshToken - Nuevo token de actualización generado al validar el token de actualización.
 */
export type ValidateRefreshTokenResponse = {
  accessToken: string;
  refreshToken: string;
}