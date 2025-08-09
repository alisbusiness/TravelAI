import { FastifyInstance } from 'fastify';
import { authGuard } from '../auth/middleware.js';
import { CreateTripSchema, createTrip } from './service.js';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { paginate } from '../utils/pagination.js';
import { createOrUpdateShare, getPublicTrip } from './share.js';

export async function tripsRoutes(app: FastifyInstance) {
  app.post('/trips', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const body = CreateTripSchema.parse(req.body);
    const trip = await createTrip(user.id, body);
    return trip;
  });

  app.get('/trips', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const query = z.object({ page: z.coerce.number().optional(), pageSize: z.coerce.number().optional() }).parse(req.query);
    const { skip, take } = paginate(query.page, query.pageSize);
    const [items, total] = await Promise.all([
      prisma.trip.findMany({ where: { userId: user.id }, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.trip.count({ where: { userId: user.id } }),
    ]);
    return { items, total, page: query.page ?? 1, pageSize: take };
  });

  app.get('/trips/:id', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const trip = await prisma.trip.findFirst({
      where: { id: params.id, userId: user.id },
      include: { days: { include: { items: true } }, offers: true },
    });
    return trip;
  });

  app.post('/trips/:id/refine', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const body = z.object({ instructions: z.string().min(1) }).parse(req.body);
    const trip = await prisma.trip.findFirstOrThrow({ where: { id: params.id, userId: user.id } });
    if (/increase hotel star/i.test(body.instructions)) {
      const hotel = await prisma.tripItem.findFirst({ where: { type: 'Hotel', day: { tripId: trip.id } } });
      if (hotel) await prisma.tripItem.update({ where: { id: hotel.id }, data: { details: { ...(hotel.details as any), stars: 5, fetchedAt: new Date().toISOString() } as any } });
    }
    return { ok: true };
  });

  app.post('/trips/:id/share', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const params = z.object({ id: z.string().min(1) }).parse(req.params);
    const body = z.object({ watermarkOff: z.boolean().optional() }).parse(req.body ?? {});
    const trip = await prisma.trip.findFirstOrThrow({ where: { id: params.id, userId: user.id } });
    const slug = await createOrUpdateShare(trip.id, body.watermarkOff ?? false);
    return { slug };
  });

  app.get('/public/trips/:slug', async (req, reply) => {
    const params = z.object({ slug: z.string().min(1) }).parse(req.params);
    const data = await getPublicTrip(params.slug);
    if (!data) return reply.code(404).send({ message: 'Not found' });
    return data;
  });

  app.get('/public/trips/:slug/og-image', async (req, reply) => {
    const params = z.object({ slug: z.string().min(1) }).parse(req.params);
    const data = await getPublicTrip(params.slug);
    if (!data) return reply.code(404).send('Not found');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="100%" height="100%" fill="#0ea5e9"/><text x="60" y="140" fill="#fff" font-size="64" font-family="Arial, Helvetica">${
      data.title
    }</text><text x="60" y="220" fill="#fff" font-size="36">${new Date(
      data.startDate,
    ).toDateString()} - ${new Date(data.endDate).toDateString()}</text><text x="60" y="280" fill="#fff" font-size="28">TripGenie</text></svg>`;
    reply.header('Content-Type', 'image/svg+xml');
    return reply.send(svg);
  });
}

