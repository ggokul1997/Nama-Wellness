import prisma from '../../infrastructure/database/prisma.client';
import { UserStatus, PerformanceStatus, Prisma } from '@nama/prisma';

export class AdminModerationRepository {
  async updateUserStatus(userId: string, status: UserStatus) {
    return prisma.user.update({
      where: { id: userId },
      data: { status }
    });
  }

  async updateTeacherPerformance(teacherId: string, performanceStatus: PerformanceStatus) {
    return prisma.teacherProfile.update({
      where: { userId: teacherId },
      data: { performanceStatus }
    });
  }

  async createComplaint(data: {
    studentId: string;
    teacherId: string;
    title: string;
    description: string;
  }) {
    return prisma.complaint.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        title: data.title,
        description: data.description,
        status: 'pending'
      }
    });
  }

  async findComplaints(filters: { teacherId?: string; status?: string }) {
    const where: Prisma.ComplaintWhereInput = {};
    if (filters.teacherId) {
      where.teacherId = filters.teacherId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    return prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
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
      }
    });
  }

  async findComplaintById(id: string) {
    return prisma.complaint.findUnique({
      where: { id },
      include: {
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
      }
    });
  }

  async updateComplaint(id: string, status: string, resolution: string) {
    return prisma.complaint.update({
      where: { id },
      data: { status, resolution }
    });
  }

  async createAuditLog(data: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return prisma.auditLog.create({
      data: {
        actorId: data.actorId,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        metadata: data.metadata || Prisma.JsonNull,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent
      }
    });
  }

  async findAuditLogs(limit: number = 100) {
    return prisma.auditLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      }
    });
  }
}

export const adminModerationRepository = new AdminModerationRepository();
export default adminModerationRepository;
