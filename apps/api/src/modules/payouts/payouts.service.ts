import { payoutsRepository } from './payouts.repository';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { Prisma } from '@nama/prisma';
import logger from '../../infrastructure/logger/logger';

// In-memory mock storage for commission configuration rate settings
let globalPlatformRate = 15.0;
let globalTeacherRate = 85.0;

export class PayoutsService {
  async getTeacherPayouts(teacherId: string) {
    const list = await payoutsRepository.findPayoutsByTeacher(teacherId);

    return list.map((p) => {
      const net = p.amount.toNumber();
      const platformFraction = globalPlatformRate / 100;
      const teacherFraction = globalTeacherRate / 100;

      // Calculate gross based on teacher share rate
      const gross = teacherFraction > 0 ? net / teacherFraction : net;
      const commission = gross * platformFraction;

      return {
        id: p.id,
        periodStart: p.billingPeriodStart.toISOString().split('T')[0],
        periodEnd: p.billingPeriodEnd.toISOString().split('T')[0],
        grossAmount: gross.toFixed(2),
        commissionAmount: commission.toFixed(2),
        netAmount: p.amount.toString(),
        status: p.status
      };
    });
  }

  async getPayouts(filters: { status?: string; teacherId?: string }) {
    const list = await payoutsRepository.findPayouts(filters);
    return list.map((p) => ({
      id: p.id,
      teacherId: p.teacherId,
      netAmount: p.amount.toString(),
      status: p.status
    }));
  }

  async getPayoutDetails(userId: string, roles: string[], payoutId: string) {
    const payout = await payoutsRepository.findPayoutById(payoutId);
    if (!payout) {
      throw new NotFoundError('Payout record not found');
    }

    const isAdmin = roles.includes('admin');
    if (!isAdmin && payout.teacherId !== userId) {
      throw new ForbiddenError('You are not authorized to view this payout record');
    }

    const lineItems = payout.lineItems.map((item) => {
      const net = item.amount.toNumber();
      const teacherFraction = globalTeacherRate / 100;
      const gross = teacherFraction > 0 ? net / teacherFraction : net;

      return {
        orderId: item.booking?.orderId || item.id, // fallback to line item uuid
        grossAmount: gross.toFixed(2),
        netAmount: item.amount.toString()
      };
    });

    return {
      id: payout.id,
      lineItems
    };
  }

  async holdPayout(payoutId: string, _reason: string) {
    const payout = await payoutsRepository.findPayoutById(payoutId);
    if (!payout) {
      throw new NotFoundError('Payout record not found');
    }

    await payoutsRepository.updatePayoutStatus(payoutId, 'hold');
    return { id: payoutId, status: 'held' };
  }

  async approvePayout(payoutId: string) {
    const payout = await payoutsRepository.findPayoutById(payoutId);
    if (!payout) {
      throw new NotFoundError('Payout record not found');
    }

    await payoutsRepository.updatePayoutStatus(payoutId, 'approved');
    return { id: payoutId, status: 'approved' };
  }

  async markPayoutPaid(payoutId: string) {
    const payout = await payoutsRepository.findPayoutById(payoutId);
    if (!payout) {
      throw new NotFoundError('Payout record not found');
    }

    await payoutsRepository.updatePayoutStatus(payoutId, 'paid');
    return { id: payoutId, status: 'paid', paidAt: new Date() };
  }

  async setCommissionConfig(platformRate: number, teacherRate: number) {
    if (platformRate + teacherRate !== 100) {
      throw new BadRequestError('Platform rate and Teacher rate must sum up to exactly 100%');
    }

    globalPlatformRate = platformRate;
    globalTeacherRate = teacherRate;

    logger.info({ platformRate, teacherRate }, 'Global commission rates configured successfully.');
    return { platformRate, teacherRate };
  }

  async calculateMonthlyPayouts(startDate: Date, endDate: Date) {
    const bookings = await payoutsRepository.findUnpaidCompletedBookings(startDate, endDate);
    if (bookings.length === 0) {
      return { count: 0 };
    }

    // Group completed bookings by teacherId
    const teacherBookingsMap: Record<string, typeof bookings> = {};
    for (const b of bookings) {
      const list = teacherBookingsMap[b.teacherId] || [];
      list.push(b);
      teacherBookingsMap[b.teacherId] = list;
    }

    let createdPayouts = 0;

    for (const [teacherId, items] of Object.entries(teacherBookingsMap)) {
      const lineItems = [];
      let totalNet = new Prisma.Decimal(0);

      for (const item of items) {
        // Calculate booking gross amount (default to course current pricing or flat fallback)
        let bookingGross = new Prisma.Decimal(1000); // 1000 INR default fallback
        const pricingArray = item.course?.pricing;
        if (pricingArray && pricingArray.length > 0) {
          const firstPrice = pricingArray[0];
          if (firstPrice) {
            bookingGross = firstPrice.amount;
          }
        }

        const teacherFraction = globalTeacherRate / 100;
        const bookingNet = bookingGross.mul(teacherFraction);
        totalNet = totalNet.add(bookingNet);

        lineItems.push({
          bookingId: item.id,
          amount: bookingNet,
          type: 'class_fee',
          description: `Completed session booking: ${item.id}`
        });
      }

      await payoutsRepository.createPayout({
        teacherId,
        amount: totalNet,
        billingPeriodStart: startDate,
        billingPeriodEnd: endDate,
        lineItems
      });

      createdPayouts++;
    }

    return { count: createdPayouts };
  }
}

export const payoutsService = new PayoutsService();
export default payoutsService;
