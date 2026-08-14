import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION'), StudentController.create);
router.post('/bulk-import', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION'), StudentController.bulkImport);
router.get('/', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION'), StudentController.list);
router.get('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION', 'STUDENT'), StudentController.getById);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION'), StudentController.update);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION'), StudentController.delete);

export default router;
