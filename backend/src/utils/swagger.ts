import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import path from 'path';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'LingoAnki & Second Brain API Documentation',
      version: '1.0.0',
      description: 'API documentation for LingoAnki Learning Assistant & Second Brain application',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../index.{ts,js}'),
    path.join(__dirname, '../routes/*.{ts,js}'),
    path.join(__dirname, '../features/**/*.routes.{ts,js}'),
    './src/index.ts',
    './src/routes/*.ts',
    './src/features/**/*.routes.ts',
    './dist/index.js',
    './dist/routes/*.js',
    './dist/features/**/*.routes.js',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  console.log('[Swagger] API Documentation available at http://localhost:3000/api-docs');
};
