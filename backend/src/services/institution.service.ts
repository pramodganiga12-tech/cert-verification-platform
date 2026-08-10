import crypto from 'crypto';
import { InstitutionRepository, InstitutionRecord } from '../repositories/InstitutionRepository.js';
import { AuditLogRepository } from '../repositories/AuditLogRepository.js';
import { BadRequestError, NotFoundError, ConflictError } from '../errors/AppError.js';

export interface CreateInstitutionInput {
  name: string;
  code: string;
  email: string;
  address?: string;
  walletAddress?: string;
}

export interface UpdateInstitutionInput {
  name?: string;
  address?: string;
  walletAddress?: string;
}

export class InstitutionService {
  static async createInstitution(input: CreateInstitutionInput, actorUserId?: string): Promise<InstitutionRecord> {
    if (!input.name || !input.code || !input.email) {
      throw new BadRequestError('Institution name, code, and email are required');
    }

    const existingCode = await InstitutionRepository.findByCode(input.code.toUpperCase().trim());
    if (existingCode) {
      throw new ConflictError(`Institution code '${input.code}' is already registered`);
    }

    const id = crypto.randomUUID();
    const created = await InstitutionRepository.create({
      id,
      name: input.name.trim(),
      code: input.code.toUpperCase().trim(),
      email: input.email.toLowerCase().trim(),
      address: input.address || null,
      wallet_address: input.walletAddress || null,
      status: 'ACTIVE',
    });

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'INSTITUTION_CREATED',
      entity_type: 'INSTITUTION',
      entity_id: created.id,
      ip_address: null,
      details: JSON.stringify({ code: created.code, name: created.name }),
    });

    return created;
  }

  static async getInstitutionById(id: string): Promise<InstitutionRecord> {
    const inst = await InstitutionRepository.findById(id);
    if (!inst) {
      throw new NotFoundError(`Institution with ID '${id}' not found`);
    }
    return inst;
  }

  static async listInstitutions(limit = 50, offset = 0): Promise<InstitutionRecord[]> {
    return InstitutionRepository.listAll(limit, offset);
  }

  static async updateInstitution(id: string, input: UpdateInstitutionInput, actorUserId?: string): Promise<InstitutionRecord> {
    await this.getInstitutionById(id);

    const updated = await InstitutionRepository.update(id, {
      name: input.name ? input.name.trim() : undefined,
      address: input.address !== undefined ? input.address : undefined,
      wallet_address: input.walletAddress !== undefined ? input.walletAddress : undefined,
    });

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'INSTITUTION_UPDATED',
      entity_type: 'INSTITUTION',
      entity_id: id,
      ip_address: null,
      details: JSON.stringify(input),
    });

    return updated;
  }

  static async updateStatus(id: string, status: 'ACTIVE' | 'SUSPENDED' | 'PENDING', actorUserId?: string): Promise<InstitutionRecord> {
    const existing = await this.getInstitutionById(id);

    const updated = await InstitutionRepository.updateStatus(id, status);

    await AuditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: actorUserId || null,
      action: 'INSTITUTION_STATUS_CHANGED',
      entity_type: 'INSTITUTION',
      entity_id: id,
      ip_address: null,
      details: JSON.stringify({ oldStatus: existing.status, newStatus: status }),
    });

    return updated;
  }
}
