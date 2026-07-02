import { Router } from 'express';
import { handleGetCourseRecommendations } from './ai.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// Retrieve recommended courses using the AI logic
router.get('/courses/recommendations', authenticate, handleGetCourseRecommendations);

export default router;
