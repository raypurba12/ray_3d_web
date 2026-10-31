import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import projectsRoutes from './routes/projects.routes';
import technologiesRoutes from './routes/technologies.routes';
import experiencesRoutes from './routes/experiences.routes';
import testimonialsRoutes from './routes/testimonials.routes';
import profileRoutes from './routes/profile.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import contactRoutes from './routes/contact.routes';
import galleryRoutes from './routes/gallery.routes';

import { configureCloudinary } from './config/cloudinary';
import { ensureUploadsDir } from './config/paths';
import { errorHandler, notFoundHandler } from './middleware/error';
import { ApiError } from './utils/errors';
import { successResponse } from './utils/response';

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new ApiError(403, 'Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

const uploadsDir = ensureUploadsDir();
app.use(
  '/uploads',
  express.static(uploadsDir, { maxAge: '7d', index: false })
);

app.get('/api/health', (_req, res) => {
  res.json(
    successResponse({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
    })
  );
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/technologies', technologiesRoutes);
app.use('/api/experiences', experiencesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/gallery', galleryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

configureCloudinary();

export default app;
