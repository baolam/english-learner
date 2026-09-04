import { Response } from 'express';

const clients: Response[] = [];

export const addSSEClient = (res: Response) => {
  clients.push(res);
  res.on('close', () => {
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
    }
  });
};

export const broadcastSSE = (type: string, payload: any) => {
  const dataString = JSON.stringify({ type, payload });
  clients.forEach(client => {
    client.write(`data: ${dataString}\n\n`);
  });
};
