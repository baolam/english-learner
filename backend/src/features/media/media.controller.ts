import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getDir } from '../../utils/upload';
import { broadcastToFrontend } from '../../utils/websocket';
import { redisPublisher } from '../../utils/redis';

export const uploadMedia = (type: 'screenshots' | 'audio') => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      if (type === 'screenshots') {
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const base64Image = fileBuffer.toString('base64');
        const taskId = Date.now().toString();

        const taskPayload = {
          task_id: taskId,
          type: 'screen',
          image_base64: base64Image
        };

        await redisPublisher.rpush('ocr_tasks', JSON.stringify(taskPayload));
        console.log(`[Media Webhook] Queued screenshot OCR task: ${taskId}`);
      } else if (type === 'audio') {
        const extractedText = req.body.text || "";
        if (extractedText) {
          broadcastToFrontend('sound_result', { text: extractedText });
        }
      }

      res.status(201).json({
        message: `${type} uploaded successfully`,
        filename: req.file.filename,
        path: `/media/${type}/${req.file.filename}`
      });
    } catch (error) {
      const err = error as Error;
      console.error(`[Media Controller] Error uploading ${type}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const listMedia = (type: 'screenshots' | 'audio') => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const dirPath = getDir(type);
      const files = await fs.promises.readdir(dirPath);
      const fileData = files.map(file => ({
        filename: file,
        url: `/media/${type}/${file}`
      }));
      res.status(200).json({ files: fileData });
    } catch (error) {
      const err = error as Error;
      console.error(`[Media Controller] Error listing ${type}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const deleteMedia = (type: 'screenshots' | 'audio') => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      const { filename } = req.params;
      const dirPath = getDir(type);
      const filePath = path.join(dirPath, filename);

      const exists = await fs.promises.access(filePath).then(() => true).catch(() => false);
      if (!exists) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      await fs.promises.unlink(filePath);
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      const err = error as Error;
      console.error(`[Media Controller] Error deleting ${type}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
