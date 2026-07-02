import prisma from '../../infrastructure/database/prisma.client';
import { Prisma } from '@nama/prisma';

export class AIReportsRepository {
  async findMany(filters: { companyId?: string }) {
    const where: Prisma.AIReportWhereInput = {};
    if (filters.companyId) {
      where.companyId = filters.companyId;
    }
    return prisma.aIReport.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string) {
    return prisma.aIReport.findUnique({
      where: { id }
    });
  }

  async create(data: {
    companyId: string;
    reportType: string;
    periodStart: Date;
    periodEnd: Date;
    wellnessScore: number;
    content: any;
    status: string;
  }) {
    return prisma.aIReport.create({
      data: {
        companyId: data.companyId,
        reportType: data.reportType,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        wellnessScore: new Prisma.Decimal(data.wellnessScore),
        content: data.content,
        status: data.status
      }
    });
  }

  async updateReport(
    id: string,
    update: { status: string; content?: any; wellnessScore?: number }
  ) {
    const data: Prisma.AIReportUpdateInput = {
      status: update.status
    };

    if (update.content) {
      data.content = update.content;
    }

    if (update.wellnessScore !== undefined) {
      data.wellnessScore = new Prisma.Decimal(update.wellnessScore);
    }

    return prisma.aIReport.update({
      where: { id },
      data
    });
  }
}

export const aiReportsRepository = new AIReportsRepository();
export default aiReportsRepository;
