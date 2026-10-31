import { z } from 'zod';
import { optionalText } from './common';

export const createTestimonialSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  role: z.string().trim().min(2, 'Role must be at least 2 characters'),
  company: z.string().trim().min(1, 'Company is required'),
  avatar: optionalText,
  content: z.string().trim().min(10, 'Content must be at least 10 characters'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  featured: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>;
export type UpdateTestimonialInput = z.infer<typeof updateTestimonialSchema>;
