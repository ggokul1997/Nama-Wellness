import { z } from 'zod';
import { USER_ROLES } from '../constants/roles';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum([USER_ROLES.STUDENT, USER_ROLES.TEACHER], {
    errorMap: () => ({ message: 'Role must be student or teacher' })
  })
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum([
    USER_ROLES.STUDENT,
    USER_ROLES.TEACHER,
    USER_ROLES.ADMIN,
    USER_ROLES.EMPLOYEE,
    USER_ROLES.COMPANY_ADMIN
  ], {
    errorMap: () => ({ message: 'Invalid login role scope' })
  })
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export const verifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be exactly 6 digits')
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const passwordResetCompleteSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'Verification code must be exactly 6 digits'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
});

export const registerCorporateSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyCode: z.string().min(1, 'Company code is required'),
  role: z.enum([USER_ROLES.EMPLOYEE, USER_ROLES.COMPANY_ADMIN], {
    errorMap: () => ({ message: 'Role must be employee or company_admin' })
  })
});

export const createApplicationSchema = z.object({
  specialties: z.array(z.string()).min(1, 'At least one specialty is required'),
  bio: z.string().min(10, 'Bio must be at least 10 characters long').optional()
});

export const uploadDocumentSchema = z.object({
  documentType: z.enum(['government_id', 'certification', 'experience_proof', 'profile_photo']),
  fileUrl: z.string().url('Invalid file URL'),
  fileName: z.string().min(1, 'File name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSizeBytes: z.number().int().positive('File size must be positive')
});

export const verifyDocumentSchema = z.object({
  verified: z.boolean({
    required_error: 'Verified status is required'
  })
});

export const scheduleInterviewSchema = z.object({
  scheduledAt: z.string().datetime({ message: 'Invalid ISO datetime format' })
});

export const updateInterviewSchema = z.object({
  outcome: z.enum(['pending', 'passed', 'failed'], {
    required_error: 'Outcome status is required'
  }),
  notes: z.string().optional()
});

export const approveApplicationSchema = z.object({
  notes: z.string().optional()
});

export const rejectApplicationSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
  notes: z.string().optional()
});

export const presignUploadSchema = z.object({
  purpose: z.enum(['avatar', 'document', 'material', 'assignment', 'recording', 'chat'], {
    required_error: 'Purpose is required'
  }),
  fileName: z.string().min(1, 'File name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSizeBytes: z.number().int().positive('File size must be positive')
});

export const sendPhoneOtpSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number format')
});

export const confirmPhoneOtpSchema = z.object({
  phone: z.string().min(10, 'Invalid phone number format'),
  otp: z.string().length(6, 'OTP must be exactly 6 characters')
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetCompleteInput = z.infer<typeof passwordResetCompleteSchema>;
export type RegisterCorporateInput = z.infer<typeof registerCorporateSchema>;
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UploadDocumentInput = z.infer<typeof uploadDocumentSchema>;
export type VerifyDocumentInput = z.infer<typeof verifyDocumentSchema>;
export type ScheduleInterviewInput = z.infer<typeof scheduleInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
export type ApproveApplicationInput = z.infer<typeof approveApplicationSchema>;
export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;
export type PresignUploadInput = z.infer<typeof presignUploadSchema>;
export type SendPhoneOtpInput = z.infer<typeof sendPhoneOtpSchema>;
export type ConfirmPhoneOtpInput = z.infer<typeof confirmPhoneOtpSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-_]+$/, 'Slug must be URL-safe (lowercase, numbers, hyphens, underscores)'),
  description: z.string().optional(),
  iconUrl: z.string().url('Invalid icon URL').nullable().optional(),
  sortOrder: z.number().int().optional()
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional()
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().min(1, 'Description is required'),
  courseType: z.enum(['live', 'recorded', 'hybrid', 'individual']),
  categoryId: z.string().uuid('Invalid category ID'),
  coverImageUrl: z.string().url('Invalid cover image URL').nullable().optional(),
  teacherId: z.string().uuid('Invalid teacher ID').optional()
});

export const updateCourseSchema = createCourseSchema.partial();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export const createModuleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().optional()
});

export const updateModuleSchema = createModuleSchema.partial();

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  lessonType: z.enum(['video', 'document', 'live']),
  contentUrl: z.string().optional().nullable(),
  durationSeconds: z.number().int().positive().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isPreview: z.boolean().optional()
});

export const updateLessonSchema = createLessonSchema.partial();

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export const proposePricingSchema = z.object({
  amount: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a positive decimal number')]),
  currency: z.string().length(3).default('INR')
});

export const approvePricingSchema = z.object({
  amount: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a positive decimal number')]).optional()
});

export type ProposePricingInput = z.infer<typeof proposePricingSchema>;
export type ApprovePricingInput = z.infer<typeof approvePricingSchema>;

export const approveCourseSchema = z.object({
  notes: z.string().optional()
});

export const rejectCourseSchema = z.object({
  reason: z.string().min(1, 'Reason is required')
});

export const requestChangesSchema = z.object({
  feedback: z.string().min(1, 'Feedback is required')
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().uuid('Invalid teacher ID')
});

export type ApproveCourseInput = z.infer<typeof approveCourseSchema>;
export type RejectCourseInput = z.infer<typeof rejectCourseSchema>;
export type RequestChangesInput = z.infer<typeof requestChangesSchema>;
export type AssignTeacherInput = z.infer<typeof assignTeacherSchema>;

export const adminAssignEnrollmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  batchId: z.string().uuid('Invalid batch ID').optional().nullable(),
  source: z.enum(['admin_assigned', 'reassignment']).default('admin_assigned')
});

export const corporateEnrollSchema = z.object({
  batchId: z.string().uuid('Invalid batch ID').optional().nullable()
});

export type AdminAssignEnrollmentInput = z.infer<typeof adminAssignEnrollmentSchema>;
export type CorporateEnrollInput = z.infer<typeof corporateEnrollSchema>;

export const updateLessonProgressSchema = z.object({
  progressPercent: z.number().min(0).max(100),
  lastPositionSeconds: z.number().int().nonnegative().optional().nullable(),
  completed: z.boolean()
});

export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;

export const createBatchSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  capacity: z.number().int().positive('Capacity must be positive'),
  startDate: z.string().datetime({ message: 'Invalid start date format' }),
  endDate: z.string().datetime({ message: 'Invalid end date format' }).optional().nullable()
});

export const updateBatchSchema = createBatchSchema.partial().extend({
  status: z.enum(['upcoming', 'active', 'completed', 'cancelled']).optional()
});

export const createSessionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  scheduledAt: z.string().datetime({ message: 'Invalid scheduled time' }),
  durationMinutes: z.number().int().positive('Duration must be positive')
});

export const updateSessionSchema = createSessionSchema.partial().extend({
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  startedAt: z.string().datetime().optional().nullable(),
  endedAt: z.string().datetime().optional().nullable(),
  meetLink: z.string().url().optional().nullable(),
  calendarEventId: z.string().optional().nullable()
});

export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type CreateSessionInput = z.infer<typeof createSessionSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

export const getSessionsQuerySchema = z.object({
  startDate: z.string().datetime({ message: 'Invalid start date format' }).optional(),
  endDate: z.string().datetime({ message: 'Invalid end date format' }).optional()
});

export type GetSessionsQueryInput = z.infer<typeof getSessionsQuerySchema>;
