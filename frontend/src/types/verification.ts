export type FinalVerificationStatus = 'VALID' | 'INVALID_HASH' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND' | 'SUSPICIOUS';

export type VerificationStepStatus = 'PASSED' | 'FAILED' | 'WARNING' | 'SKIPPED';

export interface VerificationStep {
  stepName: string;
  status: VerificationStepStatus;
  description: string;
  timestamp: string;
}

export interface IssuerDetails {
  institutionName: string;
  institutionCode: string;
}

export interface StudentDetails {
  studentName: string;
  studentId: string;
}

export interface RevocationDetails {
  isRevoked: boolean;
  reason?: string;
  revokedAt?: string;
}

export interface VerificationReport {
  verificationId: string;
  finalStatus: FinalVerificationStatus;
  isAuthentic: boolean;
  certificateId: string | null;
  certificateNumber: string | null;
  canonicalHash: string | null;
  ipfsCid: string | null;
  onChainTxHash: string | null;
  issuerDetails: IssuerDetails | null;
  studentDetails: StudentDetails | null;
  revocationDetails: RevocationDetails | null;
  explanation: string;
  steps: VerificationStep[];
  verifiedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
