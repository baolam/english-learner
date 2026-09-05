import { Router } from 'express';
import * as chatController from './chat.controller';

const router = Router();

// Chat Session Endpoints
router.get('/', chatController.getAllChatSessions);
router.get('/:id', chatController.getChatSessionById);
router.post('/', chatController.createChatSession);
router.put('/:id', chatController.updateChatSession);
router.delete('/:id', chatController.deleteChatSession);

// Chat Message Endpoints
router.post('/:id/messages', chatController.addChatMessage);
router.delete('/messages/:messageId', chatController.deleteChatMessage);

export default router;
