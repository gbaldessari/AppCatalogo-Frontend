import { z } from 'zod';
import { validateRUT } from './validators';


const locationSchema = z.object({
  lat: z.number().min(-90, 'Latitud debe estar entre -90 y 90').max(90, 'Latitud debe estar entre -90 y 90'),
  lng: z.number().min(-180, 'Longitud debe estar entre -180 y 180').max(180, 'Longitud debe estar entre -180 y 180'),
});

const addressSchema = z.object({
  address: z.string().min(1, 'La dirección es obligatoria').trim(),
  location: locationSchema.refine(
    (data) => data.lat !== 0 || data.lng !== 0,
    { message: 'Debe seleccionar una ubicación válida en el mapa' }
  ),
});

const contactSchema = z.object({
  name: z.string().min(1, 'El nombre del contacto es obligatorio').trim(),
  phone: z.string().min(1, 'El teléfono es obligatorio').trim(),
  email: z.string()
    .min(1, 'El email es obligatorio')
    .email('Formato de email inválido')
    .trim(),
});

export const vendorSchema = z.object({
  companyName: z.string().min(1, 'El nombre de la empresa es obligatorio').trim(),
  fantasyName: z.string().trim().optional(),
  rut: z.string()
    .min(1, 'El RUT es obligatorio')
    .refine((rut) => {
      const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
      return rutRegex.test(rut);
    }, 'Formato de RUT inválido (ej: 12.345.678-9)')
    .refine((rut) => validateRUT(rut), 'RUT inválido, verificar dígito verificador'),
  observations: z.string().trim().optional(),
  categoryId: z.string().min(1, 'La categoría es obligatoria'),
  contact: contactSchema,
  headquarters: addressSchema,
  branches: z.array(addressSchema),
  sellsCigarettes: z.boolean(),
  isPotentialClient: z.boolean(),
  paymentMethod: z.string().min(1, 'El método de pago es obligatorio'),
  usersIds: z.array(z.string()).optional(),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
