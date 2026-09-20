import { Router } from 'express';
import * as studySessionController from './study-session.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     StudySession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         category:
 *           type: string
 *           enum: [MEETING, LECTURE, RESEARCH, ENGLISH, CODING]
 *         status:
 *           type: string
 *           enum: [ACTIVE, PAUSED, COMPLETED, ARCHIVED]
 *         aiSummary:
 *           type: string
 *         startedAt:
 *           type: string
 *           format: date-time
 *         endedAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ConceptRelation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         sessionId:
 *           type: string
 *           format: uuid
 *         sourceTermId:
 *           type: string
 *           format: uuid
 *         targetTermId:
 *           type: string
 *           format: uuid
 *         relationType:
 *           type: string
 *           default: RELATED_TO
 */

/**
 * @openapi
 * /api/study-sessions:
 *   get:
 *     summary: Retrieve a list of study sessions
 *     tags: [StudySessions]
 *     parameters:
 *       - in: query
 *         name: category
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
 *         description: List of study sessions
 *   post:
 *     summary: Create a new study session
 *     tags: [StudySessions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *               aiSummary:
 *                 type: string
 *               startedAt:
 *                 type: string
 *               endedAt:
 *                 type: string
 *               tags:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Study session created successfully
 */
router.get('/', studySessionController.getAllStudySessions);
router.post('/', studySessionController.createStudySession);

/**
 * @openapi
 * /api/study-sessions/{id}:
 *   get:
 *     summary: Get study session by ID
 *     tags: [StudySessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Study session detail with relations
 *       404:
 *         description: Session not found
 *   put:
 *     summary: Update study session
 *     tags: [StudySessions]
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
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *               aiSummary:
 *                 type: string
 *               endedAt:
 *                 type: string
 *               tags:
 *                 oneOf:
 *                   - type: string
 *                   - type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Study session updated successfully
 *   delete:
 *     summary: Delete study session
 *     tags: [StudySessions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Study session deleted
 */
router.get('/:id', studySessionController.getStudySessionById);
router.put('/:id', studySessionController.updateStudySession);
router.delete('/:id', studySessionController.deleteStudySession);

/**
 * @openapi
 * /api/study-sessions/{id}/relations:
 *   get:
 *     summary: Get concept relations for a study session
 *     tags: [ConceptRelations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of concept relations
 *   post:
 *     summary: Add a concept relation between two terms in a study session
 *     tags: [ConceptRelations]
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
 *             required: [sourceTermId, targetTermId]
 *             properties:
 *               sourceTermId:
 *                 type: string
 *               targetTermId:
 *                 type: string
 *               relationType:
 *                 type: string
 *                 default: RELATED_TO
 *     responses:
 *       201:
 *         description: Concept relation created
 */
router.get('/:id/relations', studySessionController.getConceptRelationsBySession);
router.post('/:id/relations', studySessionController.addConceptRelation);

/**
 * @openapi
 * /api/study-sessions/relations/{relationId}:
 *   delete:
 *     summary: Delete a concept relation
 *     tags: [ConceptRelations]
 *     parameters:
 *       - in: path
 *         name: relationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Concept relation deleted
 */
router.delete('/relations/:relationId', studySessionController.deleteConceptRelation);

export default router;
