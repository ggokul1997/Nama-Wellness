import prisma from '../../infrastructure/database/prisma.client';

export class CertificatesRepository {
  async findCertificatesByStudent(userId: string) {
    return prisma.certificate.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                email: true,
                profile: true
              }
            }
          }
        }
      },
      orderBy: { issuedAt: 'desc' }
    });
  }

  async findCertificateById(id: string) {
    return prisma.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            profile: true
          }
        },
        course: {
          include: {
            teacher: {
              select: {
                id: true,
                email: true,
                profile: true
              }
            }
          }
        }
      }
    });
  }

  async createCertificate(userId: string, courseId: string) {
    return prisma.certificate.create({
      data: {
        userId,
        courseId,
        status: 'pending',
        certificateUrl: ''
      }
    });
  }

  async updateCertificateStatus(id: string, status: string, extraFields: { certificateUrl?: string; qrCodeUrl?: string; approvedBy?: string } = {}) {
    return prisma.certificate.update({
      where: { id },
      data: {
        status,
        ...extraFields
      }
    });
  }
}

export const certificatesRepository = new CertificatesRepository();
export default certificatesRepository;
