import { FastifyInstance } from 'fastify';
import { PLAN_LIMITS } from './limits.js';

export async function plansRoutes(app: FastifyInstance) {
  app.get('/plans', async () => {
    return {
      free: { ...PLAN_LIMITS.Free, name: 'Free' },
      premium: { ...PLAN_LIMITS.Premium, name: 'Premium' },
    };
  });
}

