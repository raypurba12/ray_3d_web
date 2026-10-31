import 'dotenv/config';
import type { Server } from 'http';
import app from './server';
import prisma from './config/database';
import { env } from './config/env';
import { logger } from './config/logger';

const listenTarget = /^\d+$/.test(env.PORT) ? Number(env.PORT) : env.PORT;

const registerShutdown = (server: Server) => {
  const shutdown = (signal: string) => {
    logger.info({ signal }, 'Shutting down gracefully');
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

const connectWithRetry = async (attempts = 3) => {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      logger.error({ err: error, attempt }, 'Database connection failed');
      if (attempt === attempts) throw error;
      await new Promise((resolve) => setTimeout(resolve, 2_000));
    }
  }
};

const start = async () => {
  await connectWithRetry();
  logger.info('Database connected');

  const onListen = () => {
    logger.info(
      {
        host: env.HOST,
        port: listenTarget,
        environment: env.NODE_ENV,
        corsOrigins: env.CLIENT_URL,
      },
      'Server started'
    );
  };

  const server =
    typeof listenTarget === 'number'
      ? app.listen(listenTarget, env.HOST, onListen)
      : app.listen(listenTarget, onListen);

  registerShutdown(server);
};

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  process.exit(1);
});

start().catch(async (error) => {
  logger.fatal({ err: error }, 'Failed to start server');
  await prisma.$disconnect();
  process.exit(1);
});
