import prisma from '../../infrastructure/database/prisma.client';
import { enrollmentRepository } from './enrollment.repository';
import { courseRepository } from '../course/course.repository';
import { AdminAssignEnrollmentInput, CorporateEnrollInput, UpdateLessonProgressInput } from '@nama/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

export class EnrollmentService {
  async adminAssignEnrollment(courseId: string, input: AdminAssignEnrollmentInput) {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: input.userId }
    });
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Verify course exists
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // 3. Verify batch belongs to course
    if (input.batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: input.batchId }
      });
      if (!batch || batch.courseId !== courseId) {
        throw new BadRequestError('Invalid batch ID for this course');
      }
    }

    return enrollmentRepository.upsertEnrollment({
      userId: input.userId,
      courseId,
      batchId: input.batchId,
      source: input.source as any
    });
  }

  async corporateEnroll(userId: string, courseId: string, input: CorporateEnrollInput) {
    // 1. Find employee company association
    const employeeLink = await prisma.employeeEnrollment.findFirst({
      where: { userId, status: 'active' }
    });
    if (!employeeLink) {
      throw new ForbiddenError('You are not currently linked to any active corporate company program');
    }

    // 2. Verify course exists
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // 3. Verify batch belongs to course
    if (input.batchId) {
      const batch = await prisma.batch.findUnique({
        where: { id: input.batchId }
      });
      if (!batch || batch.courseId !== courseId) {
        throw new BadRequestError('Invalid batch ID for this course');
      }
    }

    return enrollmentRepository.upsertEnrollment({
      userId,
      courseId,
      batchId: input.batchId,
      companyId: employeeLink.companyId,
      source: 'corporate'
    });
  }

  async getMyEnrollments(userId: string, query: { status?: any; page?: number; limit?: number }) {
    return enrollmentRepository.findMany({
      userId,
      status: query.status,
      page: query.page,
      limit: query.limit
    });
  }

  async getEnrollmentById(userId: string, roles: string[], enrollmentId: string) {
    const enrollment = await enrollmentRepository.findById(enrollmentId);
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = enrollment.userId === userId;
    const isTeacher = enrollment.course.teacherId === userId;

    if (!isAdmin && !isOwner && !isTeacher) {
      throw new ForbiddenError('You do not have permission to view this enrollment details');
    }

    return enrollment;
  }

  async getCourseEnrollments(
    userId: string,
    roles: string[],
    courseId: string,
    query: { page?: number; limit?: number }
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to view enrollments for this course');
    }

    return enrollmentRepository.findMany({
      courseId,
      page: query.page,
      limit: query.limit
    });
  }

  async updateLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string,
    input: UpdateLessonProgressInput
  ) {
    // 1. Verify student is active enrolled in the course
    const enrollment = await enrollmentRepository.findActiveEnrollment(userId, courseId);
    if (!enrollment) {
      throw new ForbiddenError('You are not active enrolled in this course');
    }

    // 2. Verify that the lesson belongs to the course
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true }
    });
    if (!lesson || lesson.module.courseId !== courseId) {
      throw new BadRequestError('Invalid lesson ID for this course');
    }

    return enrollmentRepository.updateLessonProgress(enrollment.id, lessonId, input);
  }
}

export const enrollmentService = new EnrollmentService();
export default enrollmentService;
