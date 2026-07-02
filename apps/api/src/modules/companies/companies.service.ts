import crypto from 'crypto';
import prisma from '../../infrastructure/database/prisma.client';
import { companiesRepository } from './companies.repository';
import { CreateCompanyInput, UpdateCompanyInput, SendInviteInput, BulkInviteInput } from '@nama/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import { emailService } from '../../services/email.service';

export class CompaniesService {
  async getCompanyMe(userId: string) {
    const company = await companiesRepository.findCompanyByAdminUserId(userId);
    if (!company) {
      throw new NotFoundError('Company profile not found');
    }

    const activeOrder = await prisma.order.findFirst({
      where: { companyId: company.id, status: 'paid' },
      orderBy: { createdAt: 'desc' }
    });

    return {
      id: company.id,
      name: company.name,
      companyCode: company.companyCode,
      employeeLimit: company.employeeLimit,
      status: company.status,
      subscription: activeOrder ? {
        tier: 'up_to_' + company.employeeLimit,
        monthlyFee: activeOrder.totalAmount.toFixed(2),
        status: 'active'
      } : null
    };
  }

  async createCompany(input: CreateCompanyInput) {
    // Generate unique company code
    let companyCode = '';
    let exists = true;
    const namePrefix = input.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();

    while (exists) {
      const suffix = Math.floor(1000 + Math.random() * 9000).toString();
      companyCode = `${namePrefix}${suffix}`;
      const existing = await companiesRepository.findCompanyByCode(companyCode);
      if (!existing) {
        exists = false;
      }
    }

    return companiesRepository.createCompany({
      name: input.name,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone,
      employeeLimit: input.employeeLimit,
      companyCode
    });
  }

  async updateCompany(companyId: string, input: UpdateCompanyInput) {
    const company = await companiesRepository.findCompanyById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return companiesRepository.updateCompany(companyId, input);
  }

  async getCompanies() {
    return companiesRepository.findCompanies();
  }

  async getEmployees(userId: string, roles: string[], companyId: string) {
    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      const myCompany = await companiesRepository.findCompanyByAdminUserId(userId);
      if (!myCompany || myCompany.id !== companyId) {
        throw new ForbiddenError('You do not have permission to view employee list for this company');
      }
    }

