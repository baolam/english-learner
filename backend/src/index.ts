import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import inputRoutes from './features/input/input.routes';
import mediaRoutes from './features/media/media.routes';
import ankiRoutes from './features/anki/anki.routes';
import { initRedisSubscriber } from './utils/redis';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LingoAnki Routes
app.use('/input', inputRoutes);
app.use('/media', mediaRoutes);
app.use('/anki', ankiRoutes);

// Serve static files
const screenshotsDir = process.env.SCREENSHOTS_UPLOAD_DIR || './uploads/screenshots';
const audioDir = process.env.AUDIO_UPLOAD_DIR || './uploads/audio';

if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

app.use('/media/screenshots', express.static(screenshotsDir));
app.use('/media/audio', express.static(audioDir));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LingoAnki Backend API' });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Setup Global WebSocket broadcast helper
(global as any).wss = wss;

const AI_WS_URL = process.env.AI_WS_URL || 'ws://localhost:8000/api/whisper/stream';

wss.on('connection', (ws: WebSocket, req) => {
  if (req.url === '/api/whisper/stream') {
    console.log('[WebSocket Proxy] Relaying audio stream to AI Service');
    const aiWs = new WebSocket(AI_WS_URL);
    
    aiWs.on('open', () => {
      ws.on('message', (message, isBinary) => {
        if (aiWs.readyState === WebSocket.OPEN) {
          aiWs.send(message, { binary: isBinary });
        }
      });
      
      aiWs.on('message', (message, isBinary) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message, { binary: isBinary });
        }
      });
    });

    ws.on('close', () => aiWs.close());
    aiWs.on('close', () => ws.close());
    aiWs.on('error', (err) => console.error('[WebSocket Proxy] AI WS Error:', err));
    return;
  }

  console.log('[WebSocket] Frontend client connected');
  ws.on('close', () => {
    console.log('[WebSocket] Frontend client disconnected');
  });
});

// Khởi tạo Redis Subscriber
initRedisSubscriber();

server.listen(PORT, () => {
  console.log(`[Server] LingoAnki Backend is running on http://localhost:${PORT}`);
  console.log(`[WebSocket] Server listening on ws://localhost:${PORT}/ws`);
});
