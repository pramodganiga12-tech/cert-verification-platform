import test from 'node:test';
import assert from 'node:assert/strict';
import { PdfParserService } from '../services/pdfParser.service.js';
import { PdfStamperService } from '../services/pdfStamper.service.js';

test('PdfParserService - validates academic certificate text', async () => {
  const dummyText = 'THIS IS TO CERTIFY THAT PRAMOD M GOWDAR HAS COMPLETED BACHELOR OF ENGINEERING AT SHREE DEVI INSTITUTE OF TECHNOLOGY';
  const buffer = Buffer.from(dummyText, 'utf-8');

  const result = await PdfParserService.analyzePdfBuffer(buffer);
  assert.equal(result.isValid, true);
});

test('PdfParserService - rejects unsupported standard non-academic documents', async () => {
  const randomText = 'Random shopping receipt total amount $50.00 store item grocery list for market purchase details items list balance';
  const buffer = Buffer.from(randomText, 'utf-8');

  const result = await PdfParserService.analyzePdfBuffer(buffer);
  assert.equal(result.isValid, false);
  assert.match(result.rejectionReason || '', /Unsupported Standard/);
});

test('PdfStamperService - stamps QR Code and canonical hash onto PDF', async () => {
  const stampedBuffer = await PdfStamperService.stampQrCodeOntoPdf({
    certificateNumber: 'CERT-SDIT-2026-001',
    canonicalHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    studentName: 'Pramod M Gowdar',
    programName: 'Computer Science and Engineering',
    degree: 'Bachelor of Engineering',
    institutionName: 'Shree Devi Institute of Technology',
    issueDate: '2026-08-12',
  });

  assert.ok(stampedBuffer instanceof Buffer);
  assert.ok(stampedBuffer.length > 500);
});
