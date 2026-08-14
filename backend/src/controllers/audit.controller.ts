import { Request, Response, NextFunction } from 'express';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { VerificationLogRepository } from '../repositories/VerificationLogRepository.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuditController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);

      const logs = await AuditLogRepository.listAll(limit, offset);
      ApiResponse.success(res, logs, 'Audit logs retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getVerificationAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await VerificationLogRepository.listAll(200, 0);

      const counts = {
        total: logs.length,
        verified: logs.filter((l) => l.result_status === 'VERIFIED').length,
        tampered: logs.filter((l) => l.result_status === 'TAMPERED').length,
        revoked: logs.filter((l) => l.result_status === 'REVOKED').length,
        notFound: logs.filter((l) => l.result_status === 'NOT_FOUND').length,
      };

      const byMethod = {
        certificateId: logs.filter((l) => l.verification_method === 'CERTIFICATE_ID').length,
        qrCode: logs.filter((l) => l.verification_method === 'QR_CODE').length,
        fileUpload: logs.filter((l) => l.verification_method === 'FILE_UPLOAD').length,
      };

      ApiResponse.success(
        res,
        {
          counts,
          byMethod,
          recentLogs: logs.slice(0, 10),
        },
        'Verification analytics retrieved successfully'
      );
    } catch (err) {
      next(err);
    }
  }
}
