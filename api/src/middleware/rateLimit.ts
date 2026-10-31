import type { NextFunction, Request, Response } from 'express';
import { errorResponse } from '../utils/response';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_TRACKED_CLIENTS = 10_000;

export const rateLimit =
  ({ windowMs, max, message = 'Too many requests' }: RateLimitOptions) => {
    const buckets = new Map<string, Bucket>();

    return (req: Request, res: Response, next: NextFunction) => {
      const now = Date.now();
      const key = req.ip || req.socket.remoteAddress || 'unknown';

      if (buckets.size > MAX_TRACKED_CLIENTS) {
        for (const [client, bucket] of buckets) {
          if (bucket.resetAt <= now) buckets.delete(client);
        }
      }

      let bucket = buckets.get(key);
      if (!bucket || bucket.resetAt <= now) {
        bucket = { count: 0, resetAt: now + windowMs };
        buckets.set(key, bucket);
      }

      bucket.count += 1;

      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
      res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

      if (bucket.count > max) {
        res
          .status(429)
          .json(errorResponse(message));
        return;
      }

      next();
    };
  };
