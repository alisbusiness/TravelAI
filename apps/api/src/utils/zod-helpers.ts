import { z } from 'zod';

export const zId = z.string().min(1);
export const zSlug = z.string().regex(/^[a-z0-9-]+$/i);
export const zDate = z.coerce.date();

