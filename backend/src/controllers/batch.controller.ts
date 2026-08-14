import { Request, Response, NextFunction } from 'express';
import { BatchIssuanceService, PdfFileItem } from '../services/batchIssuance.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { BadRequestError } from '../errors/AppError.js';

export class BatchController {
  /**
   * Phase 1: Mass Certificate Issuance Flow (Pages 9 & 11 of Presentation Slides)
   * Supports ZIP package upload OR multiple PDF file uploads
   */
  static async processBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.body.institutionId || req.user?.institutionId || 'inst-vuniv-001';
      const defaultProgram = req.body.programName || 'Computer Science & Engineering';
      const defaultDegree = req.body.degree || 'BACHELOR_OF_SCIENCE';

      let result;

      if (req.file) {
        const isZip = req.file.originalname.toLowerCase().endsWith('.zip') || req.file.mimetype.includes('zip');
        if (isZip) {
          result = await BatchIssuanceService.processZipBatch(
            req.file.buffer,
            institutionId,
            defaultProgram,
            defaultDegree,
            req.user?.id
          );
        } else {
          // Single uploaded PDF
          const items: PdfFileItem[] = [{ fileName: req.file.originalname, buffer: req.file.buffer }];
          result = await BatchIssuanceService.processPdfItemsBatch(
            items,
            institutionId,
            defaultProgram,
            defaultDegree,
            req.user?.id
          );
        }
      } else if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Multiple uploaded PDFs
        const items: PdfFileItem[] = req.files.map((f: Express.Multer.File) => ({
          fileName: f.originalname,
          buffer: f.buffer,
        }));

        result = await BatchIssuanceService.processPdfItemsBatch(
          items,
          institutionId,
          defaultProgram,
          defaultDegree,
          req.user?.id
        );
      } else {
        throw new BadRequestError('Upload file(s) or ZIP package parameter is required for mass issuance');
      }

      ApiResponse.success(res, result, 'Phase 1: Mass certificate batch issuance complete');
    } catch (error) {
      next(error);
    }
  }
}
