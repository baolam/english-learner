import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const getDir = (type: 'screenshots' | 'audio') => {
  const envKey = type === 'screenshots' ? 'SCREENSHOTS_UPLOAD_DIR' : 'AUDIO_UPLOAD_DIR';
  const defaultDir = `./uploads/${type}`;
  const dirPath = process.env[envKey] || defaultDir;
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

import { broadcastToFrontend } from '../../utils/websocket';
import { redisPublisher } from '../../utils/redis';

export const uploadMedia = (type: 'screenshots' | 'audio') => {
  return async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (type === 'screenshots') {
        const fileBuffer = fs.readFileSync(req.file.path);
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
      console.error(`[Media Controller] Error uploading ${type}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const listMedia = (type: 'screenshots' | 'audio') => {
  return (req: Request, res: Response) => {
    try {
      const dirPath = getDir(type);
      const files = fs.readdirSync(dirPath);
      const fileData = files.map(file => ({
        filename: file,
        url: `/media/${type}/${file}`
      }));
      res.status(200).json({ files: fileData });
    } catch (error) {
      console.error(`[Media Controller] Error listing ${type}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const deleteMedia = (type: 'screenshots' | 'audio') => {
  return (req: Request, res: Response) => {
    try {
      const { filename } = req.params;
      const dirPath = getDir(type);
      const filePath = path.join(dirPath, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      fs.unlinkSync(filePath);
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error(`[Media Controller] Error deleting ${type}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
