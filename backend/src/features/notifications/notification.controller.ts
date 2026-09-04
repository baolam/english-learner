import { Request, Response } from 'express';
import { NotificationService } from './notification.service';

export const streamNotifications = (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  NotificationService.addClient(res);

  req.on('close', () => {
    NotificationService.removeClient(res);
  });
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await NotificationService.getNotifications();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = await NotificationService.markAsRead(id);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
};

export const createNotification = async (req: Request, res: Response) => {
  try {
    const { title, body, type } = req.body;
    const notification = await NotificationService.createNotification(title, body, type);
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create notification' });
  }
};
