import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function createMagicToken(email: string) {
  return jwt.sign({ email }, env.MAGIC_LINK_SECRET, { expiresIn: `${env.MAGIC_LINK_TTL_MINUTES}m` });
}

export function verifyMagicToken(token: string): { email: string } {
  const decoded = jwt.verify(token, env.MAGIC_LINK_SECRET) as any;
  return { email: decoded.email };
}

