import { Request, Response, NextFunction } from 'express';
import { reviewsService } from './reviews.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleSubmitReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentUserId = req.user!.userId;
    const teacherId = req.params.teacherId as string;
    const result = await reviewsService.submitReview(studentUserId, teacherId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetTeacherReviews(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = req.params.teacherId as string;
    const result = await reviewsService.getTeacherReviews(teacherId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteReview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const reviewId = req.params.reviewId as string;
    const { reason } = req.body;
    await reviewsService.deleteReview(adminUserId, reviewId, reason);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
