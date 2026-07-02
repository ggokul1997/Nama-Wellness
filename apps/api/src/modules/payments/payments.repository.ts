import prisma from '../../infrastructure/database/prisma.client';
import { PaymentGateway, PaymentPurpose, PaymentStatus, OrderStatus, RefundStatus } from '@nama/prisma';

export class PaymentsRepository {
  async createPayment(params: {
    userId: string;
    amount: number;
    currency: string;
    gateway: PaymentGateway;
    purpose: PaymentPurpose;
    status?: PaymentStatus;
  }) {
    return prisma.payment.create({
      data: {
        userId: params.userId,
        amount: params.amount,
        currency: params.currency,
        gateway: params.gateway,
        purpose: params.purpose,
        status: params.status || 'pending'
      }
    });
  }

  async findPaymentById(id: string) {
    return prisma.payment.findUnique({
      where: { id }
    });
  }

  async findPaymentByGatewayId(gatewayPaymentId: string) {
    return prisma.payment.findUnique({
      where: { gatewayPaymentId }
    });
  }

  async findPaymentByGatewayOrderId(gatewayOrderId: string) {
    const payments = await prisma.payment.findMany({
      where: { status: 'pending' }
    });
    return payments.find(p => {
      const meta = p.metadata as any;
      return meta?.gatewayOrderId === gatewayOrderId;
    }) || null;
  }

  async updatePaymentStatus(id: string, params: {
    status: PaymentStatus;
    gatewayPaymentId?: string;
    completedAt?: Date;
    metadata?: any;
  }) {
    return prisma.payment.update({
      where: { id },
      data: {
        status: params.status,
        gatewayPaymentId: params.gatewayPaymentId,
        completedAt: params.completedAt,
        metadata: params.metadata
      }
    });
  }

  async createOrder(params: {
    userId: string;
    courseId?: string;
    companyId?: string;
    paymentId?: string;
    totalAmount: number;
    currency: string;
    status?: OrderStatus;
    classStartDate?: Date;
  }) {
    return prisma.order.create({
      data: {
        userId: params.userId,
        courseId: params.courseId || null,
        companyId: params.companyId || null,
        paymentId: params.paymentId || null,
        totalAmount: params.totalAmount,
        currency: params.currency,
        status: params.status || 'pending',
        classStartDate: params.classStartDate || null
      }
    });
  }

  async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        course: true,
        user: true
      }
    });
  }

  async updateOrderStatus(id: string, params: {
    status: OrderStatus;
    paymentId?: string;
  }) {
    return prisma.order.update({
      where: { id },
      data: {
        status: params.status,
        paymentId: params.paymentId
      }
    });
  }

  async getMyPayments(userId: string) {
    return prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMyOrders(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllPayments(filter: { status?: PaymentStatus; purpose?: PaymentPurpose }) {
    return prisma.payment.findMany({
      where: {
        status: filter.status,
        purpose: filter.purpose
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAllOrders() {
    return prisma.order.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createRefund(params: {
    orderId: string;
    paymentId: string;
    amount: number;
    reason: string;
    status?: RefundStatus;
    requestedBy: string;
    withinRefundWindow: boolean;
    gatewayRefundId?: string;
  }) {
    return prisma.refund.create({
      data: {
        orderId: params.orderId,
        paymentId: params.paymentId,
        amount: params.amount,
        reason: params.reason,
        status: params.status || 'requested',
        requestedById: params.requestedBy,
        withinRefundWindow: params.withinRefundWindow,
        gatewayRefundId: params.gatewayRefundId
      }
    });
  }

  async getRefundById(id: string) {
    return prisma.refund.findUnique({
      where: { id },
      include: {
        order: true,
        payment: true
      }
    });
  }

  async updateRefundStatus(id: string, params: {
    status: RefundStatus;
    approvedBy?: string;
    gatewayRefundId?: string;
    processedAt?: Date;
  }) {
    return prisma.refund.update({
      where: { id },
      data: {
        status: params.status,
        approvedById: params.approvedBy,
        gatewayRefundId: params.gatewayRefundId,
        processedAt: params.processedAt
      }
    });
  }

  async findWebhookEvent(gateway: PaymentGateway, eventId: string) {
    return prisma.paymentWebhookEvent.findUnique({
      where: {
        gateway_eventId: { gateway, eventId }
      }
    });
  }

  async createWebhookEvent(params: {
    gateway: PaymentGateway;
    eventId: string;
    eventType: string;
    payload: any;
  }) {
    return prisma.paymentWebhookEvent.create({
      data: {
        gateway: params.gateway,
        eventId: params.eventId,
        eventType: params.eventType,
        payload: params.payload,
        processed: false
      }
    });
  }

  async markWebhookProcessed(id: string) {
    return prisma.paymentWebhookEvent.update({
      where: { id },
      data: {
        processed: true,
        processedAt: new Date()
      }
    });
  }
}

export const paymentsRepository = new PaymentsRepository();
export default paymentsRepository;
