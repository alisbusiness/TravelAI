import { buildServer } from './server.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function main() {
  const app = await buildServer();
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
    logger.info(`TripGenie API listening on ${env.APP_URL}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();

