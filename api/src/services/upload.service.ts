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

const ALLOWED_MIME_TYPES = new Set(Object.keys(EXTENSION_BY_MIME));

export interface StoredImage {
  path: string;
  filename: string;
  storage: 'local' | 'cloudinary';
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const detectMimeType = (buffer: Buffer): string | null => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return 'image/png';
  }

  const header6 = buffer.subarray(0, 6).toString('ascii');
  if (header6 === 'GIF87a' || header6 === 'GIF89a') {
    return 'image/gif';
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }

  if (buffer.length >= 5 && buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return 'application/pdf';
  }

  return null;
};

const assertFileSignature = (file: Express.Multer.File) => {
  const detected = detectMimeType(file.buffer);

  if (
    !detected ||
    !ALLOWED_MIME_TYPES.has(detected) ||
    detected !== file.mimetype
  ) {
    throw new ApiError(
      400,
      'File content does not match an allowed image or PDF type'
    );
  }

  return detected;
};

export const storeImage = async (
  file: Express.Multer.File
): Promise<StoredImage> => {
  const mime = assertFileSignature(file);
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
