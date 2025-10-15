/**
 * Valida el formato y dígito verificador de un RUT chileno
 * @param rut - RUT en formato XX.XXX.XXX-X
 * @returns true si el RUT es válido, false en caso contrario
 */
export const validateRUT = (rut: string): boolean => {
  // Verificar formato básico
  const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
  if (!rutRegex.test(rut)) {
    return false;
  }

  // Extraer número y dígito verificador
  const cleanRut = rut.replace(/\./g, '').replace(/-/g, '');
  const rutNumber = cleanRut.slice(0, -1);
  const providedDV = cleanRut.slice(-1).toLowerCase();

  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;

  for (let i = rutNumber.length - 1; i >= 0; i--) {
    sum += parseInt(rutNumber[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  let calculatedDV: string;

  if (remainder === 0) {
    calculatedDV = '0';
  } else if (remainder === 1) {
    calculatedDV = 'k';
  } else {
    calculatedDV = (11 - remainder).toString();
  }

  return providedDV === calculatedDV;
};

/**
 * Formatea un RUT agregando puntos y guión
 * @param rut - RUT sin formato
 * @returns RUT formateado
 */
export const formatRUT = (rut: string): string => {
  // Remover caracteres no numéricos excepto K
  const clean = rut.replace(/[^\dkK]/g, '');

  if (clean.length < 2) return clean;

  const dv = clean.slice(-1);
  const number = clean.slice(0, -1);

  // Agregar puntos cada 3 dígitos desde la derecha
  const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formatted}-${dv}`;
};

/**
 * Valida formato de teléfono chileno
 * @param phone - Número de teléfono
 * @returns true si el formato es válido
 */
export const validateChileanPhone = (phone: string): boolean => {
  // Remover espacios, guiones y paréntesis
  const clean = phone.replace(/[\s\-\(\)]/g, '');

  // Validar formatos comunes chilenos:
  // +56912345678, 56912345678, 912345678, 12345678
  const patterns = [
    /^\+569\d{8}$/, // +56912345678 (móvil)
    /^\+56[2-9]\d{8}$/, // +562XXXXXXXX (fijo)
    /^569\d{8}$/, // 56912345678 (móvil)
    /^56[2-9]\d{8}$/, // 562XXXXXXXX (fijo)
    /^9\d{8}$/, // 912345678 (móvil)
    /^[2-9]\d{8}$/, // 2XXXXXXXX (fijo)
    /^\d{8}$/ // 12345678 (formato corto)
  ];

  return patterns.some(pattern => pattern.test(clean));
};

/**
 * Formatea un teléfono chileno
 * @param phone - Número de teléfono
 * @returns Teléfono formateado
 */
export const formatChileanPhone = (phone: string): string => {
  // Remover caracteres no numéricos excepto +
  const clean = phone.replace(/[^\d+]/g, '');

  if (clean.length === 0) return '';

  // Si empieza con +56
  if (clean.startsWith('+56')) {
    const number = clean.slice(3);
    if (number.length >= 9) {
      return `+56 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5, 9)}`;
    }
    return clean;
  }

  // Si empieza con 56
  if (clean.startsWith('56') && clean.length >= 11) {
    const number = clean.slice(2);
    return `+56 ${number.slice(0, 1)} ${number.slice(1, 5)} ${number.slice(5, 9)}`;
  }

  // Si es número móvil (9XXXXXXXX)
  if (clean.startsWith('9') && clean.length >= 9) {
    return `+56 ${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5, 9)}`;
  }

  // Si es número fijo regional
  if (clean.length >= 8 && !clean.startsWith('9')) {
    return `+56 ${clean.slice(0, 1)} ${clean.slice(1, 5)} ${clean.slice(5, 9)}`;
  }

  return clean;
};

/**
 * Valida formato de email más estricto
 * @param email - Dirección de email
 * @returns true si el formato es válido
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
};
