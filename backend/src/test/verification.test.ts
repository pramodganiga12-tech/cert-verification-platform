import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'http';
import app from '../index.js';
import { getDb } from '../config/database.js';
import { AuthService } from '../services/auth.service.js';
import { InstitutionService } from '../services/institution.service.js';
import { StudentService } from '../services/student.service.js';
import { CertificateService } from '../services/certificate.service.js';



describe('Certificate Verification Engine API Integration Unit Tests', () => {
  let server: http.Server;
  let baseUrl: string;
  let institutionId: string;
  let studentId: string;
  let certId: string;
  let certNumber: string;
  let certHash: string;

  before(async () => {
    process.env.NODE_ENV = 'test';
    await getDb();

    const authRes = await AuthService.login('admin@platform.local', 'Admin@123456');


    const inst = await InstitutionService.createInstitution({
      name: `Verification University ${Date.now()}`,
      code: `VUNIV-${Date.now()}`,
      email: `contact@vuniv-${Date.now()}.edu`,
      phone: '+1-555-0199',
      address: '100 Verification Way'
    });
    institutionId = inst.id;

    const student = await StudentService.createStudent({
      institutionId,
      studentIdentifier: `VSTUD-${Date.now()}`,
      firstName: 'Alice',
      lastName: 'Verifier',
      email: `alice.${Date.now()}@vuniv.edu`,
      dateOfBirth: '2001-05-15'
    });
    studentId = student.id;

    const cert = await CertificateService.createCertificate({
      institutionId,
      studentId,
      programName: 'Cryptographic Security & Verification Systems',
      degree: 'BACHELOR_OF_SCIENCE',
      issueDate: '2026-05-01'
    });

    certId = cert.id;
    certNumber = cert.certificate_number;
    certHash = cert.canonical_hash;


    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as { port: number };
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  it('POST /api/verify/hash with valid canonical hash should return VALID report', async () => {
    const res = await fetch(`${baseUrl}/api/verify/hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: certHash })
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.finalStatus, 'VALID');
    assert.strictEqual(body.data.isAuthentic, true);
    assert.strictEqual(body.data.certificateId, certId);
    assert.ok(Array.isArray(body.data.steps));
    assert.ok(body.data.steps.length >= 8);
  });

  it('GET /api/verify/:certificateId should return valid report by ID and Number', async () => {
    const res = await fetch(`${baseUrl}/api/verify/${certNumber}`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.finalStatus, 'VALID');
    assert.strictEqual(body.data.certificateNumber, certNumber);
  });

  it('POST /api/verify/hash with unknown hash should return NOT_FOUND report', async () => {
    const fakeHash = '9999999999999999999999999999999999999999999999999999999999999999';
    const res = await fetch(`${baseUrl}/api/verify/hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: fakeHash })
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.finalStatus, 'NOT_FOUND');
    assert.strictEqual(body.data.isAuthentic, false);
  });

  it('POST /api/verify/hash on revoked certificate should return REVOKED report', async () => {
    await CertificateService.revokeCertificate(certId, 'Academic integrity violation', '00000000-0000-0000-0000-000000000001');

    const res = await fetch(`${baseUrl}/api/verify/hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: certHash })
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.data.finalStatus, 'REVOKED');
    assert.strictEqual(body.data.isAuthentic, false);
  });
});
