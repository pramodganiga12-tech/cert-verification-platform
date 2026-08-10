import { Response } from 'express';

export interface ApiSuccessPayload<T> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiErrorPayload {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown;
  };
  timestamp: string;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success', statusCode = 200): Response {
    const payload: ApiSuccessPayload<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static error(res: Response, message = 'An error occurred', statusCode = 500, errorCode = 'INTERNAL_ERROR', details: unknown = null): Response {
    const payload: ApiErrorPayload = {
      success: false,
      message,
      error: {
        code: errorCode,
        details,
      },
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }
}
