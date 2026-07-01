import prisma from '../../infrastructure/database/prisma.client';
import { CreateApplicationInput, UploadDocumentInput } from '@nama/shared';

export class TeacherRepository {
  async findActiveApplication(userId: string) {
    return prisma.teacherApplication.findFirst({
      where: {
        userId,
        status: {
          in: ['draft', 'pending', 'under_review', 'interview_scheduled']
        }
      }
    });
  }

  async createApplication(userId: string, input: CreateApplicationInput) {
    return prisma.$transaction(async (tx) => {
      const app = await tx.teacherApplication.create({
        data: {
          userId,
          specialties: input.specialties,
          bio: input.bio,
          status: 'pending',
          submittedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: 'teacher_application.create',
          entityType: 'teacher_application',
          entityId: app.id,
          metadata: {
            specialties: input.specialties,
            bio: input.bio
          }
        }
      });

      return app;
    });
  }

  async findApplicationById(id: string) {
    return prisma.teacherApplication.findUnique({
      where: { id },
      include: {
        documents: true
      }
    });
  }

  async addDocument(applicationId: string, input: UploadDocumentInput) {
    return prisma.teacherDocument.create({
      data: {
        applicationId,
        documentType: input.documentType as any,
        fileUrl: input.fileUrl,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSizeBytes: input.fileSizeBytes
      }
    });
  }

  async findApplications(status?: string) {
    return prisma.teacherApplication.findMany({
      where: status ? { status: status as any } : {},
      orderBy: { submittedAt: 'desc' }
    });
  }

  async findDocumentById(applicationId: string, id: string) {
    return prisma.teacherDocument.findFirst({
      where: { id, applicationId }
    });
  }

  async verifyDocument(id: string, verified: boolean, adminUserId: string, applicationId: string) {
    return prisma.$transaction(async (tx) => {
      const doc = await tx.teacherDocument.update({
        where: { id },
        data: {
          verified,
          verifiedBy: adminUserId,
          verifiedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          action: 'teacher_application.document_verify',
          entityType: 'teacher_application',
          entityId: applicationId,
          metadata: {
            documentId: id,
            documentType: doc.documentType,
            verified
          }
        }
      });

      return doc;
    });
  }

  async scheduleInterview(applicationId: string, scheduledAt: Date, adminUserId: string) {
    return prisma.$transaction(async (tx) => {
      const interview = await tx.teacherInterview.create({
        data: {
          applicationId,
          scheduledAt
        }
      });

      await tx.teacherApplication.update({
        where: { id: applicationId },
        data: {
          status: 'interview_scheduled'
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          action: 'teacher_application.interview_schedule',
          entityType: 'teacher_application',
          entityId: applicationId,
          metadata: {
            interviewId: interview.id,
            scheduledAt
          }
        }
      });

      return interview;
    });
  }

  async findInterviewById(applicationId: string, id: string) {
    return prisma.teacherInterview.findFirst({
      where: { id, applicationId }
    });
  }

  async updateInterview(id: string, outcome: string, notes: string | undefined, adminUserId: string, applicationId: string) {
    return prisma.$transaction(async (tx) => {
      const interview = await tx.teacherInterview.update({
        where: { id },
        data: {
          outcome: outcome as any,
          notes: notes !== undefined ? notes : undefined,
          conductedBy: adminUserId
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          action: 'teacher_application.interview_update',
          entityType: 'teacher_application',
          entityId: applicationId,
          metadata: {
            interviewId: id,
            outcome,
            notes
          }
        }
      });

      return interview;
    });
  }

  async approveApplication(applicationId: string, adminUserId: string, notes?: string) {
    return prisma.$transaction(async (tx) => {
      const app = await tx.teacherApplication.update({
        where: { id: applicationId },
        data: {
          status: 'approved',
          adminNotes: notes,
          reviewedBy: adminUserId,
          reviewedAt: new Date()
        }
      });

      await tx.teacherProfile.upsert({
        where: { userId: app.userId },
        create: {
          userId: app.userId,
          specialties: app.specialties,
          onboardingFeePaid: false
        },
        update: {
          specialties: app.specialties
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          action: 'teacher_application.approve',
          entityType: 'teacher_application',
          entityId: applicationId,
          metadata: {
            notes
          }
        }
      });

      return app;
    });
  }

  async rejectApplication(applicationId: string, adminUserId: string, reason: string, notes?: string) {
    return prisma.$transaction(async (tx) => {
      const app = await tx.teacherApplication.update({
        where: { id: applicationId },
        data: {
          status: 'rejected',
          rejectionReason: reason,
          adminNotes: notes,
          reviewedBy: adminUserId,
          reviewedAt: new Date()
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: adminUserId,
          action: 'teacher_application.reject',
          entityType: 'teacher_application',
          entityId: applicationId,
          metadata: {
            reason,
            notes
          }
        }
      });

      return app;
    });
  }

  async findApplicationLogs(applicationId: string) {
    return prisma.auditLog.findMany({
      where: {
        entityType: 'teacher_application',
        entityId: applicationId
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const teacherRepository = new TeacherRepository();
