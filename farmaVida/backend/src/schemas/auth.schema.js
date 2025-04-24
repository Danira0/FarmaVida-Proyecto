import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z.string({
    required_error: 'Nombre es requerido',
  }),
  apellido: z.string({
    required_error: 'Apellido es requerido',
  }),
  correo: z.string({
    required_error: 'Correo es requerido',
  }).email({
    message: 'Correo inválido',
  }),
  nombre_usuario: z.string({
    required_error: 'El nombre de usuario es requerido',
  }),
  contrasena_usuario: z.string({
    required_error: 'Contraseña es requerida',
  }).min(6, {
    message: 'La contraseña debe contener al menos 6 caracteres',
  }),
  ROLID_ROL: z.union([z.string(), z.number()]).refine(value => [1, 2].includes(Number(value)), {
    message: 'El rol debe ser 1 o 2',
  }),
});

export const loginSchema = z.object({
  nombre_usuario: z.string({
    required_error: 'El nombre de usuario es requerido',
  }),
  contrasena_usuario: z.string({
    required_error: 'Contraseña requerida',
  }).min(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  }),
});
