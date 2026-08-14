import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service.js';
import { PdfStamperService } from '../services/pdfStamper.service.js';
import { InstitutionRepository } from '../repositories/InstitutionRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ForbiddenError, BadRequestError } from '../errors/AppError.js';

export class CertificateController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.roleName === 'INSTITUTION' ? req.user.institutionId! : req.body.institutionId;
      if (!institutionId) {
        throw new BadRequestError('Institution ID is required');
      }

      const cert = await CertificateService.createCertificate({ ...req.body, institutionId }, req.user?.id);
      ApiResponse.success(res, cert, 'Certificate created and pinned to IPFS successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cert = await CertificateService.getCertificateById(id);

      if (req.user?.roleName === 'INSTITUTION' && cert.institution_id !== req.user.institutionId) {
        throw new ForbiddenError('Access denied to certificates of other institutions');
      }

      ApiResponse.success(res, cert, 'Certificate retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);
      let list = await CertificateService.listCertificates(limit, offset);

      if (req.user?.roleName === 'INSTITUTION') {
        list = list.filter((c) => c.institution_id === req.user!.institutionId);
      }

      ApiResponse.success(res, list, 'Certificates listed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async listByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId } = req.params;
      const list = await CertificateService.listByStudent(studentId);
      ApiResponse.success(res, list, 'Student certificates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async listByInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { institutionId } = req.params;
      const list = await CertificateService.listByInstitution(institutionId);
      ApiResponse.success(res, list, 'Institution certificates retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async revoke(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const cert = await CertificateService.getCertificateById(id);

      if (req.user?.roleName === 'INSTITUTION' && cert.institution_id !== req.user.institutionId) {
        throw new ForbiddenError('You can only revoke certificates issued by your institution');
      }

      const revoked = await CertificateService.revokeCertificate(id, reason || 'Administrative Policy', req.user?.id);
      ApiResponse.success(res, revoked, 'Certificate revoked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download official QR-stamped PDF Certificate (Page 12 & 13 of PDF Presentation)
   */
  static async downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const cert = await CertificateService.getCertificateById(id);
      const inst = await InstitutionRepository.findById(cert.institution_id);
      const student = await StudentRepository.findById(cert.student_id);

      const pdfBuffer = await PdfStamperService.stampQrCodeOntoPdf({
        certificateNumber: cert.certificate_number,
        canonicalHash: cert.canonical_hash,
        studentName: student ? `${student.first_name} ${student.last_name}` : 'Student Candidate',
        programName: cert.program_name,
        degree: cert.degree,
        institutionName: inst ? inst.name : 'Shree Devi Institute of Technology',
        issueDate: cert.issue_date,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${cert.certificate_number}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
