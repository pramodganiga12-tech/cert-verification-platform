import { ApiResponse } from '../types/verification';

const API_BASE_URL = '/api';

export interface CertificateRecordUI {
  id: string;
  certificate_number: string;
  institution_id: string;
  student_id: string;
  program_name: string;
  degree: string;
  grade: string | null;
  issue_date: string;
  canonical_hash: string;
  pdf_hash?: string | null;
  ipfs_cid: string | null;
  status: 'ISSUED' | 'REVOKED' | 'SUSPENDED';
  revocation_reason: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface StudentRecordUI {
  id: string;
  institution_id: string;
  student_identifier: string;
  first_name: string;
  last_name: string;
  email: string;
  dob: string | null;
  created_at: string;
}

export interface InstitutionRecordUI {
  id: string;
  name: string;
  code: string;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
}

export class AdminApiService {
  private static getHeaders(token: string) {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    };
  }

  /**
   * List all certificates
   */
  static async listCertificates(token: string): Promise<CertificateRecordUI[]> {
    const res = await fetch(`${API_BASE_URL}/certificates`, {
      headers: this.getHeaders(token)
    });
    const payload: ApiResponse<CertificateRecordUI[]> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to fetch certificates');
    }
    return payload.data;
  }

  /**
   * Create & issue new certificate
   */
  static async createCertificate(
    token: string,
    input: {
      institutionId: string;
      studentId?: string;
      studentName?: string;
      studentIdentifier?: string;
      studentEmail?: string;
      programName: string;
      degree: string;
      grade?: string;
      issueDate?: string;
      pdfHash?: string;
    }
  ): Promise<CertificateRecordUI> {
    const res = await fetch(`${API_BASE_URL}/certificates`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(input)
    });
    const payload: ApiResponse<CertificateRecordUI> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to issue certificate');
    }
    return payload.data;
  }

  /**
   * Revoke an issued certificate
   */
  static async revokeCertificate(token: string, certificateId: string, reason: string): Promise<CertificateRecordUI> {
    const res = await fetch(`${API_BASE_URL}/certificates/${certificateId}/revoke`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify({ reason })
    });
    const payload: ApiResponse<CertificateRecordUI> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to revoke certificate');
    }
    return payload.data;
  }

  /**
   * List institutions
   */
  static async listInstitutions(token: string): Promise<InstitutionRecordUI[]> {
    const res = await fetch(`${API_BASE_URL}/institutions`, {
      headers: this.getHeaders(token)
    });
    const payload: ApiResponse<InstitutionRecordUI[]> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to fetch institutions');
    }
    return payload.data;
  }

  /**
   * List students for institution
   */
  static async listStudents(token: string, institutionId?: string): Promise<StudentRecordUI[]> {
    const url = institutionId
      ? `${API_BASE_URL}/students?institutionId=${institutionId}`
      : `${API_BASE_URL}/students`;
    const res = await fetch(url, {
      headers: this.getHeaders(token)
    });
    const payload: ApiResponse<StudentRecordUI[]> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to fetch students');
    }
    return payload.data;
  }

  /**
   * Create single student record
   */
  static async createStudent(
    token: string,
    input: {
      institutionId: string;
      studentIdentifier: string;
      firstName: string;
      lastName: string;
      email: string;
      dob?: string;
    }
  ): Promise<StudentRecordUI> {
    const res = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: JSON.stringify(input)
    });
    const payload: ApiResponse<StudentRecordUI> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to register student');
    }
    return payload.data;
  }

  /**
   * Bulk import students via CSV file
   */
  static async bulkImportStudents(token: string, institutionId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('csv', file);
    formData.append('institutionId', institutionId);

    const res = await fetch(`${API_BASE_URL}/students/bulk-import`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const payload: ApiResponse<any> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to bulk import students');
    }
    return payload.data;
  }

  /**
   * Delete student record by ID
   */
  static async deleteStudent(token: string, studentId: string): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(token)
    });
    const payload: ApiResponse<any> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Failed to delete student');
    }
    return true;
  }
}
