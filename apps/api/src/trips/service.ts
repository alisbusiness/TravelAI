import { prisma } from '../db/prisma.js';
import { z } from 'zod';
import { generateItinerary } from '../orchestrator/planner.js';
import dayjs from 'dayjs';
import { enforceTripCreationLimit } from '../plans/limits.js';
import { tripsCreatedCounter } from '../metrics.js';

export const CreateTripSchema = z.object({
  title: z.string().min(1).default('My Trip'),
  origin: z.string().optional(),
  destinations: z.array(z.string().min(1)).min(1),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  budgetMin: z.number().int().optional(),
  budgetMax: z.number().int().optional(),
  travelers: z.number().int().positive().default(1),
  style: z.enum(['Relaxed', 'Balanced', 'Packed']).default('Balanced'),
  notes: z.string().optional(),
});

export async function createTrip(userId: string, body: z.infer<typeof CreateTripSchema>) {
  await enforceTripCreationLimit(userId);
  const start = dayjs(body.startDate).toDate();
  const end = dayjs(body.endDate).toDate();
  const trip = await prisma.trip.create({
    data: {
      userId,
      title: body.title,
      origin: body.origin,
      destinations: { cities: body.destinations },
      startDate: start,
      endDate: end,
      budgetMin: body.budgetMin,
      budgetMax: body.budgetMax,
      travelers: body.travelers,
      style: body.style as any,
      notes: body.notes,
    },
  });

  await generateItinerary(
    {
      userId,
      origin: body.origin,
      destinations: body.destinations,
      startDate: body.startDate,
      endDate: body.endDate,
      adults: body.travelers,
    },
    trip.id,
  );

  tripsCreatedCounter.inc();
  return prisma.trip.findUnique({ where: { id: trip.id }, include: { days: { include: { items: true } }, offers: true } });
}

