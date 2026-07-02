import { Router } from 'express';
import {
  handleGetConversations,
  handleCreateConversation,
  handleGetMessages,
  handleSendMessage,
  handleDeleteMessage
} from './chat.controller';
import { createConversationSchema, sendMessageSchema } from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { auditLogMiddleware } from '../../middleware/audit-log.middleware';

const router = Router();

// Conversations endpoints
router.get('/conversations', authenticate, handleGetConversations);
router.post('/conversations', authenticate, validate(createConversationSchema), handleCreateConversation);

// Messages endpoints
router.get('/conversations/:conversationId/messages', authenticate, handleGetMessages);
router.post('/conversations/:conversationId/messages', authenticate, validate(sendMessageSchema), handleSendMessage);

// Admin-only message moderation delete endpoint
router.delete(
  '/messages/:messageId',
  authenticate,
  requireRole(['admin']),
  auditLogMiddleware('chat.message.delete', 'chatMessage', (req) => req.params.messageId),
  handleDeleteMessage
);

export default router;
