import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { logger } from './logger';

const config = () => ({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const isCloudinaryEnabled = (): boolean => {
  const values = Object.values(config()).filter(Boolean);
  return values.length === 3;
};

export const configureCloudinary = (): void => {
  const values = Object.values(config()).filter(Boolean);

  if (values.length > 0 && values.length < 3) {
    throw new Error(
      'Cloudinary configuration is incomplete: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET together'
    );
  }

  if (isCloudinaryEnabled()) {
    cloudinary.config({ ...config(), secure: true });
  }

  logger.info(
    { storage: isCloudinaryEnabled() ? 'cloudinary' : 'local-disk' },
    'Upload storage configured'
  );
};

export const uploadToCloudinary = (
  buffer: Buffer,
  publicId: string,
  resourceType: 'image' | 'raw' | 'video' = 'image'
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'portfolio',
        public_id: publicId,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed'));
          return;
        }
        resolve(result);
      }
    );

    stream.end(buffer);
  });
