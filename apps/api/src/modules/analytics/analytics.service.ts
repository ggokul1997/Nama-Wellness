import { analyticsRepository } from './analytics.repository';

export class AnalyticsService {
  async getTeacherDashboard(teacherId: string) {
    return analyticsRepository.getTeacherStats(teacherId);
  }

  async getEmployeeParticipation(userId: string) {
    return analyticsRepository.getEmployeeStats(userId);
  }

  async getCompanyAdminParticipation(companyId: string) {
    return analyticsRepository.getCompanyAdminStats(companyId);
  }

  async getCompanyAdminEngagement(companyId: string) {
    return analyticsRepository.getCompanyEngagementMetrics(companyId);
  }

  async getAdminDashboard() {
    return analyticsRepository.getAdminPlatformStats();
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
