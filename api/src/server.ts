import crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';

import { corsOrigins, env, isProduction } from './config/env';
import { logger } from './config/logger';
import prisma from './config/database';

import authRoutes from './routes/auth.routes';
import projectsRoutes from './routes/projects.routes';
import technologiesRoutes from './routes/technologies.routes';
import experiencesRoutes from './routes/experiences.routes';
import testimonialsRoutes from './routes/testimonials.routes';
import profileRoutes from './routes/profile.routes';
import siteContentRoutes from './routes/site-content.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import contactRoutes from './routes/contact.routes';
import galleryRoutes from './routes/gallery.routes';

import { configureCloudinary } from './config/cloudinary';
import { ensureUploadsDir } from './config/paths';
import { errorHandler, notFoundHandler } from './middleware/error';
import { rateLimit } from './middleware/rateLimit';
import { ApiError } from './utils/errors';
import { ACCESS_COOKIE, readCookie } from './utils/cookies';
import { errorResponse, successResponse } from './utils/response';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(compression({ threshold: 1024 }));

app.use(
  pinoHttp({
    logger,
    genReqId: (req, res) => {
      const header = req.headers['x-request-id'];
      const id =
        typeof header === 'string' && header.trim()
          ? header
          : crypto.randomUUID();
      res.setHeader('x-request-id', id);
      return id;
    },
    autoLogging: {
      ignore: (req) =>
        req.url === '/api/health' || req.url === '/api/health/live',
    },
  })
);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, 'Origin not allowed by CORS'));
    },
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

const uploadsDir = ensureUploadsDir();
app.use(
  '/uploads',
  express.static(uploadsDir, {
    maxAge: '30d',
    index: false,
    immutable: true,
  })
);

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms);
    timer.unref();

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });

const checkDatabase = async () => {
  await withTimeout(prisma.$queryRaw`SELECT 1`, 2_000);
};

const healthPayload = () => ({
  status: 'ok',
  db: 'up',
  timestamp: new Date().toISOString(),
  uptime: Math.round(process.uptime()),
  environment: env.NODE_ENV,
});

app.get('/api/health/live', (_req, res) => {
  res.json(successResponse({ status: 'ok' }));
});

app.get('/api/health', async (_req, res) => {
  try {
    await checkDatabase();
    res.json(successResponse(healthPayload()));
  } catch (error) {
    logger.error({ err: error }, 'Health check failed');
    res.status(503).json(
      errorResponse('Database unavailable', [
        { db: 'down', timestamp: new Date().toISOString() },
      ])
    );
  }
});

app.get('/api/health/ready', async (_req, res) => {
  try {
    await checkDatabase();
    res.json(successResponse(healthPayload()));
  } catch {
    res.status(503).json(errorResponse('Database unavailable'));
  }
});

const PUBLIC_CONTENT_PREFIXES = [
  '/api/projects',
  '/api/technologies',
  '/api/experiences',
  '/api/testimonials',
  '/api/profile',
  '/api/gallery',
  '/api/site-content',
];

app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    res.setHeader('Cache-Control', 'no-store');
  } else if (
    req.method === 'GET' &&
    !readCookie(req, ACCESS_COOKIE) &&
    PUBLIC_CONTENT_PREFIXES.some(
      (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`)
    )
  ) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=30, stale-while-revalidate=120'
    );
  }

  next();
});

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    max: 300,
    message: 'Too many requests. Please slow down.',
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/technologies', technologiesRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

configureCloudinary();

if (!isProduction) {
  logger.info(
    { uploadsDir, corsOrigins, nodeEnv: env.NODE_ENV },
    'API configuration loaded'
  );
}

export default app;
