import pino from 'pino';
import { env, isProduction } from './env';

export const logger = pino({
  level: env.NODE_ENV === 'test' ? 'silent' : isProduction ? 'info' : 'debug',
  base: { service: 'portfolio-api' },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'refreshToken',
      '*.password',
      '*.refreshToken',
    ],
    censor: '[redacted]',
  },
});
