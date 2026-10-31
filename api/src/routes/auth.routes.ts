import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from '../schemas/auth.schema';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts. Try again later.',
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many registration attempts. Try again later.',
});

router.post(
  '/login',
  loginLimiter,
  validate(loginSchema),
  authController.loginController
);
router.post(
  '/register',
  authenticate,
  requireRole('SUPER_ADMIN'),
  registerLimiter,
  validate(registerSchema),
  authController.registerController
);
router.post(
  '/refresh',
  validate(refreshSchema),
  authController.refreshController
);
router.post(
  '/logout',
  validate(refreshSchema),
  authController.logoutController
);
router.put(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  authController.changePasswordController
);
router.get('/me', authenticate, authController.getMeController);

export default router;
