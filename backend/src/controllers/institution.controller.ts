import { Request, Response, NextFunction } from 'express';
import { InstitutionService } from '../services/institution.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ForbiddenError } from '../errors/AppError.js';

export class InstitutionController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inst = await InstitutionService.createInstitution(req.body, req.user?.id);
      ApiResponse.success(res, inst, 'Institution created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const inst = await InstitutionService.getInstitutionById(id);
      ApiResponse.success(res, inst, 'Institution retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);
      const list = await InstitutionService.listInstitutions(limit, offset);
      ApiResponse.success(res, list, 'Institutions listed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Institution Admin can only update their own institution
      if (req.user?.roleName !== 'ADMIN' && req.user?.institutionId !== id) {
        throw new ForbiddenError('You can only update your own institution record');
      }

      const updated = await InstitutionService.updateInstitution(id, req.body, req.user?.id);
      ApiResponse.success(res, updated, 'Institution updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await InstitutionService.updateStatus(id, status, req.user?.id);
      ApiResponse.success(res, updated, 'Institution status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
