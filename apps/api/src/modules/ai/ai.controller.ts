import { Request, Response, NextFunction } from 'express';
import { aiService } from '../../services/ai.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetCourseRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await aiService.getCourseRecommendations(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
