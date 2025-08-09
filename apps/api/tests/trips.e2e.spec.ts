import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../src/server.js';
import supertest from 'supertest';
import { createMagicToken } from '../src/auth/magicLink.js';

let app: Awaited<ReturnType<typeof buildServer>>;

describe('Trips', () => {
  beforeAll(async () => {
    app = await buildServer();
  });
  afterAll(async () => {
    await app.close();
  });

  it('creates a trip and returns itinerary', async () => {
    const tokenRes = await supertest(app.server).post('/auth/email/verify').send({ token: createMagicToken('tripuser@tripgenie.ai') });
    const token = tokenRes.body.accessToken as string;
    const res = await supertest(app.server)
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Trip',
        origin: 'NYC',
        destinations: ['Paris'],
        startDate: '2025-05-01',
        endDate: '2025-05-05',
        travelers: 2,
      });
    expect(res.status).toBe(200);
    expect(res.body.days?.length).toBeGreaterThan(0);
    const items = res.body.days.flatMap((d: any) => d.items);
    expect(items.find((i: any) => i.type === 'Flight')).toBeTruthy();
    expect(items.find((i: any) => i.type === 'Hotel')).toBeTruthy();
    expect(items.filter((i: any) => i.type === 'Activity').length).toBeGreaterThanOrEqual(1);
  });
});

