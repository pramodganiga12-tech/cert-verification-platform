import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../services/health.service.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class HealthController {
  static async getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const health = await HealthService.checkHealth();
      ApiResponse.success(res, health, 'API health status retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static getVersion(_req: Request, res: Response, next: NextFunction): void {
    try {
      const versionInfo = HealthService.getVersion();
      ApiResponse.success(res, versionInfo, 'API version information retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}
