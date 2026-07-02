import { Router } from 'express';
import {
  handleGetCompanyReports,
  handleGenerateReport,
  handleGetReportById
} from './ai-reports.controller';
import { generateReportSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Retrieve reports lists for target corporate profile
router.get(
  '/companies/:companyId/ai-reports',
  authenticate,
  requireRole(['company_admin', 'admin']),
  handleGetCompanyReports
);

// Trigger background generation for corporate wellness report
router.post(
  '/companies/:companyId/ai-reports/generate',
  authenticate,
  requireRole(['company_admin', 'admin']),
  validate(generateReportSchema),
  handleGenerateReport
);

// Retrieve details for target report ID
router.get(
  '/ai-reports/:reportId',
  authenticate,
  requireRole(['company_admin', 'admin']),
  handleGetReportById
);

export default router;
