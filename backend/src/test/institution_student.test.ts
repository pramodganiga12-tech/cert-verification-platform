process.env.NODE_ENV = 'test';

import test, { describe } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../index.js';
import { closeDb, initDatabaseInstance } from '../config/database.js';
import { ApiSuccessPayload } from '../utils/apiResponse.js';
import { InstitutionRecord } from '../repositories/InstitutionRepository.js';
import { StudentRecord } from '../repositories/StudentRepository.js';
import { BulkImportResult } from '../services/student.service.js';

describe('Institution & Student Management API Unit Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let adminToken: string;
  let createdInstitutionId: string;
  const uniqueCode = `INST-${Date.now()}`;

  test('Start test server & authenticate as Admin', async () => {
    await initDatabaseInstance();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (typeof addr === 'object' && addr !== null) {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
    assert.ok(baseUrl);

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@platform.local', password: 'Admin@123456' }),
    });

    const loginBody = (await loginRes.json()) as any;
    assert.strictEqual(loginRes.status, 200);
    adminToken = loginBody.data.accessToken;
    assert.ok(adminToken);
  });

  test('POST /api/institutions should create a new institution', async () => {
    const res = await fetch(`${baseUrl}/api/institutions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Harvard University Test',
        code: uniqueCode,
        email: `registrar-${uniqueCode.toLowerCase()}@test.edu`,
        address: 'Cambridge, MA 02138',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as ApiSuccessPayload<InstitutionRecord>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.code, uniqueCode);
    createdInstitutionId = body.data.id;
  });

  test('GET /api/institutions should list all institutions', async () => {
    const res = await fetch(`${baseUrl}/api/institutions`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<InstitutionRecord[]>;
    assert.strictEqual(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 1);
  });

  test('PATCH /api/institutions/:id/status should update status', async () => {
    const res = await fetch(`${baseUrl}/api/institutions/${createdInstitutionId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<InstitutionRecord>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'ACTIVE');
  });

  test('POST /api/students should create a student record', async () => {
    const res = await fetch(`${baseUrl}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionId: createdInstitutionId,
        studentIdentifier: `STU-${Date.now()}-001`,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: `alice.${Date.now()}@test.edu`,
        dob: '2002-05-14',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as ApiSuccessPayload<StudentRecord>;
    assert.strictEqual(body.success, true);
    assert.ok(body.data.student_identifier.startsWith('STU-'));
  });

  test('POST /api/students/bulk-import should parse CSV and insert students', async () => {
    const timestamp = Date.now();
    const csvContent = `student_identifier,first_name,last_name,email,dob
STU-${timestamp}-002,Bob,Smith,bob.${timestamp}@test.edu,2001-11-20
STU-${timestamp}-003,Charlie,Brown,charlie.${timestamp}@test.edu,2002-01-15`;

    const res = await fetch(`${baseUrl}/api/students/bulk-import`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        institutionId: createdInstitutionId,
        csvData: csvContent,
      }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<BulkImportResult>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.successCount, 2);
    assert.strictEqual(body.data.failureCount, 0);
  });

  test('GET /api/students should list students for institution', async () => {
    const res = await fetch(`${baseUrl}/api/students?institutionId=${createdInstitutionId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<StudentRecord[]>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 3);
  });

  test('Close test server and DB connection', async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDb();
  });
});
