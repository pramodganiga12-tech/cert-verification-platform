process.env.NODE_ENV = 'test';

import test, { describe } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../index.js';
import { closeDb, initDatabaseInstance } from '../config/database.js';
import { ApiSuccessPayload } from '../utils/apiResponse.js';
import { CertificateRecord } from '../repositories/CertificateRepository.js';
import { InstitutionRecord } from '../repositories/InstitutionRepository.js';
import { StudentRecord } from '../repositories/StudentRepository.js';
import { LoginResult } from '../services/auth.service.js';

describe('Certificate Management API Integration Unit Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let adminToken: string;
  let institutionId: string;
  let studentId: string;
  let createdCertId: string;

  test('Start test server & setup test institution and student', async () => {
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

    // Login as Admin
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@platform.local', password: 'Admin@123456' }),
    });

    const loginBody = (await loginRes.json()) as ApiSuccessPayload<LoginResult>;
    adminToken = loginBody.data.accessToken;

    // Create Institution
    const instRes = await fetch(`${baseUrl}/api/institutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: 'MIT Certificate Test',
        code: `MIT-${Date.now()}`,
        email: `cert-${Date.now()}@mit.edu`,
      }),
    });
    const instBody = (await instRes.json()) as ApiSuccessPayload<InstitutionRecord>;
    institutionId = instBody.data.id;

    // Create Student
    const stuRes = await fetch(`${baseUrl}/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        institutionId,
        studentIdentifier: `STU-MIT-${Date.now()}`,
        firstName: 'Robert',
        lastName: 'Miles',
        email: `robert.${Date.now()}@mit.edu`,
      }),
    });
    const stuBody = (await stuRes.json()) as ApiSuccessPayload<StudentRecord>;
    studentId = stuBody.data.id;
  });

  test('POST /api/certificates should create certificate, compute hash, and pin to IPFS', async () => {
    const res = await fetch(`${baseUrl}/api/certificates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        institutionId,
        studentId,
        programName: 'Computer Science and AI',
        degree: 'Master of Science',
        grade: 'High Honors',
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as ApiSuccessPayload<CertificateRecord>;
    assert.strictEqual(body.success, true);
    assert.ok(body.data.canonical_hash);
    assert.strictEqual(body.data.canonical_hash.length, 64);
    assert.ok(body.data.ipfs_cid);
    assert.strictEqual(body.data.status, 'ISSUED');

    createdCertId = body.data.id;
  });

  test('GET /api/certificates/:id should retrieve created certificate', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/${createdCertId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<CertificateRecord>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.id, createdCertId);
  });

  test('GET /api/certificates/student/:studentId should return student certificates', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/student/${studentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<CertificateRecord[]>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 1);
    assert.strictEqual(body.data[0].id, createdCertId);
  });

  test('GET /api/certificates/institution/:institutionId should return institution certificates', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/institution/${institutionId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<CertificateRecord[]>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.length, 1);
  });

  test('POST /api/certificates/:id/revoke should update status to REVOKED', async () => {
    const res = await fetch(`${baseUrl}/api/certificates/${createdCertId}/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({ reason: 'Issued with typo in degree specification' }),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as ApiSuccessPayload<CertificateRecord>;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.status, 'REVOKED');
    assert.strictEqual(body.data.revocation_reason, 'Issued with typo in degree specification');
  });

  test('Close test server and DB connection', async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    closeDb();
  });
});
