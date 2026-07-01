import prisma from '../../infrastructure/database/prisma.client';
import { RegisterInput, RegisterCorporateInput } from '@nama/shared';

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  async findUserWithRelations(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        roles: true
      }
    });
  }

  async createUser(input: RegisterInput, passwordHash: string) {
    return prisma.user.create({
      data: {
        email: input.email,
        phone: input.phone,
        passwordHash,
        profile: {
          create: {
            firstName: input.firstName,
            lastName: input.lastName
          }
        },
        roles: {
          create: {
            role: input.role as any,
            productVariant: 'edpro'
          }
        }
      }
    });
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date, userAgent?: string, ipAddress?: string) {
    return prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        userAgent,
        ipAddress
      }
    });
  }
  async findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: true
          }
        }
      }
    });
  }
  async revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  async saveOTPVerification(identifier: string, codeHash: string, purpose: 'email_verify' | 'phone_verify' | 'password_reset', expiresAt: Date) {
    return prisma.oTPVerification.create({
      data: {
        identifier,
        codeHash,
        purpose,
        expiresAt
      }
    });
  }

  async findActiveOTP(identifier: string, purpose: 'email_verify' | 'phone_verify' | 'password_reset') {
    return prisma.oTPVerification.findFirst({
      where: {
        identifier,
        purpose,
        consumedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async incrementOTPAttempts(otpId: string) {
    return prisma.oTPVerification.update({
      where: { id: otpId },
      data: { attemptCount: { increment: 1 } }
    });
  }

  async consumeOTP(otpId: string) {
    return prisma.oTPVerification.update({
      where: { id: otpId },
      data: { consumedAt: new Date() }
    });
  }

  async verifyUserEmail(email: string) {
    return prisma.user.update({
      where: { email },
      data: { emailVerified: true }
    });
  }
  async updateUserPassword(email: string, passwordHash: string) {
    return prisma.user.update({
      where: { email },
      data: { passwordHash }
    });
  }

  async findCompanyByCode(companyCode: string) {
    return prisma.company.findUnique({
      where: { companyCode }
    });
  }

  async createCorporateUser(input: RegisterCorporateInput, passwordHash: string, companyId: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          passwordHash,
          profile: {
            create: {
              firstName: input.firstName,
              lastName: input.lastName
            }
          },
          roles: {
            create: {
              role: input.role as any,
              productVariant: 'corporate',
              companyId
            }
          }
        }
      });

      if (input.role === 'company_admin') {
        await tx.companyAdmin.create({
          data: {
            companyId,
            userId: user.id,
            isPrimary: true
          }
        });
      } else {
        await tx.employeeEnrollment.create({
          data: {
            companyId,
            userId: user.id
          }
        });
      }

      return user;
    });
  }
  async updateUserPhone(userId: string, phone: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        phoneVerified: true
      }
    });
  }
}

export const authRepository = new AuthRepository();
