import { FastifyInstance } from 'fastify';
import { authGuard, roleGuard } from '../auth/middleware.js';
import { alertChecksQueue } from '../alerts/queue.js';

export async function adminRoutes(app: FastifyInstance) {
  app.get('/admin/jobs', { preHandler: [authGuard, roleGuard('admin')] }, async () => {
    const counts = await alertChecksQueue.getJobCounts();
    const waiting = await alertChecksQueue.getWaiting(0, 10);
    return { counts, waiting: waiting.map((j) => ({ id: j.id, name: j.name, data: j.data })) };
  });
}

