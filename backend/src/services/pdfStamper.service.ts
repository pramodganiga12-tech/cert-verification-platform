import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface StampPdfInput {
  pdfBuffer?: Buffer;
  certificateNumber: string;
  canonicalHash: string;
  studentName: string;
  programName: string;
  degree: string;
  institutionName: string;
  issueDate: string;
  verificationUrl?: string;
}

export class PdfStamperService {
  /**
   * Stamp QR Code and Cryptographic Hash onto a PDF document using pdf-lib (Page 9 & 12 of PDF Presentation)
   */
  static async stampQrCodeOntoPdf(input: StampPdfInput): Promise<Buffer> {
    let pdfDoc: PDFDocument;

    if (input.pdfBuffer && input.pdfBuffer.length > 0) {
      pdfDoc = await PDFDocument.load(input.pdfBuffer);
    } else {
      // Create a fresh clean PDF document if no initial buffer was supplied
      pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

      page.drawRectangle({
        x: 20,
        y: 20,
        width: 560,
        height: 760,
        borderColor: rgb(0.85, 0.65, 0.13),
        borderWidth: 4,
      });

      page.drawText(input.institutionName.toUpperCase(), {
        x: 40,
        y: 720,
        size: 18,
        font,
        color: rgb(0.1, 0.2, 0.4),
      });

      page.drawText('OFFICIAL ACADEMIC CREDENTIAL CERTIFICATE', {
        x: 40,
        y: 690,
        size: 14,
        font,
        color: rgb(0.7, 0.5, 0.1),
      });

      page.drawText('This is to certify that', { x: 40, y: 640, size: 12, font: regularFont });
      page.drawText(input.studentName, { x: 40, y: 610, size: 20, font, color: rgb(0.05, 0.1, 0.3) });

      page.drawText(`has successfully completed the degree of ${input.degree}`, { x: 40, y: 570, size: 12, font: regularFont });
      page.drawText(`Program: ${input.programName}`, { x: 40, y: 540, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
      page.drawText(`Issue Date: ${input.issueDate}`, { x: 40, y: 510, size: 11, font: regularFont });
    }

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const verifyUrl = input.verificationUrl || `http://localhost:3000/verify?hash=${input.canonicalHash}`;

    // Generate QR Code PNG Buffer
    const qrPngBuffer = await QRCode.toBuffer(verifyUrl, {
      type: 'png',
      width: 120,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    const qrImage = await pdfDoc.embedPng(qrPngBuffer);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const monoFont = await pdfDoc.embedFont(StandardFonts.CourierBold);

    // Position QR Stamp at bottom-right corner
    const qrSize = 90;
    const qrX = width - qrSize - 30;
    const qrY = 30;

    // Draw background container for QR Stamp
    firstPage.drawRectangle({
      x: qrX - 10,
      y: qrY - 10,
      width: qrSize + 20,
      height: qrSize + 30,
      color: rgb(0.96, 0.98, 1.0),
      borderColor: rgb(0.22, 0.74, 0.97),
      borderWidth: 1.5,
    });

    firstPage.drawImage(qrImage, {
      x: qrX,
      y: qrY + 12,
      width: qrSize,
      height: qrSize,
    });

    firstPage.drawText('SCAN TO VERIFY', {
      x: qrX + 6,
      y: qrY,
      size: 7,
      font: monoFont,
      color: rgb(0.02, 0.52, 0.96),
    });

    // Draw Cryptographic Hash Stamp banner at bottom-left
    firstPage.drawRectangle({
      x: 20,
      y: 20,
      width: width - qrSize - 70,
      height: 45,
      color: rgb(0.96, 0.97, 0.99),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
    });

    firstPage.drawText(`VERIFIED BLOCKCHAIN ANCHOR [EVM & IPFS]`, {
      x: 30,
      y: 52,
      size: 7,
      font: monoFont,
      color: rgb(0.05, 0.6, 0.4),
    });

    firstPage.drawText(`CERT NO: ${input.certificateNumber}`, {
      x: 30,
      y: 40,
      size: 7,
      font: monoFont,
      color: rgb(0.2, 0.2, 0.3),
    });

    const displayHash = input.canonicalHash.length > 38
      ? `${input.canonicalHash.slice(0, 38)}...`
      : input.canonicalHash;

    firstPage.drawText(`SHA256: ${displayHash}`, {
      x: 30,
      y: 28,
      size: 6.5,
      font: monoFont,
      color: rgb(0.1, 0.3, 0.7),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
