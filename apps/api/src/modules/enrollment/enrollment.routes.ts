import { Router } from 'express';
import { handleGetMyEnrollments, handleGetEnrollmentById } from './enrollment.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/me', authenticate, handleGetMyEnrollments);
router.get('/:enrollmentId', authenticate, handleGetEnrollmentById);

export default router;
