import Redis from 'ioredis';
import { broadcastToFrontend } from './websocket';
import { broadcastSSE } from './sse';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Publisher client
export const redisPublisher = new Redis(REDIS_URL);

// Subscriber client
export const redisSubscriber = new Redis(REDIS_URL);

export const initRedisSubscriber = () => {
  redisSubscriber.subscribe('ai_results', 'ai_stream', (err, count) => {
    if (err) {
      console.error('[Redis] Failed to subscribe: %s', err.message);
    } else {
      console.log(`[Redis] Subscribed to ${count} channel(s). Listening for AI results and streams...`);
    }
  });

  redisSubscriber.on('message', (channel, message) => {
    if (channel === 'ai_stream') {
      try {
        const data = JSON.parse(message);
        // Broadcast stream chunk to frontend
        broadcastToFrontend('ai_stream_chunk', data);
        broadcastSSE('ai_stream_chunk', data);
      } catch (error) {
        // Fallback to sending raw message if not JSON
        broadcastToFrontend('ai_stream_chunk', { text: message });
        broadcastSSE('ai_stream_chunk', { text: message });
      }
    } else if (channel === 'ai_results') {
      try {
        const data = JSON.parse(message);
        console.log(`[Redis] Received AI result for task ${data.task_id}`);
        
        // Broadcast the result to the frontend
        if (data.type === 'screen') {
            import('./prisma').then(({ prisma }) => {
                prisma.screenshot.upsert({
                    where: { filename: data.task_id },
                    update: { extractedText: data.result_text },
                    create: { filename: data.task_id, extractedText: data.result_text }
                }).catch((err: any) => console.error('[Redis] DB update error:', err));
            });
            broadcastToFrontend('screen_result', { text: data.result_text });
            broadcastSSE('screen_result', { text: data.result_text });
        } else if (data.type === 'sound') {
            import('./prisma').then(({ prisma }) => {
                prisma.audioRecord.upsert({
                    where: { filename: data.task_id },
                    update: { extractedText: data.result_text },
                    create: { filename: data.task_id, extractedText: data.result_text }
                }).catch((err: any) => console.error('[Redis] DB update error (sound):', err));
            });
            broadcastToFrontend('sound_result', { text: data.result_text });
            broadcastSSE('sound_result', { text: data.result_text });
        } else if (data.type === 'text') {
            broadcastToFrontend('text_result', { text: data.result_text });
            broadcastSSE('text_result', { text: data.result_text });
        }
      } catch (error) {
        console.error('[Redis] Error parsing message:', error);
      }
    }
  });
};
