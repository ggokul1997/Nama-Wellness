import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from './enrollment.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleAdminAssignEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.courseId as string;
    const result = await enrollmentService.adminAssignEnrollment(courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCorporateEnroll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const courseId = req.params.courseId as string;
    const result = await enrollmentService.corporateEnroll(userId, courseId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyEnrollments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const { status, page, limit } = req.query;
    const result = await enrollmentService.getMyEnrollments(userId, {
      status: status as any,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetEnrollmentById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const enrollmentId = req.params.enrollmentId as string;
    const result = await enrollmentService.getEnrollmentById(userId, roles, enrollmentId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCourseEnrollments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const { page, limit } = req.query;
    const result = await enrollmentService.getCourseEnrollments(userId, roles, courseId, {
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateLessonProgress(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const courseId = req.params.courseId as string;
    const lessonId = req.params.lessonId as string;
    const result = await enrollmentService.updateLessonProgress(userId, courseId, lessonId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: {
        lessonId,
        progressPercent: Number(result.progressPercent),
        completedAt: result.completedAt
      }
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
