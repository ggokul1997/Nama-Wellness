import { Router } from 'express';
import { getHealth } from './health.controller';
import authRouter from '../modules/auth/auth.routes';
import teacherRouter from '../modules/teacher/teacher.routes';
import uploadsRouter from '../modules/uploads/uploads.routes';
import categoryRouter from '../modules/category/category.routes';
import courseRouter from '../modules/course/course.routes';
import enrollmentRouter from '../modules/enrollment/enrollment.routes';
import schedulingRouter from '../modules/scheduling/scheduling.routes';

const router = Router();

router.get('/health', getHealth);
router.use('/auth', authRouter);
router.use('/teacher', teacherRouter);
router.use('/uploads', uploadsRouter);
router.use('/categories', categoryRouter);
router.use('/courses', courseRouter);
router.use('/enrollments', enrollmentRouter);
router.use('/', schedulingRouter);

export default router;
