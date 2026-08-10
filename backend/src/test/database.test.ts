import test, { describe } from 'node:test';
import assert from 'node:assert';
import path from 'path';
import fs from 'fs';
import initSqlJs from 'sql.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { InstitutionRepository } from '../repositories/InstitutionRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { CertificateRepository } from '../repositories/CertificateRepository.js';
import { SystemSettingsRepository } from '../repositories/SystemSettingsRepository.js';
import { getDb, closeDb } from '../config/database.js';

describe('SQLite Database Layer Tests (sql.js)', () => {
  const testDbPath = path.resolve(__dirname, '../../../database/test_platform.sqlite');

  test('Should create and migrate schema on a clean SQLite file', async () => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    process.env.DATABASE_PATH = testDbPath;
    closeDb();

    const SQL = await initSqlJs();
    const db = new SQL.Database();
    const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);

    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table'");
    const tableNames: string[] = [];
    while (stmt.step()) {
      tableNames.push(stmt.getAsObject().name as string);
    }
    stmt.free();

    assert.ok(tableNames.includes('users'));
    assert.ok(tableNames.includes('institutions'));
    assert.ok(tableNames.includes('certificates'));
    assert.ok(tableNames.includes('blockchain_transactions'));
    assert.ok(tableNames.includes('system_settings'));

    const data = db.export();
    fs.writeFileSync(testDbPath, Buffer.from(data));
    db.close();
  });

  test('UserRepository CRUD operations should function correctly', async () => {
    // Ensure roles are present
    const db = await getDb();
    db.exec(`INSERT OR IGNORE INTO roles (id, name, description) VALUES ('ADMIN', 'Admin', 'Admin Role')`);

    const user = await UserRepository.create({
      id: 'test-user-999',
      email: 'unit-test@platform.local',
      password_hash: 'hashedpassword',
      full_name: 'Test User',
      role_id: 'ADMIN',
      institution_id: null,
      status: 'ACTIVE',
    });

    assert.strictEqual(user.email, 'unit-test@platform.local');
    assert.strictEqual(user.role_id, 'ADMIN');

    const fetched = await UserRepository.findByEmail('unit-test@platform.local');
    assert.ok(fetched);
    assert.strictEqual(fetched.id, 'test-user-999');

    const updated = await UserRepository.updateStatus('test-user-999', 'SUSPENDED');
    assert.strictEqual(updated, true);
    const updatedUser = await UserRepository.findById('test-user-999');
    assert.strictEqual(updatedUser?.status, 'SUSPENDED');
  });

  test('InstitutionRepository & StudentRepository CRUD', async () => {
    const inst = await InstitutionRepository.create({
      id: 'inst-test-001',
      name: 'Test University',
      code: 'TEST-UNI',
      email: 'info@testuni.edu',
      address: '123 Test St',
      wallet_address: '0x1234567890123456789012345678901234567890',
      status: 'ACTIVE',
    });
    assert.strictEqual(inst.code, 'TEST-UNI');

    const student = await StudentRepository.create({
      id: 'stu-test-001',
      user_id: null,
      institution_id: 'inst-test-001',
      student_identifier: 'STU-001',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@testuni.edu',
      dob: '2001-05-20',
    });
    assert.strictEqual(student.student_identifier, 'STU-001');
  });

  test('CertificateRepository CRUD & revocation', async () => {
    const cert = await CertificateRepository.create({
      id: 'cert-test-001',
      certificate_number: 'CERT-TEST-999',
      institution_id: 'inst-test-001',
      student_id: 'stu-test-001',
      program_name: 'Computer Science',
      degree: 'Bachelor of Science',
      grade: 'First Class',
      issue_date: '2026-06-01',
      canonical_hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
      pdf_hash: 'pdfhash123',
      ipfs_cid: 'QmTestCid123',
      status: 'ISSUED',
    });

    assert.strictEqual(cert.certificate_number, 'CERT-TEST-999');

    const revoked = await CertificateRepository.revoke('cert-test-001', 'Academic misconduct');
    assert.strictEqual(revoked, true);
    const fetchedCert = await CertificateRepository.findById('cert-test-001');
    assert.strictEqual(fetchedCert?.status, 'REVOKED');
    assert.strictEqual(fetchedCert?.revocation_reason, 'Academic misconduct');
  });

  test('SystemSettingsRepository get & set', async () => {
    await SystemSettingsRepository.set('TEST_SETTING', 'ENABLED', 'Unit test setting');
    const val = await SystemSettingsRepository.get('TEST_SETTING');
    assert.strictEqual(val, 'ENABLED');
  });

  test('Cleanup test DB', () => {
    closeDb();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
    assert.ok(!fs.existsSync(testDbPath));
  });
});
