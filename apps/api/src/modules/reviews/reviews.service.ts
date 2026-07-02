import { reviewsRepository } from './reviews.repository';
import prisma from '../../infrastructure/database/prisma.client';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { SubmitReviewInput } from '@nama/shared';

export class ReviewsService {
  async submitReview(studentUserId: string, teacherId: string, input: SubmitReviewInput) {
    const course = await prisma.course.findUnique({
      where: { id: input.courseId }
    });

    if (!course) {
      throw new NotFoundError('Course not found');
    }

    if (course.teacherId !== teacherId) {
      throw new BadRequestError('This course is not taught by the specified teacher');
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: { userId: studentUserId, courseId: input.courseId }
    });

    if (!enrollment) {
      throw new ForbiddenError('You can only submit reviews for courses you are enrolled in');
    }

    const review = await reviewsRepository.createReview({
      studentId: studentUserId,
      teacherId,
      courseId: input.courseId,
      rating: input.rating,
      comment: input.comment
    });

    await reviewsRepository.updateTeacherAverageRating(teacherId);

    return {
      id: review.id,
      rating: review.rating,
      status: review.status
    };
  }

  async getTeacherReviews(teacherId: string) {
    // Verify teacher profile exists
    const teacher = await prisma.user.findFirst({
      where: { id: teacherId }
    });

    if (!teacher) {
      throw new NotFoundError('Teacher not found');
    }

    const reviews = await reviewsRepository.findReviewsByTeacherId(teacherId);

    return reviews.map((r) => {
      const profile = r.student.profile;
      const studentName = profile
        ? `${profile.firstName} ${profile.lastName.substring(0, 1)}.`
        : r.student.email.split('@')[0];

      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment || '',
        studentName,
        createdAt: r.createdAt
      };
    });
  }

  async deleteReview(_adminUserId: string, reviewId: string, _reason: string) {
    const review = await reviewsRepository.findReviewById(reviewId);
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    await reviewsRepository.deleteReview(reviewId);
    await reviewsRepository.updateTeacherAverageRating(review.teacherId);

    return {
      id: reviewId,
      status: 'revoked'
    };
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;
