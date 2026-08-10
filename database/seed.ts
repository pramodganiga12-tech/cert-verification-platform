import fs from 'fs';
import path from 'path';
import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  const dbPath = process.env.DATABASE_PATH
    ? (path.isAbsolute(process.env.DATABASE_PATH)
        ? process.env.DATABASE_PATH
        : path.resolve(__dirname, '../', process.env.DATABASE_PATH))
    : path.resolve(__dirname, './platform.sqlite');

  console.log(`[Database Seed] Connecting to SQLite database at: ${dbPath}`);
  const SQL = await initSqlJs();
  if (!fs.existsSync(dbPath)) {
    throw new Error(`Database file not found at ${dbPath}. Run migration first.`);
  }

  const fileBuffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(fileBuffer);

  // Helper for prepared parameter execution
  const runStmt = (sql: string, params: any[]) => {
    const stmt = db.prepare(sql);
    stmt.run(params);
    stmt.free();
  };

  // 1. Seed Roles
  const roles = [
    { id: 'ADMIN', name: 'System Administrator', description: 'Full system administration access' },
    { id: 'INSTITUTION', name: 'Academic Institution', description: 'Certificate issuer institution account' },
    { id: 'STUDENT', name: 'Student / Credential Holder', description: 'Certificate holder student account' },
    { id: 'VERIFIER', name: 'Third-Party Verifier', description: 'Registered verifier organization' },
    { id: 'GUEST', name: 'Public Guest', description: 'Unauthenticated public verifier' },
  ];

  for (const role of roles) {
    runStmt(`
      INSERT OR REPLACE INTO roles (id, name, description, updated_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [role.id, role.name, role.description]);
  }
  console.log(`[Database Seed] Inserted ${roles.length} core system roles.`);

  // 2. Seed Permissions
  const permissions = [
    { id: 'cert:create', name: 'Create Certificate Draft', description: 'Create draft certificate payloads' },
    { id: 'cert:issue', name: 'Issue Certificate to Ledger', description: 'Issue certificate on IPFS & Blockchain' },
    { id: 'cert:revoke', name: 'Revoke Certificate', description: 'Revoke issued certificate on Ledger' },
    { id: 'cert:verify', name: 'Verify Certificate', description: 'Perform public or detailed verification' },
    { id: 'user:manage', name: 'Manage System Users', description: 'Create, update, and disable user accounts' },
    { id: 'inst:manage', name: 'Manage Institutions', description: 'Register and manage academic institutions' },
    { id: 'analytics:read', name: 'View System Analytics', description: 'Access platform metrics and reporting' },
    { id: 'audit:read', name: 'View Audit Logs', description: 'Access security audit trail logs' },
  ];

  for (const perm of permissions) {
    runStmt(`
      INSERT OR REPLACE INTO permissions (id, name, description, updated_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [perm.id, perm.name, perm.description]);
  }
  console.log(`[Database Seed] Inserted ${permissions.length} granular permissions.`);

  // 3. Seed Role-Permissions
  const rolePermissionsMapping: Record<string, string[]> = {
    ADMIN: ['cert:create', 'cert:issue', 'cert:revoke', 'cert:verify', 'user:manage', 'inst:manage', 'analytics:read', 'audit:read'],
    INSTITUTION: ['cert:create', 'cert:issue', 'cert:revoke', 'cert:verify', 'analytics:read'],
    STUDENT: ['cert:verify'],
    VERIFIER: ['cert:verify'],
    GUEST: ['cert:verify'],
  };

  for (const [roleId, perms] of Object.entries(rolePermissionsMapping)) {
    for (const permId of perms) {
      runStmt(`
        INSERT OR IGNORE INTO role_permissions (role_id, permission_id)
        VALUES (?, ?)
      `, [roleId, permId]);
    }
  }
  console.log('[Database Seed] Mapped role permissions.');

  // 4. Seed Test Institution
  const instId = 'inst-mit-001';
  runStmt(`
    INSERT OR REPLACE INTO institutions (id, name, code, email, address, wallet_address, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
  `, [
    instId,
    'Massachusetts Institute of Technology',
    'MIT-001',
    'registrar@mit.edu',
    '77 Massachusetts Ave, Cambridge, MA 02139',
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  ]);
  console.log('[Database Seed] Seeded default institution (MIT-001).');

  // 5. Seed Users (Super Admin, Institution Admin, Student User)
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin@123456', salt);
  const instPasswordHash = bcrypt.hashSync('Inst@123456', salt);
  const studentPasswordHash = bcrypt.hashSync('Student@123456', salt);

  runStmt(`
    INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role_id, institution_id, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
  `, ['user-admin-001', 'admin@platform.local', adminPasswordHash, 'System Super Admin', 'ADMIN', null]);

  runStmt(`
    INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role_id, institution_id, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
  `, ['user-inst-001', 'registrar@mit.edu', instPasswordHash, 'MIT Registrar Admin', 'INSTITUTION', instId]);

  runStmt(`
    INSERT OR REPLACE INTO users (id, email, password_hash, full_name, role_id, institution_id, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE', datetime('now'))
  `, ['user-student-001', 'student@mit.edu', studentPasswordHash, 'John Doe', 'STUDENT', instId]);
  console.log('[Database Seed] Seeded default users (admin@platform.local, registrar@mit.edu, student@mit.edu).');

  // 6. Seed Student Record
  runStmt(`
    INSERT OR REPLACE INTO students (id, user_id, institution_id, student_identifier, first_name, last_name, email, dob, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `, ['stu-001', 'user-student-001', instId, 'MIT-2026-001', 'John', 'Doe', 'student@mit.edu', '2000-01-15']);
  console.log('[Database Seed] Seeded student profile (MIT-2026-001).');

  // 7. Seed System Settings
  const settings = [
    { key: 'PLATFORM_NAME', value: 'Blockchain Academic Certificate Verification Platform', description: 'Public system display title' },
    { key: 'REQUIRE_APPROVAL_FOR_INSTITUTIONS', value: 'true', description: 'Whether new institutions require admin approval' },
    { key: 'CANONICAL_HASH_ALGORITHM', value: 'SHA-256', description: 'Primary hashing algorithm for verification payloads' },
    { key: 'ENCRYPTION_ALGORITHM', value: 'AES-256-GCM', description: 'Storage artifact encryption algorithm' },
  ];

  for (const s of settings) {
    runStmt(`
      INSERT OR REPLACE INTO system_settings (key, value, description, updated_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [s.key, s.value, s.description]);
  }
  console.log(`[Database Seed] Seeded ${settings.length} system settings.`);

  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  db.close();
  console.log('[Database Seed] Database seeding completed successfully.');
}

seedDatabase().catch(err => {
  console.error('[Database Seed Error]:', err);
  process.exit(1);
});
