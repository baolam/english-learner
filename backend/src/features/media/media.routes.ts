import { Router, Request } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadMedia, listMedia, deleteMedia } from './media.controller';

const router = Router();

import { getDir, diskStorage } from '../../utils/upload';

const uploadScreenshot = multer({ storage: diskStorage('screenshots') });
const uploadAudio = multer({ storage: diskStorage('audio') });

/**
 * @openapi
 * /media/screenshots:
 *   post:
 *     summary: Upload a screenshot media file with optional metadata
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               sessionId:
 *                 type: string
 *               windowTitle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Screenshot uploaded successfully
 *       400:
 *         description: No file uploaded
 *   get:
 *     summary: List all saved screenshot files and metadata
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: List of screenshots
 */
router.post('/screenshots', uploadScreenshot.single('file'), uploadMedia('screenshots'));
router.get('/screenshots', listMedia('screenshots'));

/**
 * @openapi
 * /media/screenshots/{filename}:
 *   delete:
 *     summary: Delete screenshot file and associated DB record
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Screenshot file and database record deleted
 */
router.delete('/screenshots/:filename', deleteMedia('screenshots'));

/**
 * @openapi
 * /media/audio:
 *   post:
 *     summary: Upload an audio media file with optional metadata
 *     tags: [Media]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               sessionId:
 *                 type: string
 *               text:
 *                 type: string
 *               duration:
 *                 type: number
 *     responses:
 *       201:
 *         description: Audio file uploaded successfully
 *       400:
 *         description: No file uploaded
 *   get:
 *     summary: List all saved audio files and metadata
 *     tags: [Media]
 *     responses:
 *       200:
 *         description: List of audio files
 */
router.post('/audio', uploadAudio.single('file'), uploadMedia('audio'));
router.get('/audio', listMedia('audio'));

/**
 * @openapi
 * /media/audio/{filename}:
 *   delete:
 *     summary: Delete audio file and associated DB record
 *     tags: [Media]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Audio file and database record deleted
 */
router.delete('/audio/:filename', deleteMedia('audio'));

export default router;
