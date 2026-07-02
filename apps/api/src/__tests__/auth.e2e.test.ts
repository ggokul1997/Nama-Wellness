import request from 'supertest';
import app from '../app';
import prisma from '../infrastructure/database/prisma.client';

describe('Auth Endpoints E2E', () => {
  const testStudentEmail = `e2e-student-${Date.now()}@nama.com`;
  const testTeacherEmail = `e2e-teacher-${Date.now()}@nama.com`;
  let studentUserId: string;
  let teacherUserId: string;

  afterAll(async () => {
    // Cleanup created test users
    await prisma.userRole.deleteMany({
      where: {
        userId: { in: [studentUserId, teacherUserId].filter(Boolean) }
      }
    });
    await prisma.profile.deleteMany({
      where: {
        userId: { in: [studentUserId, teacherUserId].filter(Boolean) }
      }
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [studentUserId, teacherUserId].filter(Boolean) }
      }
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should successfully register a student', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testStudentEmail,
          password: 'Password123!',
          phone: '+919999988888',
          firstName: 'John',
          lastName: 'Doe',
          role: 'student'
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('userId');
      expect(res.body.data.email).toBe(testStudentEmail);
      studentUserId = res.body.data.userId;
    });

    it('should successfully register a teacher', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testTeacherEmail,
          password: 'Password123!',
          phone: '+918888899999',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'teacher'
        });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('userId');
      expect(res.body.data.email).toBe(testTeacherEmail);
      teacherUserId = res.body.data.userId;
    });

    it('should reject registration if email is already taken', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: testStudentEmail,
          password: 'Password123!',
          phone: '+919999900000',
          firstName: 'Another',
          lastName: 'User',
          role: 'student'
        });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('User with this email already exists');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login student with correct credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudentEmail,
          password: 'Password123!',
          role: 'student'
        });

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data.user.email).toBe(testStudentEmail);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudentEmail,
          password: 'WrongPassword!',
          role: 'student'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain('Invalid email or password');
    });

    it('should reject login if account is suspended', async () => {
      // Manually set status to suspended in DB
      await prisma.user.update({
        where: { id: studentUserId },
        data: { status: 'suspended' }
      });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testStudentEmail,
          password: 'Password123!',
          role: 'student'
        });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain('suspended');

      // Revert status
      await prisma.user.update({
        where: { id: studentUserId },
        data: { status: 'active' }
      });
    });
  });
});
