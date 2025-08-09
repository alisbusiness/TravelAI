import { FastifyInstance } from 'fastify';
import { usersRoutes } from './users/routes.js';
import { plansRoutes } from './plans/routes.js';
import { tripsRoutes } from './trips/routes.js';
import { alertsRoutes } from './alerts/routes.js';
import { billingRoutes } from './billing/routes.js';
import { authRoutes } from './auth/index.js';
import { adminRoutes } from './admin/routes.js';
import { googleAuthRoutes } from './auth/google.js';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(googleAuthRoutes);
  await app.register(usersRoutes);
  await app.register(plansRoutes);
  await app.register(tripsRoutes);
  await app.register(alertsRoutes);
  await app.register(billingRoutes);
  await app.register(adminRoutes);
}

