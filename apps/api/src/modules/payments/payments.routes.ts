import { Router } from 'express';
import {
  handleInitiateCoursePayment,
  handleInitiateOnboardingPayment,
  handleInitiateSubscriptionPayment,
  handleVerifyPayment,
  handleGetMyPayments,
  handleGetMyOrders,
  handleGetAdminPayments,
  handleGetAdminOrders,
  handleRequestRefund,
  handleApproveRefund,
  handleRejectRefund,
  handleAdminRefundOverride,
  handleRazorpayWebhook
} from './payments.controller';
import {
  initiateCoursePaymentSchema,
  initiateOnboardingPaymentSchema,
  initiateSubscriptionPaymentSchema,
  verifyPaymentSchema,
  requestRefundSchema,
  rejectRefundSchema,
  adminRefundOverrideSchema
} from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { auditLogMiddleware } from '../../middleware/audit-log.middleware';

const router = Router();

// Webhook endpoints (signature checked in controller)
router.post('/webhooks/razorpay', handleRazorpayWebhook);

// User history endpoints
router.get('/payments/me', authenticate, handleGetMyPayments);
router.get('/orders/me', authenticate, handleGetMyOrders);

// Admin-only history endpoints
router.get('/payments', authenticate, requireRole(['admin']), handleGetAdminPayments);
router.get('/orders', authenticate, requireRole(['admin']), handleGetAdminOrders);

// Payments checkout endpoints
router.post('/payments/course', authenticate, requireRole(['student']), validate(initiateCoursePaymentSchema), handleInitiateCoursePayment);
router.post('/payments/onboarding', authenticate, requireRole(['teacher']), validate(initiateOnboardingPaymentSchema), handleInitiateOnboardingPayment);
router.post('/payments/subscription', authenticate, requireRole(['employee']), validate(initiateSubscriptionPaymentSchema), handleInitiateSubscriptionPayment);
router.post('/payments/verify', authenticate, validate(verifyPaymentSchema), handleVerifyPayment);

// Refunds endpoints
router.post('/orders/:orderId/refund', authenticate, requireRole(['student']), validate(requestRefundSchema), handleRequestRefund);

router.post(
  '/refunds/:refundId/approve',
  authenticate,
  requireRole(['admin']),
  auditLogMiddleware('refund.approve', 'refund', (req) => req.params.refundId),
  handleApproveRefund
);

router.post(
  '/refunds/:refundId/reject',
  authenticate,
  requireRole(['admin']),
  validate(rejectRefundSchema),
  auditLogMiddleware('refund.reject', 'refund', (req) => req.params.refundId),
  handleRejectRefund
);

router.post(
  '/admin/orders/:orderId/refund-override',
  authenticate,
  requireRole(['admin']),
  validate(adminRefundOverrideSchema),
  auditLogMiddleware('refund.override', 'order', (req) => req.params.orderId),
  handleAdminRefundOverride
);

export default router;
