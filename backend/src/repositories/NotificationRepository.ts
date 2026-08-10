import { getDb } from '../config/database.js';

export interface NotificationRecord {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  is_read: number;
  created_at: string;
}

export class NotificationRepository {
  static async create(n: Omit<NotificationRecord, 'created_at' | 'is_read'>): Promise<NotificationRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type, is_read)
      VALUES (?, ?, ?, ?, ?, 0)
    `);
    stmt.run(n.id, n.user_id, n.title, n.message, n.type || 'INFO');
    const row = db.prepare('SELECT * FROM notifications WHERE id = ?').get(n.id) as NotificationRecord;
    return row;
  }

  static async listByUser(user_id: string, limit = 20): Promise<NotificationRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?').all(user_id, limit) as NotificationRecord[];
  }

  static async markAsRead(id: string): Promise<boolean> {
    const db = await getDb();
    const result = db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
