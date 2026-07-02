import { Router } from 'express';
import { handleGetUserNotifications } from './notifications.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.get('/notifications', authenticate, handleGetUserNotifications);

export default router;
