import { Router } from 'express';
import { InstitutionController } from '../controllers/institution.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('ADMIN'), InstitutionController.create);
router.get('/', InstitutionController.list);
router.get('/:id', InstitutionController.getById);
router.put('/:id', requireRole('ADMIN', 'INSTITUTION'), InstitutionController.update);
router.patch('/:id/status', requireRole('ADMIN'), InstitutionController.updateStatus);

export default router;
