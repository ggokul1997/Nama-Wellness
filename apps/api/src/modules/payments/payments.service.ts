import prisma from '../../infrastructure/database/prisma.client';
import { paymentsRepository } from './payments.repository';
import { courseRepository } from '../course/course.repository';
import { enrollmentRepository } from '../enrollment/enrollment.repository';
import { razorpayService } from '../../services/razorpay.service';
import {
  InitiateCoursePaymentInput,
  InitiateOnboardingPaymentInput,
  InitiateSubscriptionPaymentInput,
  VerifyPaymentInput
} from '@nama/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

export class PaymentsService {
  async initiateCoursePayment(userId: string, input: InitiateCoursePaymentInput) {
    const course = await courseRepository.findById(input.courseId);
    if (!course) {
      throw new NotFoundError('Course not found');
    }

    // Find current approved course pricing or fallback
    const pricing = await prisma.coursePricing.findFirst({
      where: {
        courseId: input.courseId,
        isCurrent: true,
        approvalStatus: 'approved'
      }
    });

    const amount = pricing ? Number(pricing.amount) : 2999.00;
    const currency = pricing ? pricing.currency : 'INR';

    // Create payment
    const payment = await paymentsRepository.createPayment({
      userId,
      amount,
      currency,
      gateway: input.gateway,
      purpose: 'course_purchase',
      status: 'pending'
    });

    // Create order
    const order = await paymentsRepository.createOrder({
      userId,
      courseId: input.courseId,
      paymentId: payment.id,
      totalAmount: amount,
      currency,
      status: 'pending'
    });

    // Call Razorpay Order API
    const receipt = `course_${order.id.substring(0, 8)}`;
    const rpOrder = await razorpayService.createOrder(amount, currency, receipt);

    // Save gateway order ID to payment metadata
    await paymentsRepository.updatePaymentStatus(payment.id, {
      status: 'pending',
      metadata: { gatewayOrderId: rpOrder.id }
    });

    return {
      paymentId: payment.id,
      orderId: order.id,
      gatewayOrderId: rpOrder.id,
      amount: amount.toFixed(2),
      currency,
      checkoutUrl: 'https://checkout.razorpay.com/v1/checkout.js'
    };
  }

