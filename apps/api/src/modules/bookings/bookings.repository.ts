import prisma from '../../infrastructure/database/prisma.client';
import { BookingStatus } from '@nama/prisma';
import { SetAvailabilityInput } from '@nama/shared';

export class BookingsRepository {
  async getTeacherAvailability(teacherId: string) {
    return prisma.teacherAvailability.findMany({
      where: { teacherId },
      orderBy: { dayOfWeek: 'asc' }
    });
  }

  async createTeacherAvailability(teacherId: string, input: SetAvailabilityInput) {
    return prisma.teacherAvailability.create({
      data: {
        teacherId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        isRecurring: input.isRecurring
      }
    });
  }

  async findTeacherAvailabilityOnDay(teacherId: string, dayOfWeek: number) {
    return prisma.teacherAvailability.findMany({
      where: {
        teacherId,
        dayOfWeek
      }
    });
  }

  async findConflictingBookings(teacherId: string, slotStart: Date, slotEnd: Date) {
    return prisma.individualBooking.findMany({
      where: {
        teacherId,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          {
            slotStart: { lte: slotStart },
            slotEnd: { gt: slotStart }
          },
          {
            slotStart: { lt: slotEnd },
            slotEnd: { gte: slotEnd }
          },
          {
            slotStart: { gte: slotStart },
            slotEnd: { lte: slotEnd }
          }
        ]
      }
    });
  }

  async createBooking(params: {
    studentId: string;
    courseId: string;
    teacherId: string;
    slotStart: Date;
    slotEnd: Date;
    meetLink: string;
    calendarEventId: string;
  }) {
    return prisma.individualBooking.create({
      data: {
        courseId: params.courseId,
        studentId: params.studentId,
        teacherId: params.teacherId,
        slotStart: params.slotStart,
        slotEnd: params.slotEnd,
        meetLink: params.meetLink,
        calendarEventId: params.calendarEventId,
        status: 'pending'
      }
    });
  }

  async findBookingsForUser(userId: string, role: 'student' | 'teacher') {
    return prisma.individualBooking.findMany({
      where: role === 'teacher' ? { teacherId: userId } : { studentId: userId },
      include: {
        course: true,
        student: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        },
        teacher: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      },
      orderBy: { slotStart: 'desc' }
    });
  }

  async findBookingById(id: string) {
    return prisma.individualBooking.findUnique({
      where: { id },
      include: {
        course: true
      }
    });
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    return prisma.individualBooking.update({
      where: { id },
      data: { status }
    });
  }
}

export const bookingsRepository = new BookingsRepository();
export default bookingsRepository;
