import { getDb } from '../config/database.js';

export interface VerificationLogRecord {
  id: string;
  certificate_id: string | null;
  verification_method: 'CERTIFICATE_ID' | 'QR_CODE' | 'FILE_UPLOAD';
  result_status: 'VERIFIED' | 'TAMPERED' | 'REVOKED' | 'NOT_FOUND';
  input_identifier: string | null;
  verified_by_user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  details: string | null;
  created_at: string;
}

export class VerificationLogRepository {
  static async create(log: Omit<VerificationLogRecord, 'created_at'>): Promise<VerificationLogRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO verification_logs (id, certificate_id, verification_method, result_status, input_identifier, verified_by_user_id, ip_address, user_agent, details)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(log.id, log.certificate_id || null, log.verification_method, log.result_status, log.input_identifier || null, log.verified_by_user_id || null, log.ip_address || null, log.user_agent || null, log.details || null);
    const row = db.prepare('SELECT * FROM verification_logs WHERE id = ?').get<VerificationLogRecord>(log.id);
    return row!;
  }

  static async listAll(limit = 50, offset = 0): Promise<VerificationLogRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM verification_logs ORDER BY created_at DESC LIMIT ? OFFSET ?').all<VerificationLogRecord>(limit, offset);
  }
}
