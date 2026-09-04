import { Request, Response } from 'express';
import { broadcastToFrontend } from '../../utils/websocket';
import { redisPublisher } from '../../utils/redis';

export const handleScreenUpload = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    console.log(`[Webhook] Received SCREENSHOT webhook. Pushing to Redis queue...`);

    // Convert buffer to base64 to send via Redis
    const base64Image = file.buffer.toString('base64');
    const taskId = Date.now().toString();

    const taskPayload = {
      task_id: taskId,
      type: 'screen',
      image_base64: base64Image
    };

    await redisPublisher.rpush('ocr_tasks', JSON.stringify(taskPayload));

    res.status(200).json({ message: 'Screenshot received and queued.', task_id: taskId });
  } catch (error: any) {
    console.error(`[Webhook Error] Processing screen webhook failed:`, error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const handleSoundUpload = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Kết quả text giờ đây được đính kèm thẳng từ system-listener
    const extractedText = req.body.text || "";

    console.log(`[Webhook] Received SOUND webhook. File size: ${file.size} bytes. Text: "${extractedText}"`);

    // Broadcast result to frontend
    if (extractedText) {
      broadcastToFrontend('sound_result', { text: extractedText });
    }

    res.status(200).json({ message: 'Sound processed.', text: extractedText });
  } catch (error: any) {
    console.error(`[Webhook Error] Processing sound webhook failed:`, error?.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

export const handleTextUpload = (req: Request, res: Response): any => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const textContent = file.buffer.toString('utf-8');
    console.log(`[Webhook] Received TEXT webhook: "${textContent}"`);

    broadcastToFrontend('text_result', { text: textContent });

    res.status(200).json({ message: 'Text received successfully.', text: textContent });
  } catch (error: any) {
    console.error(`[Webhook Error] Processing text webhook failed:`, error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
};
