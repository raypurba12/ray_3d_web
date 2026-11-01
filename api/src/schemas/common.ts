import { z } from 'zod';

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:']);

const isSafeHttpUrl = (value: string) => {
  try {
    return SAFE_URL_PROTOCOLS.has(new URL(value).protocol);
  } catch {
    return false;
  }
};

export const urlString = z
  .string()
  .trim()
  .refine(isSafeHttpUrl, 'URL must use http:// or https://');

const uploadPath = z
  .string()
  .trim()
  .regex(
    /^\/uploads\/[A-Za-z0-9._-]+$/,
    'Asset path must point to /uploads/<filename>'
  );

/** Accepts an http(s) URL or a local upload path, empty input clears the value. */
export const optionalUrl = z
  .union([urlString, z.literal(''), z.null()])
  .optional()
  .transform((value) => (value ? value : null));

/** Same as optionalUrl, but also allows /uploads/<file> paths. */
export const optionalAssetUrl = z
  .union([urlString, uploadPath, z.literal(''), z.null()])
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
