import WebSocket, { WebSocketServer } from 'ws';

let wssInstance: WebSocketServer | null = null;

export const setWss = (wss: WebSocketServer) => {
  wssInstance = wss;
};

export const broadcastToFrontend = (type: string, payload: any) => {
  if (wssInstance && wssInstance.clients) {
    wssInstance.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  }
};
