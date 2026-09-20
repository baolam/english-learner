import { Router } from 'express';
import inputRoutes from '../features/input/input.routes';
import mediaRoutes from '../features/media/media.routes';
import ankiRoutes from '../features/anki/anki.routes';
import notificationRoutes from '../features/notifications/notification.routes';
import scheduleRoutes from '../features/schedules/schedule.routes';
import todoRoutes from '../features/todos/todo.routes';
import subjectRoutes from '../features/subjects/subject.routes';
import documentRoutes from '../features/documents/document.routes';
import termRoutes from '../features/terms/term.routes';
import chatRoutes from '../features/chat/chat.routes';
import flashcardRoutes from '../features/flashcards/flashcard.routes';
import settingRoutes from '../features/settings/setting.routes';
import studySessionRoutes from '../features/study-sessions/study-session.routes';
import aiRoutes from './ai.routes';

const router = Router();

// Feature Routes
router.use('/input', inputRoutes);
router.use('/media', mediaRoutes);
router.use('/anki', ankiRoutes);
router.use('/api/notifications', notificationRoutes);
router.use('/api/schedules', scheduleRoutes);
router.use('/api/todos', todoRoutes);
router.use('/api/subjects', subjectRoutes);
router.use('/api/documents', documentRoutes);
router.use('/api/terms', termRoutes);
router.use('/api/chat/sessions', chatRoutes);
router.use('/api/flashcards', flashcardRoutes);
router.use('/api/settings', settingRoutes);
router.use('/api/study-sessions', studySessionRoutes);
router.use('/api', aiRoutes);

export default router;
