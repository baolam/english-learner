import { Router, Request, Response } from 'express';
import multer from 'multer';
import axios from 'axios';
import FormData from 'form-data';
import WebSocket from 'ws';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_WS_URL = AI_SERVICE_URL.replace(/^http/, 'ws');

// Helper to broadcast to frontend clients
const broadcastToFrontend = (type: string, payload: any) => {
  const wss = (global as any).wss;
  if (wss && wss.clients) {
    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  }
};

router.post('/screen', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    console.log(`[Webhook] Received SCREENSHOT webhook. Forwarding to AI service...`);

    const formData = new FormData();
    formData.append('file', file.buffer, {
      filename: file.originalname || 'screenshot.png',
      contentType: 'image/png', // Ép kiểu cứng thành image/png
    });

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/ocr`, formData, {
      headers: { ...formData.getHeaders() },
    });

    const extractedText = aiResponse.data.text;
    console.log(`[OCR Result] ${extractedText}`);

    // Broadcast result to frontend
    broadcastToFrontend('screen_result', { text: extractedText });

    res.status(200).json({ message: 'Screenshot processed.', text: extractedText });
  } catch (error: any) {
    console.error(`[Webhook Error] Processing screen webhook failed:`, error?.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/sound', upload.single('file'), async (req: Request, res: Response): Promise<any> => {
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
});

router.post('/text', upload.single('file'), (req: Request, res: Response): any => {
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
});

export default router;
