import express from 'express';
import cors from 'cors';
import appRouter from '../../src/routes';
import { errorHandler } from '../../src/middlewares/error.middleware';

/**
 * Builds the same route/middleware wiring as src/index.ts, minus the parts
 * that aren't relevant (or safe) to run under Jest: server.listen, the ws
 * server, cron jobs, and the Redis pub/sub subscriber. Tests exercise the
 * app purely through supertest requests.
 */
export function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/', appRouter);
  app.use(errorHandler);
  return app;
}
