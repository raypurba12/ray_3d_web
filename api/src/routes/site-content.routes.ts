import { Router } from 'express';
import * as siteContentController from '../controllers/site-content.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateSiteContentSchema } from '../schemas/site-content.schema';

const router = Router();

router.get('/', siteContentController.getController);
router.put(
  '/',
  authenticate,
  requireAdmin,
  validate(updateSiteContentSchema),
  siteContentController.updateController
);

export default router;
