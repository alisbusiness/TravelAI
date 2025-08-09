import crypto from 'node:crypto';
import { prisma } from '../db/prisma.js';
import { cacheHitsCounter } from '../metrics.js';

export async function cacheGet(provider: string, key: unknown) {
  const keyHash = crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex');
  const row = await prisma.apiCache.findFirst({ where: { provider, keyHash } });
  if (!row) return null;
  if (row.expiresAt < new Date()) return null;
  cacheHitsCounter.inc();
  return row.payload as any;
}

export async function cacheSet(provider: string, key: unknown, payload: unknown, ttlSeconds: number) {
  const keyHash = crypto.createHash('sha256').update(JSON.stringify(key)).digest('hex');
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
  await prisma.apiCache.upsert({
    where: { provider_keyHash: { provider, keyHash } as any },
    update: { payload: payload as any, expiresAt },
    create: { provider, keyHash, payload: payload as any, expiresAt },
  });
}

