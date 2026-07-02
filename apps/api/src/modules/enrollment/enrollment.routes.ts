import { Router } from 'express';
import { handleGetMyEnrollments, handleGetEnrollmentById } from './enrollment.controller';
import { handleCompleteEnrollment } from '../certificates/certificates.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticate, handleGetMyEnrollments);
router.get('/:enrollmentId', authenticate, handleGetEnrollmentById);
router.post('/:enrollmentId/complete', authenticate, handleCompleteEnrollment);

export default router;
