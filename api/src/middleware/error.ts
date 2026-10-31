import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../config/logger';
import { ApiError } from '../utils/errors';
import { errorResponse } from '../utils/response';

export const notFoundHandler = (req: Request, res: Response) => {
  res
    .status(404)
    .json(errorResponse(`Route ${req.method} ${req.originalUrl} not found`));
};

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  if (err instanceof ApiError) {
    res.status(err.status).json(errorResponse(err.message, err.errors));
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json(errorResponse('Validation failed', err.issues));
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'File is too large'
        : `Upload error: ${err.message}`;
    res.status(400).json(errorResponse(message));
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json(errorResponse('A record with this value already exists'));
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json(errorResponse('Resource not found'));
      return;
    }
    if (err.code === 'P2003') {
      res.status(400).json(errorResponse('Related record does not exist'));
      return;
    }
  }

  if (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type?: string }).type === 'entity.parse.failed'
  ) {
    res.status(400).json(errorResponse('Malformed JSON body'));
    return;
  }

  logger.error(
    {
      err,
      reqId: (req as Request & { id?: string }).id,
      method: req.method,
      url: req.originalUrl,
    },
    'Unhandled request error'
  );
  res.status(500).json(errorResponse('Internal server error'));
};
