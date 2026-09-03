import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import inputRoutes from './routes/inputRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// LingoAnki Routes
app.use('/input', inputRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'LingoAnki Backend API' });
});

const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Setup Global WebSocket broadcast helper
(global as any).wss = wss;

wss.on('connection', (ws: WebSocket) => {
  console.log('[WebSocket] Frontend client connected');
  ws.on('close', () => {
    console.log('[WebSocket] Frontend client disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`[Server] LingoAnki Backend is running on http://localhost:${PORT}`);
  console.log(`[WebSocket] Server listening on ws://localhost:${PORT}/ws`);
});
