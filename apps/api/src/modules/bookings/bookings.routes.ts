import { Router } from 'express';
import {
  handleGetTeacherAvailability,
  handleCreateTeacherAvailability,
  handleGetAvailableSlots,
  handleBookSession,
  handleGetMyBookings,
  handleCancelBooking
} from './bookings.controller';
import {
  setAvailabilitySchema,
  bookSessionSchema,
  updateBookingSchema
} from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole } from '../../middleware/auth.middleware';

const router = Router();

// Availability endpoints
router.get('/teacher/availability', authenticate, requireRole(['teacher']), handleGetTeacherAvailability);
router.post('/teacher/availability', authenticate, requireRole(['teacher']), validate(setAvailabilitySchema), handleCreateTeacherAvailability);
router.get('/teachers/:teacherId/availability', authenticate, handleGetAvailableSlots);

// Bookings endpoints
router.post('/courses/:courseId/bookings', authenticate, requireRole(['student', 'employee']), validate(bookSessionSchema), handleBookSession);
router.get('/bookings/me', authenticate, handleGetMyBookings);
router.patch('/bookings/:bookingId', authenticate, validate(updateBookingSchema), handleCancelBooking);

export default router;
