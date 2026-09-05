import { Request, Response } from 'express';
import fs from 'fs';
import { broadcastToFrontend } from '../../utils/websocket';
import { broadcastSSE } from '../../utils/sse';
import { redisPublisher } from '../../utils/redis';
import { prisma } from '../../utils/prisma';

export const handleScreenUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    console.log(`[Webhook] Received SCREENSHOT webhook. Pushing to Redis queue...`);

    // Read from disk asynchronously
    const fileBuffer = await fs.promises.readFile(file.path);
    const base64Image = fileBuffer.toString('base64');
    const taskId = file.filename; // Use file.filename as task_id so it matches DB screenshot filename

    // Save to DB
    await prisma.screenshot.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        extractedText: '',
      }
    });

    const taskPayload = {
      task_id: taskId,
      type: 'screen',
      image_base64: base64Image
    };

    await redisPublisher.rpush('ocr_tasks', JSON.stringify(taskPayload));

    res.status(200).json({ message: 'Screenshot received and queued.', task_id: taskId });
  } catch (error) {
    const err = error as Error;
    console.error(`[Webhook Error] Processing screen webhook failed:`, err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const handleSoundUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    // Kết quả text giờ đây được đính kèm thẳng từ system-listener
    const extractedText = req.body.text || "";

    console.log(`[Webhook] Received SOUND webhook. File size: ${file.size} bytes. Text: "${extractedText}"`);

    // Save to DB
    await prisma.audioRecord.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        extractedText: extractedText,
      }
    });

    // Broadcast result to frontend
    if (extractedText) {
      broadcastToFrontend('sound_result', { text: extractedText });
      broadcastSSE('sound_result', { text: extractedText });
    }

    res.status(200).json({ message: 'Sound processed.', text: extractedText });
  } catch (error) {
    const err = error as Error;
    console.error(`[Webhook Error] Processing sound webhook failed:`, err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const handleTextUpload = (req: Request, res: Response): void => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded.' });
      return;
    }

    const textContent = file.buffer.toString('utf-8');
    console.log(`[Webhook] Received TEXT webhook: "${textContent}"`);

    broadcastToFrontend('text_result', { text: textContent });
    broadcastSSE('text_result', { text: textContent });

    res.status(200).json({ message: 'Text received successfully.', text: textContent });
  } catch (error) {
    const err = error as Error;
    console.error(`[Webhook Error] Processing text webhook failed:`, err.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
