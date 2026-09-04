import { Router } from 'express';
import { streamNotifications, getNotifications, markAsRead, createNotification } from './notification.controller';

const router = Router();

router.get('/stream', streamNotifications);
router.get('/', getNotifications);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);

export default router;
