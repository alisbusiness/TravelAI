import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../src/server.js';
import supertest from 'supertest';
import { createMagicToken } from '../src/auth/magicLink.js';

let app: Awaited<ReturnType<typeof buildServer>>;

describe('Refine', () => {
  beforeAll(async () => {
    app = await buildServer();
  });
  afterAll(async () => {
    await app.close();
  });

  it('increases hotel star rating', async () => {
    const tokenRes = await supertest(app.server).post('/auth/email/verify').send({ token: createMagicToken('refine@tripgenie.ai') });
    const accessToken = tokenRes.body.accessToken as string;

    const createRes = await supertest(app.server)
      .post('/trips')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Refine Trip', destinations: ['Paris'], startDate: '2025-06-01', endDate: '2025-06-05', travelers: 2 });
    expect(createRes.status).toBe(200);
    const tripId = createRes.body.id as string;

    const refineRes = await supertest(app.server)
      .post(`/trips/${tripId}/refine`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ instructions: 'Increase hotel star rating to 5' });
    expect(refineRes.status).toBe(200);

    const getRes = await supertest(app.server)
      .get(`/trips/${tripId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    expect(getRes.status).toBe(200);
    const items = getRes.body.days.flatMap((d: any) => d.items);
    const hotel = items.find((i: any) => i.type === 'Hotel');
    expect(hotel).toBeTruthy();
    expect((hotel.details || {}).stars).toBe(5);
  });
});

