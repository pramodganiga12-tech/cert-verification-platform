import admZip from 'adm-zip';
import { PdfParserService, PdfAnalysisResult } from './pdfParser.service.js';
import { PdfStamperService } from './pdfStamper.service.js';
import { CertificateService } from './certificate.service.js';
import { InstitutionRepository } from '../repositories/InstitutionRepository.js';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';

export interface BatchIssuanceItemResult {
  fileName: string;
  success: boolean;
  certificateNumber?: string;
  canonicalHash?: string;
  ipfsCid?: string;
  errorReason?: string;
  studentName?: string;
  programName?: string;
}

export interface BatchIssuanceResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  results: BatchIssuanceItemResult[];
}

export interface PdfFileItem {
  fileName: string;
  buffer: Buffer;
}

export class BatchIssuanceService {
  /**
   * Core 9-Step Mass Certificate Issuance Pipeline (Phase 1 of Presentation Slides)
   * 1. Admin/Issuer drop PDF batch
   * 2. Parse Text Buffer (pdf-parse)
   * 3. Check Document Validity (Reject Invalid "Unsupported Standard" -> Stop Upload)
   * 4. Process Academic Document (Approved standard document)
   * 5. System Engine: Compute SHA-256 Hash
   * 6. System Engine: Store PDF on IPFS (Receive IPFS CID)
   * 7. System Engine: Stamp QR Code (pdf-lib)
   * 8. Anchor on Ganache Blockchain (DocID, SHA256, CID)
   * 9. Bulk Processing Complete
   */
  static async processPdfItemsBatch(
    items: PdfFileItem[],
    institutionId: string,
    defaultProgram = 'Academic Degree Program',
    defaultDegree = 'BACHELOR_OF_SCIENCE',
    actorUserId?: string
  ): Promise<BatchIssuanceResponse> {
    if (!items || items.length === 0) {
      throw new BadRequestError('No PDF certificate files provided for mass batch issuance');
    }

    const inst = await InstitutionRepository.findById(institutionId);
    if (!inst) {
      throw new NotFoundError(`Institution with ID '${institutionId}' not found`);
    }

    const results: BatchIssuanceItemResult[] = [];

    for (const item of items) {
      const fileName = item.fileName;
      const pdfBuffer = item.buffer;

      try {
        // Step 2 & 3: Parse Text Buffer (pdf-parse) & Check Document Validity
        const analysis: PdfAnalysisResult = await PdfParserService.analyzePdfBuffer(pdfBuffer);

        if (!analysis.isValid) {
          // Reject Invalid ("Unsupported Standard") -> Stop Upload for this file
          results.push({
            fileName,
            success: false,
            errorReason: analysis.rejectionReason || 'Unsupported Standard Document',
          });
          continue;
        }

        // Step 4: Process Approved Academic Document
        const rawName = fileName.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        const studentName = analysis.detectedStudentName || rawName;
        const programName = analysis.detectedProgram || defaultProgram;

        // Step 5, 6 & 8: Compute SHA-256 Hash, Store PDF on IPFS (Receive CID), Anchor on Blockchain (DocID, SHA256, CID)
        const createdCert = await CertificateService.createCertificate(
          {
            institutionId,
            studentName,
            programName,
            degree: defaultDegree,
            grade: 'Passed',
          },
          actorUserId
        );

        // Step 7: Stamp QR Code & Fingerprint on PDF (pdf-lib)
        await PdfStamperService.stampQrCodeOntoPdf({
          pdfBuffer,
          certificateNumber: createdCert.certificate_number,
          canonicalHash: createdCert.canonical_hash,
          studentName,
          programName,
          degree: defaultDegree,
          institutionName: inst.name,
          issueDate: createdCert.issue_date,
        });

        results.push({
          fileName,
          success: true,
          certificateNumber: createdCert.certificate_number,
          canonicalHash: createdCert.canonical_hash,
          ipfsCid: createdCert.ipfs_cid || undefined,
          studentName,
          programName,
        });
      } catch (err: any) {
        results.push({
          fileName,
          success: false,
          errorReason: err.message || 'Batch item processing failed',
        });
      }
    }

    // Step 9: Bulk Processing Complete
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;

    return {
      totalProcessed: results.length,
      successCount,
      failureCount,
      results,
    };
  }

  /**
   * Process mass issuance from a ZIP package (.zip containing multiple PDFs)
   */
  static async processZipBatch(
    zipBuffer: Buffer,
    institutionId: string,
    defaultProgram = 'Academic Degree Program',
    defaultDegree = 'BACHELOR_OF_SCIENCE',
    actorUserId?: string
  ): Promise<BatchIssuanceResponse> {
    if (!zipBuffer || zipBuffer.length === 0) {
      throw new BadRequestError('ZIP file package is empty or invalid');
    }

    let zip: admZip;
    try {
      zip = new admZip(zipBuffer);
    } catch {
      throw new BadRequestError('Failed to extract ZIP package. Ensure a valid .zip file is uploaded.');
    }

    const zipEntries = zip.getEntries();
    const pdfEntries = zipEntries.filter(
      (e) => !e.isDirectory && e.entryName.toLowerCase().endsWith('.pdf') && !e.entryName.startsWith('__MACOSX')
    );

    if (pdfEntries.length === 0) {
      throw new BadRequestError('No valid .pdf certificate files found inside the ZIP package');
    }

    const items: PdfFileItem[] = pdfEntries.map((pdfEntry) => ({
      fileName: pdfEntry.entryName.split('/').pop() || pdfEntry.entryName,
      buffer: pdfEntry.getData(),
    }));

    return this.processPdfItemsBatch(items, institutionId, defaultProgram, defaultDegree, actorUserId);
  }
}
