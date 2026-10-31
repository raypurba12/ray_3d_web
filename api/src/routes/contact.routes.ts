import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  createContactMessageSchema,
  updateContactMessageSchema,
} from '../schemas/contact.schema';

const router = Router();

router.post(
  '/',
  rateLimit({
    windowMs: 10 * 60_000,
    max: 5,
    message: 'Too many messages. Please try again later.',
  }),
  validate(createContactMessageSchema),
  contactController.createController
);

router.get(
  '/unread-count',
  authenticate,
  requireAdmin,
  contactController.unreadCountController
);
router.get('/', authenticate, requireAdmin, contactController.listController);
router.patch(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateContactMessageSchema),
  contactController.updateController
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  contactController.deleteController
);

export default router;
