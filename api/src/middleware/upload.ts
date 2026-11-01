import { env } from '../config/env';
import multer from 'multer';
import { ApiError } from '../utils/errors';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

const ALLOWED_VIDEO_MIME_TYPES = new Set(['video/mp4', 'video/webm']);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_FILE_SIZE,
    files: 10,
    parts: 30,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, 'Only JPEG, PNG, WebP, GIF, and PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const uploadVideoFile = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_VIDEO_FILE_SIZE,
    files: 1,
    parts: 10,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_VIDEO_MIME_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, 'Only MP4 and WebM video files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadProjectImage = upload.single('image');
