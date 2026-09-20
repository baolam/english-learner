import { Router } from 'express';
import * as documentController from './document.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Document:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           type: string
 *         publishedYear:
 *           type: integer
 *         fileType:
 *           type: string
 *         status:
 *           type: string
 *         readingProgress:
 *           type: number
 *         subjectId:
 *           type: string
 *           format: uuid
 *         studySessionId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Highlight:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         documentId:
 *           type: string
 *           format: uuid
 *         text:
 *           type: string
 *         aiParaphrase:
 *           type: string
 *         aiSummary:
 *           type: string
 *         pageNumber:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/documents:
 *   get:
 *     summary: Retrieve list of documents with pagination & filtering
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: studySessionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fileType
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
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
 *         description: List of documents
 *   post:
 *     summary: Create a new document
 *     tags: [Documents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               studySessionId:
 *                 type: string
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               publishedYear:
 *                 type: integer
 *               tags:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *               localPath:
 *                 type: string
 *               sourceUrl:
 *                 type: string
 *               fileType:
 *                 type: string
 *               status:
 *                 type: string
 *               readingProgress:
 *                 type: number
 *     responses:
 *       201:
 *         description: Document created successfully
 *       400:
 *         description: Title is required
 */
router.get('/', documentController.getAllDocuments);
router.post('/', documentController.createDocument);

/**
 * @openapi
 * /api/documents/{id}:
 *   get:
 *     summary: Get document details by ID
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document detail with highlights
 *       404:
 *         description: Document not found
 *   put:
 *     summary: Update an existing document
 *     tags: [Documents]
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
 *               content:
 *                 type: string
 *               author:
 *                 type: string
 *               readingProgress:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Document updated successfully
 *   delete:
 *     summary: Delete a document
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully
 */
router.get('/:id', documentController.getDocumentById);
router.put('/:id', documentController.updateDocument);
router.delete('/:id', documentController.deleteDocument);

/**
 * @openapi
 * /api/documents/{id}/highlights:
 *   get:
 *     summary: Get all highlights for a specific document
 *     tags: [Highlights]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of document highlights
 *   post:
 *     summary: Add a highlight to a document
 *     tags: [Highlights]
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
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *               aiParaphrase:
 *                 type: string
 *               aiSummary:
 *                 type: string
 *               pageNumber:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Highlight created successfully
 *       400:
 *         description: Text is required
 */
router.get('/:id/highlights', documentController.getHighlights);
router.post('/:id/highlights', documentController.createHighlight);

/**
 * @openapi
 * /api/documents/highlights/{highlightId}:
 *   put:
 *     summary: Update a highlight
 *     tags: [Highlights]
 *     parameters:
 *       - in: path
 *         name: highlightId
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
 *               text:
 *                 type: string
 *               aiParaphrase:
 *                 type: string
 *               aiSummary:
 *                 type: string
 *               pageNumber:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Highlight updated successfully
 *   delete:
 *     summary: Delete a highlight
 *     tags: [Highlights]
 *     parameters:
 *       - in: path
 *         name: highlightId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Highlight deleted successfully
 */
router.put('/highlights/:highlightId', documentController.updateHighlight);
router.delete('/highlights/:highlightId', documentController.deleteHighlight);

export default router;
