import { attendanceRepository } from './attendance.repository';
import { schedulingRepository } from '../scheduling/scheduling.repository';
import { enrollmentRepository } from '../enrollment/enrollment.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

export class AttendanceService {
  async joinSession(userId: string, sessionId: string) {
    const session = await schedulingRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const activeEnrollment = await enrollmentRepository.findActiveEnrollment(userId, session.batch.courseId);
    if (!activeEnrollment) {
      throw new ForbiddenError('You must be enrolled in this course to join the session');
    }

    const record = await attendanceRepository.joinSession(sessionId, userId);
    return {
      id: record.id,
      sessionId: record.sessionId,
      joinedAt: record.joinedAt,
      meetLink: session.meetLink
    };
  }

  async leaveSession(userId: string, sessionId: string) {
    const session = await schedulingRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const result = await attendanceRepository.leaveSession(sessionId, userId, session.durationMinutes);
    if (!result) {
      throw new BadRequestError('No active attendance record found for this session. Did you join?');
    }

    return {
      id: result.id,
      leftAt: result.leftAt,
      durationSeconds: result.durationSeconds,
      attendancePercentage: result.attendancePercentage ? Number(result.attendancePercentage) : 0
    };
  }

  async getSessionAttendance(userId: string, roles: string[], sessionId: string) {
    const session = await schedulingRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const isAdmin = roles.includes('admin');
    const isTeacher = session.batch.course.teacherId === userId;

    if (!isAdmin && !isTeacher) {
      throw new ForbiddenError('You do not have permission to view this session attendance report');
    }

    const records = await attendanceRepository.findAttendanceBySessionId(sessionId) as any[];
    return records.map(r => {
      const profile = r.user?.profile;
      const firstName = profile?.firstName || '';
      const lastName = profile?.lastName || '';
      return {
        userId: r.userId,
        userName: `${firstName} ${lastName}`.trim() || r.user?.email || '',
        joinedAt: r.joinedAt,
        leftAt: r.leftAt,
        attendancePercentage: r.attendancePercentage ? Number(r.attendancePercentage) : 0
      };
    });
  }

  async getEnrollmentAttendance(userId: string, roles: string[], enrollmentId: string) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = enrollment.userId === userId;
    const isTeacher = enrollment.course.teacherId === userId;

    if (!isAdmin && !isOwner && !isTeacher) {
      throw new ForbiddenError('You do not have permission to view this enrollment attendance');
    }

    return attendanceRepository.findAttendanceByEnrollmentId(enrollment.userId, enrollment.courseId);
  }
}

export const attendanceService = new AttendanceService();
export default attendanceService;
