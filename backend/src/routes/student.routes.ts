import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.post('/', requireRole('ADMIN', 'INSTITUTION'), StudentController.create);
router.post('/bulk-import', requireRole('ADMIN', 'INSTITUTION'), StudentController.bulkImport);
router.get('/', requireRole('ADMIN', 'INSTITUTION'), StudentController.list);
router.get('/:id', requireRole('ADMIN', 'INSTITUTION', 'STUDENT'), StudentController.getById);
router.put('/:id', requireRole('ADMIN', 'INSTITUTION'), StudentController.update);

export default router;
