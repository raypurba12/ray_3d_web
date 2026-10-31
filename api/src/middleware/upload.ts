import multer from 'multer';
import { ApiError } from '../utils/errors';

const MAX_FILE_SIZE = Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new ApiError(400, 'Only JPEG, PNG, WebP, GIF, and PDF files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const uploadSingle = upload.single('file');
export const uploadMultiple = upload.array('files', 10);
export const uploadProjectImage = upload.single('image');
