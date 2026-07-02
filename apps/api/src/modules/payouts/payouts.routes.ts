import { Router } from 'express';
import {
  handleGetTeacherPayouts,
  handleGetPayouts,
  handleGetPayoutDetails,
  handleHoldPayout,
  handleApprovePayout,
  handleMarkPayoutPaid,
  handleSetCommissionConfig
} from './payouts.controller';
import { commissionConfigSchema, holdPayoutSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { auditLogMiddleware } from '../../middleware/audit-log.middleware';

const router = Router();

// Post new commission configurations (Admin only)
router.post(
  '/commission',
  authenticate,
  requireRole(['admin']),
  validate(commissionConfigSchema),
  auditLogMiddleware('commission.config', 'commission', () => 'global'),
  handleSetCommissionConfig
);

// Get teacher payout history (Teacher only)
router.get(
  '/payouts/me',
  authenticate,
  requireRole(['teacher']),
  handleGetTeacherPayouts
);

// List all payouts (Admin only)
router.get(
  '/payouts',
  authenticate,
  requireRole(['admin']),
  handleGetPayouts
);

// Get payout details
router.get(
  '/payouts/:payoutId',
  authenticate,
  handleGetPayoutDetails
);

// Put payout on hold (Admin only)
router.post(
  '/payouts/:payoutId/hold',
  authenticate,
  requireRole(['admin']),
  validate(holdPayoutSchema),
  auditLogMiddleware('payout.hold', 'payout', (req) => req.params.payoutId),
  handleHoldPayout
);

// Approve payout (Admin only)
router.post(
  '/payouts/:payoutId/approve',
  authenticate,
  requireRole(['admin']),
  auditLogMiddleware('payout.approve', 'payout', (req) => req.params.payoutId),
  handleApprovePayout
);

// Mark payout as paid (Admin only)
router.post(
  '/payouts/:payoutId/mark-paid',
  authenticate,
  requireRole(['admin']),
  auditLogMiddleware('payout.mark-paid', 'payout', (req) => req.params.payoutId),
  handleMarkPayoutPaid
);

export default router;
