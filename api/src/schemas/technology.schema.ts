import { z } from 'zod';

export const techCategorySchema = z.enum([
  'FRONTEND',
  'BACKEND',
  'DATABASE',
  'DEVOPS',
  'DESIGN',
  'OTHER',
]);

export const createTechnologySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  icon: z.string().trim().min(1, 'Icon is required'),
  category: techCategorySchema,
  order: z.coerce.number().int().optional(),
});

export const updateTechnologySchema = createTechnologySchema.partial();

export type CreateTechnologyInput = z.infer<typeof createTechnologySchema>;
export type UpdateTechnologyInput = z.infer<typeof updateTechnologySchema>;
