import prisma from '../../infrastructure/database/prisma.client';
import { CompanyStatus } from '@nama/prisma';

export class CompaniesRepository {
  async findCompanyById(id: string) {
    return prisma.company.findUnique({
      where: { id, deletedAt: null }
    });
  }

  async findCompanyByCode(companyCode: string) {
    return prisma.company.findUnique({
      where: { companyCode, deletedAt: null }
    });
  }

  async findCompanyByAdminUserId(userId: string) {
    const admin = await prisma.companyAdmin.findFirst({
      where: { userId },
      include: { company: true }
    });
    return admin?.company || null;
  }

  async createCompany(params: {
    name: string;
    contactEmail: string;
    contactPhone?: string;
    employeeLimit: number;
    companyCode: string;
  }) {
    return prisma.company.create({
      data: {
        name: params.name,
        contactEmail: params.contactEmail,
        contactPhone: params.contactPhone || null,
        employeeLimit: params.employeeLimit,
        companyCode: params.companyCode,
        status: 'active'
      }
    });
  }

  async updateCompany(id: string, params: {
    name?: string;
    status?: CompanyStatus;
    employeeLimit?: number;
  }) {
    return prisma.company.update({
      where: { id },
      data: {
        name: params.name,
        status: params.status,
        employeeLimit: params.employeeLimit
      }
    });
  }

  async findCompanies() {
    return prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findEmployees(companyId: string) {
    const enrollments = await prisma.employeeEnrollment.findMany({
      where: { companyId },
      include: {
        company: true
      },
      orderBy: { enrolledAt: 'desc' }
    });

    const userIds = enrollments.map(e => e.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        email: true,
        phone: true,
        profile: true
      }
    });

    return enrollments.map(e => ({
      ...e,
      user: users.find(u => u.id === e.userId) || null
    }));
  }

  async findEmployeeEnrollment(companyId: string, userId: string) {
    return prisma.employeeEnrollment.findUnique({
      where: {
        companyId_userId: { companyId, userId }
      }
    });
  }

  async deactivateEmployee(companyId: string, userId: string, _reason: string) {
    return prisma.$transaction(async (tx) => {
      const enrollment = await tx.employeeEnrollment.update({
        where: {
          companyId_userId: { companyId, userId }
        },
        data: {
          status: 'deactivated',
          deactivatedAt: new Date()
        }
      });

      // Update user roles product variant or status?
      // Typically employee is just deactivated in enrollment table.
      return enrollment;
    });
  }

  async createInvite(params: {
    companyId: string;
    email: string;
    invitedBy: string;
    tokenHash: string;
    expiresAt: Date;
  }) {
    return prisma.employeeInvite.create({
      data: {
        companyId: params.companyId,
        email: params.email,
        invitedBy: params.invitedBy,
        tokenHash: params.tokenHash,
        expiresAt: params.expiresAt,
        status: 'pending'
      }
    });
  }

  async findInviteById(id: string) {
    return prisma.employeeInvite.findUnique({
      where: { id }
    });
  }

  async findPendingInviteByEmail(email: string, companyId: string) {
    return prisma.employeeInvite.findFirst({
      where: {
        email,
        companyId,
        status: 'pending',
        expiresAt: { gt: new Date() }
      }
    });
  }

  async revokeInvite(companyId: string, id: string) {
    return prisma.employeeInvite.update({
      where: { id, companyId },
      data: { status: 'revoked' }
    });
  }

  async getActiveEnrollmentsCount(companyId: string) {
    return prisma.employeeEnrollment.count({
      where: { companyId, status: 'active' }
    });
  }

  async getPendingInvitesCount(companyId: string) {
    return prisma.employeeInvite.count({
      where: { companyId, status: 'pending', expiresAt: { gt: new Date() } }
    });
  }
}

export const companiesRepository = new CompaniesRepository();
export default companiesRepository;
