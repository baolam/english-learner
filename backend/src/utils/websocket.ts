import WebSocket from 'ws';

export const broadcastToFrontend = (type: string, payload: any) => {
  const wss = (global as any).wss;
  if (wss && wss.clients) {
    wss.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type, payload }));
      }
    });
  }
};
