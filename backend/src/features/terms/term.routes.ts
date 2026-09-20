import { Router } from 'express';
import * as termController from './term.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Term:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         term:
 *           type: string
 *         termType:
 *           type: string
 *           enum: [VOCABULARY, CONCEPT, ABBREVIATION, FORMULA]
 *         sourceType:
 *           type: string
 *           enum: [SCREENSHOT, AUDIO, DOCUMENT, MANUAL]
 *         contextSentence:
 *           type: string
 *         aiExplanation:
 *           type: string
 *         ankiSyncStatus:
 *           type: string
 *           enum: [NOT_SYNCED, SYNCED, ERROR]
 *         obsidianSyncStatus:
 *           type: string
 *           enum: [NOT_SYNCED, SYNCED, ERROR]
 *         documentId:
 *           type: string
 *           format: uuid
 *         screenshotId:
 *           type: string
 *           format: uuid
 *         audioRecordId:
 *           type: string
 *           format: uuid
 *         sessionId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/terms:
 *   get:
 *     summary: Retrieve list of vocabulary / concepts with pagination & filtering
 *     tags: [Terms]
 *     parameters:
 *       - in: query
 *         name: termType
 *         schema:
 *           type: string
 *       - in: query
 *         name: sourceType
 *         schema:
 *           type: string
 *       - in: query
 *         name: documentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: screenshotId
 *         schema:
 *           type: string
 *       - in: query
 *         name: audioRecordId
 *         schema:
 *           type: string
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: ankiSyncStatus
 *         schema:
 *           type: string
 *       - in: query
 *         name: obsidianSyncStatus
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
 *         description: List of terms
 *   post:
 *     summary: Create a new term / concept
 *     tags: [Terms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [term]
 *             properties:
 *               term:
 *                 type: string
 *               termType:
 *                 type: string
 *               sourceType:
 *                 type: string
 *               documentId:
 *                 type: string
 *               screenshotId:
 *                 type: string
 *               audioRecordId:
 *                 type: string
 *               sessionId:
 *                 type: string
 *               contextSentence:
 *                 type: string
 *               aiExplanation:
 *                 type: string
 *               tags:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Term created successfully
 *       400:
 *         description: Term text is required
 */
router.get('/', termController.getAllTerms);
router.post('/', termController.createTerm);

/**
 * @openapi
 * /api/terms/{id}:
 *   get:
 *     summary: Get term details by ID
 *     tags: [Terms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Term detail
 *       404:
 *         description: Term not found
 *   put:
 *     summary: Update an existing term
 *     tags: [Terms]
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
 *               term:
 *                 type: string
 *               contextSentence:
 *                 type: string
 *               aiExplanation:
 *                 type: string
 *               ankiSyncStatus:
 *                 type: string
 *               obsidianSyncStatus:
 *                 type: string
 *     responses:
 *       200:
 *         description: Term updated successfully
 *   delete:
 *     summary: Delete a term
 *     tags: [Terms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Term deleted successfully
 */
router.get('/:id', termController.getTermById);
router.put('/:id', termController.updateTerm);
router.delete('/:id', termController.deleteTerm);

export default router;