  async initiateOnboardingPayment(userId: string, input: InitiateOnboardingPaymentInput) {
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId }
    });
    if (!teacherProfile) {
      throw new BadRequestError('Teacher profile not found');
    }

    const amount = 500.00;
    const currency = 'INR';

    const payment = await paymentsRepository.createPayment({
      userId,
      amount,
      currency,
      gateway: input.gateway,
      purpose: 'teacher_onboarding',
      status: 'pending'
    });

    const receipt = `onboarding_${payment.id.substring(0, 8)}`;
    const rpOrder = await razorpayService.createOrder(amount, currency, receipt);

    await paymentsRepository.updatePaymentStatus(payment.id, {
      status: 'pending',
      metadata: { gatewayOrderId: rpOrder.id }
    });

    return {
      paymentId: payment.id,
      amount: amount.toFixed(2),
      currency,
      checkoutUrl: 'https://checkout.razorpay.com/v1/checkout.js'
    };
  }

  async initiateSubscriptionPayment(userId: string, input: InitiateSubscriptionPaymentInput) {
    const admin = await prisma.companyAdmin.findFirst({
      where: { userId }
    });
    if (!admin) {
      throw new ForbiddenError('Only company admins can purchase corporate subscriptions');
    }

    // Determine amount and limit based on tier
    let amount = 10000.00;
    let employeeLimit = 25;
    if (input.tier === 'up_to_10') {
      amount = 5000.00;
      employeeLimit = 10;
    } else if (input.tier === 'up_to_25') {
      amount = 10000.00;
      employeeLimit = 25;
    } else if (input.tier === 'up_to_50') {
      amount = 18000.00;
      employeeLimit = 50;
    } else if (input.tier === 'up_to_100') {
      amount = 30000.00;
      employeeLimit = 100;
    } else if (input.tier === 'custom') {
      amount = 50000.00;
      employeeLimit = 500;
    }

    const currency = 'INR';

    const payment = await paymentsRepository.createPayment({
      userId,
      amount,
      currency,
      gateway: input.gateway,
      purpose: 'corporate_subscription',
      status: 'pending'
    });

    const order = await paymentsRepository.createOrder({
      userId,
      companyId: admin.companyId,
      paymentId: payment.id,
      totalAmount: amount,
      currency,
      status: 'pending'
    });

    const receipt = `subscription_${order.id.substring(0, 8)}`;
    const rpOrder = await razorpayService.createOrder(amount, currency, receipt);

    await paymentsRepository.updatePaymentStatus(payment.id, {
      status: 'pending',
      metadata: { gatewayOrderId: rpOrder.id, employeeLimit }
    });

    return {
      paymentId: payment.id,
      subscriptionId: order.id,
      amount: amount.toFixed(2),
      checkoutUrl: 'https://checkout.razorpay.com/v1/checkout.js'
    };
  }

  async verifyPayment(_userId: string, input: VerifyPaymentInput) {
    const payment = await paymentsRepository.findPaymentById(input.paymentId);
    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    const metadata = payment.metadata as any;
    const gatewayOrderId = metadata?.gatewayOrderId || '';

    // Verify signature
    const isValid = razorpayService.verifySignature(gatewayOrderId, input.gatewayPaymentId, input.gatewaySignature);
    if (!isValid) {
      await paymentsRepository.updatePaymentStatus(payment.id, { status: 'failed' });
      const order = await prisma.order.findFirst({ where: { paymentId: payment.id } });
      if (order) {
        await paymentsRepository.updateOrderStatus(order.id, { status: 'failed' });
      }
      throw new BadRequestError('Invalid signature verification failed');
    }

    // Success flow
    await paymentsRepository.updatePaymentStatus(payment.id, {
      status: 'completed',
      gatewayPaymentId: input.gatewayPaymentId,
      completedAt: new Date()
    });

    const order = await prisma.order.findFirst({ where: { paymentId: payment.id } });
    if (order) {
      await paymentsRepository.updateOrderStatus(order.id, { status: 'paid' });

      // Action based on payment purpose
      if (payment.purpose === 'course_purchase' && order.courseId) {
        // Enrolling student: fetch or assign a batch
        const batch = await prisma.batch.findFirst({ where: { courseId: order.courseId } });
        await enrollmentRepository.upsertEnrollment({
          userId: order.userId,
          courseId: order.courseId,
          batchId: batch?.id || null,
          source: 'purchase',
          orderId: order.id
        });
      } else if (payment.purpose === 'teacher_onboarding') {
        await prisma.teacherProfile.update({
          where: { userId: payment.userId },
          data: { onboardingFeePaid: true }
        });
      } else if (payment.purpose === 'corporate_subscription' && order.companyId) {
        const employeeLimit = metadata?.employeeLimit || 25;
        await prisma.company.update({
          where: { id: order.companyId },
          data: { status: 'active', employeeLimit }
        });
      }
    }

    return { success: true };
  }

  async getMyPayments(userId: string) {
    return paymentsRepository.getMyPayments(userId);
  }

  async getMyOrders(userId: string) {
    return paymentsRepository.getMyOrders(userId);
  }

  async getAdminPayments(status?: any, purpose?: any) {
    return paymentsRepository.getAllPayments({ status, purpose });
  }

  async getAdminOrders() {
    return paymentsRepository.getAllOrders();
  }

  async requestRefund(userId: string, orderId: string, reason: string) {
    const order = await paymentsRepository.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('You can only request refunds for your own orders');
    }

    if (order.status !== 'paid') {
      throw new BadRequestError('Only paid orders can be refunded');
    }

    if (!order.paymentId) {
      throw new BadRequestError('Payment record not found for this order');
    }

    // Eligibility check: within 3 days of classStartDate
    let withinRefundWindow = true;
    if (order.classStartDate) {
      const now = new Date();
      const classStart = new Date(order.classStartDate);
      const diffTime = Math.abs(now.getTime() - classStart.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 3) {
        withinRefundWindow = false;
      }
    }

    const refund = await paymentsRepository.createRefund({
      orderId,
      paymentId: order.paymentId,
      amount: Number(order.totalAmount),
      reason,
      status: 'requested',
      requestedBy: userId,
      withinRefundWindow
    });

    return {
      id: refund.id,
      status: refund.status,
      withinRefundWindow
    };
  }

  async approveRefund(adminId: string, refundId: string) {
    const refund = await paymentsRepository.getRefundById(refundId);
    if (!refund) {
      throw new NotFoundError('Refund not found');
    }

    if (refund.status !== 'requested') {
      throw new BadRequestError('Refund is not in requested status');
    }

    const gatewayRefundId = `ref_${Math.random().toString(36).substring(2, 12)}`;

    // Update refund
    await paymentsRepository.updateRefundStatus(refundId, {
      status: 'approved',
      approvedBy: adminId,
      gatewayRefundId,
      processedAt: new Date()
    });

    // Update order status
    await paymentsRepository.updateOrderStatus(refund.orderId, { status: 'refunded' });

    // Update payment status
    await paymentsRepository.updatePaymentStatus(refund.paymentId, { status: 'refunded' });

    // Update enrollment status
    if (refund.order.courseId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: refund.order.userId,
          courseId: refund.order.courseId
        }
      });
      if (enrollment) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'refunded' }
        });
      }
    }

    return {
      id: refundId,
      status: 'approved'
    };
  }

  async rejectRefund(adminId: string, refundId: string, _reason: string) {
    const refund = await paymentsRepository.getRefundById(refundId);
    if (!refund) {
      throw new NotFoundError('Refund not found');
    }

    if (refund.status !== 'requested') {
      throw new BadRequestError('Refund is not in requested status');
    }

    await paymentsRepository.updateRefundStatus(refundId, {
      status: 'rejected',
      approvedBy: adminId,
      processedAt: new Date()
    });

    return {
      id: refundId,
      status: 'rejected'
    };
  }

  async manualRefundOverride(adminId: string, orderId: string, reason: string) {
    const order = await paymentsRepository.getOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status !== 'paid') {
      throw new BadRequestError('Only paid orders can be manually overridden for refund');
    }

    if (!order.paymentId) {
      throw new BadRequestError('Payment record not found for this order');
    }

    const gatewayRefundId = `ref_override_${Math.random().toString(36).substring(2, 12)}`;

    const refund = await paymentsRepository.createRefund({
      orderId,
      paymentId: order.paymentId,
      amount: Number(order.totalAmount),
      reason: `[Manual Override] ${reason}`,
      status: 'approved',
      requestedBy: order.userId,
      withinRefundWindow: false,
      gatewayRefundId
    });

    await paymentsRepository.updateRefundStatus(refund.id, {
      status: 'approved',
      approvedBy: adminId,
      gatewayRefundId,
      processedAt: new Date()
    });

    await paymentsRepository.updateOrderStatus(orderId, { status: 'refunded' });
    await paymentsRepository.updatePaymentStatus(order.paymentId, { status: 'refunded' });

    if (order.courseId) {
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          userId: order.userId,
          courseId: order.courseId
        }
      });
      if (enrollment) {
        await prisma.enrollment.update({
          where: { id: enrollment.id },
          data: { status: 'refunded' }
        });
      }
    }

    return {
      id: refund.id,
      status: 'approved',
      orderId,
      refundAmount: Number(order.totalAmount)
    };
  }

  async calculateProRataRefund(enrollmentId: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId }
    });
    if (!enrollment) {
      throw new NotFoundError('Enrollment not found');
    }

    if (!enrollment.orderId) {
      return { refundAmount: 0, reason: 'No paid order reference found' };
    }

    const order = await prisma.order.findUnique({
      where: { id: enrollment.orderId }
    });

    if (!order) {
      return { refundAmount: 0, reason: 'No paid order reference found' };
    }

    const totalAmount = Number(order.totalAmount);
    if (!enrollment.batchId) {
      return { refundAmount: totalAmount, reason: 'No batch associated' };
    }

    // Sessions count
    const totalSessions = await prisma.classSession.count({
      where: { batchId: enrollment.batchId }
    });

    const sessions = await prisma.classSession.findMany({
      where: { batchId: enrollment.batchId }
    });
    const sessionIds = sessions.map(s => s.id);

    const attendedSessions = await prisma.attendanceRecord.count({
      where: {
        userId: enrollment.userId,
        sessionId: { in: sessionIds }
      }
    });

    if (totalSessions === 0) {
      return { refundAmount: totalAmount, totalSessions, attendedSessions };
    }

    const remainingSessions = Math.max(0, totalSessions - attendedSessions);
    const refundAmount = totalAmount * (remainingSessions / totalSessions);

    return {
      refundAmount,
      totalSessions,
      attendedSessions,
      remainingSessions
    };
  }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
