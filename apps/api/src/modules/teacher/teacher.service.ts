import { teacherRepository } from './teacher.repository';
import { CreateApplicationInput, UploadDocumentInput } from '@nama/shared';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/errors';

export class TeacherService {
  async createApplication(userId: string, input: CreateApplicationInput) {
    const existingApp = await teacherRepository.findActiveApplication(userId);
    if (existingApp) {
      throw new BadRequestError('An active application already exists for this user');
    }
    return teacherRepository.createApplication(userId, input);
  }

  async getMyApplication(userId: string) {
    const app = await teacherRepository.findActiveApplication(userId);
    if (!app) {
      throw new NotFoundError('No active application found');
    }
    return teacherRepository.findApplicationById(app.id);
  }

  async addDocument(userId: string, applicationId: string, input: UploadDocumentInput) {
    const app = await teacherRepository.findApplicationById(applicationId);
    if (!app) {
      throw new NotFoundError('Teacher application not found');
    }
    if (app.userId !== userId) {
      throw new ForbiddenError('You do not own this application');
    }
    return teacherRepository.addDocument(applicationId, input);
  }

  async listApplications(status?: string) {
    return teacherRepository.findApplications(status);
  }

  async getApplicationById(id: string) {
    const app = await teacherRepository.findApplicationById(id);
    if (!app) {
      throw new NotFoundError('Teacher application not found');
    }
    return app;
  }

  async verifyDocument(adminUserId: string, applicationId: string, documentId: string, verified: boolean) {
    const doc = await teacherRepository.findDocumentById(applicationId, documentId);
    if (!doc) {
      throw new NotFoundError('Teacher document not found');
    }
    return teacherRepository.verifyDocument(documentId, verified, adminUserId, applicationId);
  }

  async scheduleInterview(applicationId: string, scheduledAt: string, adminUserId: string) {
    const app = await teacherRepository.findApplicationById(applicationId);
    if (!app) {
      throw new NotFoundError('Teacher application not found');
    }
    return teacherRepository.scheduleInterview(applicationId, new Date(scheduledAt), adminUserId);
  }

  async updateInterview(adminUserId: string, applicationId: string, interviewId: string, input: { outcome: string, notes?: string }) {
    const interview = await teacherRepository.findInterviewById(applicationId, interviewId);
    if (!interview) {
      throw new NotFoundError('Teacher interview not found');
    }
    return teacherRepository.updateInterview(interviewId, input.outcome, input.notes, adminUserId, applicationId);
  }

  async approveApplication(adminUserId: string, applicationId: string, notes?: string) {
    const app = await teacherRepository.findApplicationById(applicationId);
    if (!app) {
      throw new NotFoundError('Teacher application not found');
    }
    return teacherRepository.approveApplication(applicationId, adminUserId, notes);
  }

  async rejectApplication(adminUserId: string, applicationId: string, reason: string, notes?: string) {
    const app = await teacherRepository.findApplicationById(applicationId);
    if (!app) {
      throw new NotFoundError('Teacher application not found');
    }
    return teacherRepository.rejectApplication(applicationId, adminUserId, reason, notes);
  }

  async getApplicationLogs(applicationId: string) {
    const app = await teacherRepository.findApplicationById(applicationId);
    if (!app) {
      throw new NotFoundError('Teacher application not found');
    }
    return teacherRepository.findApplicationLogs(applicationId);
  }
}

export const teacherService = new TeacherService();
