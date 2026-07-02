import { Router } from 'express';
import {
  handleGetTeacherDashboard,
  handleGetEmployeeParticipation,
  handleGetCompanyAdminParticipation,
  handleGetCompanyAdminEngagement,
  handleGetAdminDashboard
} from './analytics.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Teacher dashboard
router.get(
  '/teacher/dashboard',
  authenticate,
  requireRole(['teacher']),
  handleGetTeacherDashboard
);

// Employee dashboard
router.get(
  '/employee/participation',
  authenticate,
  requireRole(['student']),
  handleGetEmployeeParticipation
);

// Company participation stats
router.get(
  '/companies/:companyId/participation',
  authenticate,
  requireRole(['company_admin', 'admin']),
  handleGetCompanyAdminParticipation
);

// Company engagement trends
router.get(
  '/companies/:companyId/engagement',
  authenticate,
  requireRole(['company_admin', 'admin']),
  handleGetCompanyAdminEngagement
);

// Platform admin dashboard
router.get(
  '/admin/dashboard',
  authenticate,
  requireRole(['admin']),
  handleGetAdminDashboard
);

export default router;
