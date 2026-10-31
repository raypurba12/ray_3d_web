import { Router } from 'express';
import * as projectsController from '../controllers/projects.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { uploadProjectImage } from '../middleware/upload';
import { validate } from '../middleware/validate';
import {
  createProjectSchema,
  updateProjectSchema,
} from '../schemas/project.schema';

const router = Router();

router.get('/', projectsController.listController);
router.get('/:id', projectsController.getByIdController);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createProjectSchema),
  projectsController.createController
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateProjectSchema),
  projectsController.updateController
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  projectsController.deleteController
);
router.post(
  '/:id/upload',
  authenticate,
  requireAdmin,
  uploadProjectImage,
  projectsController.uploadImageController
);

export default router;
