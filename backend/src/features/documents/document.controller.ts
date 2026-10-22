import { Request, Response } from 'express';
import * as documentService from './document.service';
import { asyncHandler } from '../../utils/async-handler';
import { NotFoundError, BadRequestError } from '../../errors/app-error';
import { FileType, DocumentStatus } from '@english-learner/types';

export const getAllDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { subjectId, studySessionId, fileType, status, search, page, limit } = req.query;
  const result = await documentService.getAllDocuments({
    subjectId: subjectId as string,
    studySessionId: studySessionId as string,
    fileType: fileType as FileType,
    status: status as DocumentStatus,
    search: search as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined
  });
  res.status(200).json(result);
});

export const getDocumentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await documentService.getDocumentById(id);
  if (!doc) {
    throw new NotFoundError('Document not found');
  }
  res.status(200).json(doc);
});

export const createDocument = asyncHandler(async (req: Request, res: Response) => {
  const { title, subjectId, studySessionId, content, author, publishedYear, tags, localPath, sourceUrl, fileType, status, readingProgress } = req.body;
  if (!title) {
    throw new BadRequestError('Title is required');
  }
  const doc = await documentService.createDocument({
    title,
    subjectId,
    studySessionId,
    content,
    author,
    publishedYear: publishedYear ? parseInt(publishedYear, 10) : undefined,
    tags,
    localPath,
    sourceUrl,
    fileType,
    status,
    readingProgress
  });
  res.status(201).json(doc);
});

export const updateDocument = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = await documentService.updateDocument(id, req.body);
  res.status(200).json(doc);
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  await documentService.deleteDocument(id);
  res.status(200).json({ message: 'Document deleted successfully' });
});

// -------------------------------------------------------------
// Highlight Controllers
// -------------------------------------------------------------

export const getHighlights = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const highlights = await documentService.getHighlightsByDocumentId(id);
  res.status(200).json(highlights);
});

export const createHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params; // documentId
  const { text, aiParaphrase, aiSummary, pageNumber } = req.body;
  if (!text) {
    throw new BadRequestError('Text is required for highlight');
  }
  const highlight = await documentService.createHighlight({
    documentId: id,
    text,
    aiParaphrase,
    aiSummary,
    pageNumber
  });
  res.status(201).json(highlight);
});

export const updateHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  const highlight = await documentService.updateHighlight(highlightId, req.body);
  res.status(200).json(highlight);
});

export const deleteHighlight = asyncHandler(async (req: Request, res: Response) => {
  const { highlightId } = req.params;
  await documentService.deleteHighlight(highlightId);
  res.status(200).json({ message: 'Highlight deleted successfully' });
});
