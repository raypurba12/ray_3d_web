import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';

export const isCloudinaryEnabled = (): boolean =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

export const configureCloudinary = (): void => {
  if (!isCloudinaryEnabled()) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

export const uploadToCloudinary = (
  buffer: Buffer,
  publicId: string,
  resourceType: 'image' | 'raw' = 'image'
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
