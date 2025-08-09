import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { createTransport } from '../emails/transporter.js';
import { magicLinkEmail } from '../emails/templates.js';
import { createMagicToken, verifyMagicToken } from './magicLink.js';
import { signAccessToken, signRefreshToken, hashToken, verifyRefreshToken } from './jwt.js';
import { env } from '../config/env.js';
import { Errors } from '../utils/errors.js';

import { tightAuthRateLimit } from '../config/rateLimit.js';

export async function authRoutes(app: FastifyInstance) {
  const transport = createTransport();
  const emailStartSchema = z.object({ email: z.string().email() });
  const emailVerifySchema = z.object({ token: z.string().min(10) });

  app.post('/email/start', { schema: { summary: 'Start magic-link login' }, config: { rateLimit: tightAuthRateLimit } }, async (req) => {
    const body = emailStartSchema.parse(req.body);
    const token = createMagicToken(body.email);
    const link = `${env.APP_URL}/auth/email/verify?token=${encodeURIComponent(token)}`;
    const { subject, text, html } = magicLinkEmail(link);
    await transport.sendMail({ from: env.EMAIL_FROM, to: body.email, subject, text, html });
    return { ok: true };
  });

  app.post('/email/verify', { schema: { summary: 'Verify magic-link' }, config: { rateLimit: tightAuthRateLimit } }, async (req) => {
    const { token } = emailVerifySchema.parse(req.body);
    const { email } = verifyMagicToken(token);
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({ data: { email } });
      await prisma.subscription.create({ data: { userId: user.id } });
    }
    const access = signAccessToken({ sub: user.id, role: user.role });
    const refresh = signRefreshToken({ sub: user.id, role: user.role });
    const hash = hashToken(refresh);
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hash,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        expiresAt: expires,
      },
    });
    return { accessToken: access, refreshToken: refresh };
  });

  app.post('/token/refresh', { config: { rateLimit: tightAuthRateLimit } }, async (req) => {
    const schema = z.object({ refreshToken: z.string().min(10) });
    const { refreshToken } = schema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    const session = await prisma.session.findFirst({
      where: { userId: payload.sub, refreshTokenHash: hashToken(refreshToken) },
    });
    if (!session) throw Errors.Unauthorized();
    const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.sub } });
    const access = signAccessToken({ sub: user.id, role: user.role });
    const newRefresh = signRefreshToken({ sub: user.id, role: user.role });
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: hashToken(newRefresh) },
    });
    return { accessToken: access, refreshToken: newRefresh };
  });

  app.post('/logout', { config: { rateLimit: tightAuthRateLimit } }, async (req) => {
    const schema = z.object({ refreshToken: z.string().min(10) });
    const { refreshToken } = schema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);
    await prisma.session.deleteMany({ where: { userId: payload.sub, refreshTokenHash: hashToken(refreshToken) } });
    return { ok: true };
  });

  app.get('/providers', async () => ({ google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) }));
}

