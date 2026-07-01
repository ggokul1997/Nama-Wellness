import { Router } from 'express';
import { 
  handleJoinSession, 
  handleLeaveSession, 
  handleGetSessionAttendance,
  handleGetEnrollmentAttendance
} from './attendance.controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Sessions attendance tracking
router.post('/sessions/:sessionId/attendance/join', authenticate, requireRole(['student', 'employee']), handleJoinSession);
router.post('/sessions/:sessionId/attendance/leave', authenticate, requireRole(['student', 'employee']), handleLeaveSession);
router.get('/sessions/:sessionId/attendance', authenticate, requireRole(['teacher', 'admin']), handleGetSessionAttendance);

// Enrollments attendance logs
router.get('/enrollments/:enrollmentId/attendance', authenticate, handleGetEnrollmentAttendance);

export default router;
