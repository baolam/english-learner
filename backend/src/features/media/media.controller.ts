import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getDir } from '../../utils/upload';
import { broadcastToFrontend } from '../../utils/websocket';
import { redisPublisher } from '../../utils/redis';

import { prisma } from '../../utils/prisma';

export const uploadMedia = (type: 'screenshots' | 'audio') => {
  return async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { sessionId, windowTitle, duration } = req.body;

      if (type === 'screenshots') {
        const fileBuffer = await fs.promises.readFile(req.file.path);
        const base64Image = fileBuffer.toString('base64');
        const taskId = req.file.filename;

        const taskPayload = {
          task_id: taskId,
          type: 'screen',
          image_base64: base64Image
        };

        // Save to DB with metadata
        await prisma.screenshot.create({
          data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            extractedText: '',
            windowTitle: windowTitle || null,
            sessionId: sessionId || null
          }
        });

        await redisPublisher.rpush('ocr_tasks', JSON.stringify(taskPayload));
        console.log(`[Media Webhook] Queued screenshot OCR task: ${taskId}`);
      } else if (type === 'audio') {
        const extractedText = req.body.text || "";
        const parsedDuration = duration ? parseFloat(duration) : null;
        
        // Save to DB
        await prisma.audioRecord.create({
          data: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            extractedText: extractedText,
            duration: parsedDuration,
            sessionId: sessionId || null
          }
        });

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
      
      let dbScreenshots: any[] = [];
      let dbAudios: any[] = [];
      if (type === 'screenshots') {
        dbScreenshots = await prisma.screenshot.findMany({
          include: { studySession: { select: { id: true, title: true } } }
        });
      } else if (type === 'audio') {
        dbAudios = await prisma.audioRecord.findMany({
          include: { studySession: { select: { id: true, title: true } } }
        });
      }

      const fileData = await Promise.all(files.map(async file => {
        const filePath = path.join(dirPath, file);
        const stats = await fs.promises.stat(filePath);
        
        let dbItem: any = null;
        if (type === 'screenshots') {
          dbItem = dbScreenshots.find(s => s.filename === file);
        } else if (type === 'audio') {
          dbItem = dbAudios.find(s => s.filename === file);
        }

        return {
          filename: file,
          url: `/media/${type}/${file}`,
          size: stats.size,
          createdAt: dbItem?.capturedAt || stats.birthtime,
          modifiedAt: stats.mtime,
          extractedText: dbItem?.extractedText,
          windowTitle: dbItem?.windowTitle,
          duration: dbItem?.duration,
          sessionId: dbItem?.sessionId,
          studySession: dbItem?.studySession
        };
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
      const rawFilename = req.params.filename;
      const decodedFilename = decodeURIComponent(rawFilename);
      const safeFilename = path.basename(decodedFilename);
      const dirPath = getDir(type);
      const filePath = path.resolve(dirPath, safeFilename);

      console.log(`[Media Controller] Deleting ${type} file: ${safeFilename} at ${filePath}`);

      // Attempt physical file deletion from disk
      let fileDeleted = false;
      try {
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath);
          fileDeleted = true;
          console.log(`[Media Controller] Physical file deleted from disk: ${filePath}`);
        } else {
          console.warn(`[Media Controller] Physical file not found on disk: ${filePath}, proceeding with DB deletion.`);
        }
      } catch (fileErr) {
        const fErr = fileErr as Error;
        console.error(`[Media Controller] Could not delete physical file ${filePath}:`, fErr.message);
      }

      // Delete DB records matching filename
      let deletedDbCount = 0;
      if (type === 'screenshots') {
        const result = await prisma.screenshot.deleteMany({
          where: {
            OR: [
              { filename: safeFilename },
              { filename: rawFilename }
            ]
          }
        });
        deletedDbCount = result.count;
      } else if (type === 'audio') {
        const result = await prisma.audioRecord.deleteMany({
          where: {
            OR: [
              { filename: safeFilename },
              { filename: rawFilename }
            ]
          }
        });
        deletedDbCount = result.count;
      }

      console.log(`[Media Controller] Deleted ${deletedDbCount} database record(s) for ${safeFilename}`);

      res.status(200).json({
        message: 'File and database record deleted successfully',
        fileDeleted,
        dbRecordsDeleted: deletedDbCount
      });
    } catch (error) {
      const err = error as Error;
      console.error(`[Media Controller] Error deleting ${type}:`, err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
