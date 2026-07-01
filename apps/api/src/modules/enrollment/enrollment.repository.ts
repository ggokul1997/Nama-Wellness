import prisma from '../../infrastructure/database/prisma.client';
import { EnrollmentSource, EnrollmentStatus } from '@nama/prisma';

export class EnrollmentRepository {
  async findMany(params: {
    userId?: string;
    courseId?: string;
    status?: EnrollmentStatus;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.userId) {
      where.userId = params.userId;
    }
    if (params.courseId) {
      where.courseId = params.courseId;
    }
    if (params.status) {
      where.status = params.status;
    }

    const [items, total] = await Promise.all([
      prisma.enrollment.findMany({
        where,
        include: {
          user: {
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
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              coverImageUrl: true,
              teacherId: true
            }
          },
          batch: true,
          company: true
        },
        orderBy: { enrolledAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.enrollment.count({ where })
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    return prisma.enrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        },
        course: {
          include: {
            category: true,
            teacher: {
              select: {
                id: true,
                email: true,
                profile: true
              }
            }
          }
        },
        batch: true,
        company: true
      }
    });
  }

  async findActiveEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
        status: 'active'
      }
    });
  }

  async upsertEnrollment(data: {
    userId: string;
    courseId: string;
    batchId?: string | null;
    companyId?: string | null;
    source: EnrollmentSource;
    orderId?: string | null;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Check if enrollment already exists
      const existing = await tx.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: data.userId,
            courseId: data.courseId
          }
        }
      });

      let enrollment;
      if (existing) {
        // If it's already active, return it
        if (existing.status === 'active') {
          return existing;
        }

        // Reactivate enrollment
        enrollment = await tx.enrollment.update({
          where: { id: existing.id },
          data: {
            status: 'active',
            batchId: data.batchId !== undefined ? data.batchId : existing.batchId,
            companyId: data.companyId !== undefined ? data.companyId : existing.companyId,
            source: data.source,
            enrolledAt: new Date(),
            completedAt: null
          }
        });
      } else {
        // Create new enrollment
        enrollment = await tx.enrollment.create({
          data: {
            userId: data.userId,
            courseId: data.courseId,
            batchId: data.batchId,
            companyId: data.companyId,
            source: data.source,
            orderId: data.orderId,
            status: 'active'
          }
        });
      }

      // 2. If batchId is provided, increment enrolledCount in Batch
      if (data.batchId) {
        await tx.batch.update({
          where: { id: data.batchId },
          data: {
            enrolledCount: {
              increment: 1
            }
          }
        });
      }

      return enrollment;
    });
  }

  async updateLessonProgress(
    enrollmentId: string,
    lessonId: string,
    input: { progressPercent: number; lastPositionSeconds?: number | null; completed: boolean }
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Upsert LessonProgress
      const completedAt = input.completed ? new Date() : null;
      const progressPercent = Math.min(100, Math.max(0, input.progressPercent));

      const lessonProgress = await tx.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId,
            lessonId
          }
        },
        create: {
          enrollmentId,
          lessonId,
          progressPercent,
          completedAt,
          lastPositionSeconds: input.lastPositionSeconds
        },
        update: {
          progressPercent,
          completedAt,
          lastPositionSeconds: input.lastPositionSeconds
        }
      });

      // 2. Fetch the enrollment's course ID
      const enrollment = await tx.enrollment.findUnique({
        where: { id: enrollmentId },
        select: { courseId: true }
      });

      if (enrollment) {
        // 3. Count total lessons in course
        const totalLessons = await tx.lesson.count({
          where: {
            module: {
              courseId: enrollment.courseId
            }
          }
        });

        if (totalLessons > 0) {
          // 4. Count completed lessons in this enrollment
          const completedLessons = await tx.lessonProgress.count({
            where: {
              enrollmentId,
              completedAt: { not: null }
            }
          });

          // 5. Calculate and save overall progress
          const overallProgress = (completedLessons / totalLessons) * 100;
          await tx.enrollment.update({
            where: { id: enrollmentId },
            data: {
              progressPercent: overallProgress
            }
          });
        }
      }

      return lessonProgress;
    });
  }
}

export const enrollmentRepository = new EnrollmentRepository();
export default enrollmentRepository;
