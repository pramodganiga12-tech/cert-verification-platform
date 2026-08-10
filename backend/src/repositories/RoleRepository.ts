import { getDb } from '../config/database.js';

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface PermissionRecord {
  id: string;
  name: string;
  description: string | null;
}

export class RoleRepository {
  static async findById(id: string): Promise<RoleRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM roles WHERE id = ?').get<RoleRecord>(id);
    return row || null;
  }

  static async findByName(name: string): Promise<RoleRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM roles WHERE name = ?').get<RoleRecord>(name);
    return row || null;
  }

  static async getRolePermissions(role_id: string): Promise<string[]> {
    const db = await getDb();
    const rows = db.prepare(`
      SELECT p.name
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ?
    `).all<{ name: string }>(role_id);
    return rows.map((r) => r.name);
  }

  static async listAllRoles(): Promise<RoleRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM roles ORDER BY name ASC').all<RoleRecord>();
  }
}
