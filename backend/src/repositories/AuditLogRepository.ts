import { getDb } from '../config/database.js';

export interface AuditLogRecord {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  ip_address: string | null;
  details: string | null;
  created_at: string;
}

export class AuditLogRepository {
  static async create(log: Omit<AuditLogRecord, 'created_at'>): Promise<AuditLogRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, ip_address, details)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(log.id, log.user_id || null, log.action, log.entity_type, log.entity_id || null, log.ip_address || null, log.details || null);
    const row = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get<AuditLogRecord>(log.id);
    return row!;
  }

  static async listAll(limit = 50, offset = 0): Promise<AuditLogRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?').all<AuditLogRecord>(limit, offset);
  }
}
