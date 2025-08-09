import { Worker, JobsOptions } from 'bullmq';
import IORedis from 'ioredis';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { createTransport } from '../emails/transporter.js';
import { priceDropEmail } from '../emails/templates.js';
import { jobsProcessedCounter } from '../metrics.js';

const connection = new IORedis(env.REDIS_URL);
const transport = createTransport();

export async function processAlert(alertId: string) {
  const alert = await prisma.priceAlert.findUnique({ where: { id: alertId }, include: { user: true, trip: true } as any });
  if (!alert || !alert.isActive) return;
  const oldPrice = alert.thresholdMinor + 1000;
  const newPrice = alert.thresholdMinor - 500; // simulate drop
  const foundBetter = newPrice < alert.thresholdMinor;
  await prisma.alertCheck.create({
    data: {
      alertId: alert.id,
      status: 'ok',
      foundBetter,
      oldPriceMinor: oldPrice,
      newPriceMinor: newPrice,
      details: { fetchedAt: new Date().toISOString() },
    },
  });
  await prisma.priceAlert.update({ where: { id: alert.id }, data: { lastCheckedAt: new Date() } });
  if (foundBetter) {
    const mail = priceDropEmail({ title: alert.type + ' deal', oldPrice: oldPrice / 100, newPrice: newPrice / 100, url: 'https://example.com' });
    await transport.sendMail({ to: (alert as any).user.email, from: process.env.EMAIL_FROM, subject: mail.subject, text: mail.text, html: mail.html });
  }
  jobsProcessedCounter.inc();
}

export const worker = new Worker(
  'alertChecks',
  async (job) => {
    const alertId = job.data.alertId as string;
    await processAlert(alertId);
  },
  { connection },
);

// Keep worker alive if executed directly
if (process.argv[1]?.includes('worker.ts')) {
  console.log('Alert worker started');
}

