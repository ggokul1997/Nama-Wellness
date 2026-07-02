import prisma from '../infrastructure/database/prisma.client';
import logger from '../infrastructure/logger/logger';

export class AIService {
  async getCourseRecommendations(userId: string) {
    logger.info({ userId }, 'Generating personalized course recommendations');

    // 1. Fetch user's current course enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            categoryId: true
          }
        }
      }
    });

    const enrolledCourseIds = enrollments.map((e) => e.courseId);
    const categoryCounts: Record<string, number> = {};

    for (const e of enrollments) {
      if (e.course) {
        const catId = e.course.categoryId;
        categoryCounts[catId] = (categoryCounts[catId] || 0) + 1;
      }
    }

    // Find the student's favorite category ID
    let favoriteCategoryId: string | null = null;
    let maxCount = 0;
    for (const [catId, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        favoriteCategoryId = catId;
      }
    }

    let recommendedCourses: any[] = [];

    // 2. Query matching courses
    if (favoriteCategoryId) {
      // Find courses in the same favorite category that student has not enrolled in yet
      recommendedCourses = await prisma.course.findMany({
        where: {
          status: 'published',
          categoryId: favoriteCategoryId,
          id: {
            notIn: enrolledCourseIds
          }
        },
        take: 3,
        include: {
          category: true,
          teacher: {
            select: {
              email: true,
              profile: true
            }
          }
        }
      });
    }

    // 3. Fallback to default popular published courses if recommended list is small
    if (recommendedCourses.length < 3) {
      const extraCourses = await prisma.course.findMany({
        where: {
          status: 'published',
          id: {
            notIn: [...enrolledCourseIds, ...recommendedCourses.map((c) => c.id)]
          }
        },
        take: 3 - recommendedCourses.length,
        include: {
          category: true,
          teacher: {
            select: {
              email: true,
              profile: true
            }
          }
        }
      });

      recommendedCourses.push(...extraCourses);
    }

    return recommendedCourses.map((c) => {
      const teacherProfile = c.teacher?.profile;
      const teacherName = teacherProfile
        ? `${teacherProfile.firstName} ${teacherProfile.lastName}`.trim()
        : c.teacher?.email || 'NAMA Instructor';

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        coverImageUrl: c.coverImageUrl,
        categoryName: c.category.name,
        teacherName,
        reason: favoriteCategoryId && c.categoryId === favoriteCategoryId
          ? 'Recommended based on your interest in ' + c.category.name
          : 'Popular course on NAMA Wellness'
      };
    });
  }
}

export const aiService = new AIService();
export default aiService;
