process.env.NODE_ENV = 'test';

import test, { describe } from 'node:test';
import assert from 'node:assert';
import { CertificateHashService, RawCertificatePayload } from '../services/certificateHash.service.js';
import { generateCertificateNumber } from '../utils/certNumberGenerator.js';
import { canonicalizeJSON } from '../utils/canonicalize.js';

describe('Certificate Generation & Deterministic Hashing Engine Unit Tests', () => {
  const samplePayload: RawCertificatePayload = {
    certificateNumber: 'CERT-2026-HARVARD-A1B2C3D4',
    institutionId: 'inst-harvard-uuid',
    institutionCode: 'HARVARD-001',
    studentId: 'student-alice-uuid',
    studentIdentifier: 'STU-2026-001',
    studentFirstName: 'Alice',
    studentLastName: 'Johnson',
    studentEmail: 'alice.johnson@harvard.edu',
    programName: 'Computer Science',
    degree: 'Bachelor of Science',
    grade: 'First Class Honors',
    issueDate: '2026-06-15T00:00:00.000Z',
  };

  test('generateCertificateNumber should return valid formatted certificate number', () => {
    const certNum = generateCertificateNumber('MIT-001', 2026);
    assert.ok(certNum.startsWith('CERT-2026-MIT001-'));
    assert.strictEqual(certNum.split('-').length, 4);
  });

  test('computeCanonicalHash should return deterministic 64-character SHA-256 hex hash', () => {
    const res1 = CertificateHashService.computeCanonicalHash(samplePayload);
    const res2 = CertificateHashService.computeCanonicalHash(samplePayload);

    assert.strictEqual(res1.canonicalHash.length, 64);
    assert.strictEqual(res1.canonicalHash, res2.canonicalHash);
    assert.strictEqual(res1.canonicalJson, res2.canonicalJson);
  });

  test('canonicalizeJSON should produce identical output regardless of key insertion order', () => {
    const objA = { z: 10, a: 'test', m: { b: 2, a: 1 } };
    const objB = { a: 'test', m: { a: 1, b: 2 }, z: 10 };

    const jsonA = canonicalizeJSON(objA);
    const jsonB = canonicalizeJSON(objB);

    assert.strictEqual(jsonA, jsonB);
  });

  test('Modifying single property should alter SHA-256 hash completely', () => {
    const originalHash = CertificateHashService.computeCanonicalHash(samplePayload).canonicalHash;

    const tamperedPayload: RawCertificatePayload = {
      ...samplePayload,
      grade: 'Second Class Honors', // Tampered grade
    };

    const tamperedHash = CertificateHashService.computeCanonicalHash(tamperedPayload).canonicalHash;

    assert.notStrictEqual(originalHash, tamperedHash);
  });

  test('verifyHashDeterminism should return true for valid hash match and false for invalid', () => {
    const { canonicalHash } = CertificateHashService.computeCanonicalHash(samplePayload);

    const isValid = CertificateHashService.verifyHashDeterminism(samplePayload, canonicalHash);
    const isInvalid = CertificateHashService.verifyHashDeterminism(samplePayload, '0000000000000000000000000000000000000000000000000000000000000000');

    assert.strictEqual(isValid, true);
    assert.strictEqual(isInvalid, false);
  });
});
