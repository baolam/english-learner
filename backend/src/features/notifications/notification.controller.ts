import { Request, Response } from 'express';
import { NotificationService } from './notification.service';
import { asyncHandler } from '../../utils/async-handler';
import { BadRequestError } from '../../errors/app-error';
import { NotificationType } from '@english-learner/types';

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

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await NotificationService.getNotifications();
  res.json(notifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const notification = await NotificationService.markAsRead(id);
  res.json(notification);
});

export const createNotification = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, type } = req.body;
  if (!title || !body) {
    throw new BadRequestError('title and body are required');
  }
  const notification = await NotificationService.createNotification(title, body, type as NotificationType);
  res.json(notification);
});
