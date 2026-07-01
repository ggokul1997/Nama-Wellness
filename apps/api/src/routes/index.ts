import { Router } from 'express';
import { getHealth } from './health.controller';
import authRouter from '../modules/auth/auth.routes';
import teacherRouter from '../modules/teacher/teacher.routes';
import uploadsRouter from '../modules/uploads/uploads.routes';
import categoryRouter from '../modules/category/category.routes';
import courseRouter from '../modules/course/course.routes';
import enrollmentRouter from '../modules/enrollment/enrollment.routes';
import schedulingRouter from '../modules/scheduling/scheduling.routes';
import attendanceRouter from '../modules/attendance/attendance.routes';
import recordingsRouter from '../modules/recordings/recordings.routes';
import bookingsRouter from '../modules/bookings/bookings.routes';
import paymentsRouter from '../modules/payments/payments.routes';
import companiesRouter from '../modules/companies/companies.routes';

const router = Router();

router.get('/health', getHealth);
router.use('/auth', authRouter);
router.use('/teacher', teacherRouter);
router.use('/uploads', uploadsRouter);
router.use('/categories', categoryRouter);
router.use('/courses', courseRouter);
router.use('/enrollments', enrollmentRouter);
router.use('/', schedulingRouter);
router.use('/', attendanceRouter);
router.use('/', recordingsRouter);
router.use('/', bookingsRouter);
router.use('/', paymentsRouter);
router.use('/', companiesRouter);

export default router;
