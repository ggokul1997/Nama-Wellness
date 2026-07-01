import { courseRepository } from './course.repository';
import { categoryRepository } from '../category/category.repository';
import { CreateCourseInput, UpdateCourseInput, CreateModuleInput, UpdateModuleInput, CreateLessonInput, UpdateLessonInput, ProposePricingInput, ApprovePricingInput, ApproveCourseInput, RejectCourseInput, RequestChangesInput, AssignTeacherInput } from '@nama/shared';
import { pricingRepository } from './pricing.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = slugify(title) || 'course';
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await courseRepository.findBySlug(slug);
    if (!existing) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export class CourseService {
  async getCourses(
    userContext: { userId?: string; roles?: string[] } | undefined,
    query: {
      categoryId?: string;
      courseType?: any;
      search?: string;
      status?: any;
      teacherId?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const isAdmin = userContext?.roles?.includes('admin');
    const isTeacher = userContext?.roles?.includes('teacher');

    const params: any = {
      categoryId: query.categoryId,
      courseType: query.courseType,
      search: query.search,
      page: query.page,
      limit: query.limit
    };

    if (isAdmin) {
      params.status = query.status;
      params.teacherId = query.teacherId;
    } else if (isTeacher && userContext) {
      // Teachers can see their own courses or any published courses
      // Since our simple repository handles single status and single teacherId filters,
      // if querying another status or another teacher's draft, we restrict it.
      if (query.teacherId === userContext.userId) {
        params.teacherId = userContext.userId;
        params.status = query.status;
      } else {
        params.status = 'published';
        params.teacherId = query.teacherId;
      }
    } else {
      // Guest or student can only see published courses
      params.status = 'published';
      params.teacherId = query.teacherId;
    }

    return courseRepository.findMany(params);
  }

  async getCourseById(
    userContext: { userId?: string; roles?: string[] } | undefined,
    id: string
  ) {
    const course = await courseRepository.findById(id);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = userContext?.roles?.includes('admin');
    const isOwner = userContext?.userId && course.teacherId === userContext.userId;

    if (course.status !== 'published' && !isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to view this course');
    }

    return course;
  }

  async createCourse(
    userId: string,
    roles: string[],
    input: CreateCourseInput
  ) {
    // 1. Check category exists
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw new BadRequestError('Invalid category ID');
    }

    // 2. Validate roles and teacherId override
    const isAdmin = roles.includes('admin');
    const isTeacher = roles.includes('teacher');

    if (!isAdmin && !isTeacher) {
      throw new ForbiddenError('Only teachers and admins can create courses');
    }

    const finalizedInput = { ...input };
    if (!isAdmin) {
      finalizedInput.teacherId = userId;
    }

    // 3. Generate unique slug
    const slug = await generateUniqueSlug(input.title);

    return courseRepository.create(userId, finalizedInput, slug);
  }

  async updateCourse(
    userId: string,
    roles: string[],
    courseId: string,
    input: UpdateCourseInput
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to edit this course');
    }

    if (input.categoryId) {
      const category = await categoryRepository.findById(input.categoryId);
      if (!category) {
        throw new BadRequestError('Invalid category ID');
      }
    }

    const finalizedInput = { ...input };
    if (!isAdmin) {
      delete finalizedInput.teacherId; // Teachers cannot reassign courses to others
    }

    return courseRepository.update(courseId, finalizedInput);
  }

  // Modules CRUD operations
  async getModules(
    userContext: { userId?: string; roles?: string[] } | undefined,
    courseId: string
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = userContext?.roles?.includes('admin');
    const isOwner = userContext?.userId && course.teacherId === userContext.userId;

    if (course.status !== 'published' && !isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to view modules for this course');
    }

    const modules = await courseRepository.findModulesByCourseId(courseId);

    // If not admin or owner, mask contentUrl for non-preview lessons
    if (!isAdmin && !isOwner) {
      return modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => ({
          ...l,
          contentUrl: l.isPreview ? l.contentUrl : null
        }))
      }));
    }

    return modules;
  }

  async createModule(
    userId: string,
    roles: string[],
    courseId: string,
    input: CreateModuleInput
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to add modules to this course');
    }

    return courseRepository.createModule(courseId, input);
  }

  async updateModule(
    userId: string,
    roles: string[],
    courseId: string,
    moduleId: string,
    input: UpdateModuleInput
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to edit modules in this course');
    }

    const module = await courseRepository.findModuleById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundError('Module not found in this course');
    }

    return courseRepository.updateModule(moduleId, input);
  }

  async deleteModule(
    userId: string,
    roles: string[],
    courseId: string,
    moduleId: string
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to delete modules in this course');
    }

    const module = await courseRepository.findModuleById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundError('Module not found in this course');
    }

    await courseRepository.deleteModule(moduleId);
  }

  // Lessons CRUD operations
  async createLesson(
    userId: string,
    roles: string[],
    courseId: string,
    moduleId: string,
    input: CreateLessonInput
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to add lessons to this course');
    }

    const module = await courseRepository.findModuleById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundError('Module not found in this course');
    }

    return courseRepository.createLesson(moduleId, input);
  }

  async updateLesson(
    userId: string,
    roles: string[],
    courseId: string,
    moduleId: string,
    lessonId: string,
    input: UpdateLessonInput
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to edit lessons in this course');
    }

    const module = await courseRepository.findModuleById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundError('Module not found in this course');
    }

    const lesson = await courseRepository.findLessonById(lessonId);
    if (!lesson || lesson.moduleId !== moduleId) {
      throw new NotFoundError('Lesson not found in this module');
    }

    return courseRepository.updateLesson(lessonId, input);
  }

  async deleteLesson(
    userId: string,
    roles: string[],
    courseId: string,
    moduleId: string,
    lessonId: string
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to delete lessons in this course');
    }

    const module = await courseRepository.findModuleById(moduleId);
    if (!module || module.courseId !== courseId) {
      throw new NotFoundError('Module not found in this course');
    }

    const lesson = await courseRepository.findLessonById(lessonId);
    if (!lesson || lesson.moduleId !== moduleId) {
      throw new NotFoundError('Lesson not found in this module');
    }

    await courseRepository.deleteLesson(lessonId);
  }

  // Pricing CRUD operations
  async proposePricing(
    userId: string,
    roles: string[],
    courseId: string,
    input: ProposePricingInput
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to propose pricing for this course');
    }

    return pricingRepository.createProposal(courseId, userId, input);
  }

  async approvePricing(
    userId: string,
    roles: string[],
    courseId: string,
    pricingId: string,
    input: ApprovePricingInput
  ) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can approve course pricing');
    }

    const proposal = await pricingRepository.findProposalById(pricingId);
    if (!proposal || proposal.courseId !== courseId) {
      throw new NotFoundError('Pricing proposal not found for this course');
    }

    return pricingRepository.approveProposal(pricingId, userId, input.amount);
  }

  // Course Review & Publishing state transitions
  async submitCourse(userId: string, roles: string[], courseId: string) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    const isOwner = course.teacherId === userId;

    if (!isAdmin && !isOwner) {
      throw new ForbiddenError('You do not have permission to submit this course');
    }

    if (course.status !== 'draft' && course.status !== 'changes_requested') {
      throw new BadRequestError(`Cannot submit course in '${course.status}' status`);
    }

    return courseRepository.update(courseId, { status: 'pending_review' as any });
  }

  async approveCourse(roles: string[], courseId: string, _input: ApproveCourseInput) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can approve courses');
    }

    if (course.status !== 'pending_review') {
      throw new BadRequestError(`Cannot approve course in '${course.status}' status`);
    }

    return courseRepository.update(courseId, { status: 'approved' as any });
  }

  async rejectCourse(roles: string[], courseId: string, input: RejectCourseInput) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can reject courses');
    }

    if (course.status !== 'pending_review') {
      throw new BadRequestError(`Cannot reject course in '${course.status}' status`);
    }

    return courseRepository.update(courseId, { 
      status: 'rejected' as any,
      rejectedReason: input.reason
    });
  }

  async requestChanges(roles: string[], courseId: string, input: RequestChangesInput) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can request changes for courses');
    }

    if (course.status !== 'pending_review') {
      throw new BadRequestError(`Cannot request changes for course in '${course.status}' status`);
    }

    return courseRepository.update(courseId, { 
      status: 'changes_requested' as any,
      rejectedReason: input.feedback
    });
  }

  async publishCourse(roles: string[], courseId: string) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can publish courses');
    }

    if (course.status !== 'approved') {
      throw new BadRequestError(`Only approved courses can be published. Current status is '${course.status}'`);
    }

    return courseRepository.update(courseId, { 
      status: 'published' as any,
      publishedAt: new Date()
    });
  }

  async assignTeacher(roles: string[], courseId: string, input: AssignTeacherInput) {
    const course = await courseRepository.findById(courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      throw new ForbiddenError('Only admins can assign teachers to courses');
    }

    return courseRepository.update(courseId, { 
      teacherId: input.teacherId
    });
  }
}

export const courseService = new CourseService();
export default courseService;
