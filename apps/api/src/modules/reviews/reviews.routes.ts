import { Router } from 'express';
import {
  handleSubmitReview,
  handleGetTeacherReviews,
  handleDeleteReview
} from './reviews.controller';
import { submitReviewSchema, deleteReviewSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { auditLogMiddleware } from '../../middleware/audit-log.middleware';

const router = Router();

// Submit a review (Student only)
router.post(
  '/teachers/:teacherId/reviews',
  authenticate,
  requireRole(['student']),
  validate(submitReviewSchema),
  handleSubmitReview
);

// Get reviews (Public)
router.get('/teachers/:teacherId/reviews', handleGetTeacherReviews);

// Moderation deletion (Admin only)
router.delete(
  '/reviews/:reviewId',
  authenticate,
  requireRole(['admin']),
  validate(deleteReviewSchema),
  auditLogMiddleware('review.delete', 'review', (req) => req.params.reviewId),
  handleDeleteReview
);

export default router;
