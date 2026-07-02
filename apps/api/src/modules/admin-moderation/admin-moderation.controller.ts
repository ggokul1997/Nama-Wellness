import { Request, Response, NextFunction } from 'express';
import { adminModerationService } from './admin-moderation.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleUpdateUserStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorId = req.user!.userId;
    const userId = req.params.userId as string;
    const { status } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const user = await adminModerationService.updateUserStatus(
      actorId,
      userId,
      status,
      ipAddress,
      userAgent
    );

    const response: ApiResponseEnvelope<any> = {
      data: {
        id: user.id,
        email: user.email,
        status: user.status
      }
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateTeacherPerformance(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorId = req.user!.userId;
    const teacherId = req.params.teacherId as string;
    const { performanceStatus } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const profile = await adminModerationService.updateTeacherPerformance(
      actorId,
      teacherId,
      performanceStatus,
      ipAddress,
      userAgent
    );

    const response: ApiResponseEnvelope<any> = {
      data: {
        id: profile.id,
        userId: profile.userId,
        performanceStatus: profile.performanceStatus
      }
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateComplaint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.userId;
    const { teacherId, title, description } = req.body;

    const complaint = await adminModerationService.fileComplaint(
      studentId,
      teacherId,
      title,
      description
    );

    const response: ApiResponseEnvelope<typeof complaint> = {
      data: complaint
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetComplaints(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = req.query.teacherId as string;
    const status = req.query.status as string;

    const complaints = await adminModerationService.listComplaints({ teacherId, status });
    const response: ApiResponseEnvelope<typeof complaints> = {
      data: complaints
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleResolveComplaint(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorId = req.user!.userId;
    const complaintId = req.params.complaintId as string;
    const { status, resolution } = req.body;
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];

    const complaint = await adminModerationService.resolveComplaint(
      actorId,
      complaintId,
      status,
      resolution,
      ipAddress,
      userAgent
    );

    const response: ApiResponseEnvelope<typeof complaint> = {
      data: complaint
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAuditLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await adminModerationService.listAuditLogs(limit);
    const response: ApiResponseEnvelope<typeof logs> = {
      data: logs
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleTerminateTeacher(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const actorId = req.user!.userId;
    const teacherId = req.params.teacherId as string;
    const { resolutionNotes } = req.body;

    const result = await adminModerationService.terminateTeacher(
      actorId,
      teacherId,
      resolutionNotes
    );

    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
