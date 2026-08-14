import { Request, Response, NextFunction } from 'express';
import { VerificationService } from '../services/VerificationService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AppError } from '../errors/AppError.js';

const verificationService = new VerificationService();

export class VerificationController {
  public static async verifyByHash(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { hash } = req.body;
      if (!hash || typeof hash !== 'string') {
        throw new AppError('Canonical SHA-256 hash parameter is required', 400, 'BAD_REQUEST');
      }

      const report = await verificationService.verifyByHash(hash, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        verifiedByUserId: (req as any).user?.id
      });

      ApiResponse.success(res, report, 'Verification complete');
    } catch (error) {
      next(error);
    }
  }

  public static async verifyByQR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { qrData } = req.body;
      if (!qrData || typeof qrData !== 'string') {
        throw new AppError('QR code content parameter (qrData) is required', 400, 'BAD_REQUEST');
      }

      const report = await verificationService.verifyByQR(qrData, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        verifiedByUserId: (req as any).user?.id
      });

      ApiResponse.success(res, report, 'QR code verification complete');
    } catch (error) {
      next(error);
    }
  }

  public static async verifyByJSON(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const payload = req.body.certificateData || req.body;
      if (!payload || typeof payload !== 'object') {
        throw new AppError('Certificate JSON data parameter is required', 400, 'BAD_REQUEST');
      }

      const report = await verificationService.verifyByJSON(payload, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        verifiedByUserId: (req as any).user?.id
      });

      ApiResponse.success(res, report, 'JSON certificate payload verification complete');
    } catch (error) {
      next(error);
    }
  }

  public static async verifyByPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let buffer: Buffer | null = null;
      if (req.file) {
        buffer = req.file.buffer;
      } else if (req.body.pdfBase64) {
        buffer = Buffer.from(req.body.pdfBase64, 'base64');
      }

      if (!buffer) {
        throw new AppError('PDF file or pdfBase64 parameter is required', 400, 'BAD_REQUEST');
      }

      const report = await verificationService.verifyByPDFBuffer(buffer, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        verifiedByUserId: (req as any).user?.id
      });

      ApiResponse.success(res, report, 'PDF certificate verification complete');
    } catch (error) {
      next(error);
    }
  }

  public static async verifyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { certificateId } = req.params;
      if (!certificateId) {
        throw new AppError('Certificate identifier parameter is required', 400, 'BAD_REQUEST');
      }

      const report = await verificationService.verifyByCertificateId(certificateId, {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        verifiedByUserId: (req as any).user?.id
      });

      ApiResponse.success(res, report, 'Certificate ID verification complete');
    } catch (error) {
      next(error);
    }
  }
}

