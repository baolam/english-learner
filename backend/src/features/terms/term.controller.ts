import { Request, Response } from 'express';
import * as termService from './term.service';

export const getAllTerms = async (req: Request, res: Response) => {
  try {
    const {
      termType,
      sourceType,
      documentId,
      screenshotId,
      audioRecordId,
      ankiSyncStatus,
      obsidianSyncStatus,
      search,
      page,
      limit
    } = req.query;

    const result = await termService.getAllTerms({
      termType: termType as string,
      sourceType: sourceType as string,
      documentId: documentId as string,
      screenshotId: screenshotId as string,
      audioRecordId: audioRecordId as string,
      ankiSyncStatus: ankiSyncStatus as string,
      obsidianSyncStatus: obsidianSyncStatus as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTermById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const term = await termService.getTermById(id);
    if (!term) {
      return res.status(404).json({ error: 'Term not found' });
    }
    res.status(200).json(term);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createTerm = async (req: Request, res: Response) => {
  try {
    const { term, termType, sourceType, documentId, screenshotId, audioRecordId, contextSentence, aiExplanation } = req.body;
    if (!term) {
      return res.status(400).json({ error: 'Term text is required' });
    }

    const createdTerm = await termService.createTerm({
      term,
      termType,
      sourceType,
      documentId,
      screenshotId,
      audioRecordId,
      contextSentence,
      aiExplanation
    });

    res.status(201).json(createdTerm);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTerm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedTerm = await termService.updateTerm(id, req.body);
    res.status(200).json(updatedTerm);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTerm = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await termService.deleteTerm(id);
    res.status(200).json({ message: 'Term deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
