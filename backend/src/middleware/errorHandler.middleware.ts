import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { Logger } from '../utils/logger.js';

export function errorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    Logger.warn(`[AppError ${err.statusCode} - ${err.errorCode}] ${err.message}`, err.details);
    ApiResponse.error(res, err.message, err.statusCode, err.errorCode, err.details);
    return;
  }

  Logger.error(`[Unhandled Error] ${err.message}`, err.stack);
  const isDev = process.env.NODE_ENV !== 'production';
  ApiResponse.error(
    res,
    isDev ? err.message : 'An unexpected internal server error occurred',
    500,
    'INTERNAL_SERVER_ERROR',
    isDev ? { stack: err.stack } : null
  );
}
