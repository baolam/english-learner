import { Router, Request, Response } from 'express';
import axios from 'axios';
import { addSSEClient, broadcastSSE } from '../utils/sse';
import { asyncHandler } from '../utils/async-handler';
import { AppError } from '../errors/app-error';

const router = Router();

/**
 * @openapi
 * /api/stream:
 *   get:
 *     summary: Server-Sent Events stream for AI & System notifications
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: SSE event stream connection established
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 */
router.get(['/stream', '/ai/stream'], (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });
  res.write('\n'); // keep-alive
  addSSEClient(res);
});

/**
 * @openapi
 * /api/chat:
 *   post:
 *     summary: Proxy chat request to external AI service stream
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               history:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Streamed AI response chunks
 *       502:
 *         description: Failed to contact AI service
 */
router.post(
  ['/chat', '/ai/chat'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const prompt = req.body?.prompt || req.body?.message || req.body?.text || '';
      const payload = {
        ...req.body,
        prompt
      };
      const aiRes = await axios.post(`${AI_SERVICE_URL}/api/chat/stream`, payload, {
        responseType: 'stream'
      });
      aiRes.data.pipe(res);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      console.error('[AI Proxy Error] Failed proxying chat to AI service:', errorDetail);
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

/**
 * @openapi
 * /api/ai/model-info:
 *   get:
 *     summary: Get current Llama model info and status
 *     tags: [AI]
 *     responses:
 *       200:
 *         description: Current active Llama model details
 *       502:
 *         description: AI Service unavailable
 */
router.get(
  ['/model-info', '/ai/model-info'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiRes = await axios.get(`${AI_SERVICE_URL}/api/ai/model-info`);
      res.json(aiRes.data);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

/**
 * @openapi
 * /api/ai/set-model:
 *   post:
 *     summary: Dynamically switch Llama model size (1b or 3b)
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model_size:
 *                 type: string
 *                 enum: [1b, 3b]
 *                 example: 3b
 *     responses:
 *       200:
 *         description: Model switched successfully
 *       502:
 *         description: AI Service unavailable
 */
router.post(
  ['/set-model', '/ai/set-model'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
      const aiRes = await axios.post(`${AI_SERVICE_URL}/api/ai/set-model`, req.body);
      res.json(aiRes.data);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

const proxyAIRequest = async (endpoint: string, reqBody: any, res: Response) => {
  const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
  const isFastFirst = reqBody?.fast_first === true || (reqBody?.fast === true && reqBody?.async_update === true);
  
  if (isFastFirst) {
    // 1. Get fast result first (traditional algorithm)
    const fastRes = await axios.post(`${AI_SERVICE_URL}${endpoint}`, { ...reqBody, fast: true });
    res.json(fastRes.data);
    
    // 2. Asynchronously run full LLM in background and update via SSE
    axios.post(`${AI_SERVICE_URL}${endpoint}`, { ...reqBody, fast: false })
      .then(fullRes => {
        broadcastSSE('ai_update', {
          endpoint,
          request: reqBody,
          data: fullRes.data
        });
      })
      .catch(err => {
        console.error(`[AI Background Update Error] Endpoint ${endpoint}:`, err?.message || err);
      });
    return;
  }
  
  const aiRes = await axios.post(`${AI_SERVICE_URL}${endpoint}`, reqBody);
  res.json(aiRes.data);
};

/**
 * @openapi
 * /api/ai/term-explain:
 *   post:
 *     summary: Explain vocabulary/term with IPA, definition, and collocations
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [term]
 *             properties:
 *               term:
 *                 type: string
 *               context_sentence:
 *                 type: string
 *               fast:
 *                 type: boolean
 *                 description: Return fast NLTK result immediately
 *               fast_first:
 *                 type: boolean
 *                 description: Return fast result first, then send full AI update via SSE stream
 *     responses:
 *       200:
 *         description: Structured term explanation
 *       502:
 *         description: AI Service unavailable
 */
router.post(
  ['/term-explain', '/ai/term-explain'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await proxyAIRequest('/api/ai/term-explain', req.body, res);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

/**
 * @openapi
 * /api/ai/grammar-parse:
 *   post:
 *     summary: Parse sentence grammar using hybrid NLTK + Llama engine
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sentence]
 *             properties:
 *               sentence:
 *                 type: string
 *               fast:
 *                 type: boolean
 *                 description: Return fast NLTK result immediately
 *               fast_first:
 *                 type: boolean
 *                 description: Return fast result first, then send full AI update via SSE stream
 *     responses:
 *       200:
 *         description: Detailed grammar breakdown (SVO & notes)
 *       502:
 *         description: AI Service unavailable
 */
router.post(
  ['/grammar-parse', '/ai/grammar-parse'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await proxyAIRequest('/api/ai/grammar-parse', req.body, res);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

/**
 * @openapi
 * /api/ai/flashcard-generate:
 *   post:
 *     summary: Generate Anki flashcard content from term and context
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [term]
 *             properties:
 *               term:
 *                 type: string
 *               context_sentence:
 *                 type: string
 *               definition:
 *                 type: string
 *               fast:
 *                 type: boolean
 *               fast_first:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Flashcard Front and Back content
 *       502:
 *         description: AI Service unavailable
 */
router.post(
  ['/flashcard-generate', '/ai/flashcard-generate'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await proxyAIRequest('/api/ai/flashcard-generate', req.body, res);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

/**
 * @openapi
 * /api/ai/extract-terms:
 *   post:
 *     summary: Extract key academic terms and definitions from text snippet
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *               fast:
 *                 type: boolean
 *               fast_first:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: List of key extracted terms
 *       502:
 *         description: AI Service unavailable
 */
router.post(
  ['/extract-terms', '/ai/extract-terms'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await proxyAIRequest('/api/ai/extract-terms', req.body, res);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

/**
 * @openapi
 * /api/ai/summarize-paraphrase:
 *   post:
 *     summary: Summarize and paraphrase academic text
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *               fast:
 *                 type: boolean
 *               fast_first:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Summary bullet points, simplified paraphrase, and takeaways
 *       502:
 *         description: AI Service unavailable
 */
router.post(
  ['/summarize-paraphrase', '/ai/summarize-paraphrase'],
  asyncHandler(async (req: Request, res: Response) => {
    try {
      await proxyAIRequest('/api/ai/summarize-paraphrase', req.body, res);
    } catch (error: any) {
      const errorDetail = error.response?.data ? JSON.stringify(error.response.data) : error.message;
      throw new AppError('Failed to contact AI service', 502, errorDetail);
    }
  })
);

export default router;

