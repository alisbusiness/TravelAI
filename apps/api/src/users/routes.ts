import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authGuard } from '../auth/middleware.js';
import { prisma } from '../db/prisma.js';

export async function usersRoutes(app: FastifyInstance) {
  app.get('/me', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const me = await prisma.user.findUnique({
      where: { id: user.id },
      include: { subscription: true, preferences: true },
    });
    return me;
  });

  app.patch('/me/preferences', { preHandler: [authGuard] }, async (req) => {
    const user = (req as any).user as { id: string };
    const schema = z.object({
      hotelMinStars: z.number().min(1).max(5).optional(),
      hotelMaxPrice: z.number().int().positive().optional(),
      likesMuseums: z.boolean().optional(),
      dislikesNightlife: z.boolean().optional(),
      cuisinePrefs: z.any().optional(),
    });
    const body = schema.parse(req.body);
    const pref = await prisma.preference.upsert({
      where: { userId: user.id },
      update: body,
      create: { userId: user.id, ...body },
    });
    return pref;
  });
}

