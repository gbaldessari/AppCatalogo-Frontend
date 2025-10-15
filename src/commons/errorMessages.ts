export interface ErrorResponse {
  status?: number;
  message?: string;
  code?: string;
  details?: string;
}

export const ERROR_MESSAGES = {
  // Errores de validación (400)
  400: 'Los datos enviados son inválidos. Por favor, revise la información.',
  INVALID_RUT: 'El RUT ingresado es inválido o ya está registrado.',
  INVALID_EMAIL: 'El email ingresado no es válido.',
  INVALID_PHONE: 'El número de teléfono no es válido.',
  MISSING_REQUIRED_FIELDS: 'Faltan campos obligatorios por completar.',

  // Errores de autorización (401)
  401: 'No tiene permisos para realizar esta acción.',
  UNAUTHORIZED: 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.',

  // Errores de recurso no encontrado (403)
  403: 'Acceso denegado. No tiene permisos suficientes.',

  // Errores de recurso no encontrado (404)
  404: 'El recurso solicitado no fue encontrado.',

  // Errores de conflicto (409)
  409: 'Ya existe un vendedor registrado con esta información.',
  DUPLICATE_RUT: 'Ya existe un vendedor registrado con este RUT.',
  DUPLICATE_EMAIL: 'Ya existe un vendedor registrado con este email.',

  // Errores del servidor (500)
  500: 'Error interno del servidor. Intente nuevamente más tarde.',
  502: 'El servidor no está disponible temporalmente.',
  503: 'Servicio no disponible. Intente nuevamente en unos minutos.',
  504: 'Tiempo de espera agotado. Intente nuevamente.',

  // Errores de red
  NETWORK_ERROR: 'Error de conexión. Verifique su conexión a internet.',
  TIMEOUT: 'La operación tardó demasiado tiempo. Intente nuevamente.',

  // Error genérico
  DEFAULT: 'Ocurrió un error inesperado. Intente nuevamente.'
} as const;

export const getErrorMessage = (error: any): string => {
  // Si es una respuesta de Axios
  if (error?.response) {
    const status = error.response.status;
    const data = error.response.data;

    // Buscar mensaje específico por código de error del backend
    if (data?.code && ERROR_MESSAGES[data.code as keyof typeof ERROR_MESSAGES]) {
      return ERROR_MESSAGES[data.code as keyof typeof ERROR_MESSAGES];
    }

    // Mensajes específicos según el status HTTP
    switch (status) {
      case 400:
        if (data?.message?.includes('RUT')) {
          return ERROR_MESSAGES.INVALID_RUT;
        }
        if (data?.message?.includes('email')) {
          return ERROR_MESSAGES.INVALID_EMAIL;
        }
        if (data?.message?.includes('phone')) {
          return ERROR_MESSAGES.INVALID_PHONE;
        }
        return ERROR_MESSAGES[400];

      case 409:
        if (data?.message?.includes('RUT')) {
          return ERROR_MESSAGES.DUPLICATE_RUT;
        }
        if (data?.message?.includes('email')) {
          return ERROR_MESSAGES.DUPLICATE_EMAIL;
        }
        return ERROR_MESSAGES[409];

      default:
        return ERROR_MESSAGES[status as keyof typeof ERROR_MESSAGES] || ERROR_MESSAGES.DEFAULT;
    }
  }

  // Errores de red
  if (error?.code === 'NETWORK_ERR' || error?.message?.includes('Network Error')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  // Mensaje personalizado del error si existe
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  return ERROR_MESSAGES.DEFAULT;
};

export const getValidationErrorMessage = (fieldName: string, error: any): string => {
  const fieldMessages = {
    companyName: 'Nombre de empresa',
    rut: 'RUT',
    category: 'Categoría',
    'contact.name': 'Nombre del contacto',
    'contact.phone': 'Teléfono de contacto',
    'contact.email': 'Email de contacto',
    'headquarters.address': 'Dirección de sede principal',
    'headquarters.location': 'Ubicación de sede principal'
  };

  const fieldDisplayName = fieldMessages[fieldName as keyof typeof fieldMessages] || fieldName;

  if (error?.message?.includes('required')) {
    return `${fieldDisplayName} es obligatorio`;
  }

  if (error?.message?.includes('invalid')) {
    return `${fieldDisplayName} no es válido`;
  }

  return error?.message || `Error en ${fieldDisplayName}`;
};
