import { z } from 'zod';
import { optionalText, optionalUrl } from './common';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    tagline: z.string().trim().min(2, 'Tagline must be at least 2 characters'),
    bio: z.string().trim().min(10, 'Bio must be at least 10 characters'),
    avatar: z.string().trim().min(1, 'Avatar is required'),
    resumeUrl: optionalText,
    email: z
      .string()
      .trim()
      .email('Invalid email address')
      .transform((value) => value.toLowerCase()),
    phone: optionalText,
    location: optionalText,
    github: optionalUrl,
    linkedin: optionalUrl,
    twitter: optionalUrl,
    website: optionalUrl,
  })
  .partial();

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
