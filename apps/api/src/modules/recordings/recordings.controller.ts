import { Request, Response, NextFunction } from 'express';
import { recordingsService } from './recordings.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetCourseRecordings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const courseId = req.params.courseId as string;
    const result = await recordingsService.getCourseRecordings(userId, roles, courseId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetRecordingPlayback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const recordingId = req.params.recordingId as string;
    const result = await recordingsService.getRecordingPlayback(userId, roles, recordingId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleProposeReplacement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const sessionId = req.params.sessionId as string;
    const result = await recordingsService.proposeReplacementRecording(userId, sessionId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleApproveReplacement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.userId;
    const replacementId = req.params.id as string;
    const result = await recordingsService.approveReplacementRecording(adminId, replacementId);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRejectReplacement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.userId;
    const replacementId = req.params.id as string;
    const result = await recordingsService.rejectReplacementRecording(adminId, replacementId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleOverrideAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminId = req.user!.userId;
    const recordingId = req.params.recordingId as string;
    const result = await recordingsService.overrideRecordingAccess(adminId, recordingId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}
