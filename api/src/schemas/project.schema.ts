import { z } from 'zod';
import { idList, optionalAssetUrl, optionalText, optionalUrl } from './common';

const projectImageSchema = z.object({
  image: z.string().trim().min(1, 'Screenshot image is required'),
  caption: optionalText,
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  image: z.string().trim().min(1, 'Image is required'),
  metric: optionalText,
  demoUrl: optionalUrl,
  githubUrl: optionalUrl,
  videoUrl: optionalAssetUrl,
  featured: z.boolean().optional(),
  order: z.coerce.number().int().optional(),
  technologies: idList,
  tags: z.array(z.string().trim().min(1)).optional(),
  images: z.array(projectImageSchema).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
