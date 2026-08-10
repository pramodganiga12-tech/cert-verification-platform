import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('ADMIN', 'INSTITUTION'), CertificateController.create);
router.get('/', CertificateController.list);
router.get('/student/:studentId', CertificateController.listByStudent);
router.get('/institution/:institutionId', CertificateController.listByInstitution);
router.get('/:id', CertificateController.getById);
router.post('/:id/revoke', requireRole('ADMIN', 'INSTITUTION'), CertificateController.revoke);

export default router;
