import crypto from 'crypto';
import { CertificateRepository, CertificateRecord } from '../repositories/CertificateRepository.js';
import { InstitutionRepository } from '../repositories/InstitutionRepository.js';
import { StudentRepository, StudentRecord } from '../repositories/StudentRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { CertificateHashService } from './certificateHash.service.js';
import { IpfsService } from './ipfs.service.js';
import { generateCertificateNumber } from '../utils/certNumberGenerator.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';

export interface CreateCertificateInput {
  institutionId: string;
  studentId?: string;
  studentName?: string;
  studentIdentifier?: string;
  studentEmail?: string;
  programName: string;
  degree: string;
  grade?: string;
  issueDate?: string;
  pdfHash?: string;
}

export class CertificateService {
  static async createCertificate(input: CreateCertificateInput, actorUserId?: string): Promise<CertificateRecord> {
    if (!input.institutionId || !input.programName || !input.degree) {
      throw new BadRequestError('Institution ID, program name, and degree are required');
    }

    const inst = await InstitutionRepository.findById(input.institutionId);
    if (!inst) {
      throw new NotFoundError(`Institution with ID '${input.institutionId}' not found`);
    }

    let student: StudentRecord | null = null;
    if (input.studentId) {
      student = await StudentRepository.findById(input.studentId);
    }

    if (!student) {
      // Auto-create student profile if studentId is not specified or not found
      const identifier = (input.studentIdentifier && input.studentIdentifier.trim()) || `STU-${Date.now().toString().slice(-6)}`;
      const fullName = (input.studentName && input.studentName.trim()) || 'Scholar Student';
      const parts = fullName.split(' ');
      const firstName = parts[0];
      const lastName = parts.slice(1).join(' ') || 'Candidate';
      const email = (input.studentEmail && input.studentEmail.trim().toLowerCase()) || `${identifier.toLowerCase()}@${inst.code.toLowerCase()}.edu`;

      student = await StudentRepository.create({
        id: crypto.randomUUID(),
        user_id: null,
        institution_id: inst.id,
        student_identifier: identifier,
        first_name: firstName,
        last_name: lastName,
        email,
        dob: null,
      });
    }

    const certNumber = generateCertificateNumber(inst.code);
    const issueDate = input.issueDate || new Date().toISOString();

    const { canonicalHash, canonicalJson } = CertificateHashService.computeCanonicalHash({
      certificateNumber: certNumber,
      institutionId: inst.id,
      institutionCode: inst.code,
      studentId: student.id,
      studentIdentifier: student.student_identifier,
      studentFirstName: student.first_name,
      studentLastName: student.last_name,
      studentEmail: student.email,
      programName: input.programName.trim(),
      degree: input.degree.trim(),
      grade: input.grade ? input.grade.trim() : null,
      issueDate,
    });

    // Pin canonical metadata payload to IPFS
    const ipfsRes = await IpfsService.uploadJSON(JSON.parse(canonicalJson));

    const id = crypto.randomUUID();
    const created = await CertificateRepository.create({
      id,
      certificate_number: certNumber,
      institution_id: inst.id,
      student_id: student.id,
      program_name: input.programName.trim(),
      degree: input.degree.trim(),
      grade: input.grade ? input.grade.trim() : null,
      issue_date: issueDate,
      canonical_hash: canonicalHash,
      pdf_hash: input.pdfHash || null,
      ipfs_cid: ipfsRes.cid,
      status: 'ISSUED',
    });

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'CERTIFICATE_ISSUED',
      entity_type: 'CERTIFICATE',
      entity_id: created.id,
      ip_address: null,
      details: JSON.stringify({
        certificateNumber: certNumber,
        canonicalHash,
        pdfHash: input.pdfHash || null,
        ipfsCid: ipfsRes.cid,
      }),
    });

    return created;
  }

  static async getCertificateById(id: string): Promise<CertificateRecord> {
    const cert = await CertificateRepository.findById(id);
    if (!cert) {
      throw new NotFoundError(`Certificate with ID '${id}' not found`);
    }
    return cert;
  }

  static async listCertificates(limit = 50, offset = 0): Promise<CertificateRecord[]> {
    return CertificateRepository.listAll(limit, offset);
  }

  static async listByStudent(studentId: string): Promise<CertificateRecord[]> {
    return CertificateRepository.listByStudent(studentId);
  }

  static async listByInstitution(institutionId: string): Promise<CertificateRecord[]> {
    return CertificateRepository.listByInstitution(institutionId);
  }

  static async revokeCertificate(id: string, reason: string, actorUserId?: string): Promise<CertificateRecord> {
    const cert = await this.getCertificateById(id);
    if (cert.status === 'REVOKED') {
      throw new BadRequestError('Certificate is already revoked');
    }

    const updated = await CertificateRepository.updateStatus(id, 'REVOKED', reason);

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'CERTIFICATE_REVOKED',
      entity_type: 'CERTIFICATE',
      entity_id: id,
      ip_address: null,
      details: JSON.stringify({ reason }),
    });

    return updated;
  }
}
