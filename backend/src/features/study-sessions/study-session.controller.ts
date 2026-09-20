import { Request, Response } from 'express';
import * as studySessionService from './study-session.service';

export const getAllStudySessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status, search, page, limit } = req.query;
    const result = await studySessionService.getAllStudySessions({
      category: category as string,
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    res.status(200).json(result);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const getStudySessionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await studySessionService.getStudySessionById(id);
    if (!session) {
      res.status(404).json({ error: 'Study session not found' });
      return;
    }
    res.status(200).json(session);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const createStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await studySessionService.createStudySession(req.body);
    res.status(201).json(session);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const updateStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const session = await studySessionService.updateStudySession(id, req.body);
    res.status(200).json(session);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteStudySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await studySessionService.deleteStudySession(id);
    res.status(200).json({ message: 'Study session deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

// -------------------------------------------------------------
// Concept Relation Controller Handlers
// -------------------------------------------------------------

export const getConceptRelationsBySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const relations = await studySessionService.getConceptRelationsBySession(id);
    res.status(200).json(relations);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};

export const addConceptRelation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sourceTermId, targetTermId, relationType } = req.body;

    if (!sourceTermId || !targetTermId) {
      res.status(400).json({ error: 'sourceTermId and targetTermId are required' });
      return;
    }

    const relation = await studySessionService.addConceptRelation({
      sessionId: id,
      sourceTermId,
      targetTermId,
      relationType
    });

    res.status(201).json(relation);
  } catch (error) {
    const err = error as Error;
    res.status(400).json({ error: err.message });
  }
};

export const deleteConceptRelation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { relationId } = req.params;
    await studySessionService.deleteConceptRelation(relationId);
    res.status(200).json({ message: 'Concept relation deleted successfully' });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
};
