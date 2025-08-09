import { FastifyRequest } from 'fastify';

export const tightAuthRateLimit = {
  max: 10,
  timeWindow: '1 minute',
};

export const webhookRateLimit = {
  max: 30,
  timeWindow: '1 minute',
};

export function userRateLimit(max = 60, window = '1 minute') {
  return {
    max,
    timeWindow: window,
    keyGenerator: (req: FastifyRequest) => {
      const header = req.headers.authorization || '';
      if (header.startsWith('Bearer ') && (req as any).user?.id) return (req as any).user.id as string;
      return req.ip;
    },
  } as const;
}

