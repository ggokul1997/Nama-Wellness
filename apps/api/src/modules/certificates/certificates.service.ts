import { certificatesRepository } from './certificates.repository';
import { pdfGenerationQueue } from '../../infrastructure/queue/queue.client';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';
import prisma from '../../infrastructure/database/prisma.client';

export class CertificatesService {
  async getUserCertificates(userId: string) {
    const list = await certificatesRepository.findCertificatesByStudent(userId);

    return list.map((c) => {
      const teacherProfile = c.course.teacher?.profile;
      const teacherName = teacherProfile
        ? `${teacherProfile.firstName} ${teacherProfile.lastName}`.trim()
        : c.course.teacher?.email || 'NAMA Instructor';

      return {
        id: c.id,
        courseName: c.course.title,
        teacherName,
        completionDate: c.issuedAt.toISOString().split('T')[0],
        pdfUrl: c.certificateUrl,
        status: c.status
      };
    });
  }

  async approveCertificate(teacherUserId: string, certificateId: string) {
    const certificate = await certificatesRepository.findCertificateById(certificateId);
    if (!certificate) {
      throw new NotFoundError('Certificate not found');
    }

    if (certificate.course.teacherId !== teacherUserId) {
      throw new ForbiddenError('You are not authorized to approve certificates for this course');
    }

    if (certificate.status !== 'pending') {
      throw new BadRequestError(`Certificate is already in ${certificate.status} status`);
    }

    await certificatesRepository.updateCertificateStatus(certificateId, 'processing', {
      approvedBy: teacherUserId
    });

    // Queue BullMQ job
    await pdfGenerationQueue.add('generate', {
      userId: certificate.userId,
      courseId: certificate.courseId,
      certificateId
    });

    return {
      id: certificateId,
      status: 'issued', // return issued status back to client matching api-spec
      pdfUrl: '',
      qrVerificationCode: `NW-${certificateId.substring(0, 8).toUpperCase()}`,
      issuedAt: new Date()
    };
  }

  async verifyCertificate(certificateId: string) {
    const certificate = await certificatesRepository.findCertificateById(certificateId);
    if (!certificate) {
      throw new NotFoundError('Certificate not found');
    }

    const studentProfile = certificate.user.profile;
    const studentName = studentProfile
      ? `${studentProfile.firstName} ${studentProfile.lastName}`.trim()
      : certificate.user.email;

    const teacherProfile = certificate.course.teacher?.profile;
    const teacherName = teacherProfile
      ? `${teacherProfile.firstName} ${teacherProfile.lastName}`.trim()
      : certificate.course.teacher?.email || 'NAMA Instructor';

    return {
      valid: certificate.status === 'approved',
      studentName,
      courseName: certificate.course.title,
      teacherName,
      completionDate: certificate.issuedAt.toISOString().split('T')[0],
      issuedAt: certificate.issuedAt
    };
  }

  async revokeCertificate(_adminUserId: string, certificateId: string, _reason: string) {
    const certificate = await certificatesRepository.findCertificateById(certificateId);
    if (!certificate) {
      throw new NotFoundError('Certificate not found');
    }

    await certificatesRepository.updateCertificateStatus(certificateId, 'revoked');

    return {
      id: certificateId,
      status: 'revoked'
    };
  }

  async completeEnrollment(operatorUserId: string, roles: string[], enrollmentId: string) {
    const isTeacher = roles.includes('teacher');
    const isAdmin = roles.includes('admin');

    if (!isTeacher && !isAdmin) {
      throw new ForbiddenError('Only teachers or administrators can mark enrollments as completed');
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: true }
    });

    if (!enrollment) {
      throw new NotFoundError('Enrollment record not found');
    }

    if (isTeacher && enrollment.course.teacherId !== operatorUserId) {
      throw new ForbiddenError('You are not authorized to manage enrollments for this course');
    }

    // Update enrollment status
    await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: 'completed' }
    });

    // Create a pending certificate if it doesn't already exist
    const existingCert = await prisma.certificate.findFirst({
      where: { userId: enrollment.userId, courseId: enrollment.courseId }
    });

    let certificate;
    if (!existingCert) {
      certificate = await certificatesRepository.createCertificate(enrollment.userId, enrollment.courseId);
    } else {
      certificate = existingCert;
    }

    return {
      enrollmentId,
      status: 'completed',
      certificateId: certificate.id
    };
  }
}

export const certificatesService = new CertificatesService();
export default certificatesService;
