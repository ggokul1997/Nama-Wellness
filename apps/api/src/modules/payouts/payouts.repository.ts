import prisma from '../../infrastructure/database/prisma.client';
import { Prisma } from '@nama/prisma';

export class PayoutsRepository {
  async findPayouts(filters: { status?: string; teacherId?: string }) {
    const where: Prisma.PayoutWhereInput = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.teacherId) {
      where.teacherId = filters.teacherId;
    }

    return prisma.payout.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findPayoutById(id: string) {
    return prisma.payout.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        },
        lineItems: {
          include: {
            booking: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });
  }

  async findPayoutsByTeacher(teacherId: string) {
    return prisma.payout.findMany({
      where: { teacherId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPayout(data: {
    teacherId: string;
    amount: Prisma.Decimal | number;
    billingPeriodStart: Date;
    billingPeriodEnd: Date;
    lineItems: {
      bookingId: string;
      amount: Prisma.Decimal | number;
      type: string;
      description?: string;
    }[];
  }) {
    return prisma.payout.create({
      data: {
        teacherId: data.teacherId,
        amount: data.amount,
        billingPeriodStart: data.billingPeriodStart,
        billingPeriodEnd: data.billingPeriodEnd,
        status: 'pending',
        lineItems: {
          create: data.lineItems.map(item => ({
            bookingId: item.bookingId,
            amount: item.amount,
            type: item.type,
            description: item.description
          }))
        }
      },
      include: {
        lineItems: true
      }
    });
  }

  async updatePayoutStatus(id: string, status: string) {
    return prisma.payout.update({
      where: { id },
      data: { status }
    });
  }

  async findUnpaidCompletedBookings(startDate: Date, endDate: Date) {
    return prisma.individualBooking.findMany({
      where: {
        status: 'completed',
        slotStart: {
          gte: startDate,
          lte: endDate
        },
        payoutLineItems: {
          none: {}
        }
      },
      include: {
        course: {
          include: {
            pricing: {
              where: { isCurrent: true }
            }
          }
        }
      }
    });
  }
}

export const payoutsRepository = new PayoutsRepository();
export default payoutsRepository;
