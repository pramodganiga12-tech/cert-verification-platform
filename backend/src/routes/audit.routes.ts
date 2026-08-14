import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', requireAuth, (req, res, next) => AuditController.getAuditLogs(req, res, next));
router.get('/analytics', requireAuth, (req, res, next) => AuditController.getVerificationAnalytics(req, res, next));

export default router;
