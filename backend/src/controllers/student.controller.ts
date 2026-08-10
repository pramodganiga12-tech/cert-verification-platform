import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ForbiddenError, BadRequestError } from '../errors/AppError.js';

export class StudentController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.roleName === 'INSTITUTION' ? req.user.institutionId! : req.body.institutionId;
      if (!institutionId) {
        throw new BadRequestError('Institution ID is required');
      }

      const student = await StudentService.createStudent({ ...req.body, institutionId }, req.user?.id);
      ApiResponse.success(res, student, 'Student record created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const student = await StudentService.getStudentById(id);

      if (req.user?.roleName === 'INSTITUTION' && student.institution_id !== req.user.institutionId) {
        throw new ForbiddenError('Access denied to students of other institutions');
      }

      ApiResponse.success(res, student, 'Student retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.roleName === 'INSTITUTION' ? req.user.institutionId! : (req.query.institutionId as string);
      if (!institutionId) {
        throw new BadRequestError('Institution ID query parameter is required for listing students');
      }

      const limit = parseInt(req.query.limit as string || '50', 10);
      const offset = parseInt(req.query.offset as string || '0', 10);
      const list = await StudentService.listStudentsByInstitution(institutionId, limit, offset);
      ApiResponse.success(res, list, 'Students listed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const existing = await StudentService.getStudentById(id);

      if (req.user?.roleName === 'INSTITUTION' && existing.institution_id !== req.user.institutionId) {
        throw new ForbiddenError('You can only update students of your institution');
      }

      const updated = await StudentService.updateStudent(id, req.body, req.user?.id);
      ApiResponse.success(res, updated, 'Student record updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async bulkImport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.roleName === 'INSTITUTION' ? req.user.institutionId! : req.body.institutionId;
      if (!institutionId) {
        throw new BadRequestError('Institution ID is required for bulk import');
      }

      const csvData = req.body.csvData || req.body.data;
      if (!csvData) {
        throw new BadRequestError('CSV content (csvData string field) is required');
      }

      const result = await StudentService.bulkImportStudents(institutionId, csvData, req.user?.id);
      ApiResponse.success(res, result, 'Student bulk import completed');
    } catch (error) {
      next(error);
    }
  }
}
