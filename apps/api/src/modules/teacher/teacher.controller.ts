import { Request, Response, NextFunction } from 'express';
import { teacherService } from './teacher.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleCreateApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await teacherService.createApplication(userId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await teacherService.getMyApplication(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleAddDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const applicationId = req.params.applicationId as string;
    const result = await teacherService.addDocument(userId, applicationId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleListApplications(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status } = req.query;
    const result = await teacherService.listApplications(status as string);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetApplicationById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const applicationId = req.params.applicationId as string;
    const result = await teacherService.getApplicationById(applicationId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleVerifyDocument(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const applicationId = req.params.applicationId as string;
    const documentId = req.params.documentId as string;
    const { verified } = req.body;
    const result = await teacherService.verifyDocument(adminUserId, applicationId, documentId, verified);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleScheduleInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const applicationId = req.params.applicationId as string;
    const { scheduledAt } = req.body;
    const result = await teacherService.scheduleInterview(applicationId, scheduledAt, adminUserId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateInterview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const applicationId = req.params.applicationId as string;
    const interviewId = req.params.interviewId as string;
    const result = await teacherService.updateInterview(adminUserId, applicationId, interviewId, req.body);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleApproveApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const applicationId = req.params.applicationId as string;
    const { notes } = req.body;
    const result = await teacherService.approveApplication(adminUserId, applicationId, notes);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRejectApplication(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const applicationId = req.params.applicationId as string;
    const { reason, notes } = req.body;
    const result = await teacherService.rejectApplication(adminUserId, applicationId, reason, notes);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetApplicationLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const applicationId = req.params.applicationId as string;
    const result = await teacherService.getApplicationLogs(applicationId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
