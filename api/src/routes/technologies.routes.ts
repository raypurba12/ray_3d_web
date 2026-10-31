import { Router } from 'express';
import * as technologiesController from '../controllers/technologies.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTechnologySchema,
  updateTechnologySchema,
} from '../schemas/technology.schema';

const router = Router();

router.get('/', technologiesController.listController);
router.get('/:id', technologiesController.getByIdController);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createTechnologySchema),
  technologiesController.createController
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateTechnologySchema),
  technologiesController.updateController
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  technologiesController.deleteController
);

export default router;
