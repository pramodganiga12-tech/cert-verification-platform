import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

// Public / Recipient Certificate Download Routes (Page 12 & 13 of PDF Presentation)
router.get('/:id/download-pdf', CertificateController.downloadPdf);
router.get('/:id/pdf', CertificateController.downloadPdf);

router.use(requireAuth);

router.post('/', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION'), CertificateController.create);
router.get('/', CertificateController.list);
router.get('/student/:studentId', CertificateController.listByStudent);
router.get('/institution/:institutionId', CertificateController.listByInstitution);
router.get('/:id', CertificateController.getById);
router.post('/:id/revoke', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'REVOKER', 'INSTITUTION'), CertificateController.revoke);

export default router;
