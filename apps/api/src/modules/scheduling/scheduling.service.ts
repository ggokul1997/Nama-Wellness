import { schedulingRepository } from './scheduling.repository';
import { courseRepository } from '../course/course.repository';
import { enrollmentRepository } from '../enrollment/enrollment.repository';
import { CreateBatchInput, UpdateBatchInput, CreateSessionInput, UpdateSessionInput, GetSessionsQueryInput } from '@nama/shared';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { googleCalendarService } from '../../services/google-calendar.service';
import prisma from '../../infrastructure/database/prisma.client';

export class SchedulingService {
  // Batch CRUD Service
  async getBatches(courseId: string) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }
    return schedulingRepository.findBatchesByCourseId(courseId);
  }

  async createBatch(userId: string, roles: string[], courseId: string, input: CreateBatchInput) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to create batches for this course');
    }

    return schedulingRepository.createBatch(courseId, input);
  }

  async updateBatch(userId: string, roles: string[], batchId: string, input: UpdateBatchInput) {
    const batch = await schedulingRepository.findBatchById(batchId);
    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = batch.course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to update this batch');
    }

    return schedulingRepository.updateBatch(batchId, input);
  }

  // Session CRUD Service
  async getSessions(userId: string, roles: string[], batchId: string) {
    const batch = await schedulingRepository.findBatchById(batchId);
    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    const isAdmin = roles.includes('admin');
    const isTeacher = batch.course.teacherId === userId;

    let isEnrolled = false;
    if (!isAdmin && !isTeacher) {
      const activeEnrollment = await enrollmentRepository.findActiveEnrollment(userId, batch.courseId);
      if (activeEnrollment && (activeEnrollment.batchId === batchId || activeEnrollment.batchId === null)) {
        isEnrolled = true;
      }
    }

    if (!isAdmin && !isTeacher && !isEnrolled) {
      throw new ForbiddenError('You do not have permission to view sessions for this batch');
    }

    return schedulingRepository.findSessionsByBatchId(batchId);
  }

  async createSession(userId: string, roles: string[], batchId: string, input: CreateSessionInput) {
    const batch = await schedulingRepository.findBatchById(batchId);
    if (!batch) {
      throw new NotFoundError('Batch not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = batch.course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to create sessions for this batch');
    }

    const attendeeEmails: string[] = [];
    const teacherEmail = (batch.course as any).teacher?.email;
    if (teacherEmail) {
      attendeeEmails.push(teacherEmail);
    }

    const enrollments = await enrollmentRepository.findMany({ courseId: batch.courseId, status: 'active' });
    enrollments.items.forEach((item: any) => {
      if (item.user?.email) {
        attendeeEmails.push(item.user.email);
      }
    });

    const scheduledAt = new Date(input.scheduledAt);
    const durationMinutes = input.durationMinutes;
    const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

    const { meetLink, calendarEventId } = await googleCalendarService.createCalendarEvent({
      title: `${batch.course.title} - ${input.title}`,
      description: `Class session for batch ${batch.name} of course ${batch.course.title}`,
      startTime: scheduledAt,
      endTime,
      attendeeEmails
    });

    return schedulingRepository.createSession(batchId, {
      ...input,
      meetLink,
      calendarEventId
    });
  }

  async updateSession(userId: string, roles: string[], sessionId: string, input: UpdateSessionInput) {
    const session = await schedulingRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = session.batch.course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to update this session');
    }

    if (session.calendarEventId) {
      const scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : new Date(session.scheduledAt);
      const durationMinutes = input.durationMinutes || session.durationMinutes;
      const endTime = new Date(scheduledAt.getTime() + durationMinutes * 60 * 1000);

      const enrollments = await prisma.enrollment.findMany({
        where: { batchId: session.batchId },
        include: { user: true }
      });
      const attendeeEmails = enrollments.map(e => e.user.email).filter(Boolean);

      await googleCalendarService.updateCalendarEvent(session.calendarEventId, {
        title: `${session.batch.course.title} - ${input.title || session.title}`,
        description: `Class session for batch ${session.batch.name} of course ${session.batch.course.title}`,
        startTime: scheduledAt,
        endTime,
        attendeeEmails
      });
    }

    return schedulingRepository.updateSession(sessionId, input);
  }

  async getSessionsCalendar(
    userId: string,
    roles: string[],
    activeRole: string | undefined,
    query: GetSessionsQueryInput
  ) {
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    // Default to the first role if activeRole is not provided
    const role = activeRole || roles[0] || 'student';

    if (role === 'admin') {
      return schedulingRepository.findAllSessions(startDate, endDate);
    } else if (role === 'teacher') {
      return schedulingRepository.findSessionsForTeacher(userId, startDate, endDate);
    } else {
      // Default to student/employee calendar
      return schedulingRepository.findSessionsForStudent(userId, startDate, endDate);
    }
  }
}

export const schedulingService = new SchedulingService();
export default schedulingService;