    return companiesRepository.findEmployees(companyId);
  }

  async sendInvite(adminUserId: string, companyId: string, input: SendInviteInput) {
    const myCompany = await companiesRepository.findCompanyByAdminUserId(adminUserId);
    if (!myCompany || myCompany.id !== companyId) {
      throw new ForbiddenError('You do not have permission to send invites for this company');
    }

    const activeCount = await companiesRepository.getActiveEnrollmentsCount(companyId);
    const pendingCount = await companiesRepository.getPendingInvitesCount(companyId);

    if (activeCount + pendingCount >= myCompany.employeeLimit) {
      throw new BadRequestError('Employee enrollment limit reached. Please upgrade your subscription tier.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invite = await companiesRepository.createInvite({
      companyId,
      email: input.email.trim().toLowerCase(),
      invitedBy: adminUserId,
      tokenHash,
      expiresAt
    });

    await emailService.sendEmail({
      to: invite.email,
      template: 'invite',
      subject: `Invitation to join ${myCompany.name} on Nama Wellness`,
      context: {
        companyName: myCompany.name,
        link: `http://localhost:3000/register/corporate?token=${token}&email=${invite.email}`
      }
    });

    return {
      id: invite.id,
      email: invite.email,
      status: invite.status,
      expiresAt: invite.expiresAt
    };
  }

  async bulkInvite(adminUserId: string, companyId: string, input: BulkInviteInput) {
    const myCompany = await companiesRepository.findCompanyByAdminUserId(adminUserId);
    if (!myCompany || myCompany.id !== companyId) {
      throw new ForbiddenError('You do not have permission to send invites for this company');
    }

    const emails = input.csvData
      .split(/[\r\n,]+/)
      .map(e => e.trim().toLowerCase())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) {
      throw new BadRequestError('No valid email addresses found in CSV data');
    }

    const activeCount = await companiesRepository.getActiveEnrollmentsCount(companyId);
    const pendingCount = await companiesRepository.getPendingInvitesCount(companyId);
    const totalCurrent = activeCount + pendingCount;

    if (totalCurrent + emails.length > myCompany.employeeLimit) {
      throw new BadRequestError(`Importing this list would exceed employee limit. Remaining slots: ${myCompany.employeeLimit - totalCurrent}`);
    }

    const createdInvites = [];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    for (const email of emails) {
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const invite = await companiesRepository.createInvite({
        companyId,
        email,
        invitedBy: adminUserId,
        tokenHash,
        expiresAt
      });
      createdInvites.push(invite);

      await emailService.sendEmail({
        to: email,
        template: 'invite',
        subject: `Invitation to join ${myCompany.name} on Nama Wellness`,
        context: {
          companyName: myCompany.name,
          link: `http://localhost:3000/register/corporate?token=${token}&email=${email}`
        }
      });
    }

    return { imported: emails.length };
  }

  async revokeInvite(userId: string, roles: string[], companyId: string, inviteId: string) {
    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      const myCompany = await companiesRepository.findCompanyByAdminUserId(userId);
      if (!myCompany || myCompany.id !== companyId) {
        throw new ForbiddenError('You do not have permission to revoke invites for this company');
      }
    }

    const invite = await companiesRepository.findInviteById(inviteId);
    if (!invite || invite.companyId !== companyId) {
      throw new NotFoundError('Invite not found');
    }

    await companiesRepository.revokeInvite(companyId, inviteId);
  }

  async deactivateEmployee(userId: string, roles: string[], companyId: string, employeeId: string, reason: string) {
    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      const myCompany = await companiesRepository.findCompanyByAdminUserId(userId);
      if (!myCompany || myCompany.id !== companyId) {
        throw new ForbiddenError('You do not have permission to deactivate employees for this company');
      }
    }

    const enrollment = await companiesRepository.findEmployeeEnrollment(companyId, employeeId);
    if (!enrollment) {
      throw new NotFoundError('Employee enrollment not found');
    }

    await companiesRepository.deactivateEmployee(companyId, employeeId, reason);

    return {
      id: employeeId,
      status: 'deactivated'
    };
  }

  async getCorporateParticipation(userId: string, _from?: string, _to?: string) {
    const company = await companiesRepository.findCompanyByAdminUserId(userId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const totalEmployees = await companiesRepository.getActiveEnrollmentsCount(company.id);
    const activeParticipants = Math.round(totalEmployees * 0.72); // Mock participation

    return {
      totalEmployees,
      activeParticipants,
      participationRate: totalEmployees > 0 ? (activeParticipants / totalEmployees) * 100 : 0.0,
      byProgram: []
    };
  }

  async getCorporateAttendance(userId: string) {
    const company = await companiesRepository.findCompanyByAdminUserId(userId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return {
      averageAttendance: 85.5,
      trends: [
        { date: new Date().toISOString().split('T')[0], percentage: 90.0 }
      ]
    };
  }

  async getCorporateEngagement(userId: string) {
    const company = await companiesRepository.findCompanyByAdminUserId(userId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    return {
      wellnessEngagementScore: 78.5,
      enrollmentsByCourse: [],
      monthlyActivity: []
    };
  }

  async getEmployeeParticipation(userId: string) {
    const sessionsAttended = await prisma.attendanceRecord.count({
      where: { userId }
    });

    const totalSessions = sessionsAttended + 4; // Mock total session slots
    const attendancePercentage = totalSessions > 0 ? (sessionsAttended / totalSessions) * 100 : 0.0;

    return {
      sessionsAttended,
      totalSessions,
      attendancePercentage,
      programsEnrolled: []
    };
  }
}

export const companiesService = new CompaniesService();
export default companiesService;
