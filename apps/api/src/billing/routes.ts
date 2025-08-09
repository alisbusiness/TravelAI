import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { stripe } from './stripe.js';
import { env } from '../config/env.js';
import { stripeWebhookRoute } from './webhook.js';
import { authGuard } from '../auth/middleware.js';
import { prisma } from '../db/prisma.js';

export async function billingRoutes(app: FastifyInstance) {
  await stripeWebhookRoute(app);

  app.post('/billing/checkout', { preHandler: [authGuard] }, async (req) => {
    const schema = z.object({ plan: z.enum(['monthly', 'yearly']) });
    const { plan } = schema.parse(req.body);
    if (!stripe || !env.STRIPE_SECRET_KEY) return { url: env.STRIPE_SUCCESS_URL };
    const user = (req as any).user as { id: string };
    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    let sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    if (!sub) sub = await prisma.subscription.create({ data: { userId: user.id } });
    let customerId = sub.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: dbUser.email });
      customerId = customer.id;
      await prisma.subscription.update({ where: { id: sub.id }, data: { stripeCustomerId: customerId } });
    }
    const price = plan === 'monthly' ? env.STRIPE_PRICE_PREMIUM_MONTHLY : env.STRIPE_PRICE_PREMIUM_YEARLY;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: price!, quantity: 1 }],
      success_url: env.STRIPE_SUCCESS_URL!,
      cancel_url: env.STRIPE_CANCEL_URL!,
      customer: customerId!,
    });
    return { url: session.url };
  });

  app.get('/billing/portal', { preHandler: [authGuard] }, async (req) => {
    if (!stripe || !env.STRIPE_SECRET_KEY) return { url: env.STRIPE_SUCCESS_URL };
    const user = (req as any).user as { id: string };
    const sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
    if (!sub?.stripeCustomerId) return { url: env.STRIPE_SUCCESS_URL };
    const session = await stripe.billingPortal.sessions.create({ customer: sub.stripeCustomerId });
    return { url: session.url };
  });
}

