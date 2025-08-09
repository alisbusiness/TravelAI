import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import sensible from '@fastify/sensible';
import rawBody from '@fastify/raw-body';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { registerRoutes } from './routes.js';
import client from 'prom-client';
import { registry } from './metrics.js';
import { AppError } from './utils/errors.js';

export async function buildServer() {
  const app = Fastify({ logger });

  await app.register(sensible);
  await app.register(cors, {
    origin: (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests from CLIENT_URL and localhost variations
      const allowedOrigins = [
        env.CLIENT_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    exposedHeaders: ['x-auth-token', 'x-refresh-token'],
  });
  await app.register(helmet, { global: true });
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });
  await app.register(rawBody, { field: 'rawBody', global: false, runFirst: true });

  await app.register(swagger, {
    openapi: {
      info: { title: 'TripGenie API', version: '1.0.0' },
    },
  });
  await app.register(swaggerUI, { routePrefix: '/docs' });

  await registerRoutes(app);

  app.get('/healthz', async () => ({ status: 'ok' }));
  app.get('/readyz', async () => ({ status: 'ready' }));

  // Metrics
  app.get('/metrics', async (_req, reply) => {
    reply.header('Content-Type', registry.contentType);
    return registry.metrics();
  });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AppError) {
      return reply.code(err.status).send({ code: err.code, message: err.message, details: err.details });
    }
    app.log.error(err);
    return reply.code(500).send({ code: 'INTERNAL', message: 'Internal Server Error' });
  });

  return app;
}

