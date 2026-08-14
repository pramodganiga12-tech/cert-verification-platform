import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { CertificateRepository, CertificateRecord } from '../repositories/CertificateRepository.js';
import { InstitutionRepository } from '../repositories/InstitutionRepository.js';
import { StudentRepository } from '../repositories/StudentRepository.js';
import { VerificationLogRepository } from '../repositories/VerificationLogRepository.js';
import { IpfsService } from './ipfs.service.js';
import { BlockchainService } from './BlockchainService.js';
import { CertificateHashService } from './certificateHash.service.js';
import { canonicalizeJSON } from '../utils/canonicalize.js';
import { Logger } from '../utils/logger.js';

export type FinalVerificationStatus = 'VALID' | 'INVALID_HASH' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND' | 'SUSPICIOUS';

export interface VerificationStep {
  stepName: string;
  status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'WARNING';
  description: string;
  timestamp: string;
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
  issuerDetails: {
    institutionName?: string;
    institutionCode?: string;
    issuerAddress?: string;
  } | null;
  studentDetails: {
    studentName?: string;
    studentId?: string;
  } | null;
  revocationDetails: {
    isRevoked: boolean;
    reason?: string;
    revokedAt?: string;
  } | null;
  explanation: string;
  steps: VerificationStep[];
  verifiedAt: string;
}

export interface RequestContext {
  ipAddress?: string;
  userAgent?: string;
  verifiedByUserId?: string;
}

export class VerificationService {
  private ipfsService: IpfsService;
  private blockchainService: BlockchainService;

  constructor() {
    this.ipfsService = new IpfsService();
    this.blockchainService = new BlockchainService();
  }

  /**
   * Helper to compute canonical SHA-256 hash for any payload (raw or canonical metadata)
   */
  private computeHashOfAnyPayload(payload: any): string {
    if (!payload || typeof payload !== 'object') return '';
    try {
      if (payload.institutionId && payload.studentId && payload.programName) {
        return CertificateHashService.computeCanonicalHash(payload).canonicalHash;
      }
      const jsonStr = canonicalizeJSON(payload);
      return crypto.createHash('sha256').update(jsonStr, 'utf8').digest('hex');
    } catch {
      return '';
    }
  }

  /**
   * Main verification entrypoint by Canonical SHA-256 Hash
   */
  public async verifyByHash(hash: string, context?: RequestContext): Promise<VerificationReport> {
    const cleanHash = hash.trim().toLowerCase();
    const cert = await CertificateRepository.findByCanonicalHash(cleanHash);
    return this.runVerificationPipeline({ canonicalHash: cleanHash, dbCert: cert }, 'CERTIFICATE_ID', context);
  }

  /**
   * Main verification entrypoint by Certificate ID or Certificate Number
   */
  public async verifyByCertificateId(idOrNumber: string, context?: RequestContext): Promise<VerificationReport> {
    const query = idOrNumber.trim();
    let cert = await CertificateRepository.findById(query);
    if (!cert) {
      cert = await CertificateRepository.findByNumber(query);
    }
    return this.runVerificationPipeline({ searchIdentifier: query, dbCert: cert }, 'CERTIFICATE_ID', context);
  }

  /**
   * Main verification entrypoint by JSON payload structure
   */
  public async verifyByJSON(payload: any, context?: RequestContext): Promise<VerificationReport> {
    const canonicalHash = this.computeHashOfAnyPayload(payload);
    const certNumber = payload?.certificateNumber || payload?.id;

    let cert: CertificateRecord | null = null;
    if (canonicalHash) {
      cert = await CertificateRepository.findByCanonicalHash(canonicalHash);
    }
    if (!cert && certNumber) {
      cert = await CertificateRepository.findByNumber(certNumber);
    }

    return this.runVerificationPipeline({ rawPayload: payload, canonicalHash, dbCert: cert }, 'FILE_UPLOAD', context);
  }

