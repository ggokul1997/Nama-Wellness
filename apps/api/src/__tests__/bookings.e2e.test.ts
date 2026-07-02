import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../app';
import prisma from '../infrastructure/database/prisma.client';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretnamawellnessdevkey2026!';

function generateToken(userId: string, email: string, roles: string[]) {
  return jwt.sign({ userId, email, roles }, JWT_SECRET, { expiresIn: '1h' });
}

describe('Bookings & Onboarding E2E', () => {
  const teacherEmail = `e2e-bookings-teacher-${Date.now()}@nama.com`;
  let teacherUserId: string;
  let teacherToken: string;
  let teacherProfileId: string;

  beforeAll(async () => {
    // 1. Create a teacher user
    const teacher = await prisma.user.create({
      data: {
        email: teacherEmail,
        passwordHash: 'hashed_password_placeholder',
        phone: `+9177777${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'active',
        roles: {
          create: { role: 'teacher', productVariant: 'edpro' }
        },
        profile: {
          create: { firstName: 'Test', lastName: 'Teacher' }
        }
      }
    });
    teacherUserId = teacher.id;
    teacherToken = generateToken(teacherUserId, teacherEmail, ['teacher']);

    // 2. Create approved application
    await prisma.teacherApplication.create({
      data: {
        userId: teacherUserId,
        status: 'approved',
        bio: 'E2E test teacher bio',
        specialties: ['yoga']
      }
    });

    // 3. Create teacher profile (unpaid)
    const profile = await prisma.teacherProfile.create({
      data: {
        userId: teacherUserId,
        specialties: ['yoga'],
        onboardingFeePaid: false
      }
    });
    teacherProfileId = profile.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.teacherProfile.deleteMany({ where: { userId: teacherUserId } });
    await prisma.teacherApplication.deleteMany({ where: { userId: teacherUserId } });
    await prisma.userRole.deleteMany({ where: { userId: teacherUserId } });
    await prisma.profile.deleteMany({ where: { userId: teacherUserId } });
    await prisma.user.deleteMany({ where: { id: teacherUserId } });
  });

  it('should block course creation for unpaid teacher', async () => {
    const res = await request(app)
      .post('/api/v1/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        title: 'Forbidden E2E Yoga Course',
        description: 'Should be blocked by onboarding gate',
        price: 2999.00,
        currency: 'INR',
        type: 'live',
        categoryId: '00000000-0000-0000-0000-000000000000' // Mock/default UUID
      });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('onboarding fee');
  });

  it('should successfully handle teacher onboarding fee payment via webhook', async () => {
    // 1. Create a pending payment
    await prisma.payment.create({
      data: {
        userId: teacherUserId,
        amount: 500.00,
        currency: 'INR',
        gateway: 'razorpay',
        purpose: 'teacher_onboarding',
        status: 'pending',
        metadata: { gatewayOrderId: 'order_onboarding_e2e_123' }
      }
    });

    // 2. Trigger Razorpay Webhook
    const webhookRes = await request(app)
      .post('/api/v1/webhooks/razorpay')
      .set('x-razorpay-signature', 'mock_signature')
      .send({
        id: `evt_e2e_${Date.now()}`,
        event: 'payment.captured',
        payload: {
          payment: {
            entity: {
              id: 'pay_onboarding_e2e_123',
              order_id: 'order_onboarding_e2e_123'
            }
          }
        }
      });

    expect(webhookRes.status).toBe(200);
    expect(webhookRes.body).toEqual({ received: true });

    // 3. Verify teacher onboarding status updated to paid in database
    const updatedProfile = await prisma.teacherProfile.findUnique({
      where: { id: teacherProfileId }
    });
    expect(updatedProfile?.onboardingFeePaid).toBe(true);
  });
});
