import { getDb } from '../config/database.js';

export interface InstitutionRecord {
  id: string;
  name: string;
  code: string;
  email: string;
  address: string | null;
  wallet_address: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  created_at: string;
  updated_at: string;
}

export class InstitutionRepository {
  static async findById(id: string): Promise<InstitutionRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM institutions WHERE id = ?').get<InstitutionRecord>(id);
    return row || null;
  }

  static async findByCode(code: string): Promise<InstitutionRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM institutions WHERE code = ?').get<InstitutionRecord>(code);
    return row || null;
  }

  static async create(inst: Omit<InstitutionRecord, 'created_at' | 'updated_at'>): Promise<InstitutionRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO institutions (id, name, code, email, address, wallet_address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(inst.id, inst.name, inst.code, inst.email, inst.address || null, inst.wallet_address || null, inst.status || 'ACTIVE');
    const created = await this.findById(inst.id);
    return created!;
  }

  static async update(id: string, updates: { name?: string; address?: string | null; wallet_address?: string | null }): Promise<InstitutionRecord> {
    const db = await getDb();
    db.prepare(`
      UPDATE institutions
      SET name = COALESCE(?, name),
          address = COALESCE(?, address),
          wallet_address = COALESCE(?, wallet_address),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(updates.name || null, updates.address !== undefined ? updates.address : null, updates.wallet_address !== undefined ? updates.wallet_address : null, id);
    const updated = await this.findById(id);
    return updated!;
  }

  static async updateStatus(id: string, status: InstitutionRecord['status']): Promise<InstitutionRecord> {
    const db = await getDb();
    db.prepare(`
      UPDATE institutions
      SET status = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(status, id);
    const updated = await this.findById(id);
    return updated!;
  }

  static async listAll(limit = 50, offset = 0): Promise<InstitutionRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM institutions ORDER BY created_at DESC LIMIT ? OFFSET ?').all<InstitutionRecord>(limit, offset);
  }
}
