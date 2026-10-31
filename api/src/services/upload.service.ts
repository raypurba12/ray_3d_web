import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fromBuffer } from 'file-type';
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

const ALLOWED_MIME_TYPES = new Set(Object.keys(EXTENSION_BY_MIME));

export interface StoredImage {
  path: string;
  filename: string;
  storage: 'local' | 'cloudinary';
}

const assertFileSignature = async (file: Express.Multer.File) => {
  const detected = await fromBuffer(file.buffer);

  if (
    !detected ||
    !ALLOWED_MIME_TYPES.has(detected.mime) ||
    detected.mime !== file.mimetype
  ) {
    throw new ApiError(
      400,
      'File content does not match an allowed image or PDF type'
    );
  }

  return detected.mime;
};

export const storeImage = async (
  file: Express.Multer.File
): Promise<StoredImage> => {
  const mime = await assertFileSignature(file);
  const extension = EXTENSION_BY_MIME[mime];
  const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

  if (isCloudinaryEnabled()) {
    const isPdf = mime === 'application/pdf';
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
