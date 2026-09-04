import Redis from 'ioredis';
import { broadcastToFrontend } from './websocket';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Publisher client
export const redisPublisher = new Redis(REDIS_URL);

// Subscriber client
export const redisSubscriber = new Redis(REDIS_URL);

export const initRedisSubscriber = () => {
  redisSubscriber.subscribe('ai_results', (err, count) => {
    if (err) {
      console.error('[Redis] Failed to subscribe: %s', err.message);
    } else {
      console.log(`[Redis] Subscribed to ${count} channel(s). Listening for AI results...`);
    }
  });

  redisSubscriber.on('message', (channel, message) => {
    if (channel === 'ai_results') {
      try {
        const data = JSON.parse(message);
        console.log(`[Redis] Received AI result for task ${data.task_id}: ${data.result_text}`);
        
        // Broadcast the result to the frontend
        if (data.type === 'screen') {
            broadcastToFrontend('screen_result', { text: data.result_text });
        } else if (data.type === 'sound') {
            broadcastToFrontend('sound_result', { text: data.result_text });
        }
      } catch (error) {
        console.error('[Redis] Error parsing message:', error);
      }
    }
  });
};
