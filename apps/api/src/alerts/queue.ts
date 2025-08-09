import { Queue } from 'bullmq';
import { env } from '../config/env.js';
import IORedis from 'ioredis';

export const connection = new IORedis(env.REDIS_URL);
export const alertChecksQueue = new Queue('alertChecks', { connection });

