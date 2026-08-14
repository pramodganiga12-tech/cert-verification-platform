import { Router } from 'express';
import multer from 'multer';
import { BatchController } from '../controllers/batch.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.middleware.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(requireAuth);

// Phase 1 Mass Batch Issuance Route (Pages 9 & 11 of Presentation Slides)
router.post(
  '/mass-issuance',
  requireRole('SUPER_ADMIN', 'ADMIN', 'INSTITUTION_ADMIN', 'ISSUER', 'INSTITUTION'),
  upload.any(),
  BatchController.processBatch
);

export default router;
