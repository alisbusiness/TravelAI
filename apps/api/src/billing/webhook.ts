import { FastifyInstance } from 'fastify';
import { stripe } from './stripe.js';
import { env } from '../config/env.js';
import { prisma } from '../db/prisma.js';
import { Plan } from '@prisma/client';

export async function stripeWebhookRoute(app: FastifyInstance) {
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (req, body, done) => done(null, body));
  app.post('/webhooks/stripe', async (req, reply) => {
    let event: any = req.body;
    if (env.TEST_SKIP_STRIPE_SIGNATURE !== 'true') {
      const sig = req.headers['stripe-signature'] as string;
      if (!stripe || !env.STRIPE_WEBHOOK_SECRET) return reply.code(200).send({});
      try {
        event = stripe.webhooks.constructEvent(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET);
      } catch (err) {
        app.log.error({ err }, 'Invalid Stripe signature');
        return reply.code(400).send({});
      }
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        if (session.customer_email) {
          const user = await prisma.user.findUnique({ where: { email: session.customer_email } });
          if (user) {
            await prisma.subscription.update({
              where: { userId: user.id },
              data: {
                plan: Plan.Premium,
                status: 'active',
                stripeCustomerId: session.customer as string,
              },
            });
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = sub.customer as string;
        const subscription = await prisma.subscription.findFirst({ where: { stripeCustomerId: customerId } });
        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              plan: sub.status === 'active' ? Plan.Premium : Plan.Free,
              status: sub.status,
              currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null,
            },
          });
        }
        break;
      }
      default:
        break;
    }

    return reply.code(200).send({ received: true });
  });
}

