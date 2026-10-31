import { z } from 'zod';

const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be at most 128 characters')
  .refine(
    (value) => {
      const categories = [
        /[a-z]/,
        /[A-Z]/,
        /\d/,
        /[^A-Za-z0-9]/,
      ].filter((pattern) => pattern.test(value)).length;

      return categories >= 3;
    },
    {
      message:
        'Password must combine at least 3 of: lowercase, uppercase, numbers, symbols',
    }
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});
