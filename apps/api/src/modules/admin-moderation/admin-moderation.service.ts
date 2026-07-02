import { adminModerationRepository } from './admin-moderation.repository';
import { UserStatus, PerformanceStatus } from '@nama/prisma';
import { NotFoundError } from '../../utils/errors';
import logger from '../../infrastructure/logger/logger';

export class AdminModerationService {
  async updateUserStatus(
    actorId: string,
    userId: string,
    status: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    logger.info({ actorId, userId, status }, 'Updating user account status');

    const updatedUser = await adminModerationRepository.updateUserStatus(
      userId,
      status as UserStatus
    );

    // Write to audit log
    await adminModerationRepository.createAuditLog({
      actorId,
      action: 'UPDATE_USER_STATUS',
      entityType: 'User',
      entityId: userId,
      metadata: { status },
      ipAddress,
      userAgent
    });

    return updatedUser;
  }

  async updateTeacherPerformance(
    actorId: string,
    teacherId: string,
    performanceStatus: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    logger.info({ actorId, teacherId, performanceStatus }, 'Updating teacher performance status');

    const updatedProfile = await adminModerationRepository.updateTeacherPerformance(
      teacherId,
      performanceStatus as PerformanceStatus
    );

    // Write to audit log
    await adminModerationRepository.createAuditLog({
      actorId,
      action: 'UPDATE_TEACHER_PERFORMANCE',
      entityType: 'TeacherProfile',
      entityId: updatedProfile.id,
      metadata: { performanceStatus },
      ipAddress,
      userAgent
    });

    return updatedProfile;
  }

  async fileComplaint(
    studentId: string,
    teacherId: string,
    title: string,
    description: string
  ) {
    logger.info({ studentId, teacherId, title }, 'Student filing complaint against teacher');
    return adminModerationRepository.createComplaint({
      studentId,
      teacherId,
      title,
      description
    });
  }

  async listComplaints(filters: { teacherId?: string; status?: string }) {
    return adminModerationRepository.findComplaints(filters);
  }

  async resolveComplaint(
    actorId: string,
    complaintId: string,
    status: string,
    resolution: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    logger.info({ actorId, complaintId, status }, 'Admin resolving complaint');

    const complaint = await adminModerationRepository.findComplaintById(complaintId);
    if (!complaint) {
      throw new NotFoundError('Complaint record not found');
    }

    const updatedComplaint = await adminModerationRepository.updateComplaint(
      complaintId,
      status,
      resolution
    );

    // Write to audit log
    await adminModerationRepository.createAuditLog({
      actorId,
      action: 'RESOLVE_COMPLAINT',
      entityType: 'Complaint',
      entityId: complaintId,
      metadata: { status, resolution },
      ipAddress,
      userAgent
    });

    return updatedComplaint;
  }

  async listAuditLogs(limit: number = 100) {
    return adminModerationRepository.findAuditLogs(limit);
  }
}

export const adminModerationService = new AdminModerationService();
export default adminModerationService;
