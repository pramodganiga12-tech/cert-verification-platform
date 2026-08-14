import { getDb } from '../config/database.js';

export interface CertificateRecord {
  id: string;
  certificate_number: string;
  institution_id: string;
  student_id: string;
  program_name: string;
  degree: string;
  grade: string | null;
  issue_date: string;
  canonical_hash: string;
  pdf_hash: string | null;
  ipfs_cid: string | null;
  status: 'ISSUED' | 'REVOKED' | 'SUSPENDED';
  revocation_reason: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export class CertificateRepository {
  static async findById(id: string): Promise<CertificateRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM certificates WHERE id = ?').get<CertificateRecord>(id);
    return row || null;
  }

  static async findByNumber(certificate_number: string): Promise<CertificateRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM certificates WHERE LOWER(certificate_number) = LOWER(?)').get<CertificateRecord>(certificate_number.trim());
    return row || null;
  }

  static async findByCanonicalHash(canonical_hash: string): Promise<CertificateRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM certificates WHERE LOWER(canonical_hash) = LOWER(?)').get<CertificateRecord>(canonical_hash.trim());
    return row || null;
  }

  static async findByPdfHash(pdf_hash: string): Promise<CertificateRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM certificates WHERE LOWER(pdf_hash) = LOWER(?)').get<CertificateRecord>(pdf_hash.trim());
    return row || null;
  }

  static async create(cert: Omit<CertificateRecord, 'created_at' | 'updated_at' | 'revocation_reason' | 'revoked_at'>): Promise<CertificateRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO certificates (id, certificate_number, institution_id, student_id, program_name, degree, grade, issue_date, canonical_hash, pdf_hash, ipfs_cid, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(cert.id, cert.certificate_number, cert.institution_id, cert.student_id, cert.program_name, cert.degree, cert.grade || null, cert.issue_date, cert.canonical_hash, cert.pdf_hash || null, cert.ipfs_cid || null, cert.status || 'ISSUED');
    const created = await this.findById(cert.id);
    return created!;
  }

  static async revoke(id: string, reason: string): Promise<boolean> {
    const db = await getDb();
    const result = db.prepare(`
      UPDATE certificates
      SET status = 'REVOKED', revocation_reason = ?, revoked_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `).run(reason, id);
    return result.changes > 0;
  }

  static async listAll(limit = 50, offset = 0): Promise<CertificateRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM certificates ORDER BY created_at DESC LIMIT ? OFFSET ?').all<CertificateRecord>(limit, offset);
  }

  static async listByStudent(student_id: string): Promise<CertificateRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM certificates WHERE student_id = ? ORDER BY created_at DESC').all<CertificateRecord>(student_id);
  }

  static async listByInstitution(institution_id: string): Promise<CertificateRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM certificates WHERE institution_id = ? ORDER BY created_at DESC').all<CertificateRecord>(institution_id);
  }

  static async updateStatus(id: string, status: CertificateRecord['status'], reason?: string): Promise<CertificateRecord> {
    const db = await getDb();
    db.prepare(`
      UPDATE certificates
      SET status = ?, revocation_reason = ?, revoked_at = CASE WHEN ? = 'REVOKED' THEN datetime('now') ELSE revoked_at END, updated_at = datetime('now')
      WHERE id = ?
    `).run(status, reason || null, status, id);
    const updated = await this.findById(id);
    return updated!;
  }
}
