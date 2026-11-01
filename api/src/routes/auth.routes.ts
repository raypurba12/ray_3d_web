import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate, requireRole } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import type { AuthRequest } from '../types';
import {
  changePasswordSchema,
  loginSchema,
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

const sessionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: 'Too many session requests. Try again later.',
});

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many password attempts. Try again later.',
  keyGenerator: (req) =>
    (req as AuthRequest).user?.userId || req.ip || 'unknown',
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
router.post('/refresh', sessionLimiter, authController.refreshController);
router.post('/logout', sessionLimiter, authController.logoutController);
router.put(
  '/password',
  authenticate,
  passwordLimiter,
  validate(changePasswordSchema),
  authController.changePasswordController
);
router.get('/me', authenticate, authController.getMeController);

export default router;
