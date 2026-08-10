import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;
    const logMsg = `${method} ${originalUrl} ${statusCode} - ${duration}ms [IP: ${ip || '127.0.0.1'}]`;

    if (statusCode >= 500) {
      Logger.error(logMsg);
    } else if (statusCode >= 400) {
      Logger.warn(logMsg);
    } else {
      Logger.info(logMsg);
    }
  });

  next();
}
