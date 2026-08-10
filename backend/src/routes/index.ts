import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import institutionRoutes from './institution.routes.js';
import studentRoutes from './student.routes.js';

const router = Router();

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/institutions', institutionRoutes);
router.use('/students', studentRoutes);

export default router;
