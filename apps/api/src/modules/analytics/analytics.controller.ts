import { Request, Response, NextFunction } from 'express';
import { analyticsService } from './analytics.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetTeacherDashboard(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = req.user!.userId;
    const result = await analyticsService.getTeacherDashboard(teacherId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetEmployeeParticipation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await analyticsService.getEmployeeParticipation(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCompanyAdminParticipation(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const companyId = req.params.companyId as string;
    const result = await analyticsService.getCompanyAdminParticipation(companyId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCompanyAdminEngagement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const companyId = req.params.companyId as string;
    const result = await analyticsService.getCompanyAdminEngagement(companyId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAdminDashboard(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await analyticsService.getAdminDashboard();
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
