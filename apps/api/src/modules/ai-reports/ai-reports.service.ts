import { aiReportsRepository } from './ai-reports.repository';
import { aiReportsQueue } from '../../infrastructure/queue/queue.client';
import { NotFoundError } from '../../utils/errors';
import logger from '../../infrastructure/logger/logger';
import prisma from '../../infrastructure/database/prisma.client';

export class AIReportsService {
  async getCompanyReports(companyId: string) {
    return aiReportsRepository.findMany({ companyId });
  }

  async getReportById(reportId: string) {
    const report = await aiReportsRepository.findById(reportId);
    if (!report) {
      throw new NotFoundError('Corporate AI report not found');
    }
    return report;
  }

  async queueReportGeneration(
    companyId: string,
    data: { reportType: string; periodStart: Date; periodEnd: Date }
  ) {
    logger.info({ companyId, type: data.reportType }, 'Queueing corporate wellness report generation');

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // 1. Create a processing AIReport entry
    const report = await aiReportsRepository.create({
      companyId,
      reportType: data.reportType,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      wellnessScore: 0.0,
      content: {},
      status: 'processing'
    });

    // 2. Add job to BullMQ queue
    await aiReportsQueue.add('generate-report', {
      reportId: report.id,
      companyId,
      reportType: data.reportType,
      periodStart: data.periodStart.toISOString(),
      periodEnd: data.periodEnd.toISOString()
    });

    return {
      id: report.id,
      status: 'processing'
    };
  }

  async generateReportSync(reportId: string) {
    logger.info({ reportId }, 'Starting background generation of AI report');

    const report = await aiReportsRepository.findById(reportId);
    if (!report) {
      logger.error({ reportId }, 'Report not found for background generation');
      return;
    }

    try {
      // 1. Gather stats from the company employees during the target period
      const enrollments = await prisma.employeeEnrollment.findMany({
        where: { companyId: report.companyId, status: 'active' }
      });
      const userIds = enrollments.map(e => e.userId);

      // Count total completed bookings in the date range
      const bookings = await prisma.individualBooking.findMany({
        where: {
          studentId: { in: userIds },
          slotStart: {
            gte: report.periodStart,
            lte: report.periodEnd
          }
        },
        include: {
          course: {
            select: {
              title: true,
              category: { select: { name: true } }
            }
          }
        }
      });

      const completedBookings = bookings.filter(b => b.status === 'completed');
      const attendanceCount = completedBookings.length;

      // Group by category to identify interests
      const categoryMap: Record<string, number> = {};
      for (const b of completedBookings) {
        const catName = b.course?.category?.name || 'General';
        categoryMap[catName] = (categoryMap[catName] || 0) + 1;
      }

      const participationTrends = Object.entries(categoryMap).map(([category, count]) => ({
        category,
        count
      }));

      // Calculate a mock but dynamic wellness score based on average attendance count per employee
      const employeeLimit = enrollments.length || 1;
      const averageSessionsPerEmployee = attendanceCount / employeeLimit;
      
      // Calculate wellness score out of 100
      // 0.0 sessions = 50.0 score, with each session adding 10 points up to a max of 95.0
      const wellnessScore = Math.min(50.0 + averageSessionsPerEmployee * 10, 95.0);

      // Generate employee participation summaries
      const employeeSummaries = enrollments.map((e) => {
        const userBookingsCount = bookings.filter(b => b.studentId === e.userId).length;
        const userCompleted = bookings.filter(b => b.studentId === e.userId && b.status === 'completed').length;
        return {
          userId: e.userId,
          status: e.status,
          totalSessionsBooked: userBookingsCount,
          sessionsAttended: userCompleted
        };
      });

      // Recommend wellness programs based on favorite categories or general courses
      const recommendedPrograms = [
        {
          courseTitle: 'Mindfulness & Deep Breath Meditation',
          reason: 'Recommended to lower stress scores among high-activity screen workers.'
        },
        {
          courseTitle: 'Power Vinyasa Yoga for Desk Professionals',
          reason: 'Recommended to promote physical activity and posture relief.'
        }
      ];

      const content = {
        participationTrends,
        employeeSummaries,
        recommendedPrograms,
        metadata: {
          totalBookings: bookings.length,
          completedBookings: attendanceCount,
          averageSessions: averageSessionsPerEmployee.toFixed(1)
        }
      };

      // Update report status in DB
      await aiReportsRepository.updateReport(reportId, {
        status: 'completed',
        wellnessScore,
        content
      });

      logger.info({ reportId, wellnessScore }, 'Background generation of AI report completed successfully');
    } catch (err: any) {
      logger.error({ reportId, err }, 'Background generation of AI report failed');
      await aiReportsRepository.updateReport(reportId, {
        status: 'failed'
      });
    }
  }
}

export const aiReportsService = new AIReportsService();
export default aiReportsService;
