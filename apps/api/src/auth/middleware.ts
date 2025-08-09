import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from './jwt.js';
import { Errors } from '../utils/errors.js';

export async function authGuard(req: FastifyRequest, _reply: FastifyReply) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw Errors.Unauthorized();
  const token = header.slice('Bearer '.length);
  const payload = verifyAccessToken(token);
  (req as any).user = { id: payload.sub, role: payload.role };
}

export function roleGuard(role: string) {
  return async function (req: FastifyRequest) {
    const user = (req as any).user as { id: string; role: string } | undefined;
    if (!user) throw Errors.Unauthorized();
    if (user.role !== role) throw Errors.Forbidden();
  };
}

