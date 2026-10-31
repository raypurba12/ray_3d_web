import { Router } from 'express';
import * as galleryController from '../controllers/gallery.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createGalleryImageSchema,
  updateGalleryImageSchema,
} from '../schemas/gallery.schema';

const router = Router();

router.get('/', galleryController.listController);
router.get('/:id', galleryController.getByIdController);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createGalleryImageSchema),
  galleryController.createController
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateGalleryImageSchema),
  galleryController.updateController
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  galleryController.deleteController
);

export default router;
