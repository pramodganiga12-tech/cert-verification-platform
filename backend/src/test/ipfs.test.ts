process.env.NODE_ENV = 'test';

import test, { describe } from 'node:test';
import assert from 'node:assert';
import { IpfsService } from '../services/ipfs.service.js';

describe('IPFS Storage Integration & Fallback Engine Unit Tests', () => {
  const sampleCertMetadata = {
    certificateNumber: 'CERT-2026-TEST-12345',
    institution: { id: 'inst-1', code: 'TEST-001' },
    student: { id: 'stu-1', identifier: 'STU-100', firstName: 'Jane', lastName: 'Doe', email: 'jane@test.edu' },
    credential: { programName: 'Physics', degree: 'B.Sc.', grade: 'Distinction', issueDate: '2026-06-01T00:00:00.000Z' },
  };

  test('checkNodeHealth should return health status object', async () => {
    const health = await IpfsService.checkNodeHealth();
    assert.ok(typeof health.online === 'boolean');
    assert.ok(health.mode === 'DAEMON' || health.mode === 'FALLBACK');
  });

  test('uploadJSON should pin metadata and return valid IPFS CID starting with Qm', async () => {
    const res = await IpfsService.uploadJSON(sampleCertMetadata);
    assert.ok(res.cid);
    assert.ok(res.cid.startsWith('Qm'));
    assert.ok(res.size > 0);
  });

  test('uploadBuffer and retrieveContent should restore identical binary content', async () => {
    const originalText = 'Academic Certificate PDF Document Buffer Payload Content Verification';
    const buffer = Buffer.from(originalText, 'utf8');

    const uploadRes = await IpfsService.uploadBuffer(buffer, 'certificate.pdf');
    assert.ok(uploadRes.cid);

    const retrievedBuffer = await IpfsService.retrieveContent(uploadRes.cid);
    const retrievedText = retrievedBuffer.toString('utf8');

    assert.strictEqual(retrievedText, originalText);
  });

  test('Uploading identical content should yield identical IPFS CIDs', async () => {
    const data = { title: 'Degree Certificate', year: 2026 };
    const res1 = await IpfsService.uploadJSON(data);
    const res2 = await IpfsService.uploadJSON(data);

    assert.strictEqual(res1.cid, res2.cid);
  });
});
