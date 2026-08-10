import { getDb } from '../config/database.js';

export interface StudentRecord {
  id: string;
  user_id: string | null;
  institution_id: string;
  student_identifier: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string | null;
  created_at: string;
  updated_at: string;
}

export class StudentRepository {
  static async findById(id: string): Promise<StudentRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM students WHERE id = ?').get<StudentRecord>(id);
    return row || null;
  }

  static async findByIdentifier(institution_id: string, student_identifier: string): Promise<StudentRecord | null> {
    const db = await getDb();
    const row = db.prepare('SELECT * FROM students WHERE institution_id = ? AND student_identifier = ?').get<StudentRecord>(institution_id, student_identifier);
    return row || null;
  }

  static async create(student: Omit<StudentRecord, 'created_at' | 'updated_at'>): Promise<StudentRecord> {
    const db = await getDb();
    const stmt = db.prepare(`
      INSERT INTO students (id, user_id, institution_id, student_identifier, first_name, last_name, email, dob)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(student.id, student.user_id || null, student.institution_id, student.student_identifier, student.first_name, student.last_name, student.email, student.dob || null);
    const created = await this.findById(student.id);
    return created!;
  }

  static async listByInstitution(institution_id: string, limit = 50, offset = 0): Promise<StudentRecord[]> {
    const db = await getDb();
    return db.prepare('SELECT * FROM students WHERE institution_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?').all<StudentRecord>(institution_id, limit, offset);
  }
}
