import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { uploadMultiple, uploadSingle, uploadVideoFile } from '../middleware/upload';
import type { AuthRequest } from '../types';

const router = Router();

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: 'Too many uploads. Please try again later.',
  keyGenerator: (req) =>
    (req as AuthRequest).user?.userId || req.ip || 'unknown',
});

router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadSingle,
  uploadController.uploadSingleController
);
router.post(
  '/video',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadVideoFile.single('file'),
  uploadController.uploadSingleController
);
router.post(
  '/multiple',
  authenticate,
  requireAdmin,
  uploadLimiter,
  uploadMultiple,
  uploadController.uploadMultipleController
);
router.delete(
  '/:filename',
  authenticate,
  requireAdmin,
  uploadController.deleteController
);

export default router;
