import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../src/server.js';
import supertest from 'supertest';

let app: Awaited<ReturnType<typeof buildServer>>;

describe('Stripe webhook', () => {
  beforeAll(async () => {
    process.env.TEST_SKIP_STRIPE_SIGNATURE = 'true';
    app = await buildServer();
  });
  afterAll(async () => {
    await app.close();
  });

  it('accepts checkout.session.completed', async () => {
    const evt = { type: 'checkout.session.completed', data: { object: { customer_email: 'webhook@tripgenie.ai', customer: 'cus_123' } } };
    const res = await supertest(app.server).post('/webhooks/stripe').send(evt);
    expect(res.status).toBe(200);
  });
});

