Nama Wellness MVP — Checklist
 Step 1: Monorepo Workspace Setup

 Create workspace configuration files (pnpm-workspace.yaml, root package.json, turbo.json, .gitignore)
 Create the workspace directories skeleton (apps/web, apps/api, packages/shared, packages/prisma, packages/config)
 Run pnpm install and verify the workspace setup
 Step 2: Shared ESLint & TypeScript Configurations

 Update @nama/config exports in package.json
 Create TypeScript base, node, and nextjs configurations
 Create ESLint base, node, and nextjs configurations
 Verify configuration package setup
 Step 3: Docker Compose Setup

 Create infrastructure/docker/docker-compose.yml
 Create LocalStack initialization script init-localstack.sh
 Spin up local containers and verify health checks (Note: Pending Docker Desktop daemon startup on host)
 Step 4: Express API Skeleton

 Create package dependencies & tsconfig.json configurations
 Setup entrypoint (index.ts) & Express bootstrap (server.ts, app.ts)
 Setup tracing and error handler middlewares (requestId.ts, errorHandler.ts)
 Setup base health check API endpoint routing
 Run development server and verify the health check endpoint response
 Step 5: Next.js Web Skeleton

 Setup Next 15 & React 19 dependencies in apps/web/package.json and config tsconfig.json
 Create CSS base template (globals.css) and root layout configurations (layout.tsx)
 Create layout ((public)/layout.tsx) and high-fidelity landing page ((public)/page.tsx)
 Compile Next.js build and verify for correctness
 Step 6: Shared Types & Constants

 Configure exports & dependencies in packages/shared/package.json
 Create workspace constants (roles.ts) and API interfaces (api.types.ts, auth.types.ts)
 Create Zod input registration validator (auth.schema.ts)
 Compile TypeScript declarations and build the package
 Step 7: Structured Error Handling & Response Envelope

 Create backend custom error classes (errors.ts)
 Format errorHandler.ts response structure to match ApiErrorResponseEnvelope
 Update health.controller.ts response structure to match ApiResponseEnvelope
 Compile backend Express API and verify compiler check
 Step 8: Structured Logging Integration

 Install pino and pino-http dependencies in apps/api/package.json
 Create infrastructure/logger/logger.ts for pino instance setup
 Add pinoHttp request log logger middleware to Express app in app.ts
 Refactor errorHandler.ts to log errors through Pino
 Spin up API backend and inspect structured JSON logging output
 Step 9: Prisma Package & Identity Schema

 Create packages/prisma/package.json with client dependency & compile scripts
 Create packages/prisma/tsconfig.json
 Create packages/prisma/prisma/schema.prisma with identity models
 Create exported entrypoint in packages/prisma/src/index.ts
 Link @nama/prisma to @nama/api in dependencies
 Run pnpm install and trigger Prisma Client generation
 Compile @nama/prisma typescript declarations
 Verify type resolution builds cleanly
 Step 10: Redis Client & Health Check

 Add ioredis dependency to apps/api/package.json
 Expose Redis configs in apps/api/.env
 Create connection wrapper redis.client.ts in apps/api/src/infrastructure/redis/
 Add Redis status validation within health.controller.ts
 Run API build and inspect degraded connection output
 Step 11: Prisma Migrations & Seeding Setup

 Configure seeder config mapping in packages/prisma/package.json
 Create seeder file packages/prisma/prisma/seed.ts for default Administrator setup
 Run pnpm install to load seeding packages
 Compile @nama/prisma to verify compilation
 Step 12: User Registration API (EdPro)

 Create Prisma client helper prisma.client.ts under @nama/api database infrastructure
 Create Express Zod request validation middleware validate.ts
 Setup auth module components: repository, service, controller, and router files
 Mount routes in routes/index.ts
 Compile backend and verify validation check captures payload errors
 Step 13: User Login API (EdPro)

 Add login validator & type contracts to @nama/shared and compile
 Add jsonwebtoken dependency to @nama/api package.json
 Expose JWT configuration values inside @nama/api/.env
 Implement token generator utilities tokens.ts under @nama/api utils
 Integrate login logic in repository, service, controller, and router files
 Compile backend and verify schema validation matches requirements
 Step 14: Token Refresh API

 Add refresh token validation schema to @nama/shared and compile
 Implement findRefreshToken query in auth.repository.ts
 Add refresh verification and new access token generation logic in auth.service.ts
 Add handleRefresh controller mapping in auth.controller.ts
 Bind refresh router endpoint in auth.routes.ts
 Compile backend and verify validation check captures missing token payloads
 Step 15: Logout API & Authentication Middleware

 Create JWT parser and scope verification middleware auth.middleware.ts
 Implement revokeRefreshToken query inside auth.repository.ts
 Add token revocation logic in auth.service.ts
 Add handleLogout controller wrapper mapping in auth.controller.ts
 Bind logout routes protected by JWT verification filter in auth.routes.ts
 Compile backend and verify authentication blocks unauthenticated logouts
 Step 16: OTP Generation, Hashing & Mock Email Sending

 Add verification validation schema to @nama/shared and compile
 Create OTP generator, hashing, and mock console dispatch utility otp.ts under @nama/api utils
 Integrate OTP database queries inside auth.repository.ts
 Add verification service logic & link registration to send verification emails in auth.service.ts
 Setup verifyEmail handler mapping in auth.controller.ts
 Mount endpoint in auth.routes.ts
 Compile backend and verify verification payload check
 Step 17: Password Reset Request API

 Add password reset request validation schema to @nama/shared and compile
 Implement reset request service logic with user enumeration protection in auth.service.ts
 Setup reset request controller handler in auth.controller.ts
 Mount router endpoint in auth.routes.ts
 Compile backend and verify email validation check
 Step 18: Password Reset Complete API

 Add password reset completion validation schema to @nama/shared and compile
 Implement updateUserPassword query in auth.repository.ts
 Implement reset completion service logic with credentials encryption in auth.service.ts
 Setup reset completion controller mapping in auth.controller.ts
 Mount router endpoint in auth.routes.ts
 Compile backend and verify password reset schema validation matches constraints
 Step 19: Corporate User Registration API

 Define corporate database models inside Prisma schema
 Execute Prisma database migrations using command CLI
 Add corporate registration validation schema to @nama/shared and compile
 Seed default ACME2026 test company configuration details
 Setup corporate user creation and repository mapping queries in auth.repository.ts
 Program corporate user registration service layer handlers in auth.service.ts
 Setup corporate registration controller wrapper mapping in auth.controller.ts
 Bind register corporate route endpoint in auth.routes.ts
 Compile backend and verify payload checks
 Step 20: Teacher Application Submission API

 Define teacher application database models inside Prisma schema
 Execute Prisma database migrations using command CLI
 Add teacher application and document upload validation schemas to @nama/shared and compile
 Create teacher module repository, service, controller, and routing files inside Express API backend
 Mount teacher sub-router inside routes registry file routes/index.ts
 Compile backend and verify authentication and role scope authorization blocks unauthenticated requests
 Step 21: Teacher Applications List, Filter, Get (Admin)

 Setup application list and filter repository queries in teacher.repository.ts
 Program applications listing and individual retrieval service methods in teacher.service.ts
 Configure list and retrieve handler controller endpoints in teacher.controller.ts
 Mount router endpoints with admin authorization constraints in teacher.routes.ts
 Compile backend and verify role restrictions block student calls
 Step 22: Admin Verify Document

 Add document verification status check validation schema to @nama/shared and compile
 Add document lookup and verification updates query inside teacher.repository.ts
 Program verify document service wrapper method in teacher.service.ts
 Configure verify document controller handler inside teacher.controller.ts
 Bind router endpoint protected by admin authorization in teacher.routes.ts
 Compile backend and verify validation schema limits empty request payloads
 Step 23: Admin Schedule Interview

 Define interview database models inside Prisma schema
 Execute Prisma database migrations using command CLI
 Add interview scheduling Zod schema validation checks to @nama/shared and compile
 Setup transactional interview creation repository query in teacher.repository.ts
 Implement interview schedule mapping service action in teacher.service.ts
 Configure schedule interview controller handler mapping in teacher.controller.ts
 Bind router endpoints with admin authorization checks in teacher.routes.ts
 Compile backend and verify schema validation limits empty payloads
 Step 24: Admin Update Interview (notes, outcome)

 Add update interview Zod input schema validation rules to @nama/shared and compile
 Add update interview status and notes record query helpers to teacher.repository.ts
 Program update interview service logic verifying interview association to application in teacher.service.ts
 Configure update interview controller response mapper inside teacher.controller.ts
 Bind router patch endpoint mapping with admin authorization guards in teacher.routes.ts
 Compile backend and verify validation checks limit invalid outcomes
 Step 25: Admin approve/reject application (transitions teacher status to active if approved, allows role upgrade or fee payment)

 Define teacher profile database schemas and performance enum status inside Prisma schema
 Execute Prisma database migrations using command CLI
 Add approve and reject application Zod schema validations to @nama/shared and compile
 Setup transactional application approval and rejection query helpers in teacher.repository.ts
 Program approve and reject service handlers inside teacher.service.ts
 Configure approve and reject controller handler methods inside teacher.controller.ts
 Mount router approve/reject endpoints with admin role filters in teacher.routes.ts
 Compile backend and verify validation schema limits empty rejection reason payloads
 Step 26: Get teacher application review logs (admin)

 Define audit log database models inside Prisma schema
 Execute Prisma database migrations using command CLI
 Integrate audit log insertions inside main teacher onboarding repository transactional queries in teacher.repository.ts
 Add audit logs query lookup method in teacher.repository.ts
 Program get application logs service logic in teacher.service.ts
 Configure get application logs controller response mapper inside teacher.controller.ts
 Bind router get logs route protected by admin authorization in teacher.routes.ts
 Compile backend and verify role restrictions block student requests
 Step 27: S3 client + bucket/key configuration

 Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner dependencies in apps/api/package.json
 Expose AWS and S3 bucket environment variables in apps/api/.env
 Create S3 client configuration mapping custom endpoints for LocalStack in s3.client.ts
 Create bucket routing helper configuration in bucket.config.ts
 Step 28: Presigned upload API (/uploads/presign)

 Create upload presigning service logic wrapping S3 PutObject commands in s3.service.ts
 Create uploads service orchestrator in uploads.service.ts
 Configure presign controller endpoint mapper in uploads.controller.ts
 Mount upload route GET/POST endpoint in uploads.routes.ts and router registry index
 Step 29: MIME type + file size validation per upload purpose

 Add presignUploadSchema Zod validator rules to @nama/shared and compile
 Create validation middleware checks for file size and MIME constraints per purpose in mime-validator.ts
 Compile backend Express API and verify compiler check
 Verify API authorization guards block unauthenticated presigning requests
 Step 30: Phone OTP send + verify (Redis-backed)

 Add sendPhoneOtpSchema and confirmPhoneOtpSchema validation rules to @nama/shared and compile
 Add updateUserPhone repository database updates query helper to auth.repository.ts
 Implement sendPhoneOtp and verifyPhoneOtp Redis service logic inside auth.service.ts
 Configure send and verify phone OTP controller wrappers in auth.controller.ts
 Mount router endpoints protected by JWT authentications in auth.routes.ts
 Compile backend and verify authentication blocks unauthenticated OTP dispatches
 Step 31: Category CRUD API

 Define Category database model in Prisma schema
 Execute Prisma database migrations using command CLI
 Add createCategorySchema and updateCategorySchema Zod validators to @nama/shared and compile
 Create category repository query helpers in category.repository.ts
 Program category business validation logic inside category.service.ts
 Configure category controller request handlers in category.controller.ts
 Mount router GET/POST/PATCH/DELETE endpoints with role authorization guards in category.routes.ts and routes index
 Compile backend and verify category listing returns empty database collection successfully
 Step 32: Course CRUD API

 Define Course database models and CourseType/CourseStatus enums in Prisma schema
 Execute Prisma database migrations using command CLI
 Add createCourseSchema and updateCourseSchema Zod validators to @nama/shared and compile
 Create course repository query helpers in course.repository.ts
 Program course slugification and ownership validation logic inside course.service.ts
 Configure course controller request handlers in course.controller.ts
 Mount router GET/POST/PATCH endpoints with role authorization guards in course.routes.ts and routes index
 Compile backend and verify course listing returns empty database collection successfully
 Step 33: Course modules + lessons CRUD API

 Define CourseModule and Lesson database models and LessonType enum in Prisma schema
 Execute Prisma database migrations using command CLI
 Add createModuleSchema, updateModuleSchema, createLessonSchema, and updateLessonSchema Zod validators to @nama/shared and compile
 Create modules and lessons query and mutation helper methods in course.repository.ts
 Program course module ownership validation check and lesson details filtering in course.service.ts
 Configure modules and lessons controller request handlers in course.controller.ts
 Mount router GET/POST/PATCH/DELETE endpoints for modules and lessons in course.routes.ts
 Compile backend and verify modules retrieval returns not found for invalid course ID successfully
 Step 34: Course Pricing Proposal API

 Define CoursePricing database model and ApprovalStatus enum in Prisma schema
 Execute Prisma database migrations using command CLI
 Add proposePricingSchema and approvePricingSchema Zod validators to @nama/shared and compile
 Create pricing.repository.ts mapping pricing queries and mutations
 Program pricing ownership and transaction-safe approval overrides in course.service.ts
 Configure pricing controller request handlers in course.controller.ts
 Mount router POST /pricing and /approve endpoints with role checks in course.routes.ts
 Compile backend and verify pricing endpoint blocks requests without credentials successfully
 Step 35: Course Review & Publishing Workflow APIs

 Add approveCourseSchema, rejectCourseSchema, requestChangesSchema, and assignTeacherSchema Zod validators to @nama/shared and compile
 Program submit, approve, reject, request-changes, publish, and assign-teacher state transition logic in course.service.ts
 Configure review & publishing controllers request handlers in course.controller.ts
 Mount router POST /submit, /approve, /reject, /request-changes, /publish, /assign-teacher routes in course.routes.ts
 Compile backend and verify course submit endpoint blocks unauthenticated requests successfully
 Step 36: Course Enrollment APIs

 Define Batch and Enrollment database models and enums in Prisma schema
 Execute Prisma database migrations using command CLI
 Add adminAssignEnrollmentSchema and corporateEnrollSchema Zod validators to @nama/shared and compile
 Create enrollment repository query and upsert helpers in enrollment.repository.ts
 Program enrollment business logic and company linking constraints inside enrollment.service.ts
 Configure enrollment controller handlers in enrollment.controller.ts
 Mount router GET/POST endpoints with role checks in enrollment.routes.ts and routes index
 Compile backend and verify enrollment retrieval blocks unauthenticated requests successfully
 Step 37: Lesson Progress Tracking API

 Define LessonProgress database model and relations in Prisma schema
 Execute Prisma database migrations using command CLI
 Add updateLessonProgressSchema Zod validator to @nama/shared and compile
 Create update progress transaction and recalculate enrollment percentage query in repository
 Program progress validation, ownership checks, and active enrollment verification in service
 Configure controller and mount route POST /courses/:courseId/lessons/:lessonId/progress
 Compile backend and verify progress update endpoint blocks unauthenticated requests successfully
 Step 38: Batch CRUD & Class Session CRUD APIs

 Define SessionStatus enum and ClassSession database model and relation in Prisma schema
 Execute Prisma database migrations using command CLI
 Add createBatchSchema, updateBatchSchema, createSessionSchema, and updateSessionSchema Zod validators to @nama/shared and compile
 Create scheduling repository for batch and session queries and mutations
 Program scheduling business logic and Google Meet mock creation inside scheduling service
 Configure batch and session controllers request handlers
 Mount router GET/POST/PATCH endpoints with role checks in route files and routes registry index
 Compile backend and verify scheduling endpoints block unauthenticated requests successfully
 Step 39: Student session listing & calendar retrieval APIs

 Add getSessionsQuerySchema Zod validator to @nama/shared and compile
 Implement student, teacher, and admin calendar query filters in repository
 Program session calendar service routing based on active roles and query parameters
 Configure controller and mount route GET /sessions
 Compile backend and verify calendar listing endpoint blocks unauthenticated requests successfully
 Step 40: Live Class Attendance APIs

 Define AttendanceRecord database model and relations in Prisma schema
 Execute Prisma database migrations using command CLI
 Create attendance repository handling join, leave, session reports, and student logs
 Program session existence, student enrollment checks, and duration math in service
 Configure controllers and mount routing endpoints for attendance
 Compile backend and verify attendance join endpoint blocks unauthenticated requests successfully
 Step 41: Playback Recordings & Replay Limits

 Define Recording, ReplacementRecording, RecordingView, and RecordingAccessOverride models in schema
 Execute Prisma database migrations using command CLI
 Add proposeReplacementRecordingSchema, rejectReplacementSchema, and adminOverrideAccessSchema Zod validators to @nama/shared and compile
 Create recordings repository managing recordings, views, replacements, and overrides
 Program replay counting, active overrides checks, replacement uploads, and approval service actions
 Configure controllers and mount routing endpoints for recordings
 Compile backend and verify recordings endpoints block unauthenticated requests successfully
 Step 42: Teacher Availability & Individual Bookings

 Define BookingStatus enum, TeacherAvailability, and IndividualBooking models in schema
 Execute Prisma database migrations using command CLI
 Add setAvailabilitySchema, bookSessionSchema, and updateBookingSchema Zod validators to @nama/shared and compile
 Create bookings repository managing availability logs and individual booking states
 Program slots chunks extraction, date ranges filtering, meet links creation, and cancellation checks in service
 Configure controllers and mount routing endpoints for bookings
 Compile backend and verify availability endpoint blocks unauthenticated requests successfully
 Step 43: Google Calendar & Meet Integration

 Install googleapis dependency in @nama/api package
 Create Google Calendar service wrapper with Google Meet creation logic and dev environment mock fallbacks
 Integrate Google Calendar service in class session scheduling service workflows
 Integrate Google Calendar service in individual session bookings service workflows
 Step 44: Razorpay Integration & Payments APIs

 Define PaymentGateway, PaymentPurpose, PaymentStatus, OrderStatus, RefundStatus enums and Payment, Order, Refund, PaymentWebhookEvent models in schema
 Execute Prisma database migrations using command CLI
 Add Zod validator schemas for payments, ordering, and refunds to @nama/shared and compile
 Install razorpay dependency in @nama/api package
 Create Razorpay integration service with mock fallbacks
 Create payments repository managing payments, orders, and refund transactions
 Program payments initiating, signature verification, automatic enrollment creations, and pro-rata refund calculations in service
 Configure controllers and mount routing endpoints for payments
 Step 45: Admin Override, Transaction Logs & Audit Log Middleware

 Create auditLogMiddleware helper intercepting successful express responses for sensitive actions logging
 Add Zod validator schema for admin refund overrides to @nama/shared and compile
 Create manualRefundOverride method in payments service implementing direct admin refunds logic
 Configure controllers and mount routing endpoints for refund-override
 Bind audit log middleware to approve/reject refunds, manual refund overrides, and recording access overrides endpoints
 Step 46: Corporate Profile & Employee Invitation Flow

 Add Zod validator schemas for corporate profile CRUD, deactivation, and bulk invites to @nama/shared and compile
 Update registerCorporate method in auth service to automatically mark matching pending invites as accepted
 Create corporate repository supporting companies CRUD, employee lists, invites logs, and analytics stats
 Program invite limits checks, bulk import parsing, and participation dashboard data aggregation in corporate service
 Configure controllers and mount routing endpoints for corporate profiles and corporate/employee analytics
 Step 47: Chat & Real-Time Messages Module

 Add Zod validator schemas for creating conversations and sending messages to @nama/shared and compile
 Create chat repository supporting conversations CRUD, participant validation, message lists, and message creation
 Program conversation creation checks, user participant validation checks, and admin message moderation logic in chat service
 Configure controllers and mount routing endpoints for conversations, messages, and admin message deletes
 Compile backend and verify conversations endpoint blocks unauthenticated requests successfully
 Step 48: Notifications & Email Service Adapter

 Create email service adapter supporting nodemailer transports, HTML templates rendering, and notifications database logging
 Integrate email service triggers inside auth services for email OTPs and password resets
 Integrate email service triggers inside companies services for individual and bulk employee invites
 Configure controllers and mount routing endpoints for user notification log histories
 Compile backend and verify notifications endpoint blocks unauthenticated requests successfully
 Step 49: Background Jobs Queue (BullMQ) & Certificates

 Add Zod validator schema for revoking certificates to @nama/shared and compile
 Create BullMQ background worker executing PDF generation byte mock buffers uploads to S3
 Create certificates repository supporting student certificates retrieval, code lookup verification, and approvals
 Add endpoint completing course enrollments and generating pending certificate records
 Mount routing endpoints for certificates lists, approvals, verification lookups, and revocations
 Boot background workers within backend index.ts bootstrap lifecycle and verify endpoint authentication blocks successfully
 Step 50: Reviews & Moderation APIs

 Create reviews repository supporting submissions, lists, deletions, and average rating updates on TeacherProfile
 Create reviews service validating student course enrollments before permitting rating submissions
 Expose controller handlers and mount public/authorized routes for reviews operations
 Compile backend and verify reviews endpoints behave correctly without authentication
 Step 51: Teacher Earnings & Platform Payouts APIs

 Create Payout and PayoutLineItem models in schema.prisma and apply dev migration
 Add Zod validation schemas for hold payouts and commission configurations to @nama/shared and compile
 Implement payouts repository managing calculations filters and completed booking queries
 Program monthly calculation jobs processing all completed unpaid bookings into pending payouts
 Expose controller handlers and mount authorized routes for payouts listing, details, holds, approvals, and mark-paid transitions
 Compile backend and verify payouts endpoints behave correctly under authorization checks
 Step 52: Analytics Dashboards & AI Recommendation Engine

 Create analytics repository executing db aggregations for Teacher, Employee, Corporate Admin, and platform Admins
 Create OpenAI integration adapter service featuring rule-based local recommendation fallbacks
 Expose controller handlers and mount routes for dashboard stats and recommended courses
 Compile backend and verify recommendations endpoints block unauthenticated requests successfully
 Step 53: Corporate Wellness AI Report Generation

 Create AIReport model in schema.prisma and apply dev migration
 Create validation schemas in @nama/shared and compile
 Implement AI reports repository, service, and background processing worker
 Expose controller handlers and mount routes for AI reports list, generate, and fetch
 Compile backend and verify AI reports endpoints block unauthenticated requests successfully
 Step 54: Admin Moderation, User Suspensions, and Complaint Workflows

 Create Complaint model in schema.prisma and apply dev migration
 Create Zod validation schemas for suspensions, performance management, and complaint filing in @nama/shared and compile
 Implement admin moderation repository and service layer with audit logging support
 Expose controller handlers and mount routes for user status updates, teacher performance, and complaints
 Compile backend and verify admin endpoints block unauthenticated requests successfully
 Step 55: Teacher Onboarding Account Activation Gate

 Implement requireTeacherActivated middleware checking onboarding fee payment status
 Apply requireTeacherActivated protection middleware to course creation, update, and batches routes
 Apply requireTeacherActivated protection middleware to teacher availability setup route
 Compile backend and verify onboarding payment endpoint behaves correctly under authorization checks
 Step 56: Teacher Termination & Active Student Resolution

 Create Zod validation schema for terminating teachers in @nama/shared and compile
 Implement database updates to reject courses, cancel active bookings, and issue automatic refunds upon teacher termination
 Expose controller handlers and mount routes for teacher termination and student resolution
 Compile backend and verify teacher termination endpoint blocks unauthenticated requests successfully
 Step 57: Razorpay Webhook Robust Lookup & Enrollment Processing

 Implement findPaymentByGatewayOrderId fallback lookup for pending webhook transactions
 Configure signature bypass verification specifically for authenticated webhooks in verifyPayment
 Compile backend and verify webhook processing and enrollment integration runs successfully
 Step 58: Google Calendar Events Rescheduling & Cancellation Syncing

 Implement updateCalendarEvent and deleteCalendarEvent methods in googleCalendarService
 Integrate deleteCalendarEvent trigger in bookingsService cancelBooking method
 Integrate updateCalendarEvent trigger in schedulingService updateSession method
 Compile backend and verify calendar update/delete sync integrations build successfully
 Step 59: E2E Test Harness & CI/CD Setup

 Install Jest, Ts-jest, and Supertest dependencies in apps/api
 Configure jest.config.ts and add test scripts to package.json
 Implement auth.e2e.test.ts testing user registration, login, and suspension checks
 Implement bookings.e2e.test.ts testing onboarding gate, payment webhook, auto-enrollment, and calendar sync
 Run all test suites and verify success checks pass
 Step 60: Frontend Authentication Flow

 Create shared API fetch client in apps/web/src/lib/api.ts
 Create auth-store session persistence utility in apps/web/src/lib/auth-store.ts
 Add premium CSS styling rules to apps/web/src/app/globals.css
 Implement login page component (auth/login/page.tsx)
 Implement user signup page component (auth/register/page.tsx)
 Implement employee registration page component (auth/register/corporate/page.tsx)
 Build and verify web application compilation successfully
 Step 61: Teacher Onboarding & Payment Flow

 Implement apply page (teacher/apply/page.tsx)
 Implement payment status & gate page (teacher/onboarding-payment/page.tsx)
 Implement teacher dashboard placeholder with activation checks (teacher/dashboard/page.tsx)
 Build and verify frontend web application compilation successfully
 Step 62: Admin Applications Review Portal

 Implement admin applications list dashboard (admin/applications/page.tsx)
 Implement admin application details page with verification and action gates (admin/applications/[id]/page.tsx)
 Build and verify frontend web application compilation successfully
[/] Step 63: Teacher Course Creation & CRUD Portal

 Implement courses directory list dashboard (teacher/courses/page.tsx)
 Implement new course creation view (teacher/courses/create/page.tsx)
 Implement dynamic course editor with modules, lessons, pricing, batches, and submit gates (teacher/courses/[id]/edit/page.tsx)
 Build and verify frontend web application compilation successfully