import { Router, Request, Response } from 'express';
import axios from 'axios';
import { addSSEClient } from '../utils/sse';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../errors/app-error';

const router = Router();

router.get('/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n'); // keep-alive
  addSSEClient(res);
});

router.post(
  '/chat',
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiRes = await axios.post(`${AI_SERVICE_URL}/api/chat/stream`, req.body, {
        responseType: 'stream'
      });
      aiRes.data.pipe(res);
    } catch (error: any) {
      console.error('[AI Proxy Error] Failed proxying chat to AI service:', error.message);
      throw new AppError('Failed to contact AI service', 502, error.message);
    }
  })
);

export default router;
