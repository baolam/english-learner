import { Router } from 'express';
import * as settingController from './setting.controller';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Settings:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         whisperModel:
 *           type: string
 *         ankiDeckName:
 *           type: string
 *         obsidianVaultPath:
 *           type: string
 *         autoSyncAnki:
 *           type: boolean
 *         autoSyncObsidian:
 *           type: boolean
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/settings:
 *   get:
 *     summary: Get application settings
 *     tags: [Settings]
 *     responses:
 *       200:
 *         description: Application settings object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Settings'
 *   put:
 *     summary: Update application settings
 *     tags: [Settings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               whisperModel:
 *                 type: string
 *               ankiDeckName:
 *                 type: string
 *               obsidianVaultPath:
 *                 type: string
 *               autoSyncAnki:
 *                 type: boolean
 *               autoSyncObsidian:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Settings updated successfully and broadcasted via SSE
 */
router.get('/', settingController.getSettings);
router.put('/', settingController.updateSettings);

export default router;
