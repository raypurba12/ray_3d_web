import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { uploadMultiple, uploadSingle } from '../middleware/upload';

const router = Router();

router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadSingle,
  uploadController.uploadSingleController
);
router.post(
  '/multiple',
  authenticate,
  requireAdmin,
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
