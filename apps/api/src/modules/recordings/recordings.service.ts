import { recordingsRepository } from './recordings.repository';
import { courseRepository } from '../course/course.repository';
import { enrollmentRepository } from '../enrollment/enrollment.repository';
import { schedulingRepository } from '../scheduling/scheduling.repository';
import { 
  ProposeReplacementRecordingInput, 
  RejectReplacementInput, 
  AdminOverrideAccessInput 
} from '@nama/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

export class RecordingsService {
  async getCourseRecordings(userId: string, roles: string[], courseId: string) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isTeacher = course.teacherId === userId;

    let isEnrolled = false;
    if (!isAdmin && !isTeacher) {
      const activeEnrollment = await enrollmentRepository.findActiveEnrollment(userId, courseId);
      if (activeEnrollment) {
        isEnrolled = true;
      }
    }

    if (!isAdmin && !isTeacher && !isEnrolled) {
      throw new ForbiddenError('You do not have permission to view recordings for this course');
    }

    return recordingsRepository.findRecordingsByCourseId(courseId);
  }

  async getRecordingPlayback(userId: string, roles: string[], recordingId: string) {
    const recording = await recordingsRepository.findRecordingById(recordingId);
    if (!recording) {
      throw new NotFoundError('Recording not found');
    }

    const isAdmin = roles.includes('admin');
    const isTeacher = recording.course.teacherId === userId;

    if (isAdmin || isTeacher) {
      // Admins and teachers bypass replay limits completely
      const fileUrl = recording.fileUrl 
        ? recording.fileUrl.replace('s3://', 'https://nama-wellness-recordings.s3.amazonaws.com/') + '?signed=true' 
        : '';
      return {
        id: recording.id,
        fileUrl,
        durationSeconds: recording.durationSeconds,
        viewCount: 0,
        remainingViews: null
      };
    }

    // Student/Employee check active enrollment
    const enrollment = await enrollmentRepository.findActiveEnrollment(userId, recording.courseId);
    if (!enrollment) {
      throw new ForbiddenError('You must have an active enrollment to access this recording');
    }

    // Load or create recording view
    const view = await recordingsRepository.findOrCreateRecordingView(enrollment.id, recordingId);

    // Check for access override
    const override = await recordingsRepository.findAccessOverride(enrollment.id, recordingId);

    // Resolve max allowed views
    let maxAllowed: number | null = recording.maxReplayCount;
    if (override) {
      maxAllowed = override.maxReplayCount; // null means unlimited
    }

    if (maxAllowed !== null && view.viewCount >= maxAllowed) {
      throw new ForbiddenError(`You have reached the maximum replay limit of ${maxAllowed} views for this recording. Please contact support to request an override.`);
    }

    // Increment views count
    const updatedView = await recordingsRepository.incrementRecordingView(view.id);

    const fileUrl = recording.fileUrl 
      ? recording.fileUrl.replace('s3://', 'https://nama-wellness-recordings.s3.amazonaws.com/') + '?signed=true' 
      : '';

    return {
      id: recording.id,
      fileUrl,
      durationSeconds: recording.durationSeconds,
      viewCount: updatedView.viewCount,
      remainingViews: maxAllowed !== null ? maxAllowed - updatedView.viewCount : null
    };
  }

  async proposeReplacementRecording(
    userId: string,
    sessionId: string,
    input: ProposeReplacementRecordingInput
  ) {
    const session = await schedulingRepository.findSessionById(sessionId);
    if (!session) {
      throw new NotFoundError('Session not found');
    }

    const isTeacher = session.batch.course.teacherId === userId;
    if (!isTeacher) {
      throw new ForbiddenError('You do not have permission to propose a replacement recording for this session');
    }

    return recordingsRepository.createReplacementRecording(
      userId,
      sessionId,
      input.fileUrl,
      input.fileName
    );
  }

  async approveReplacementRecording(adminId: string, replacementId: string) {
    const replacement = await recordingsRepository.findReplacementRecordingById(replacementId);
    if (!replacement) {
      throw new NotFoundError('Replacement recording not found');
    }

    if (replacement.status !== 'pending') {
      throw new BadRequestError('Replacement recording is not in a pending state');
    }

    // Create approved recording linked to original session and course
    const recording = await recordingsRepository.createRecording({
      sessionId: replacement.originalSessionId,
      courseId: replacement.originalSession.batch.courseId,
      fileUrl: replacement.fileUrl,
      durationSeconds: 3600, // standard session duration fallback
      recordingType: 'replacement',
      status: 'approved'
    });

    // Update replacement recording status to approved
    return recordingsRepository.updateReplacementRecording(replacementId, {
      status: 'approved',
      reviewedById: adminId,
      recordingId: recording.id
    });
  }

  async rejectReplacementRecording(
    adminId: string,
    replacementId: string,
    input: RejectReplacementInput
  ) {
    const replacement = await recordingsRepository.findReplacementRecordingById(replacementId);
    if (!replacement) {
      throw new NotFoundError('Replacement recording not found');
    }

    if (replacement.status !== 'pending') {
      throw new BadRequestError('Replacement recording is not in a pending state');
    }

    return recordingsRepository.updateReplacementRecording(replacementId, {
      status: 'rejected',
      reviewedById: adminId,
      rejectionReason: input.reason
    });
  }

  async overrideRecordingAccess(
    adminId: string,
    recordingId: string,
    input: AdminOverrideAccessInput
  ) {
    const recording = await recordingsRepository.findRecordingById(recordingId);
    if (!recording) {
      throw new NotFoundError('Recording not found');
    }

    const enrollment = await enrollmentRepository.findById(input.enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    return recordingsRepository.upsertAccessOverride({
      enrollmentId: input.enrollmentId,
      recordingId,
      maxReplayCount: input.maxReplayCount !== undefined ? input.maxReplayCount : null,
      grantedById: adminId,
      reason: input.reason
    });
  }
}

export const recordingsService = new RecordingsService();
export default recordingsService;
