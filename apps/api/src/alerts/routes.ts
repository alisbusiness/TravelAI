import { FastifyInstance } from 'fastify';
import { authGuard } from '../auth/middleware.js';
import { prisma } from '../db/prisma.js';
import { z } from 'zod';
import crypto from 'node:crypto';
import { alertChecksQueue } from './queue.js';
import { PLAN_LIMITS } from '../plans/limits.js';

export async function alertsRoutes(app: FastifyInstance) {
  app.get('/alerts', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const alerts = await prisma.priceAlert.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
    return alerts;
  });

  app.delete('/alerts/:id', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    await prisma.priceAlert.deleteMany({ where: { id: params.id, userId: user.id } });
    return { ok: true };
  });

  app.post('/trips/:id/track', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const body = z
      .object({
        type: z.enum(['Flight', 'Hotel']),
        params: z.any(),
        thresholdMinor: z.number().int().positive(),
        currency: z.string().min(3),
      })
      .parse(req.body);

    const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    const canAlert = sub?.plan && PLAN_LIMITS[sub.plan].alertsEnabled;
    if (!canAlert) return { error: 'Alerts are Premium only' };

    const queryHash = crypto.createHash('sha256').update(JSON.stringify(body.params)).digest('hex');
    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        tripId: params.id,
        type: body.type as any,
        params: body.params as any,
        queryHash,
        thresholdMinor: body.thresholdMinor,
        currency: body.currency,
      },
    });
    await alertChecksQueue.add('check', { alertId: alert.id }, { attempts: 3, backoff: { type: 'exponential', delay: 5000 }, repeat: { every: 1000 * 60 * 60 * 6 } });
    return alert;
  });

  app.get('/providers', async () => {
    return {
      amadeus: process.env.PROVIDER_AMADEUS_ENABLED === 'true',
      kiwi: process.env.PROVIDER_KIWI_ENABLED === 'true',
      gyg: process.env.PROVIDER_GYG_ENABLED === 'true',
    };
  });
}

