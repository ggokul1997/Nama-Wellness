import { Request, Response, NextFunction } from 'express';
import { uploadsService } from './uploads.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetPresignedUpload(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await uploadsService.getPresignedUpload(userId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
