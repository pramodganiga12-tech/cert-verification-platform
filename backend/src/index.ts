import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'http';
import { env } from './config/env.js';
import { requestLoggerMiddleware } from './middleware/logger.middleware.js';
import { defaultRateLimiter } from './middleware/rateLimiter.middleware.js';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware.js';
import { NotFoundError } from './errors/AppError.js';
import apiRouter from './routes/index.js';
import { Logger } from './utils/logger.js';
import { closeDb, initDatabaseInstance } from './config/database.js';

const app = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging & Rate Limiting
app.use(requestLoggerMiddleware);
app.use(defaultRateLimiter);

// API Routing
app.use(env.API_PREFIX, apiRouter);

// 404 Handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Cannot ${req.method} ${req.originalUrl}`));
});

// Centralized Error Handler
app.use(errorHandlerMiddleware);

let server: Server | null = null;

export async function startServer(port = env.PORT): Promise<Server> {
  await initDatabaseInstance();
  return new Promise((resolve) => {
    server = app.listen(port, '0.0.0.0', () => {
      Logger.info(`[Server] Express listening on port ${port} in ${env.NODE_ENV} mode`);
      Logger.info(`[Server] Health check: http://localhost:${port}${env.API_PREFIX}/health`);
      Logger.info(`[Server] Version check: http://localhost:${port}${env.API_PREFIX}/version`);
      resolve(server!);
    });
  });
}

// Auto-start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    Logger.error('[Server] Failed to initialize database or start server:', err);
    process.exit(1);
  });
}

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  Logger.info(`[Server] Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(() => {
      Logger.info('[Server] HTTP server closed.');
      closeDb();
      Logger.info('[Server] Database connections closed. Process exiting.');
      process.exit(0);
    });
  } else {
    closeDb();
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

export default app;
