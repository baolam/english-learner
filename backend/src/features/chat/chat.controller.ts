import { Request, Response } from 'express';
import * as chatService from './chat.service';

export const getAllChatSessions = async (req: Request, res: Response) => {
  try {
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getChatSessionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await chatService.getChatSessionById(id);
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found' });
    }
    res.status(200).json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createChatSession = async (req: Request, res: Response) => {
  try {
    const { title, sourceType, documentId, screenshotId, audioRecordId } = req.body;
    const session = await chatService.createChatSession({
      title,
      sourceType,
      documentId,
      screenshotId,
      audioRecordId
    });
    res.status(201).json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateChatSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = await chatService.updateChatSession(id, req.body);
    res.status(200).json(session);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChatSession = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await chatService.deleteChatSession(id);
    res.status(200).json({ message: 'Chat session deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------
// Message Controllers
// -------------------------------------------------------------

export const addChatMessage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // chatSessionId
    const { role, message, extractedData } = req.body;
    if (!role || !message) {
      return res.status(400).json({ error: 'Role and message are required' });
    }
    const chatMsg = await chatService.addChatMessage({
      chatSessionId: id,
      role,
      message,
      extractedData
    });
    res.status(201).json(chatMsg);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteChatMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    await chatService.deleteChatMessage(messageId);
    res.status(200).json({ message: 'Chat message deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
