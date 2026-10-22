import { prisma } from '../../utils/prisma';
import { Response } from 'express';
import { NotificationType } from '@english-learner/types';

export class NotificationService {
  private static clients: Response[] = [];

  static addClient(client: Response) {
    this.clients.push(client);
  }

  static removeClient(client: Response) {
    this.clients = this.clients.filter(c => c !== client);
  }

  static async createNotification(title: string, body: string, type: NotificationType = NotificationType.SYSTEM) {
    const notification = await prisma.notification.create({
      data: {
        title,
        body,
        type
      }
    });

    // Broadcast via SSE
    this.broadcast(notification);
    return notification;
  }

  private static broadcast(data: any) {
    this.clients.forEach(client => {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    });
  }

  static async getNotifications() {
    return prisma.notification.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  static async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
  }
}
