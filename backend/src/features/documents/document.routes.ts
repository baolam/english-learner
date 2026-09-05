import { Router } from 'express';
import * as documentController from './document.controller';

const router = Router();

// Document Endpoints
router.get('/', documentController.getAllDocuments);
router.get('/:id', documentController.getDocumentById);
router.post('/', documentController.createDocument);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

// Highlight Endpoints
router.get('/:id/highlights', documentController.getHighlights);
router.post('/:id/highlights', documentController.createHighlight);
router.put('/highlights/:highlightId', documentController.updateHighlight);
router.delete('/highlights/:highlightId', documentController.deleteHighlight);

export default router;
