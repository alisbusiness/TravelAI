import { prisma } from '../db/prisma.js';
import crypto from 'node:crypto';

export async function createOrUpdateShare(tripId: string, watermarkOff: boolean) {
  const slug = crypto.randomBytes(4).toString('hex');
  await prisma.trip.update({ where: { id: tripId }, data: { isPublic: true, publicSlug: slug, premiumWatermarkOff: watermarkOff } });
  return slug;
}

export async function getPublicTrip(slug: string) {
  const trip = await prisma.trip.findFirst({ where: { publicSlug: slug, isPublic: true }, include: { days: { include: { items: true } }, offers: true } });
  if (!trip) return null;
  return {
    title: trip.title,
    destinations: trip.destinations,
    startDate: trip.startDate,
    endDate: trip.endDate,
    days: trip.days.map((d) => ({ date: d.date, summary: d.summary, items: d.items.map((i) => ({ type: i.type, title: i.title, linkUrl: i.linkUrl, provider: i.provider })) })),
    offers: trip.offers.map((o) => ({ type: o.type, deeplinkUrl: o.deeplinkUrl, priceMinor: o.priceMinor, currency: o.currency })),
    watermark: !trip.premiumWatermarkOff,
  };
}

