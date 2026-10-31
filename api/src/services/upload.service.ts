import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { getUploadsDir } from '../config/paths';
import {
  isCloudinaryEnabled,
  uploadToCloudinary,
} from '../config/cloudinary';
import { ApiError } from '../utils/errors';

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'application/pdf': '.pdf',
};

export interface StoredImage {
  path: string;
  filename: string;
  storage: 'local' | 'cloudinary';
}

export const storeImage = async (
  file: Express.Multer.File
): Promise<StoredImage> => {
  const extension = EXTENSION_BY_MIME[file.mimetype];
  if (!extension) {
    throw new ApiError(400, 'Unsupported image type');
  }

  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

  if (isCloudinaryEnabled()) {
    const isPdf = file.mimetype === 'application/pdf';
    const result = await uploadToCloudinary(
      file.buffer,
      isPdf ? filename : filename.replace(/\.[^.]+$/, ''),
      isPdf ? 'raw' : 'image'
    );
    return {
      path: result.secure_url,
      filename: result.public_id,
      storage: 'cloudinary',
    };
  }

  const directory = getUploadsDir();
  await fs.mkdir(directory, { recursive: true });
  await fs.writeFile(path.join(directory, filename), file.buffer);

  return {
    path: `/uploads/${filename}`,
    filename,
    storage: 'local',
  };
};

export const deleteLocalImage = async (filename: string) => {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new ApiError(400, 'Invalid filename');
  }

  const directory = getUploadsDir();
  const filePath = path.resolve(directory, filename);

  if (!filePath.startsWith(directory + path.sep)) {
    throw new ApiError(400, 'Invalid filename');
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new ApiError(404, 'File not found');
    }
    throw error;
  }

  return { filename };
};
