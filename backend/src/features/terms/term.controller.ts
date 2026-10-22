import { Request, Response } from 'express';
import * as termService from './term.service';
import { asyncHandler } from '../../utils/async-handler';
import { NotFoundError, BadRequestError } from '../../errors/app-error';
import { TermType, SourceType, AnkiSyncStatus, ObsidianSyncStatus } from '@english-learner/types';

export const getAllTerms = asyncHandler(async (req: Request, res: Response) => {
  const {
    termType,
    sourceType,
    documentId,
    screenshotId,
    audioRecordId,
    sessionId,
    ankiSyncStatus,
    obsidianSyncStatus,
    search,
    page,
    limit
  } = req.query;

  const result = await termService.getAllTerms({
    termType: termType as TermType,
    sourceType: sourceType as SourceType,
    documentId: documentId as string,
    screenshotId: screenshotId as string,
    audioRecordId: audioRecordId as string,
    sessionId: sessionId as string,
    ankiSyncStatus: ankiSyncStatus as AnkiSyncStatus,
    obsidianSyncStatus: obsidianSyncStatus as ObsidianSyncStatus,
    search: search as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined
  });

  res.status(200).json(result);
});

export const getTermById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const term = await termService.getTermById(id);
  if (!term) {
    throw new NotFoundError('Term not found');
  }
  res.status(200).json(term);
});

export const createTerm = asyncHandler(async (req: Request, res: Response) => {
  const { term, termType, sourceType, documentId, screenshotId, audioRecordId, sessionId, contextSentence, aiExplanation, tags } = req.body;
  if (!term) {
    throw new BadRequestError('Term text is required');
  }

  const createdTerm = await termService.createTerm({
    term,
    termType,
    sourceType,
    documentId,
    screenshotId,
    audioRecordId,
    sessionId,
    contextSentence,
    aiExplanation,
    tags
  });

  res.status(201).json(createdTerm);
});

export const updateTerm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updatedTerm = await termService.updateTerm(id, req.body);
  res.status(200).json(updatedTerm);
});

export const deleteTerm = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await termService.deleteTerm(id);
  res.status(200).json({ message: 'Term deleted successfully' });
});
