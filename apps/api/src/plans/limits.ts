import { Plan } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import dayjs from 'dayjs';
import { Errors } from '../utils/errors.js';

export const PLAN_LIMITS = {
  [Plan.Free]: { tripsPerMonth: 1, refinementsPerTrip: 3, alertsEnabled: false, watermark: true },
  [Plan.Premium]: { tripsPerMonth: Infinity, refinementsPerTrip: Infinity, alertsEnabled: true, watermark: false },
};

export async function enforceTripCreationLimit(userId: string) {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const plan = sub?.plan ?? Plan.Free;
  const limits = PLAN_LIMITS[plan];
  if (!Number.isFinite(limits.tripsPerMonth)) return;
  const start = dayjs().startOf('month').toDate();
  const end = dayjs().endOf('month').toDate();
  const count = await prisma.trip.count({ where: { userId, createdAt: { gte: start, lte: end } } });
  if (count >= limits.tripsPerMonth) {
    const upgradeUrl = `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/pricing`;
    throw Errors.PaymentRequired(`Monthly trip limit reached. Upgrade to Premium to create more trips: ${upgradeUrl}`);
  }
}

