import { getDb } from '../config/database.js';

export interface UserRecord {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role_id: string;
  institution_id: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  created_at: string;
  updated_at: string;
}

export class UserRepository {
  static async findById(id: string): Promise<UserRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRecord | undefined;
    return row || null;
  }

  static async findByEmail(email: string): Promise<UserRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRecord | undefined;
    return row || null;
  }

  static async create(user: Omit<UserRecord, 'created_at' | 'updated_at'>): Promise<UserRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, full_name, role_id, institution_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(user.id, user.email, user.password_hash, user.full_name, user.role_id, user.institution_id || null, user.status || 'ACTIVE');
    const created = await this.findById(user.id);
    return created!;
  }

  static async updateStatus(id: string, status: UserRecord['status']): Promise<boolean> {
    const db = await getDb();
    const result = db.prepare(`UPDATE users SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);
    return result.changes > 0;
  }

  static async listAll(limit = 50, offset = 0): Promise<UserRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?').all(limit, offset) as UserRecord[];
  }
}
