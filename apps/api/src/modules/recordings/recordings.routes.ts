import { Router } from 'express';
import {
  handleGetCourseRecordings,
  handleGetRecordingPlayback,
  handleProposeReplacement,
  handleApproveReplacement,
  handleRejectReplacement,
  handleOverrideAccess
} from './recordings.controller';
import {
  proposeReplacementRecordingSchema,
  rejectReplacementSchema,
  adminOverrideAccessSchema
} from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { auditLogMiddleware } from '../../middleware/audit-log.middleware';

const router = Router();

// Get course recordings
router.get('/courses/:courseId/recordings', authenticate, handleGetCourseRecordings);

// Get specific recording playback details (increments view count)
router.get('/recordings/:recordingId', authenticate, handleGetRecordingPlayback);

// Propose replacement recording (Teacher only)
router.post(
  '/sessions/:sessionId/replacement-recordings',
  authenticate,
  requireRole(['teacher']),
  validate(proposeReplacementRecordingSchema),
  handleProposeReplacement
);

// Approve replacement recording (Admin only)
router.post(
  '/replacement-recordings/:id/approve',
  authenticate,
  requireRole(['admin']),
  handleApproveReplacement
);

// Reject replacement recording (Admin only)
router.post(
  '/replacement-recordings/:id/reject',
  authenticate,
  requireRole(['admin']),
  validate(rejectReplacementSchema),
  handleRejectReplacement
);

// Admin access override replay limit
router.post(
  '/recordings/:recordingId/access-override',
  authenticate,
  requireRole(['admin']),
  validate(adminOverrideAccessSchema),
  auditLogMiddleware('recording.override', 'recording', (req) => req.params.recordingId),
  handleOverrideAccess
);

export default router;
