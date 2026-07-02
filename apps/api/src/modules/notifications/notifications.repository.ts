import prisma from '../../infrastructure/database/prisma.client';

export class NotificationsRepository {
  async findUserNotifications(userId: string) {
    return prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const notificationsRepository = new NotificationsRepository();
export default notificationsRepository;
