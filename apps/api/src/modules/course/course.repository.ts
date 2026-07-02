import prisma from '../../infrastructure/database/prisma.client';
import { CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateLessonInput, UpdateLessonInput } from '@nama/shared';

export class CourseRepository {
  async findMany(params: {
    status?: any;
    categoryId?: string;
    courseType?: any;
    search?: string;
    teacherId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (params.status) {
      where.status = params.status;
    }
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }
    if (params.courseType) {
      where.courseType = params.courseType;
    }
    if (params.teacherId) {
      where.teacherId = params.teacherId;
    }
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          teacher: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                  avatarUrl: true
                }
              },
              teacherProfile: {
                select: {
                  averageRating: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.course.count({ where })
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
    return prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        teacher: {
          select: {
            id: true,
            email: true,
            profile: true,
            teacherProfile: true
          }
        },
        modules: {
          include: {
            lessons: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        pricing: true,
        batches: true
      }
    });
  }

  async findBySlug(slug: string) {
    return prisma.course.findUnique({
      where: { slug }
    });
  }

  async create(userId: string, input: CreateCourseInput, slug: string) {
    return prisma.course.create({
      data: {
        title: input.title,
        slug,
        description: input.description,
        courseType: input.courseType as any,
        categoryId: input.categoryId,
        teacherId: input.teacherId || userId,
        coverImageUrl: input.coverImageUrl,
        status: 'draft'
      }
    });
  }

  async update(id: string, input: UpdateCourseInput & { status?: any; rejectedReason?: string | null; publishedAt?: Date | null }) {
    return prisma.course.update({
      where: { id },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        description: input.description !== undefined ? input.description : undefined,
        courseType: input.courseType !== undefined ? (input.courseType as any) : undefined,
        categoryId: input.categoryId !== undefined ? input.categoryId : undefined,
        coverImageUrl: input.coverImageUrl !== undefined ? input.coverImageUrl : undefined,
        teacherId: input.teacherId !== undefined ? input.teacherId : undefined,
        status: input.status !== undefined ? input.status : undefined,
        rejectedReason: input.rejectedReason !== undefined ? input.rejectedReason : undefined,
        publishedAt: input.publishedAt !== undefined ? input.publishedAt : undefined
      }
    });
  }

  // Modules CRUD
  async findModulesByCourseId(courseId: string) {
    return prisma.courseModule.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  async findModuleById(id: string) {
    return prisma.courseModule.findUnique({
      where: { id },
      include: {
        course: true
      }
    });
  }

  async createModule(courseId: string, input: CreateModuleInput) {
    return prisma.courseModule.create({
      data: {
        courseId,
        title: input.title,
        description: input.description,
        sortOrder: input.sortOrder || 0
      }
    });
  }

  async updateModule(id: string, input: UpdateModuleInput) {
    return prisma.courseModule.update({
      where: { id },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        description: input.description !== undefined ? input.description : undefined,
        sortOrder: input.sortOrder !== undefined ? input.sortOrder : undefined
      }
    });
  }

  async deleteModule(id: string) {
    return prisma.courseModule.delete({
      where: { id }
    });
  }

  // Lessons CRUD
  async findLessonById(id: string) {
    return prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });
  }

  async createLesson(moduleId: string, input: CreateLessonInput) {
    return prisma.lesson.create({
      data: {
        moduleId,
        title: input.title,
        lessonType: input.lessonType as any,
        contentUrl: input.contentUrl,
        durationSeconds: input.durationSeconds,
        sortOrder: input.sortOrder || 0,
        isPreview: input.isPreview || false
      }
    });
  }

  async updateLesson(id: string, input: UpdateLessonInput) {
    return prisma.lesson.update({
      where: { id },
      data: {
        title: input.title !== undefined ? input.title : undefined,
        lessonType: input.lessonType !== undefined ? (input.lessonType as any) : undefined,
        contentUrl: input.contentUrl !== undefined ? input.contentUrl : undefined,
        durationSeconds: input.durationSeconds !== undefined ? input.durationSeconds : undefined,
        sortOrder: input.sortOrder !== undefined ? input.sortOrder : undefined,
        isPreview: input.isPreview !== undefined ? input.isPreview : undefined
      }
    });
  }

  async deleteLesson(id: string) {
    return prisma.lesson.delete({
      where: { id }
    });
  }
}

export const courseRepository = new CourseRepository();
export default courseRepository;
