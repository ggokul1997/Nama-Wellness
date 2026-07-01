import { Request, Response, NextFunction } from 'express';
import { schedulingService } from './scheduling.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetBatches(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const courseId = req.params.courseId as string;
    const result = await schedulingService.getBatches(courseId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateBatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await schedulingService.createBatch(userId, roles, courseId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateBatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const batchId = req.params.batchId as string;
    const result = await schedulingService.updateBatch(userId, roles, batchId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetSessions(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const batchId = req.params.batchId as string;
    const result = await schedulingService.getSessions(userId, roles, batchId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const batchId = req.params.batchId as string;
    const result = await schedulingService.createSession(userId, roles, batchId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const sessionId = req.params.sessionId as string;
    const result = await schedulingService.updateSession(userId, roles, sessionId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetSessionsCalendar(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const activeRole = req.header('x-active-role') || roles[0];
    const result = await schedulingService.getSessionsCalendar(userId, roles, activeRole, {
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string
    });
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
