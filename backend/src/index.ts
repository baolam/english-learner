import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import fs from 'fs';
import appRouter from './routes';
import { initWhisperWebSocket } from './sockets/whisper.socket';
import { initRedisSubscriber } from './utils/redis';
import { startScheduleCron } from './utils/cron/schedule.cron';
import { startCleanupCron } from './utils/cron/cleanup.cron';
import { errorHandler } from './middlewares/error.middleware';

import { setupSwagger } from './utils/swagger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Standard Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload files
const screenshotsDir = process.env.SCREENSHOTS_UPLOAD_DIR || './uploads/screenshots';
const audioDir = process.env.AUDIO_UPLOAD_DIR || './uploads/audio';

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

app.use('/media/screenshots', express.static(screenshotsDir));
app.use('/media/audio', express.static(audioDir));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: System status OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 service:
 *                   type: string
 *                   example: LingoAnki Backend API
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LingoAnki Backend API' });
});

// Mount All Application & Feature Routes
app.use('/', appRouter);

// Initialize Swagger Documentation
setupSwagger(app);

// Centralized Global Error Handler Middleware
app.use(errorHandler);

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize WebSocket Proxy & Helper
initWhisperWebSocket(wss);

// Initialize Redis Subscriber & Background Schedulers
initRedisSubscriber();
startScheduleCron();
startCleanupCron();

server.listen(PORT, () => {
  console.log(`[Server] LingoAnki Backend is running on http://localhost:${PORT}`);
  console.log(`[WebSocket] Server listening on ws://localhost:${PORT}`);
});
