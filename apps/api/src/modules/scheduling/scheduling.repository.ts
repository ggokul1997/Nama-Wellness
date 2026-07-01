import prisma from '../../infrastructure/database/prisma.client';
import { CreateBatchInput, UpdateBatchInput, CreateSessionInput, UpdateSessionInput } from '@nama/shared';

export class SchedulingRepository {
  // Batch CRUD
  async findBatchesByCourseId(courseId: string) {
    return prisma.batch.findMany({
      where: { courseId },
      orderBy: { startDate: 'asc' }
    });
  }

  async findBatchById(id: string) {
    return prisma.batch.findUnique({
      where: { id },
      include: {
        course: {
          include: {
            teacher: true
          }
        }
      }
    });
  }

  async createBatch(courseId: string, input: CreateBatchInput) {
    return prisma.batch.create({
      data: {
        courseId,
        name: input.name,
        capacity: input.capacity,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: 'upcoming'
      }
    });
  }

  async updateBatch(id: string, input: UpdateBatchInput) {
    return prisma.batch.update({
      where: { id },
      data: {
        name: input.name !== undefined ? input.name : undefined,
        capacity: input.capacity !== undefined ? input.capacity : undefined,
        startDate: input.startDate !== undefined ? new Date(input.startDate) : undefined,
        endDate: input.endDate !== undefined ? (input.endDate ? new Date(input.endDate) : null) : undefined,
        status: input.status !== undefined ? (input.status as any) : undefined
      }
    });
  }

  // Session CRUD
  async findSessionsByBatchId(batchId: string) {
    return prisma.classSession.findMany({
      where: { batchId },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  async findSessionById(id: string) {
    return prisma.classSession.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            course: true
          }
        }
      }
    });
  }

  async createSession(batchId: string, input: CreateSessionInput & { meetLink?: string; calendarEventId?: string }) {
    return prisma.classSession.create({
      data: {
        batchId,
        title: input.title,
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes,
        meetLink: input.meetLink || null,
        calendarEventId: input.calendarEventId || null,
        status: 'scheduled'
      }
    });
  }

  async updateSession(id: string, input: UpdateSessionInput) {
    return prisma.classSession.update({
      where: { id },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        scheduledAt: input.scheduledAt !== undefined ? new Date(input.scheduledAt) : undefined,
        durationMinutes: input.durationMinutes !== undefined ? input.durationMinutes : undefined,
        status: input.status !== undefined ? (input.status as any) : undefined,
        startedAt: input.startedAt !== undefined ? (input.startedAt ? new Date(input.startedAt) : null) : undefined,
        endedAt: input.endedAt !== undefined ? (input.endedAt ? new Date(input.endedAt) : null) : undefined,
        meetLink: input.meetLink !== undefined ? input.meetLink : undefined,
        calendarEventId: input.calendarEventId !== undefined ? input.calendarEventId : undefined
      }
    });
  }

  async findSessionsForStudent(userId: string, startDate?: Date, endDate?: Date) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId,
        status: 'active'
      },
      select: {
        courseId: true,
        batchId: true
      }
    });

    const batchIds = enrollments.map(e => e.batchId).filter((id): id is string => id !== null);

    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const where: any = {
      batchId: { in: batchIds }
    };
    if (startDate || endDate) {
      where.scheduledAt = dateFilter;
    }

    return prisma.classSession.findMany({
      where,
      include: {
        batch: {
          include: {
            course: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  async findSessionsForTeacher(userId: string, startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const where: any = {
      batch: {
        course: {
          teacherId: userId
        }
      }
    };
    if (startDate || endDate) {
      where.scheduledAt = dateFilter;
    }

    return prisma.classSession.findMany({
      where,
      include: {
        batch: {
          include: {
            course: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  async findAllSessions(startDate?: Date, endDate?: Date) {
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = startDate;
    }
    if (endDate) {
      dateFilter.lte = endDate;
    }

    const where: any = {};
    if (startDate || endDate) {
      where.scheduledAt = dateFilter;
    }

    return prisma.classSession.findMany({
      where,
      include: {
        batch: {
          include: {
            course: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }
}

export const schedulingRepository = new SchedulingRepository();
export default schedulingRepository;
