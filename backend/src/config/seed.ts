import path from 'path';
import fs from 'fs';
import { Database as SqlJsDatabase } from 'sql.js';
import { hashPassword } from '../utils/password.js';

export async function runMigrationsAndSeeds(rawDb: SqlJsDatabase): Promise<void> {
  try {
    const schemaPath = path.resolve(__dirname, '../../../../database/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      rawDb.exec(schemaSql);
    }
  } catch (err) {
    console.error('Schema execution warning:', err);
  }

  // Ensure default roles exist
  rawDb.exec(`
    INSERT OR IGNORE INTO roles (id, name, description) VALUES 
    ('SUPER_ADMIN', 'Super Admin', 'Platform Super Administrator'),
    ('INSTITUTION_ADMIN', 'Institution Admin', 'Institution Administrator'),
    ('ISSUER', 'Issuer', 'Credential Issuing Officer'),
    ('REVOKER', 'Revoker', 'Credential Revocation Officer'),
    ('ADMIN', 'Admin', 'Administrative Role');
  `);

  // Ensure default institution exists
  const instCheck = rawDb.prepare("SELECT id FROM institutions WHERE code = 'VUNIV'").step();
  let defaultInstId = 'inst-vuniv-001';
  if (!instCheck) {
    rawDb.run(
      `INSERT INTO institutions (id, name, code, email, address, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [defaultInstId, 'Verification University', 'VUNIV', 'contact@vuniv.edu', '100 Innovation Way, Tech Park', 'ACTIVE']
    );
  }

  const defaultPasswordHash = await hashPassword('Admin@123456');

  // Ensure Super Admin user exists
  const adminCheck = rawDb.prepare("SELECT id FROM users WHERE email = 'admin@platform.local'").step();
  if (!adminCheck) {
    rawDb.run(
      `INSERT INTO users (id, email, password_hash, full_name, role_id, institution_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['user-admin-001', 'admin@platform.local', defaultPasswordHash, 'Platform Super Admin', 'SUPER_ADMIN', defaultInstId, 'ACTIVE']
    );
  }

  // Ensure Institution Issuer user exists
  const issuerCheck = rawDb.prepare("SELECT id FROM users WHERE email = 'issuer@vuniv.edu'").step();
  if (!issuerCheck) {
    rawDb.run(
      `INSERT INTO users (id, email, password_hash, full_name, role_id, institution_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['user-issuer-001', 'issuer@vuniv.edu', defaultPasswordHash, 'Academic Credential Issuer', 'ISSUER', defaultInstId, 'ACTIVE']
    );
  }
}
