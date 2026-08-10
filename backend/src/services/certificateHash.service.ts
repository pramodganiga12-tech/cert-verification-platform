import crypto from 'crypto';
import { canonicalizeJSON } from '../utils/canonicalize.js';
import { BadRequestError } from '../errors/AppError.js';

export interface RawCertificatePayload {
  certificateNumber: string;
  institutionId: string;
  institutionCode: string;
  studentId: string;
  studentIdentifier: string;
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  programName: string;
  degree: string;
  grade?: string | null;
  issueDate: string;
}

export interface CanonicalCertificateMetadata {
  version: '1.0';
  certificateNumber: string;
  institution: {
    id: string;
    code: string;
  };
  student: {
    id: string;
    identifier: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  credential: {
    programName: string;
    degree: string;
    grade: string | null;
    issueDate: string;
  };
}

export class CertificateHashService {
  static validatePayload(payload: RawCertificatePayload): void {
    if (!payload.certificateNumber) throw new BadRequestError('certificateNumber is required');
    if (!payload.institutionId) throw new BadRequestError('institutionId is required');
    if (!payload.institutionCode) throw new BadRequestError('institutionCode is required');
    if (!payload.studentId) throw new BadRequestError('studentId is required');
    if (!payload.studentIdentifier) throw new BadRequestError('studentIdentifier is required');
    if (!payload.studentFirstName) throw new BadRequestError('studentFirstName is required');
    if (!payload.studentLastName) throw new BadRequestError('studentLastName is required');
    if (!payload.programName) throw new BadRequestError('programName is required');
    if (!payload.degree) throw new BadRequestError('degree is required');
    if (!payload.issueDate) throw new BadRequestError('issueDate is required');
  }

  static buildCanonicalMetadata(payload: RawCertificatePayload): CanonicalCertificateMetadata {
    this.validatePayload(payload);

    return {
      version: '1.0',
      certificateNumber: payload.certificateNumber.trim(),
      institution: {
        id: payload.institutionId.trim(),
        code: payload.institutionCode.trim().toUpperCase(),
      },
      student: {
        id: payload.studentId.trim(),
        identifier: payload.studentIdentifier.trim(),
        firstName: payload.studentFirstName.trim(),
        lastName: payload.studentLastName.trim(),
        email: payload.studentEmail.trim().toLowerCase(),
      },
      credential: {
        programName: payload.programName.trim(),
        degree: payload.degree.trim(),
        grade: payload.grade ? payload.grade.trim() : null,
        issueDate: new Date(payload.issueDate).toISOString(),
      },
    };
  }

  static computeCanonicalHash(payload: RawCertificatePayload): { canonicalJson: string; canonicalHash: string } {
    const metadata = this.buildCanonicalMetadata(payload);
    const canonicalJson = canonicalizeJSON(metadata);
    const canonicalHash = crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');

    return {
      canonicalJson,
      canonicalHash,
    };
  }

  static verifyHashDeterminism(payload: RawCertificatePayload, expectedHash: string): boolean {
    const { canonicalHash } = this.computeCanonicalHash(payload);
    return canonicalHash.toLowerCase() === expectedHash.toLowerCase();
  }
}
