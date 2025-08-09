import { prisma } from '../db/prisma.js';

export async function getMe(userId: string) {
  const [user, sub] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);
  return { user, subscription: sub };
}

