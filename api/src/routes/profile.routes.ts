import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema } from '../schemas/profile.schema';

const router = Router();

router.get('/', profileController.getController);
router.put(
  '/',
  authenticate,
  requireAdmin,
  validate(updateProfileSchema),
  profileController.updateController
);

export default router;
