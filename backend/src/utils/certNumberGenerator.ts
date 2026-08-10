import crypto from 'crypto';

export function generateCertificateNumber(institutionCode: string, year = new Date().getFullYear()): string {
  const cleanCode = institutionCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const randomSuffix = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `CERT-${year}-${cleanCode}-${randomSuffix}`;
}
