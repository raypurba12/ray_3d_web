import { z } from 'zod';

export const urlString = z.string().trim().url();

/** Accepts a URL or a non-empty path, empty input clears the value. */
export const optionalUrl = z
  .union([urlString, z.literal(''), z.null()])
  .optional()
  .transform((value) => (value ? value : null));

/** Accepts any non-empty string (local asset path, URL, or plain text). */
export const optionalText = z
  .union([z.string().trim().min(1), z.literal(''), z.null()])
  .optional()
  .transform((value) => (value ? value : null));

/** Accepts an ISO date string or Date, empty input clears the value. */
export const optionalDate = z
  .preprocess(
    (value) => (value === '' || value === null ? null : value),
    z.union([z.null(), z.coerce.date()])
  )
  .optional();

export const idList = z.array(z.string().trim().min(1)).optional();
