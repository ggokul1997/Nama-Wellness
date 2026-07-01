import { Request, Response, NextFunction } from 'express';
import { bookingsService } from './bookings.service';
import { ApiResponseEnvelope } from '@nama/shared';

export async function handleGetTeacherAvailability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = req.user!.userId;
    const result = await bookingsService.getTeacherAvailability(teacherId);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateTeacherAvailability(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = req.user!.userId;
    const result = await bookingsService.createTeacherAvailability(teacherId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetAvailableSlots(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const teacherId = req.params.teacherId as string;
    const dateString = req.query.date as string;
    if (!dateString) {
      res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Missing date query parameter' } });
      return;
    }
    const result = await bookingsService.getAvailableSlots(teacherId, dateString);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleBookSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const studentId = req.user!.userId;
    const courseId = req.params.courseId as string;
    const result = await bookingsService.bookSession(studentId, courseId, req.body);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(201).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleGetMyBookings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const activeRole = req.header('x-active-role') || roles[0];
    const result = await bookingsService.getMyBookings(userId, roles, activeRole);
    const response: ApiResponseEnvelope<typeof result> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}

export async function handleCancelBooking(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const roles = req.user!.roles;
    const bookingId = req.params.bookingId as string;
    const result = await bookingsService.cancelBooking(userId, roles, bookingId);
    const response: ApiResponseEnvelope<any> = {
      data: result
    };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}
