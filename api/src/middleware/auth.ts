import type { NextFunction, Response } from 'express';
import type { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { errorResponse } from '../utils/response';

export const authenticate = (
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
    req.user = verifyAccessToken(authHeader.slice(7));
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
