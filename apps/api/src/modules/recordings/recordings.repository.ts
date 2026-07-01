import prisma from '../../infrastructure/database/prisma.client';
import { RecordingType, RecordingStatus, ApprovalStatus } from '@nama/prisma';

export class RecordingsRepository {
  async findRecordingsByCourseId(courseId: string) {
    return prisma.recording.findMany({
      where: {
        courseId,
        status: 'approved'
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findRecordingById(id: string) {
    return prisma.recording.findUnique({
      where: { id },
      include: {
        session: true,
        course: true
      }
    });
  }

  async findReplacementRecordingById(id: string) {
    return prisma.replacementRecording.findUnique({
      where: { id },
      include: {
        originalSession: {
          include: {
            batch: true
          }
        }
      }
    });
  }

  async createReplacementRecording(
    teacherId: string,
    originalSessionId: string,
    fileUrl: string,
    fileName: string
  ) {
    return prisma.replacementRecording.create({
      data: {
        originalSessionId,
        teacherId,
        fileUrl,
        fileName,
        status: 'pending'
      }
    });
  }

  async updateReplacementRecording(
    id: string,
    params: {
      status: ApprovalStatus;
      reviewedById: string;
      recordingId?: string;
      rejectionReason?: string;
    }
  ) {
    return prisma.replacementRecording.update({
      where: { id },
      data: {
        status: params.status,
        reviewedById: params.reviewedById,
        reviewedAt: new Date(),
        recordingId: params.recordingId || null,
        rejectionReason: params.rejectionReason || null
      }
    });
  }

  async createRecording(params: {
    sessionId: string;
    courseId: string;
    fileUrl: string;
    durationSeconds: number;
    recordingType: RecordingType;
    status: RecordingStatus;
  }) {
    return prisma.recording.create({
      data: {
        sessionId: params.sessionId,
        courseId: params.courseId,
        fileUrl: params.fileUrl,
        durationSeconds: params.durationSeconds,
        recordingType: params.recordingType,
        status: params.status
      }
    });
  }

  async findOrCreateRecordingView(enrollmentId: string, recordingId: string) {
    return prisma.recordingView.upsert({
      where: {
        enrollmentId_recordingId: {
          enrollmentId,
          recordingId
        }
      },
      create: {
        enrollmentId,
        recordingId,
        viewCount: 0
      },
      update: {}
    });
  }

  async incrementRecordingView(id: string) {
    return prisma.recordingView.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date()
      }
    });
  }

  async upsertAccessOverride(params: {
    enrollmentId: string;
    recordingId: string;
    maxReplayCount: number | null;
    grantedById: string;
    reason?: string;
  }) {
    return prisma.recordingAccessOverride.upsert({
      where: {
        enrollmentId_recordingId: {
          enrollmentId: params.enrollmentId,
          recordingId: params.recordingId
        }
      },
      create: {
        enrollmentId: params.enrollmentId,
        recordingId: params.recordingId,
        maxReplayCount: params.maxReplayCount,
        grantedById: params.grantedById,
        reason: params.reason || null
      },
      update: {
        maxReplayCount: params.maxReplayCount,
        grantedById: params.grantedById,
        reason: params.reason || null,
        createdAt: new Date()
      }
    });
  }

  async findAccessOverride(enrollmentId: string, recordingId: string) {
    return prisma.recordingAccessOverride.findUnique({
      where: {
        enrollmentId_recordingId: {
          enrollmentId,
          recordingId
        }
      }
    });
  }
}

export const recordingsRepository = new RecordingsRepository();
export default recordingsRepository;
