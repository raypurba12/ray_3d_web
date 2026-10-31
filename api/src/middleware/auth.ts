import type { NextFunction, Response } from 'express';
import prisma from '../config/database';
import type { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(errorResponse('No token provided'));
    return;
  }

  try {
    const payload = verifyAccessToken(authHeader.slice(7));
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, tokenVersion: true },
    });

    if (!user || user.tokenVersion !== payload.tv) {
      res.status(401).json(errorResponse('Session has been revoked'));
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tv: user.tokenVersion,
    };
    next();
  } catch {
    res.status(401).json(errorResponse('Invalid or expired token'));
  }
};

export const requireRole =
  (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json(errorResponse('Insufficient permissions'));
      return;
    }
    next();
  };

export const requireAdmin = requireRole('ADMIN', 'SUPER_ADMIN');
