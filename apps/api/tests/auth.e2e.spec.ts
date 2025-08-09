import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { buildServer } from '../src/server.js';
import supertest from 'supertest';
import { createMagicToken } from '../src/auth/magicLink.js';

let app: Awaited<ReturnType<typeof buildServer>>;

describe('Auth magic link', () => {
  beforeAll(async () => {
    process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tripgenie?schema=public';
    app = await buildServer();
  });
  afterAll(async () => {
    await app.close();
  });

  it('issues tokens', async () => {
    const token = createMagicToken('test+e2e@tripgenie.ai');
    const res = await supertest(app.server).post('/auth/email/verify').send({ token });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });
});

