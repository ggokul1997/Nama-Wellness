import prisma from '../../infrastructure/database/prisma.client';
import { Prisma } from '@nama/prisma';

export class AnalyticsRepository {
  async getTeacherStats(teacherId: string) {
    // 1. Earnings aggregation
    const payouts = await prisma.payout.findMany({
      where: { teacherId }
    });

    const totalPaid = payouts
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum.add(p.amount), new Prisma.Decimal(0));

    const totalPending = payouts
      .filter(p => p.status === 'pending' || p.status === 'approved')
      .reduce((sum, p) => sum.add(p.amount), new Prisma.Decimal(0));

    // 2. Class bookings count
    const bookings = await prisma.individualBooking.findMany({
      where: { teacherId }
    });

    const completedClasses = bookings.filter(b => b.status === 'completed').length;
    const scheduledClasses = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
    const cancelledClasses = bookings.filter(b => b.status === 'cancelled').length;

    // 3. Reviews rating stats
    const profile = await prisma.teacherProfile.findUnique({
      where: { userId: teacherId }
    });

    return {
      earnings: {
        totalPaid: totalPaid.toString(),
        totalPending: totalPending.toString(),
        totalEarnings: totalPaid.add(totalPending).toString()
      },
      classes: {
        completed: completedClasses,
        scheduled: scheduledClasses,
        cancelled: cancelledClasses,
        total: bookings.length
      },
      reviews: {
        total: profile?.totalReviews || 0,
        averageRating: profile?.averageRating ? profile.averageRating.toString() : '0.00'
      }
    };
  }

  async getEmployeeStats(userId: string) {
    const bookings = await prisma.individualBooking.findMany({
      where: { studentId: userId }
    });

    const completedCount = bookings.filter(b => b.status === 'completed').length;
    const upcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

    // Calculate total hours completed (assuming 1 hour per session)
    const hoursSpent = completedCount * 1.0;

    const certificatesCount = await prisma.certificate.count({
      where: { userId, status: 'approved' }
    });

    return {
      attendedClasses: completedCount,
      hoursSpent,
      certificatesEarned: certificatesCount,
      upcomingClasses: upcomingCount
    };
  }

  async getCompanyAdminStats(companyId: string) {
    // Get all enrollments under this corporate company
    const enrollments = await prisma.employeeEnrollment.findMany({
      where: { companyId, status: 'active' }
    });

    const totalEmployees = enrollments.length;
    const userIds = enrollments.map(e => e.userId);

    if (totalEmployees === 0) {
      return {
        totalEmployees: 0,
        activeParticipationRate: '0.00%',
        attendanceRate: '0.00%',
        employeeStats: []
      };
    }

    // Load bookings for all corporate users
    const bookings = await prisma.individualBooking.findMany({
      where: { studentId: { in: userIds } },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      }
    });

    const uniqueStudentsWithBookings = new Set(bookings.map(b => b.studentId));
    const participationRate = (uniqueStudentsWithBookings.size / totalEmployees) * 100;

    const completed = bookings.filter(b => b.status === 'completed').length;
    const noShow = bookings.filter(b => b.status === 'no_show').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;

    const totalResolved = completed + noShow + cancelled;
    const attendanceRate = totalResolved > 0 ? (completed / totalResolved) * 100 : 0.0;

    // Load user emails since EmployeeEnrollment doesn't store them directly
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true }
    });

    // Map stats per employee
    const employeeStats = enrollments.map((enrollment) => {
      const userBookings = bookings.filter(b => b.studentId === enrollment.userId);
      const userCompleted = userBookings.filter(b => b.status === 'completed').length;
      const matchedUser = users.find(u => u.id === enrollment.userId);

      return {
        userId: enrollment.userId,
        email: matchedUser ? matchedUser.email : 'unknown@namawellness.com',
        totalBookings: userBookings.length,
        completedBookings: userCompleted,
        status: enrollment.status
      };
    });

    return {
      totalEmployees,
      activeParticipationRate: `${participationRate.toFixed(2)}%`,
      attendanceRate: `${attendanceRate.toFixed(2)}%`,
      employeeStats
    };
  }

  async getCompanyEngagementMetrics(companyId: string) {
    // Engagement category breakdown and weekly trends
    const enrollments = await prisma.employeeEnrollment.findMany({
      where: { companyId, status: 'active' }
    });
    const userIds = enrollments.map(e => e.userId);

    const bookings = await prisma.individualBooking.findMany({
      where: {
        studentId: { in: userIds },
        status: 'completed'
      },
      include: {
        course: {
          include: {
            category: true
          }
        }
      }
    });

    // 1. Group bookings by category
    const categoryCounts: Record<string, number> = {};
    for (const b of bookings) {
      const catName = b.course.category.name || 'General';
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;
    }

    const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count
    }));

    // 2. Weekly bookings trend (last 8 weeks)
    const weeklyBookingsTrend = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const start = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);

      const count = bookings.filter(b => b.slotStart >= start && b.slotStart < end).length;
      weeklyBookingsTrend.push({
        weekStart: start.toISOString().split('T')[0],
        count
      });
    }

    return {
      categoryBreakdown,
      weeklyBookingsTrend
    };
  }

  async getAdminPlatformStats() {
    // Platform revenue aggregation
    const payments = await prisma.payment.findMany({
      where: { status: 'completed' }
    });

    const totalRevenue = payments.reduce((sum, p) => sum.add(p.amount), new Prisma.Decimal(0));

    // Platform payouts aggregation
    const payouts = await prisma.payout.findMany();
    const totalPayouts = payouts.reduce((sum, p) => sum.add(p.amount), new Prisma.Decimal(0));

    const platformCommission = totalRevenue.sub(totalPayouts);

    const activeStudents = await prisma.userRole.count({
      where: { role: 'student' }
    });

    const activeTeachers = await prisma.teacherProfile.count({
      where: { performanceStatus: 'good_standing' }
    });

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        }
      }
    });

    const transactions = recentOrders.map(o => ({
      id: o.id,
      email: o.user.email,
      amount: o.totalAmount.toString(),
      status: o.status,
      date: o.createdAt
    }));

    return {
      totalRevenue: totalRevenue.toString(),
      totalCommissions: platformCommission.toString(),
      netTeacherPayouts: totalPayouts.toString(),
      activeStudentsCount: activeStudents,
      activeTeachersCount: activeTeachers,
      recentTransactions: transactions
    };
  }
}

export const analyticsRepository = new AnalyticsRepository();
export default analyticsRepository;
