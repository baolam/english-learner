import { Request, Response } from 'express';
import * as documentService from './document.service';

export const getAllDocuments = async (req: Request, res: Response) => {
  try {
    const { subjectId, studySessionId, fileType, status, search, page, limit } = req.query;
    const result = await documentService.getAllDocuments({
      subjectId: subjectId as string,
      studySessionId: studySessionId as string,
      fileType: fileType as string,
      status: status as string,
      search: search as string,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined
    });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDocumentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await documentService.getDocumentById(id);
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.status(200).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createDocument = async (req: Request, res: Response) => {
  try {
    const { title, subjectId, studySessionId, content, author, publishedYear, tags, localPath, sourceUrl, fileType, status, readingProgress } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
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
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await documentService.updateDocument(id, req.body);
    res.status(200).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await documentService.deleteDocument(id);
    res.status(200).json({ message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------
// Highlight Controllers
// -------------------------------------------------------------

export const getHighlights = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const highlights = await documentService.getHighlightsByDocumentId(id);
    res.status(200).json(highlights);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createHighlight = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // documentId
    const { text, aiParaphrase, aiSummary, pageNumber } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for highlight' });
    }
    const highlight = await documentService.createHighlight({
      documentId: id,
      text,
      aiParaphrase,
      aiSummary,
      pageNumber
    });
    res.status(201).json(highlight);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateHighlight = async (req: Request, res: Response) => {
  try {
    const { highlightId } = req.params;
    const highlight = await documentService.updateHighlight(highlightId, req.body);
    res.status(200).json(highlight);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteHighlight = async (req: Request, res: Response) => {
  try {
    const { highlightId } = req.params;
    await documentService.deleteHighlight(highlightId);
    res.status(200).json({ message: 'Highlight deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
