import { getDb } from '../config/database.js';

export interface RefreshTokenRecord {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  revoked: number;
  created_at: string;
}

export class RefreshTokenRepository {
  static async findById(id: string): Promise<RefreshTokenRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM refresh_tokens WHERE id = ?').get<RefreshTokenRecord>(id);
    return row || null;
  }

  static async findByTokenHash(token_hash: string): Promise<RefreshTokenRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = 0').get<RefreshTokenRecord>(token_hash);
    return row || null;
  }

  static async create(rt: {
    id: string;
    user_id: string;
    token_hash: string;
    expires_at: string;
  }): Promise<RefreshTokenRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, revoked)
      VALUES (?, ?, ?, ?, 0)
    `);
    stmt.run(rt.id, rt.user_id, rt.token_hash, rt.expires_at);
    const created = await this.findById(rt.id);
    return created!;
  }

  static async revoke(id: string): Promise<boolean> {
    const db = await getDb();
    const result = db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE id = ?').run(id);
    return result.changes > 0;
  }

  static async revokeAllForUser(user_id: string): Promise<number> {
    const db = await getDb();
    const result = db.prepare('UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?').run(user_id);
    return result.changes;
  }
}
