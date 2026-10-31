import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { errorResponse } from '../utils/response';

export const validate =
  (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res
        .status(400)
        .json(errorResponse('Validation failed', result.error.issues));
      return;
    }

    req.body = result.data;
    next();
  };
