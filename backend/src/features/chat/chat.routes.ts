import { Router } from 'express';
import * as chatController from './chat.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ChatSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         sourceType:
 *           type: string
 *           enum: [DOCUMENT, SCREENSHOT, AUDIO, GENERAL]
 *         documentId:
 *           type: string
 *           format: uuid
 *         screenshotId:
 *           type: string
 *           format: uuid
 *         audioRecordId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ChatMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         chatSessionId:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [USER, ASSISTANT, SYSTEM]
 *         message:
 *           type: string
 *         extractedData:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/chat/sessions:
 *   get:
 *     summary: Retrieve list of chat sessions
 *     tags: [Chat]
 *     parameters:
 *       - in: query
 *         name: sourceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: documentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: screenshotId
 *         schema:
 *           type: string
 *       - in: query
 *         name: audioRecordId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of chat sessions
 *   post:
 *     summary: Create a new chat session
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               sourceType:
 *                 type: string
 *               documentId:
 *                 type: string
 *               screenshotId:
 *                 type: string
 *               audioRecordId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Chat session created
 */
router.get('/', chatController.getAllChatSessions);
router.post('/', chatController.createChatSession);

/**
 * @openapi
 * /api/chat/sessions/{id}:
 *   get:
 *     summary: Get chat session details with messages
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat session details
 *       404:
 *         description: Chat session not found
 *   put:
 *     summary: Update chat session title
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *     responses:
 *       200:
 *         description: Chat session updated successfully
 *   delete:
 *     summary: Delete a chat session and its messages
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat session deleted successfully
 */
router.get('/:id', chatController.getChatSessionById);
router.put('/:id', chatController.updateChatSession);
router.delete('/:id', chatController.deleteChatSession);

/**
 * @openapi
 * /api/chat/sessions/{id}/messages:
 *   post:
 *     summary: Add a message to a chat session
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role, message]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, ASSISTANT, SYSTEM]
 *               message:
 *                 type: string
 *               extractedData:
 *                 type: object
 *     responses:
 *       201:
 *         description: Chat message added
 *       400:
 *         description: Role and message are required
 */
router.post('/:id/messages', chatController.addChatMessage);

/**
 * @openapi
 * /api/chat/sessions/messages/{messageId}:
 *   delete:
 *     summary: Delete a single chat message
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chat message deleted successfully
 */
router.delete('/messages/:messageId', chatController.deleteChatMessage);

export default router;
