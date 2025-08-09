import { FastifyInstance } from 'fastify';
import { env } from '../config/env.js';

export async function googleAuthRoutes(app: FastifyInstance) {
  app.get('/auth/google', async (_req, reply) => {
    if (!env.GOOGLE_CLIENT_ID) return reply.code(501).send({ error: 'Google OAuth not configured' });
    return reply.redirect('/');
  });
  app.get('/auth/google/callback', async (_req, reply) => {
    if (!env.GOOGLE_CLIENT_ID) return reply.code(501).send({ error: 'Google OAuth not configured' });
    return reply.redirect('/');
  });
}

