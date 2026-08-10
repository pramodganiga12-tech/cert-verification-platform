import { getDb } from '../config/database.js';

export interface SessionRecord {
  id: string;
  user_id: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  created_at: string;
}

export class SessionRepository {
  static async findById(id: string): Promise<SessionRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get<SessionRecord>(id);
    return row || null;
  }

  static async create(session: {
    id: string;
    user_id: string;
    ip_address?: string | null;
    user_agent?: string | null;
    expires_at: string;
  }): Promise<SessionRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO sessions (id, user_id, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(
      session.id,
      session.user_id,
      session.ip_address || null,
      session.user_agent || null,
      session.expires_at
    );
    const created = await this.findById(session.id);
    return created!;
  }

  static async invalidate(id: string): Promise<boolean> {
    const db = await getDb();
    const result = db.prepare("UPDATE sessions SET expires_at = datetime('now', '-1 minute') WHERE id = ?").run(id);
    return result.changes > 0;
  }

  static async invalidateAllForUser(user_id: string): Promise<number> {
    const db = await getDb();
    const result = db.prepare("UPDATE sessions SET expires_at = datetime('now', '-1 minute') WHERE user_id = ?").run(user_id);
    return result.changes;
  }
}
