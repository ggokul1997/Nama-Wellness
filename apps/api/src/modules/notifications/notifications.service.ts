import { notificationsRepository } from './notifications.repository';

export class NotificationsService {
  async getUserNotifications(userId: string) {
    const logs = await notificationsRepository.findUserNotifications(userId);
    return logs.map((l) => ({
      id: l.id,
      channel: l.channel,
      subject: l.subject,
      body: l.content,
      sentAt: l.createdAt
    }));
  }
}

export const notificationsService = new NotificationsService();
export default notificationsService;
