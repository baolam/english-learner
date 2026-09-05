import { Request, Response } from 'express';
import * as chatService from './chat.service';
import { asyncHandler } from '../../utils/async-handler';
import { NotFoundError, BadRequestError } from '../../errors/app-error';

export const getAllChatSessions = asyncHandler(async (req: Request, res: Response) => {
  const { sourceType, documentId, screenshotId, audioRecordId, search, page, limit } = req.query;
  const result = await chatService.getAllChatSessions({
    sourceType: sourceType as string,
    documentId: documentId as string,
    screenshotId: screenshotId as string,
    audioRecordId: audioRecordId as string,
    search: search as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined
  });
  res.status(200).json(result);
});

export const getChatSessionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = await chatService.getChatSessionById(id);
  if (!session) {
    throw new NotFoundError('Chat session not found');
  }
  res.status(200).json(session);
});

export const createChatSession = asyncHandler(async (req: Request, res: Response) => {
  const { title, sourceType, documentId, screenshotId, audioRecordId } = req.body;
  const session = await chatService.createChatSession({
    title,
    sourceType,
    documentId,
    screenshotId,
    audioRecordId
  });
  res.status(201).json(session);
});

export const updateChatSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = await chatService.updateChatSession(id, req.body);
  res.status(200).json(session);
});

export const deleteChatSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await chatService.deleteChatSession(id);
  res.status(200).json({ message: 'Chat session deleted successfully' });
});

export const addChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // chatSessionId
  const { role, message, extractedData } = req.body;
  if (!role || !message) {
    throw new BadRequestError('Role and message are required');
  }
  const chatMsg = await chatService.addChatMessage({
    chatSessionId: id,
    role,
    message,
    extractedData
  });
  res.status(201).json(chatMsg);
});

export const deleteChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { messageId } = req.params;
  await chatService.deleteChatMessage(messageId);
  res.status(200).json({ message: 'Chat message deleted successfully' });
});
