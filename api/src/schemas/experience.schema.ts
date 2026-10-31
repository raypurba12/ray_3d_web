import { z } from 'zod';
import { idList, optionalDate, optionalText } from './common';

export const createExperienceSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters'),
  company: z.string().trim().min(2, 'Company must be at least 2 characters'),
  companyLogo: optionalText,
  location: optionalText,
  startDate: z.coerce.date(),
  endDate: optionalDate,
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  technologies: idList,
  order: z.coerce.number().int().optional(),
});

export const updateExperienceSchema = createExperienceSchema.partial();

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
