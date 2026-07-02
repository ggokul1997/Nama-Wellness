import prisma from '../../infrastructure/database/prisma.client';

export class ReviewsRepository {
  async createReview(data: {
    studentId: string;
    teacherId: string;
    courseId: string;
    rating: number;
    comment?: string;
  }) {
    return prisma.review.create({
      data: {
        studentId: data.studentId,
        teacherId: data.teacherId,
        courseId: data.courseId,
        rating: data.rating,
        comment: data.comment,
        status: 'active' // Set active by default matching api-spec
      }
    });
  }

  async findReviewsByTeacherId(teacherId: string) {
    return prisma.review.findMany({
      where: { teacherId, status: 'active' },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findReviewById(id: string) {
    return prisma.review.findUnique({
      where: { id }
    });
  }

  async deleteReview(id: string) {
    return prisma.review.update({
      where: { id },
      data: { status: 'deleted' }
    });
  }

  async updateTeacherAverageRating(teacherId: string) {
    const aggregate = await prisma.review.aggregate({
      where: { teacherId, status: 'active' },
      _avg: { rating: true },
      _count: { id: true }
    });

    const averageRating = aggregate._avg.rating || 0;
    const totalReviews = aggregate._count.id || 0;

    // Check if TeacherProfile exists for this userId
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: teacherId }
    });

    if (profile) {
      await prisma.teacherProfile.update({
        where: { userId: teacherId },
        data: {
          averageRating,
          totalReviews
        }
      });
    }
  }
}

export const reviewsRepository = new ReviewsRepository();
export default reviewsRepository;
