import { bookingsRepository } from './bookings.repository';
import { courseRepository } from '../course/course.repository';
import { enrollmentRepository } from '../enrollment/enrollment.repository';
import { SetAvailabilityInput, BookSessionInput } from '@nama/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { googleCalendarService } from '../../services/google-calendar.service';
import prisma from '../../infrastructure/database/prisma.client';

export class BookingsService {
  async getTeacherAvailability(teacherId: string) {
    return bookingsRepository.getTeacherAvailability(teacherId);
  }

  async createTeacherAvailability(teacherId: string, input: SetAvailabilityInput) {
    const startTime = input.startTime || '09:00';
    const endTime = input.endTime || '17:00';
    const startMin = parseInt(startTime.split(':')[0] || '0') * 60 + parseInt(startTime.split(':')[1] || '0');
    const endMin = parseInt(endTime.split(':')[0] || '0') * 60 + parseInt(endTime.split(':')[1] || '0');

    if (startMin >= endMin) {
      throw new BadRequestError('Start time must be before end time');
    }

    return bookingsRepository.createTeacherAvailability(teacherId, {
      ...input,
      startTime,
      endTime
    });
  }

  async getAvailableSlots(teacherId: string, dateString: string) {
    const queryDate = new Date(dateString);
    if (isNaN(queryDate.getTime())) {
      throw new BadRequestError('Invalid date format');
    }

    const dayOfWeek = queryDate.getDay();
    const availabilities = await bookingsRepository.findTeacherAvailabilityOnDay(teacherId, dayOfWeek);

    // Fetch existing bookings for this day to perform collision checking
    const dayStart = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 0, 0, 0);
    const dayEnd = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59);

    const conflicts = await bookingsRepository.findConflictingBookings(teacherId, dayStart, dayEnd);

    const slots: Array<{ slotStart: string; slotEnd: string; available: boolean }> = [];

    for (const availability of availabilities) {
      const startHour = Number(availability.startTime.split(':')[0]) || 0;
      const startMin = Number(availability.startTime.split(':')[1]) || 0;
      const endHour = Number(availability.endTime.split(':')[0]) || 0;
      const endMin = Number(availability.endTime.split(':')[1]) || 0;

      let currentHour = startHour;
      let currentMin = startMin;

      while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
        const slotStart = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), currentHour, currentMin);
        
        // Add 1 hour duration
        let nextHour = currentHour + 1;
        let nextMin = currentMin;
        
        if (nextHour > endHour || (nextHour === endHour && nextMin > endMin)) {
          break;
        }

        const slotEnd = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), nextHour, nextMin);

        // Check if overlaps with any conflict
        const isConflict = conflicts.some(c => {
          return (
            (c.slotStart.getTime() <= slotStart.getTime() && c.slotEnd.getTime() > slotStart.getTime()) ||
            (c.slotStart.getTime() < slotEnd.getTime() && c.slotEnd.getTime() >= slotEnd.getTime()) ||
            (c.slotStart.getTime() >= slotStart.getTime() && c.slotEnd.getTime() <= slotEnd.getTime())
          );
        });

        slots.push({
          slotStart: slotStart.toISOString(),
          slotEnd: slotEnd.toISOString(),
          available: !isConflict
        });

        currentHour = nextHour;
        currentMin = nextMin;
      }
    }

    return slots;
  }

  async bookSession(studentId: string, courseId: string, input: BookSessionInput) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Verify active enrollment
    const activeEnrollment = await enrollmentRepository.findActiveEnrollment(studentId, courseId);
    if (!activeEnrollment) {
      throw new ForbiddenError('You must be enrolled in this course to book an individual session');
    }

    const slotStart = new Date(input.slotStart);
    const slotEnd = new Date(input.slotEnd);

    if (isNaN(slotStart.getTime()) || isNaN(slotEnd.getTime())) {
      throw new BadRequestError('Invalid slot dates');
    }

    if (slotStart.getTime() >= slotEnd.getTime()) {
      throw new BadRequestError('Slot start must be before slot end');
    }

    // Verify slots collision
    const conflicts = await bookingsRepository.findConflictingBookings(input.teacherId, slotStart, slotEnd);
    if (conflicts.length > 0) {
      throw new BadRequestError('This slot is already booked or conflicts with another booking');
    }

    const attendeeEmails: string[] = [];
    const [studentUser, teacherUser] = await Promise.all([
      prisma.user.findUnique({ where: { id: studentId } }),
      prisma.user.findUnique({ where: { id: input.teacherId } })
    ]);
    if (studentUser?.email) attendeeEmails.push(studentUser.email);
    if (teacherUser?.email) attendeeEmails.push(teacherUser.email);

    const { meetLink, calendarEventId } = await googleCalendarService.createCalendarEvent({
      title: `${course.title} - Individual Session`,
      description: `Individual coaching session for course ${course.title}`,
      startTime: slotStart,
      endTime: slotEnd,
      attendeeEmails
    });

    return bookingsRepository.createBooking({
      studentId,
      courseId,
      teacherId: input.teacherId,
      slotStart,
      slotEnd,
      meetLink,
      calendarEventId
    });
  }

  async getMyBookings(userId: string, roles: string[], activeRole: string | undefined) {
    const role = activeRole || roles[0] || 'student';
    const queryRole = role === 'teacher' ? 'teacher' : 'student';
    return bookingsRepository.findBookingsForUser(userId, queryRole);
  }

  async cancelBooking(userId: string, roles: string[], bookingId: string) {
    const booking = await bookingsRepository.findBookingById(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const isAdmin = roles.includes('admin');
    const isStudent = booking.studentId === userId;
    const isTeacher = booking.teacherId === userId;

    if (!isAdmin && !isStudent && !isTeacher) {
      throw new ForbiddenError('You do not have permission to cancel this booking');
    }

    if (booking.calendarEventId) {
      await googleCalendarService.deleteCalendarEvent(booking.calendarEventId);
    }

    return bookingsRepository.updateBookingStatus(bookingId, 'cancelled');
  }
}

export const bookingsService = new BookingsService();
export default bookingsService;
