import { Router } from 'express';
import { 
  handleGetCourses, 
  handleGetCourseById, 
  handleCreateCourse, 
  handleUpdateCourse,
  handleGetModules,
  handleCreateModule,
  handleUpdateModule,
  handleDeleteModule,
  handleCreateLesson,
  handleUpdateLesson,
  handleDeleteLesson,
  handleProposePricing,
  handleApprovePricing,
  handleSubmitCourse,
  handleApproveCourse,
  handleRejectCourse,
  handleRequestChanges,
  handlePublishCourse,
  handleAssignTeacher
} from './course.controller';
import {
  handleAdminAssignEnrollment,
  handleCorporateEnroll,
  handleGetCourseEnrollments,
  handleUpdateLessonProgress
} from '../enrollment/enrollment.controller';
import {
  handleGetBatches,
  handleCreateBatch
} from '../scheduling/scheduling.controller';
import { 
  createCourseSchema, 
  updateCourseSchema,
  createModuleSchema,
  updateModuleSchema,
  createLessonSchema,
  updateLessonSchema,
  proposePricingSchema,
  approvePricingSchema,
  approveCourseSchema,
  rejectCourseSchema,
  requestChangesSchema,
  assignTeacherSchema,
  adminAssignEnrollmentSchema,
  corporateEnrollSchema,
  updateLessonProgressSchema,
  createBatchSchema
} from '@nama/shared';
import { validate } from '../../middleware/validate';
import { authenticate, requireRole, optionalAuthenticate } from '../../middleware/auth.middleware';

const router = Router();

// Public/Optional auth routes
router.get('/', optionalAuthenticate, handleGetCourses);
router.get('/:courseId', optionalAuthenticate, handleGetCourseById);
router.get('/:courseId/modules', optionalAuthenticate, handleGetModules);

// Teacher/Admin routes
router.post('/', authenticate, requireRole(['teacher', 'admin']), validate(createCourseSchema), handleCreateCourse);
router.patch('/:courseId', authenticate, requireRole(['teacher', 'admin']), validate(updateCourseSchema), handleUpdateCourse);

// Modules CRUD routes
router.post('/:courseId/modules', authenticate, requireRole(['teacher', 'admin']), validate(createModuleSchema), handleCreateModule);
router.patch('/:courseId/modules/:moduleId', authenticate, requireRole(['teacher', 'admin']), validate(updateModuleSchema), handleUpdateModule);
router.delete('/:courseId/modules/:moduleId', authenticate, requireRole(['teacher', 'admin']), handleDeleteModule);

// Lessons CRUD routes
router.post('/:courseId/modules/:moduleId/lessons', authenticate, requireRole(['teacher', 'admin']), validate(createLessonSchema), handleCreateLesson);
router.patch('/:courseId/modules/:moduleId/lessons/:lessonId', authenticate, requireRole(['teacher', 'admin']), validate(updateLessonSchema), handleUpdateLesson);
router.delete('/:courseId/modules/:moduleId/lessons/:lessonId', authenticate, requireRole(['teacher', 'admin']), handleDeleteLesson);

// Pricing CRUD routes
router.post('/:courseId/pricing', authenticate, requireRole(['teacher', 'admin']), validate(proposePricingSchema), handleProposePricing);
router.post('/:courseId/pricing/:pricingId/approve', authenticate, requireRole(['admin']), validate(approvePricingSchema), handleApprovePricing);

// Course Review & Publishing state transitions routes
router.post('/:courseId/submit', authenticate, requireRole(['teacher', 'admin']), handleSubmitCourse);
router.post('/:courseId/approve', authenticate, requireRole(['admin']), validate(approveCourseSchema), handleApproveCourse);
router.post('/:courseId/reject', authenticate, requireRole(['admin']), validate(rejectCourseSchema), handleRejectCourse);
router.post('/:courseId/request-changes', authenticate, requireRole(['admin']), validate(requestChangesSchema), handleRequestChanges);
router.post('/:courseId/publish', authenticate, requireRole(['admin']), handlePublishCourse);
router.post('/:courseId/assign-teacher', authenticate, requireRole(['admin']), validate(assignTeacherSchema), handleAssignTeacher);

// Course enrollment routes
router.post('/:courseId/enroll/assign', authenticate, requireRole(['admin']), validate(adminAssignEnrollmentSchema), handleAdminAssignEnrollment);
router.post('/:courseId/enroll/corporate', authenticate, requireRole(['employee', 'admin']), validate(corporateEnrollSchema), handleCorporateEnroll);
router.get('/:courseId/enrollments', authenticate, requireRole(['teacher', 'admin']), handleGetCourseEnrollments);

// Lesson progress tracking
router.post('/:courseId/lessons/:lessonId/progress', authenticate, requireRole(['student', 'employee']), validate(updateLessonProgressSchema), handleUpdateLessonProgress);

// Course batches routes
router.get('/:courseId/batches', authenticate, handleGetBatches);
router.post('/:courseId/batches', authenticate, requireRole(['teacher', 'admin']), validate(createBatchSchema), handleCreateBatch);

export default router;
