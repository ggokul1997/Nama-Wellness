import { schedulingRepository } from './scheduling.repository';
import { courseRepository } from '../course/course.repository';
import { enrollmentRepository } from '../enrollment/enrollment.repository';
import { CreateBatchInput, UpdateBatchInput, CreateSessionInput, UpdateSessionInput, GetSessionsQueryInput } from '@nama/shared';
import { ForbiddenError, NotFoundError } from '../../utils/errors';

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

    // Generate mock Meet details
    const suffix1 = Math.random().toString(36).substring(2, 5);
    const suffix2 = Math.random().toString(36).substring(2, 6);
    const suffix3 = Math.random().toString(36).substring(2, 5);
    const meetLink = `https://meet.google.com/${suffix1}-${suffix2}-${suffix3}`;
    const calendarEventId = `mock_event_${Math.random().toString(36).substring(2, 15)}`;

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
