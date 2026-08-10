import crypto from 'crypto';
import { CertificateRepository, CertificateRecord } from '../repositories/CertificateRepository.js';
import { InstitutionRepository } from '../repositories/InstitutionRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { CertificateHashService } from './certificateHash.service.js';
import { IpfsService } from './ipfs.service.js';
import { generateCertificateNumber } from '../utils/certNumberGenerator.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/AppError.js';

export interface CreateCertificateInput {
  institutionId: string;
  studentId: string;
  programName: string;
  degree: string;
  grade?: string;
  issueDate?: string;
}

export class CertificateService {
  static async createCertificate(input: CreateCertificateInput, actorUserId?: string): Promise<CertificateRecord> {
    if (!input.institutionId || !input.studentId || !input.programName || !input.degree) {
      throw new BadRequestError('Institution ID, student ID, program name, and degree are required');
    }

    const inst = await InstitutionRepository.findById(input.institutionId);
    if (!inst) {
      throw new NotFoundError(`Institution with ID '${input.institutionId}' not found`);
    }

    const student = await StudentRepository.findById(input.studentId);
    if (!student) {
      throw new NotFoundError(`Student with ID '${input.studentId}' not found`);
    }

    if (student.institution_id !== inst.id) {
      throw new BadRequestError('Student does not belong to the specified institution');
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
      pdf_hash: null,
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
      details: JSON.stringify({ certNumber, canonicalHash, ipfsCid: ipfsRes.cid }),
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

  static async getCertificateByNumber(certNumber: string): Promise<CertificateRecord> {
    const cert = await CertificateRepository.findByNumber(certNumber.trim());
    if (!cert) {
      throw new NotFoundError(`Certificate number '${certNumber}' not found`);
    }
    return cert;
  }

  static async revokeCertificate(id: string, reason: string, actorUserId?: string): Promise<CertificateRecord> {
    if (!reason || !reason.trim()) {
      throw new BadRequestError('Revocation reason is required');
    }

    const cert = await this.getCertificateById(id);
    if (cert.status === 'REVOKED') {
      throw new ConflictError('Certificate is already revoked');
    }

    await CertificateRepository.revoke(id, reason.trim());

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'CERTIFICATE_REVOKED',
      entity_type: 'CERTIFICATE',
      entity_id: id,
      ip_address: null,
      details: JSON.stringify({ certNumber: cert.certificate_number, reason }),
    });

    return this.getCertificateById(id);
  }

  static async listCertificates(limit = 50, offset = 0): Promise<CertificateRecord[]> {
    return CertificateRepository.listAll(limit, offset);
  }

  static async listByStudent(studentId: string): Promise<CertificateRecord[]> {
    const all = await CertificateRepository.listAll(1000, 0);
    return all.filter((c) => c.student_id === studentId);
  }

  static async listByInstitution(institutionId: string): Promise<CertificateRecord[]> {
    const all = await CertificateRepository.listAll(1000, 0);
    return all.filter((c) => c.institution_id === institutionId);
  }
}
