import { Router } from 'express';
import multer from 'multer';
import { VerificationController } from '../controllers/VerificationController.js';

const upload = multer({ storage: multer.memoryStorage() });

export const verificationRoutes = Router();

// Publicly accessible verification routes (Page 10 & 13 of PDF Presentation)
verificationRoutes.post('/hash', VerificationController.verifyByHash);
verificationRoutes.post('/qr', VerificationController.verifyByQR);
verificationRoutes.post('/json', VerificationController.verifyByJSON);
verificationRoutes.post('/pdf', upload.single('pdf'), VerificationController.verifyByPDF);
verificationRoutes.post('/file', upload.single('file'), VerificationController.verifyByPDF);
verificationRoutes.get('/:certificateId', VerificationController.verifyById);
