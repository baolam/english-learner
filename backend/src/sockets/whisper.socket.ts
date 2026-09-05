import { WebSocketServer, WebSocket } from 'ws';
import { setWss } from '../utils/websocket';

export const initWhisperWebSocket = (wss: WebSocketServer) => {
  setWss(wss);

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
};
