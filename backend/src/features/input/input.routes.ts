import { Router } from 'express';
import multer from 'multer';
import { handleScreenUpload, handleSoundUpload, handleTextUpload } from './input.controller';

import { diskStorage } from '../../utils/upload';

const router = Router();
const uploadText = multer({ storage: multer.memoryStorage() });
const uploadScreen = multer({ storage: diskStorage('screenshots') });
const uploadSound = multer({ storage: diskStorage('audio') });

/**
 * @openapi
 * /input/screen:
 *   post:
 *     summary: Upload a screenshot for OCR processing & background extraction
 *     tags: [Input Webhooks]
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
 *     responses:
 *       200:
 *         description: Screenshot uploaded & OCR task queued successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
router.post('/screen', uploadScreen.single('file'), handleScreenUpload);

/**
 * @openapi
 * /input/sound:
 *   post:
 *     summary: Upload an audio file with optional transcribed text
 *     tags: [Input Webhooks]
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
 *               text:
 *                 type: string
 *                 description: Pre-transcribed audio text
 *     responses:
 *       200:
 *         description: Sound record created and processed
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
router.post('/sound', uploadSound.single('file'), handleSoundUpload);

/**
 * @openapi
 * /input/text:
 *   post:
 *     summary: Upload a text file snippet
 *     tags: [Input Webhooks]
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
 *     responses:
 *       200:
 *         description: Text received successfully
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Server error
 */
router.post('/text', uploadText.single('file'), handleTextUpload);

export default router;
