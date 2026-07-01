import { Router } from 'express';
import { 
  handleUpdateBatch, 
  handleGetSessions, 
  handleCreateSession, 
  handleUpdateSession,
  handleGetSessionsCalendar
} from './scheduling.controller';
import { 
  updateBatchSchema, 
  createSessionSchema, 
  updateSessionSchema,
  getSessionsQuerySchema
} from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Sessions calendar route
router.get('/sessions', authenticate, validate(getSessionsQuerySchema, 'query'), handleGetSessionsCalendar);

// Batch update route
router.patch('/batches/:batchId', authenticate, requireRole(['teacher', 'admin']), validate(updateBatchSchema), handleUpdateBatch);

// Sessions routes
router.get('/batches/:batchId/sessions', authenticate, handleGetSessions);
router.post('/batches/:batchId/sessions', authenticate, requireRole(['teacher', 'admin']), validate(createSessionSchema), handleCreateSession);
router.patch('/sessions/:sessionId', authenticate, requireRole(['teacher', 'admin']), validate(updateSessionSchema), handleUpdateSession);

export default router;
