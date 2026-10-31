import { Router } from 'express';
import * as experiencesController from '../controllers/experiences.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createExperienceSchema,
  updateExperienceSchema,
} from '../schemas/experience.schema';

const router = Router();

router.get('/', experiencesController.listController);
router.get('/:id', experiencesController.getByIdController);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createExperienceSchema),
  experiencesController.createController
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateExperienceSchema),
  experiencesController.updateController
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  experiencesController.deleteController
);

export default router;
