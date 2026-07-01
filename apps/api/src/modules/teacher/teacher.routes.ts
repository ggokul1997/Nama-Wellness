import { Router } from 'express';
import { handleCreateApplication, handleGetMyApplication, handleAddDocument, handleListApplications, handleGetApplicationById, handleVerifyDocument, handleScheduleInterview, handleUpdateInterview, handleApproveApplication, handleRejectApplication, handleGetApplicationLogs } from './teacher.controller';
import { createApplicationSchema, uploadDocumentSchema, verifyDocumentSchema, scheduleInterviewSchema, updateInterviewSchema, approveApplicationSchema, rejectApplicationSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Teacher routes
router.post('/applications', authenticate, requireRole(['teacher']), validate(createApplicationSchema), handleCreateApplication);
router.get('/applications/me', authenticate, requireRole(['teacher']), handleGetMyApplication);
router.post('/applications/:applicationId/documents', authenticate, requireRole(['teacher']), validate(uploadDocumentSchema), handleAddDocument);

// Admin routes
router.get('/applications', authenticate, requireRole(['admin']), handleListApplications);
router.get('/applications/:applicationId', authenticate, requireRole(['admin']), handleGetApplicationById);
router.post('/applications/:applicationId/documents/:documentId/verify', authenticate, requireRole(['admin']), validate(verifyDocumentSchema), handleVerifyDocument);
router.post('/applications/:applicationId/interviews', authenticate, requireRole(['admin']), validate(scheduleInterviewSchema), handleScheduleInterview);
router.patch('/applications/:applicationId/interviews/:interviewId', authenticate, requireRole(['admin']), validate(updateInterviewSchema), handleUpdateInterview);
router.post('/applications/:applicationId/approve', authenticate, requireRole(['admin']), validate(approveApplicationSchema), handleApproveApplication);
router.post('/applications/:applicationId/reject', authenticate, requireRole(['admin']), validate(rejectApplicationSchema), handleRejectApplication);
router.get('/applications/:applicationId/logs', authenticate, requireRole(['admin']), handleGetApplicationLogs);

export default router;
