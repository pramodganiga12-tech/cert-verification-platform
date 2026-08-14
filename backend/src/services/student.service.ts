import crypto from 'crypto';
import { StudentRepository, StudentRecord } from '../repositories/StudentRepository.js';
import { InstitutionRepository } from '../repositories/InstitutionRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/AppError.js';

export interface CreateStudentInput {
  institutionId: string;
  studentIdentifier: string;
  firstName: string;
  lastName: string;
  email: string;
  dob?: string;
  userId?: string;
}

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  dob?: string;
}

export interface BulkImportResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  insertedStudents: StudentRecord[];
  errors: { row: number; identifier: string; error: string }[];
}

export class StudentService {
  static async createStudent(input: CreateStudentInput, actorUserId?: string): Promise<StudentRecord> {
    if (!input.institutionId || !input.studentIdentifier || !input.firstName || !input.lastName || !input.email) {
      throw new BadRequestError('Institution ID, student identifier, first name, last name, and email are required');
    }

    const inst = await InstitutionRepository.findById(input.institutionId);
    if (!inst) {
      throw new NotFoundError(`Institution with ID '${input.institutionId}' not found`);
    }

    const existing = await StudentRepository.findByIdentifier(input.institutionId, input.studentIdentifier.trim());
    if (existing) {
      throw new ConflictError(`Student identifier '${input.studentIdentifier}' already exists for this institution`);
    }

    const id = crypto.randomUUID();
    const created = await StudentRepository.create({
      id,
      user_id: input.userId || null,
      institution_id: input.institutionId,
      student_identifier: input.studentIdentifier.trim(),
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email: input.email.toLowerCase().trim(),
      dob: input.dob || null,
    });

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'STUDENT_CREATED',
      entity_type: 'STUDENT',
      entity_id: created.id,
      ip_address: null,
      details: JSON.stringify({ identifier: created.student_identifier, email: created.email }),
    });

    return created;
  }

  static async getStudentById(id: string): Promise<StudentRecord> {
    const student = await StudentRepository.findById(id);
    if (!student) {
      throw new NotFoundError(`Student with ID '${id}' not found`);
    }
    return student;
  }

  static async listStudentsByInstitution(institutionId: string, limit = 50, offset = 0): Promise<StudentRecord[]> {
    return StudentRepository.listByInstitution(institutionId, limit, offset);
  }

  static async listAllStudents(limit = 50, offset = 0): Promise<StudentRecord[]> {
    return StudentRepository.listAll(limit, offset);
  }

  static async updateStudent(id: string, input: UpdateStudentInput, actorUserId?: string): Promise<StudentRecord> {
    await this.getStudentById(id);

    const updated = await StudentRepository.update(id, {
      first_name: input.firstName ? input.firstName.trim() : undefined,
      last_name: input.lastName ? input.lastName.trim() : undefined,
      email: input.email ? input.email.toLowerCase().trim() : undefined,
      dob: input.dob !== undefined ? input.dob : undefined,
    });

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'STUDENT_UPDATED',
      entity_type: 'STUDENT',
      entity_id: id,
      ip_address: null,
      details: JSON.stringify(input),
    });

    return updated;
  }

  static async deleteStudent(id: string, actorUserId?: string): Promise<boolean> {
    const student = await this.getStudentById(id);
    const deleted = await StudentRepository.delete(id);

    if (deleted) {
      await AuditLogRepository.create({
        id: crypto.randomUUID(),
        user_id: actorUserId || null,
        action: 'STUDENT_DELETED',
        entity_type: 'STUDENT',
        entity_id: id,
        ip_address: null,
        details: JSON.stringify({ studentIdentifier: student.student_identifier, name: `${student.first_name} ${student.last_name}` }),
      });
    }

    return deleted;
  }

  static async bulkImportStudents(institutionId: string, csvData: string, actorUserId?: string): Promise<BulkImportResult> {
    const inst = await InstitutionRepository.findById(institutionId);
    if (!inst) {
      throw new NotFoundError(`Institution with ID '${institutionId}' not found`);
    }

    const lines = csvData.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length === 0) {
      throw new BadRequestError('CSV data is empty');
    }

    // Determine header row
    const firstLineParts = lines[0].split(',').map((p) => p.trim().toLowerCase());
    const hasHeader = firstLineParts.includes('student_identifier') || firstLineParts.includes('identifier') || firstLineParts.includes('email');
    const dataLines = hasHeader ? lines.slice(1) : lines;

    const result: BulkImportResult = {
      totalProcessed: dataLines.length,
      successCount: 0,
      failureCount: 0,
      insertedStudents: [],
      errors: [],
    };

    for (let i = 0; i < dataLines.length; i++) {
      const parts = dataLines[i].split(',').map((p) => p.trim());
      const rowNumber = i + (hasHeader ? 2 : 1);

      if (parts.length < 4) {
        result.failureCount++;
        result.errors.push({
          row: rowNumber,
          identifier: parts[0] || 'UNKNOWN',
          error: 'Row must contain student_identifier, first_name, last_name, email',
        });
        continue;
      }

      const [studentIdentifier, firstName, lastName, email, dob] = parts;

      try {
        const student = await this.createStudent(
          {
            institutionId,
            studentIdentifier,
            firstName,
            lastName,
            email,
            dob: dob || undefined,
          },
          actorUserId
        );
        result.successCount++;
        result.insertedStudents.push(student);
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Import error';
        result.failureCount++;
        result.errors.push({
          row: rowNumber,
          identifier: studentIdentifier,
          error: errMsg,
        });
      }
    }

    return result;
  }
}
