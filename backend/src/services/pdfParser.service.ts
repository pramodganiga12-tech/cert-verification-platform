import pdfParse from 'pdf-parse';

export interface PdfAnalysisResult {
  isValid: boolean;
  extractedText: string;
  rejectionReason?: string;
  detectedStudentName?: string;
  detectedDegree?: string;
  detectedProgram?: string;
}

export class PdfParserService {
  /**
   * Parse PDF buffer, extract plain text, and validate against academic certificate standard criteria
   */
  static async analyzePdfBuffer(buffer: Buffer): Promise<PdfAnalysisResult> {
    try {
      if (!buffer || buffer.length === 0) {
        return {
          isValid: false,
          extractedText: '',
          rejectionReason: 'Empty file buffer or corrupted PDF file',
        };
      }

      let parsedData: { text?: string } = {};
      try {
        const parseFn = (pdfParse as any).default || pdfParse;
        if (typeof parseFn === 'function') {
          parsedData = await parseFn(buffer);
        } else {
          parsedData = { text: buffer.toString('utf-8') };
        }
      } catch (err: any) {
        // Fallback to text buffer extraction if binary pdf-parse encounters structure warnings
        const rawText = buffer.toString('utf-8');
        parsedData = { text: rawText };
      }

      const text = parsedData.text || '';
      const upperText = text.toUpperCase();

      // Academic certificate validation keywords (Page 9: Check Document Validity)
      const academicKeywords = [
        'CERTIFICATE',
        'DEGREE',
        'DIPLOMA',
        'UNIVERSITY',
        'INSTITUTE',
        'BACHELOR',
        'MASTER',
        'DOCTOR',
        'COLLEGE',
        'AWARDED',
        'COMPLETED',
        'ACADEMIC',
        'PASSED',
        'STATEMENT OF MARKS',
      ];

      const matches = academicKeywords.filter((kw) => upperText.includes(kw));

      if (matches.length < 1 && text.length > 30) {
        return {
          isValid: false,
          extractedText: text,
          rejectionReason: 'Unsupported Standard: Document does not match required academic certificate format keywords',
        };
      }

      // Simple heuristic extraction of student name or program
      let detectedStudentName: string | undefined;
      let detectedDegree: string | undefined;

      const lines = text.split(/\r?\n/).map((lineItem: string) => lineItem.trim()).filter(Boolean);
      for (const line of lines) {
        if (/this is to certify that/i.test(line) || /certify that/i.test(line)) {
          detectedStudentName = line.replace(/.*certify that/i, '').trim();
        }
        if (/bachelor|master|doctor|diploma/i.test(line)) {
          detectedDegree = line;
        }
      }

      return {
        isValid: true,
        extractedText: text,
        detectedStudentName,
        detectedDegree,
      };
    } catch (err: any) {
      return {
        isValid: false,
        extractedText: '',
        rejectionReason: `Unexpected validation error: ${err.message}`,
      };
    }
  }
}
