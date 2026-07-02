import { Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetConversations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await chatService.getConversations(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateConversation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await chatService.createConversation(userId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const conversationId = req.params.conversationId as string;
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);

    const result = await chatService.getMessages(userId, roles, conversationId, page, limit);
    const response: ApiResponseEnvelope<typeof result> & { meta: any } = {
      data: result,
      meta: { page, limit }
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleSendMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const conversationId = req.params.conversationId as string;
    const result = await chatService.sendMessage(userId, conversationId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const messageId = req.params.messageId as string;
    await chatService.deleteMessage(adminUserId, messageId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
