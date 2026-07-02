import { Router } from 'express';
import {
  handleGetUserCertificates,
  handleApproveCertificate,
  handleVerifyCertificate,
  handleRevokeCertificate
} from './certificates.controller';
import { revokeCertificateSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { auditLogMiddleware } from '../../middleware/audit-log.middleware';

const router = Router();

// Student certificates lists
router.get('/certificates/me', authenticate, requireRole(['student']), handleGetUserCertificates);

// Public verification
router.get('/certificates/verify/:certificateId', handleVerifyCertificate);

// Teacher approval
router.post(
  '/certificates/:certificateId/approve',
  authenticate,
  requireRole(['teacher']),
  auditLogMiddleware('certificate.approve', 'certificate', (req) => req.params.certificateId),
  handleApproveCertificate
);

// Admin revocation
router.post(
  '/certificates/:certificateId/revoke',
  authenticate,
  requireRole(['admin']),
  validate(revokeCertificateSchema),
  auditLogMiddleware('certificate.revoke', 'certificate', (req) => req.params.certificateId),
  handleRevokeCertificate
);

export default router;
