import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetUserNotifications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await notificationsService.getUserNotifications(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
