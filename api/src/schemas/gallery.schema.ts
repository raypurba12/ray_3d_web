import { z } from 'zod';
import { optionalText } from './common';

export const createGalleryImageSchema = z.object({
  title: optionalText,
  image: z.string().trim().min(1, 'Image is required'),
  order: z.coerce.number().int().optional(),
});

export const updateGalleryImageSchema = createGalleryImageSchema.partial();

export type CreateGalleryImageInput = z.infer<typeof createGalleryImageSchema>;
export type UpdateGalleryImageInput = z.infer<typeof updateGalleryImageSchema>;
