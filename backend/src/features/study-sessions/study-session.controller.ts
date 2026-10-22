import { Request, Response } from 'express';
import * as studySessionService from './study-session.service';
import { asyncHandler } from '../../utils/async-handler';
import { NotFoundError, BadRequestError } from '../../errors/app-error';
import { StudyCategory, StudyStatus } from '@english-learner/types';

export const getAllStudySessions = asyncHandler(async (req: Request, res: Response) => {
  const { category, status, search, page, limit } = req.query;
  const result = await studySessionService.getAllStudySessions({
    category: category as StudyCategory,
    status: status as StudyStatus,
    search: search as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined
  });
  res.status(200).json(result);
});

export const getStudySessionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = await studySessionService.getStudySessionById(id);
  if (!session) {
    throw new NotFoundError('Study session not found');
  }
  res.status(200).json(session);
});

export const createStudySession = asyncHandler(async (req: Request, res: Response) => {
  const session = await studySessionService.createStudySession(req.body);
  res.status(201).json(session);
});

export const updateStudySession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const session = await studySessionService.updateStudySession(id, req.body);
  res.status(200).json(session);
});

export const deleteStudySession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await studySessionService.deleteStudySession(id);
  res.status(200).json({ message: 'Study session deleted successfully' });
});

// -------------------------------------------------------------
// Concept Relation Controller Handlers
// -------------------------------------------------------------

export const getConceptRelationsBySession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const relations = await studySessionService.getConceptRelationsBySession(id);
  res.status(200).json(relations);
});

export const addConceptRelation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { sourceTermId, targetTermId, relationType } = req.body;

  if (!sourceTermId || !targetTermId) {
    throw new BadRequestError('sourceTermId and targetTermId are required');
  }

  const relation = await studySessionService.addConceptRelation({
    sessionId: id,
    sourceTermId,
    targetTermId,
    relationType
  });

  res.status(201).json(relation);
});

export const deleteConceptRelation = asyncHandler(async (req: Request, res: Response) => {
  const { relationId } = req.params;
  await studySessionService.deleteConceptRelation(relationId);
  res.status(200).json({ message: 'Concept relation deleted successfully' });
});
