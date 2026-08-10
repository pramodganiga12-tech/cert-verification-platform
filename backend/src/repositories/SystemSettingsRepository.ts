import { getDb } from '../config/database.js';

export interface SystemSettingRecord {
  key: string;
  value: string;
  description: string | null;
  updated_at: string;
}

export class SystemSettingsRepository {
  static async get(key: string): Promise<string | null> {
    const db = await getDb();
    const row = db.prepare('SELECT value FROM system_settings WHERE key = ?').get<{ value: string }>(key);
    return row ? row.value : null;
  }

  static async set(key: string, value: string, description?: string): Promise<void> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO system_settings (key, value, description, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, description = COALESCE(excluded.description, system_settings.description), updated_at = datetime('now')
    `);
    stmt.run(key, value, description || null);
  }

  static async listAll(): Promise<SystemSettingRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM system_settings ORDER BY key ASC').all<SystemSettingRecord>();
  }
}
