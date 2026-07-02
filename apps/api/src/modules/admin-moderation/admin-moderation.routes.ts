import { Router } from 'express';
import {
  handleUpdateUserStatus,
  handleUpdateTeacherPerformance,
  handleCreateComplaint,
  handleGetComplaints,
  handleResolveComplaint,
  handleGetAuditLogs
} from './admin-moderation.controller';
import {
  updateUserStatusSchema,
  updateTeacherPerformanceSchema,
  createComplaintSchema,
  resolveComplaintSchema
} from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// User Suspend/Reactivate status Management (Admin)
router.patch(
  '/admin/users/:userId/status',
  authenticate,
  requireRole(['admin']),
  validate(updateUserStatusSchema),
  handleUpdateUserStatus
);

// Teacher performance status level Management (Admin)
router.patch(
  '/admin/teachers/:teacherId/performance',
  authenticate,
  requireRole(['admin']),
  validate(updateTeacherPerformanceSchema),
  handleUpdateTeacherPerformance
);

// File complaints against instructor (Students)
router.post(
  '/teacher/complaints',
  authenticate,
  requireRole(['student']),
  validate(createComplaintSchema),
  handleCreateComplaint
);

// Get complaints list (Admin)
router.get(
  '/teacher/complaints',
  authenticate,
  requireRole(['admin']),
  handleGetComplaints
);

// Resolve complaints record (Admin)
router.patch(
  '/admin/complaints/:complaintId',
  authenticate,
  requireRole(['admin']),
  validate(resolveComplaintSchema),
  handleResolveComplaint
);

// View system administrative audit log history (Admin)
router.get(
  '/admin/audit-logs',
  authenticate,
  requireRole(['admin']),
  handleGetAuditLogs
);

export default router;
