import { Request, Response, NextFunction } from 'express';
import { payoutsService } from './payouts.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetTeacherPayouts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = req.user!.userId;
    const result = await payoutsService.getTeacherPayouts(teacherId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetPayouts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const status = req.query.status as string | undefined;
    const teacherId = req.query.teacherId as string | undefined;
    const result = await payoutsService.getPayouts({ status, teacherId });
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetPayoutDetails(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const payoutId = req.params.payoutId as string;
    const result = await payoutsService.getPayoutDetails(userId, roles, payoutId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleHoldPayout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payoutId = req.params.payoutId as string;
    const { reason } = req.body;
    const result = await payoutsService.holdPayout(payoutId, reason);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleApprovePayout(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payoutId = req.params.payoutId as string;
    const result = await payoutsService.approvePayout(payoutId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleMarkPayoutPaid(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payoutId = req.params.payoutId as string;
    const result = await payoutsService.markPayoutPaid(payoutId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleSetCommissionConfig(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { platformRate, teacherRate } = req.body;
    const result = await payoutsService.setCommissionConfig(platformRate, teacherRate);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}
