import path from 'path';
import { z } from 'zod';

const emptyToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.preprocess(emptyToUndefined, z.string().default('5000')),
    HOST: z.preprocess(emptyToUndefined, z.string().default('127.0.0.1')),
    CLIENT_URL: z.string().min(1, 'CLIENT_URL is required'),
    DATABASE_URL: z
      .string()
      .min(1, 'DATABASE_URL is required')
      .refine((value) => value.startsWith('mysql://'), {
        message: 'DATABASE_URL must be a mysql:// connection string',
      }),
    JWT_SECRET: z
      .string()
      .min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_REFRESH_SECRET: z
      .string()
      .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
    JWT_EXPIRE: z.string().default('15m'),
    JWT_REFRESH_EXPIRE: z.string().default('30d'),
    MAX_FILE_SIZE: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 1024 * 1024),
    UPLOAD_DIR: z.string().min(1).default('./uploads'),
    CLOUDINARY_CLOUD_NAME: optionalString,
    CLOUDINARY_API_KEY: optionalString,
    CLOUDINARY_API_SECRET: optionalString,
  })
  .superRefine((value, ctx) => {
    if (value.JWT_SECRET === value.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'JWT_REFRESH_SECRET must differ from JWT_SECRET',
      });
    }

    const cloudinaryValues = [
      value.CLOUDINARY_CLOUD_NAME,
      value.CLOUDINARY_API_KEY,
      value.CLOUDINARY_API_SECRET,
    ].filter(Boolean);

    if (cloudinaryValues.length > 0 && cloudinaryValues.length < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['CLOUDINARY_CLOUD_NAME'],
        message:
          'Cloudinary is partially configured; set all three CLOUDINARY_* variables or none',
      });
    }

    if (value.NODE_ENV === 'production') {
      const origins = value.CLIENT_URL.split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);

      for (const origin of origins) {
        if (!/^https:\/\//i.test(origin)) {
          ctx.addIssue({
            code: 'custom',
            path: ['CLIENT_URL'],
            message: `Production CLIENT_URL must use https (got ${origin})`,
          });
        }
        if (/localhost|127\.0\.0\.1/i.test(origin)) {
          ctx.addIssue({
            code: 'custom',
            path: ['CLIENT_URL'],
            message: 'Production CLIENT_URL cannot point to localhost',
          });
        }
      }

      const weakSecrets = [value.JWT_SECRET, value.JWT_REFRESH_SECRET];
      for (const secret of weakSecrets) {
        if (/change-this|change-in-production|dev-secret/i.test(secret)) {
          ctx.addIssue({
            code: 'custom',
            path: ['JWT_SECRET'],
            message: 'Replace default development JWT secrets before deploy',
          });
        }
      }

      if (!path.isAbsolute(value.UPLOAD_DIR)) {
        ctx.addIssue({
          code: 'custom',
          path: ['UPLOAD_DIR'],
          message:
            'Production UPLOAD_DIR must be an absolute path outside the app directory',
        });
      }
    }
  });

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  for (const issue of parsed.error.issues) {
    console.error(`   - ${issue.path.join('.') || 'env'}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProduction = env.NODE_ENV === 'production';
export const corsOrigins = env.CLIENT_URL.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
