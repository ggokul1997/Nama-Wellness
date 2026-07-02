import { Request, Response, NextFunction } from 'express';
import { certificatesService } from './certificates.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetUserCertificates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const result = await certificatesService.getUserCertificates(userId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleApproveCertificate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherUserId = req.user!.userId;
    const certificateId = req.params.certificateId as string;
    const result = await certificatesService.approveCertificate(teacherUserId, certificateId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleVerifyCertificate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const certificateId = req.params.certificateId as string;
    const result = await certificatesService.verifyCertificate(certificateId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleRevokeCertificate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const adminUserId = req.user!.userId;
    const certificateId = req.params.certificateId as string;
    const { reason } = req.body;
    const result = await certificatesService.revokeCertificate(adminUserId, certificateId, reason);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCompleteEnrollment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const operatorUserId = req.user!.userId;
    const roles = req.user!.roles;
    const enrollmentId = req.params.enrollmentId as string;
    const result = await certificatesService.completeEnrollment(operatorUserId, roles, enrollmentId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
