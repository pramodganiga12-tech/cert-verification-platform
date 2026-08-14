import { VerificationReport, ApiResponse } from '../types/verification';

const API_BASE_URL = '/api';

export class VerificationApiService {
  /**
   * Verify by Canonical SHA-256 Hash
   */
  static async verifyByHash(hash: string): Promise<VerificationReport> {
    const res = await fetch(`${API_BASE_URL}/verify/hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: hash.trim() })
    });
    
    const payload: ApiResponse<VerificationReport> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Hash verification request failed');
    }
    return payload.data;
  }

  /**
   * Verify by Certificate ID or Certificate Number
   */
  static async verifyById(certificateId: string): Promise<VerificationReport> {
    const cleanId = encodeURIComponent(certificateId.trim());
    const res = await fetch(`${API_BASE_URL}/verify/${cleanId}`);
    const payload: ApiResponse<VerificationReport> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'Certificate ID verification request failed');
    }
    return payload.data;
  }

  /**
   * Verify by JSON certificate payload string or object
   */
  static async verifyByJSON(jsonPayload: any): Promise<VerificationReport> {
    const res = await fetch(`${API_BASE_URL}/verify/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ certificateData: jsonPayload })
    });
    const payload: ApiResponse<VerificationReport> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'JSON payload verification failed');
    }
    return payload.data;
  }

  /**
   * Verify by QR Code content text
   */
  static async verifyByQR(qrData: string): Promise<VerificationReport> {
    const res = await fetch(`${API_BASE_URL}/verify/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrData: qrData.trim() })
    });
    const payload: ApiResponse<VerificationReport> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'QR code verification failed');
    }
    return payload.data;
  }

  /**
   * Verify by PDF file buffer / base64
   */
  static async verifyByPDF(file: File): Promise<VerificationReport> {
    const formData = new FormData();
    formData.append('pdf', file);

    const res = await fetch(`${API_BASE_URL}/verify/pdf`, {
      method: 'POST',
      body: formData
    });

    const payload: ApiResponse<VerificationReport> = await res.json();
    if (!res.ok || !payload.success) {
      throw new Error(payload.message || 'PDF verification failed');
    }
    return payload.data;
  }
}
