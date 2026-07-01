import { Request, Response, NextFunction } from 'express';
import { attendanceService } from './attendance.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleJoinSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.sessionId as string;
    const result = await attendanceService.joinSession(userId, sessionId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleLeaveSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.sessionId as string;
    const result = await attendanceService.leaveSession(userId, sessionId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetSessionAttendance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const sessionId = req.params.sessionId as string;
    const result = await attendanceService.getSessionAttendance(userId, roles, sessionId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetEnrollmentAttendance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const enrollmentId = req.params.enrollmentId as string;
    const result = await attendanceService.getEnrollmentAttendance(userId, roles, enrollmentId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
