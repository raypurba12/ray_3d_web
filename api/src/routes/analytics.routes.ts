import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, requireAdmin } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  trackCvDownloadSchema,
  trackPageViewSchema,
} from '../schemas/analytics.schema';

const router = Router();

const trackLimiter = rateLimit({
  windowMs: 60_000,
  max: 120,
  message: 'Too many tracking requests',
});

router.post(
  '/pageview',
  trackLimiter,
  validate(trackPageViewSchema),
  analyticsController.trackPageViewController
);
router.post(
  '/cv-download',
  trackLimiter,
  validate(trackCvDownloadSchema),
  analyticsController.trackCvDownloadController
);

router.get(
  '/summary',
  authenticate,
  requireAdmin,
  analyticsController.summaryController
);

export default router;
