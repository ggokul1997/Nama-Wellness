import { Router } from 'express';
import {
  handleGetCompanyMe,
  handleCreateCompany,
  handleGetCompanies,
  handleUpdateCompany,
  handleGetEmployees,
  handleSendInvite,
  handleBulkInvite,
  handleRevokeInvite,
  handleDeactivateEmployee,
  handleGetCorporateParticipation,
  handleGetCorporateAttendance,
  handleGetCorporateEngagement,
  handleGetEmployeeParticipation
} from './companies.controller';
import {
  createCompanySchema,
  updateCompanySchema,
  sendInviteSchema,
  bulkInviteSchema,
  deactivateEmployeeSchema
} from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { auditLogMiddleware } from '../../middleware/audit-log.middleware';

const router = Router();

// Company Admin profile
router.get('/companies/me', authenticate, requireRole(['company_admin']), handleGetCompanyMe);

// Admin-only Company profile CRUD
router.post('/companies', authenticate, requireRole(['admin']), validate(createCompanySchema), handleCreateCompany);
router.get('/companies', authenticate, requireRole(['admin']), handleGetCompanies);
router.patch('/companies/:companyId', authenticate, requireRole(['admin']), validate(updateCompanySchema), handleUpdateCompany);

// Employees directory
router.get('/companies/:companyId/employees', authenticate, handleGetEmployees);

// Invites & deactivation
router.post(
  '/companies/:companyId/invites',
  authenticate,
  requireRole(['company_admin']),
  validate(sendInviteSchema),
  handleSendInvite
);

router.post(
  '/companies/:companyId/employees/import',
  authenticate,
  requireRole(['company_admin']),
  validate(bulkInviteSchema),
  handleBulkInvite
);

router.delete(
  '/companies/:companyId/invites/:inviteId',
  authenticate,
  handleRevokeInvite
);

router.post(
  '/companies/:companyId/employees/:employeeId/deactivate',
  authenticate,
  validate(deactivateEmployeeSchema),
  auditLogMiddleware('employee.deactivate', 'user', (req) => req.params.employeeId),
  handleDeactivateEmployee
);

// Analytics endpoints
router.get('/analytics/corporate/participation', authenticate, requireRole(['company_admin']), handleGetCorporateParticipation);
router.get('/analytics/corporate/attendance', authenticate, requireRole(['company_admin']), handleGetCorporateAttendance);
router.get('/analytics/corporate/engagement', authenticate, requireRole(['company_admin']), handleGetCorporateEngagement);
router.get('/analytics/employee/participation', authenticate, requireRole(['employee']), handleGetEmployeeParticipation);

export default router;
