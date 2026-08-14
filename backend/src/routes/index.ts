import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import institutionRoutes from './institution.routes.js';
import studentRoutes from './student.routes.js';
import certificateRoutes from './certificate.routes.js';
import { verificationRoutes } from './verification.routes.js';
import auditRoutes from './audit.routes.js';
import batchRoutes from './batch.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/students', studentRoutes);
router.use('/certificates', certificateRoutes);
router.use('/verify', verificationRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/batch', batchRoutes);

export default router;
