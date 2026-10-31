import { Router } from 'express';
import * as testimonialsController from '../controllers/testimonials.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createTestimonialSchema,
  updateTestimonialSchema,
} from '../schemas/testimonial.schema';

const router = Router();

router.get('/', testimonialsController.listController);
router.get('/:id', testimonialsController.getByIdController);

router.post(
  '/',
  authenticate,
  requireAdmin,
  validate(createTestimonialSchema),
  testimonialsController.createController
);
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  validate(updateTestimonialSchema),
  testimonialsController.updateController
);
router.delete(
  '/:id',
  authenticate,
  requireAdmin,
  testimonialsController.deleteController
);

export default router;