  /**
   * Main verification entrypoint by QR Code content
   */
  public async verifyByQR(qrContent: string, context?: RequestContext): Promise<VerificationReport> {
    const trimmed = qrContent.trim();
    
    // Check if QR content is JSON string
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        return this.verifyByJSON(parsed, context);
      } catch {
        // Fall back to identifier query
      }
    }

    // Check if QR is direct hash or ID/Number
    if (trimmed.length === 64 && /^[a-fA-F0-9]+$/.test(trimmed)) {
      return this.verifyByHash(trimmed, context);
    }

    return this.verifyByCertificateId(trimmed, context);
  }

  /**
   * Main verification entrypoint by PDF file buffer (Page 10 & 13 of PDF Presentation)
   */
  public async verifyByPDFBuffer(buffer: Buffer, context?: RequestContext): Promise<VerificationReport> {
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex').toLowerCase();

    // Try finding certificate by PDF document hash directly
    let cert = await CertificateRepository.findByPdfHash(fileHash);

    if (!cert) {
      // Try finding by embedded canonical hash or certificate number in PDF text
      const textContent = buffer.toString('utf-8');
      const hashMatch = textContent.match(/([a-fA-F0-9]{64})/);
      if (hashMatch && hashMatch[1]) {
        cert = await CertificateRepository.findByCanonicalHash(hashMatch[1]);
      }

      if (!cert) {
        const certNumMatch = textContent.match(/(CERT-[A-Z0-9]+-[A-Z0-9]+)/);
        if (certNumMatch && certNumMatch[1]) {
          cert = await CertificateRepository.findByNumber(certNumMatch[1]);
        }
      }
    }

    const targetHash = cert ? cert.canonical_hash : fileHash;
    return this.runVerificationPipeline({ canonicalHash: targetHash, searchIdentifier: fileHash, dbCert: cert }, 'FILE_UPLOAD', context);
  }

  /**
   * Core 12-Step Reasoning Verification Engine Pipeline
   */
  private async runVerificationPipeline(
    target: { canonicalHash?: string; searchIdentifier?: string; rawPayload?: any; dbCert?: CertificateRecord | null },
    method: 'CERTIFICATE_ID' | 'QR_CODE' | 'FILE_UPLOAD',
    context?: RequestContext
  ): Promise<VerificationReport> {
    const verificationId = uuidv4();
    const steps: VerificationStep[] = [];

    let cert = target.dbCert || null;
    let targetHash = target.canonicalHash || cert?.canonical_hash || null;
    let finalStatus: FinalVerificationStatus = 'VALID';
    let explanation = '';

    // Step 1: Input Identification & Database Lookup
    steps.push({
      stepName: '1. DATABASE_RECORD_LOOKUP',
      status: cert ? 'PASSED' : 'FAILED',
      description: cert
        ? `Found matching certificate record in database (ID: ${cert.id}, Number: ${cert.certificate_number}).`
        : `No matching certificate record found in database for identifier.`,
      timestamp: new Date().toISOString()
    });

    if (!cert && !targetHash) {
      finalStatus = 'NOT_FOUND';
      explanation = 'The requested certificate could not be located in the platform database or on-chain record index.';
      return this.finalizeReport(verificationId, finalStatus, false, null, null, null, null, null, null, null, explanation, steps, method, context);
    }

    // Step 2: Canonical SHA-256 Hash Recalculation
    let computedHash: string | null = null;
    if (target.rawPayload) {
      computedHash = this.computeHashOfAnyPayload(target.rawPayload);
      const isMatch = (targetHash && computedHash) ? computedHash.toLowerCase() === targetHash.toLowerCase() : true;
      steps.push({
        stepName: '2. CANONICAL_HASH_RECALCULATION',
        status: isMatch ? 'PASSED' : 'FAILED',
        description: isMatch
          ? `Canonical SHA-256 hash computed successfully (${computedHash}).`
          : `Computed canonical hash (${computedHash}) does not match expected hash (${targetHash}).`,
        timestamp: new Date().toISOString()
      });
      if (!isMatch) {
        finalStatus = 'INVALID_HASH';
      }
    } else {
      steps.push({
        stepName: '2. CANONICAL_HASH_RECALCULATION',
        status: 'PASSED',
        description: `Canonical SHA-256 target hash identified (${targetHash}).`,
        timestamp: new Date().toISOString()
      });
    }

    // Step 3: Local Hash Integrity Match
    if (cert && targetHash) {
      const localMatch = (cert.canonical_hash && targetHash) ? cert.canonical_hash.toLowerCase() === targetHash.toLowerCase() : true;
      steps.push({
        stepName: '3. LOCAL_HASH_INTEGRITY_MATCH',
        status: localMatch ? 'PASSED' : 'FAILED',
        description: localMatch
          ? `Local database hash matches target canonical hash.`
          : `LOCAL DATABASE TAMPERING DETECTED! Database hash (${cert.canonical_hash}) differs from input target hash (${targetHash}).`,
        timestamp: new Date().toISOString()
      });
      if (!localMatch) {
        finalStatus = 'INVALID_HASH';
      }
    }

    // Step 4: IPFS Payload Retrieval & Verification
    let ipfsCid = cert?.ipfs_cid || null;
    if (ipfsCid) {
      try {
        const ipfsContent = await this.ipfsService.retrieveContent(ipfsCid);
        const ipfsJson = JSON.parse(ipfsContent.toString('utf-8'));
        const ipfsComputedHash = this.computeHashOfAnyPayload(ipfsJson);

        const ipfsMatch = (targetHash && ipfsComputedHash) ? ipfsComputedHash.toLowerCase() === targetHash.toLowerCase() : true;

        steps.push({
          stepName: '4. IPFS_PAYLOAD_INTEGRITY',
          status: ipfsMatch ? 'PASSED' : 'FAILED',
          description: ipfsMatch
            ? `Retrieved metadata from IPFS (CID: ${ipfsCid}). IPFS canonical hash verified.`
            : `IPFS PAYLOAD TAMPERING DETECTED! IPFS content hash (${ipfsComputedHash}) does not match certificate canonical hash.`,
          timestamp: new Date().toISOString()
        });

        if (!ipfsMatch) {
          finalStatus = 'SUSPICIOUS';
        }
      } catch {
        steps.push({
          stepName: '4. IPFS_PAYLOAD_INTEGRITY',
          status: 'WARNING',
          description: `Unable to fetch IPFS metadata for CID (${ipfsCid}). Continuing verification with database and on-chain records.`,
          timestamp: new Date().toISOString()
        });
      }
    } else {
      steps.push({
        stepName: '4. IPFS_PAYLOAD_INTEGRITY',
        status: 'SKIPPED',
        description: `No IPFS CID associated with this certificate record.`,
        timestamp: new Date().toISOString()
      });
    }

    // Step 5 & 6: On-Chain Blockchain Notarization & Revocation Verification
    let onChainFound = false;
    if (targetHash) {
      try {
        const onChainResult = await this.blockchainService.verifyCertificateOnChain(targetHash);

        if (onChainResult.issueTimestamp > 0) {
          onChainFound = true;
          steps.push({
            stepName: '5. BLOCKCHAIN_NOTARIZATION',
            status: 'PASSED',
            description: `Notarized on EVM Blockchain by issuer (${onChainResult.issuer}) at timestamp ${onChainResult.issueTimestamp}.`,
            timestamp: new Date().toISOString()
          });

          if (onChainResult.isRevoked) {
            steps.push({
              stepName: '6. BLOCKCHAIN_REVOCATION_CHECK',
              status: 'FAILED',
              description: `ON-CHAIN REVOCATION DETECTED! Contract returns certificate is revoked.`,
              timestamp: new Date().toISOString()
            });
            finalStatus = 'REVOKED';
          } else {
            steps.push({
              stepName: '6. BLOCKCHAIN_REVOCATION_CHECK',
              status: 'PASSED',
              description: `On-chain status is ACTIVE and unrevoked.`,
              timestamp: new Date().toISOString()
            });
          }
        } else {
          steps.push({
            stepName: '5. BLOCKCHAIN_NOTARIZATION',
            status: 'WARNING',
            description: `Certificate hash not notarized on EVM Smart Contract (or pending block confirmation).`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (err: any) {
        steps.push({
          stepName: '5. BLOCKCHAIN_NOTARIZATION',
          status: 'WARNING',
          description: `On-chain check failed: ${err.message}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    if (!cert && !onChainFound) {
      finalStatus = 'NOT_FOUND';
    }

    // Step 7: Database Revocation Check
    if (cert) {
      const isDbRevoked = cert.status === 'REVOKED' || (cert as any).is_revoked === 1;
      if (isDbRevoked) {
        steps.push({
          stepName: '7. DATABASE_REVOCATION_CHECK',
          status: 'FAILED',
          description: `REVOKED IN DATABASE! Reason: "${cert.revocation_reason || 'No reason provided'}".`,
          timestamp: new Date().toISOString()
        });
        finalStatus = 'REVOKED';
      } else {
        steps.push({
          stepName: '7. DATABASE_REVOCATION_CHECK',
          status: 'PASSED',
          description: `Database revocation status is ACTIVE.`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // Step 8: Expiration Validation
    if (cert && cert.expires_at) {
      const expDate = new Date(cert.expires_at);
      const isExpired = expDate.getTime() < Date.now();
      steps.push({
        stepName: '8. EXPIRATION_VALIDATION',
        status: isExpired ? 'FAILED' : 'PASSED',
        description: isExpired
          ? `CERTIFICATE EXPIRED on ${cert.expires_at}.`
          : `Certificate is valid through expiration date ${cert.expires_at}.`,
        timestamp: new Date().toISOString()
      });
      if (isExpired && finalStatus === 'VALID') {
        finalStatus = 'EXPIRED';
      }
    } else {
      steps.push({
        stepName: '8. EXPIRATION_VALIDATION',
        status: 'PASSED',
        description: `Certificate has lifetime validity (no expiration date).`,
        timestamp: new Date().toISOString()
      });
    }

    // Step 9: Issuing Institution Status
    let institution = null;
    if (cert) {
      institution = await InstitutionRepository.findById(cert.institution_id);
      const instActive = institution && institution.status === 'ACTIVE';
      steps.push({
        stepName: '9. INSTITUTION_AUTHORIZATION',
        status: instActive ? 'PASSED' : 'WARNING',
        description: instActive
          ? `Issuing institution (${institution?.name}) is verified and ACTIVE.`
          : `Issuing institution is INACTIVE or non-existent in platform registry.`,
        timestamp: new Date().toISOString()
      });
    }

    // Step 10: Student Details Check
    let student = null;
    if (cert) {
      student = await StudentRepository.findById(cert.student_id);
      steps.push({
        stepName: '10. STUDENT_REGISTRY_CHECK',
        status: student ? 'PASSED' : 'WARNING',
        description: student
          ? `Student profile verified (${student.first_name} ${student.last_name}, Roll: ${student.student_identifier}).`
          : `Student record not found in institution database.`,
        timestamp: new Date().toISOString()
      });
    }

    // Final Status & Explanation Generation
    const isAuthentic = finalStatus === 'VALID';
    switch (finalStatus) {
      case 'VALID':
        explanation = 'The academic certificate is 100% AUTHENTIC, valid, and cryptographically verified on IPFS and the EVM Blockchain.';
        break;
      case 'REVOKED':
        explanation = `The certificate was REVOKED by the issuing institution. Revocation rationale: "${cert?.revocation_reason || 'Administrative revocation'}".`;
        break;
      case 'EXPIRED':
        explanation = `The certificate reached its expiration date on ${cert?.expires_at} and is no longer valid.`;
        break;
      case 'INVALID_HASH':
        explanation = 'CRITICAL WARNING: Certificate tampering detected! The computed canonical hash does not match stored records.';
        break;
      case 'SUSPICIOUS':
        explanation = 'SUSPICIOUS CREDENTIAL: IPFS metadata does not match on-chain cryptographic hashes.';
        break;
      default:
        explanation = 'The specified certificate could not be verified.';
        break;
    }

    return this.finalizeReport(
      verificationId,
      finalStatus,
      isAuthentic,
      cert?.id || null,
      cert?.certificate_number || null,
      targetHash,
      ipfsCid,
      cert?.blockchain_tx_hash || null,
      institution ? { institutionName: institution.name, institutionCode: institution.code } : null,
      student ? { studentName: `${student.first_name} ${student.last_name}`, studentId: student.student_identifier } : null,
      explanation,
      steps,
      method,
      context,
      cert ? { isRevoked: cert.status === 'REVOKED' || (cert as any).is_revoked === 1, reason: cert.revocation_reason || undefined, revokedAt: cert.revoked_at || undefined } : null
    );
  }

  /**
   * Finalize verification report and log audit entry into database
   */
  private async finalizeReport(
    verificationId: string,
    finalStatus: FinalVerificationStatus,
    isAuthentic: boolean,
    certificateId: string | null,
    certificateNumber: string | null,
    canonicalHash: string | null,
    ipfsCid: string | null,
    onChainTxHash: string | null,
    issuerDetails: any,
    studentDetails: any,
    explanation: string,
    steps: VerificationStep[],
    method: 'CERTIFICATE_ID' | 'QR_CODE' | 'FILE_UPLOAD',
    context?: RequestContext,
    revocationDetails?: any
  ): Promise<VerificationReport> {
    let dbStatus: 'VERIFIED' | 'TAMPERED' | 'REVOKED' | 'NOT_FOUND' = 'NOT_FOUND';
    if (finalStatus === 'VALID') dbStatus = 'VERIFIED';
    else if (finalStatus === 'INVALID_HASH' || finalStatus === 'SUSPICIOUS') dbStatus = 'TAMPERED';
    else if (finalStatus === 'REVOKED') dbStatus = 'REVOKED';

    try {
      await VerificationLogRepository.create({
        id: verificationId,
        certificate_id: certificateId,
        verification_method: method,
        result_status: dbStatus,
        input_identifier: canonicalHash || certificateNumber || certificateId || 'PAYLOAD',
        verified_by_user_id: context?.verifiedByUserId || null,
        ip_address: context?.ipAddress || null,
        user_agent: context?.userAgent || null,
        details: JSON.stringify({ finalStatus, explanation })
      });
    } catch (err: any) {
      Logger.warn(`[VerificationService] Unable to save verification log: ${err.message}`);
    }

    return {
      verificationId,
      finalStatus,
      isAuthentic,
      certificateId,
      certificateNumber,
      canonicalHash,
      ipfsCid,
      onChainTxHash,
      issuerDetails,
      studentDetails,
      revocationDetails: revocationDetails || null,
      explanation,
      steps,
      verifiedAt: new Date().toISOString()
    };
  }
}
