import 'dotenv/config';
import type { Server } from 'http';
import app from './server';
import prisma from './config/database';

const PORT = Number(process.env.PORT) || 5000;

const registerShutdown = (server: Server) => {
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      void prisma.$disconnect().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
};

const start = async () => {
  await prisma.$connect();
  console.log('✅ Database connected');

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 CORS allowed origins: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });

  registerShutdown(server);
};

start().catch(async (error) => {
  console.error('❌ Failed to start server:', error);
  await prisma.$disconnect();
  process.exit(1);
});
