import { z } from 'zod';

export const createContactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().trim().email('Invalid email').max(160),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(5000),
  // Honeypot: hidden in the UI, bots tend to fill it in.
  website: z.string().max(200).optional(),
});

export const updateContactMessageSchema = z.object({
  status: z.enum(['NEW', 'READ', 'ARCHIVED']),
});

export type CreateContactMessageInput = z.infer<
  typeof createContactMessageSchema
>;
export type UpdateContactMessageInput = z.infer<
  typeof updateContactMessageSchema
>;
