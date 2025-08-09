import client from 'prom-client';

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const tripsCreatedCounter = new client.Counter({ name: 'trips_created_total', help: 'Trips created', registers: [registry] });
export const toolCallsCounter = new client.Counter({ name: 'orchestrator_tool_calls_total', help: 'Tool calls executed', registers: [registry] });
export const cacheHitsCounter = new client.Counter({ name: 'api_cache_hits_total', help: 'API cache hits', registers: [registry] });
export const jobsProcessedCounter = new client.Counter({ name: 'jobs_processed_total', help: 'Queue jobs processed', registers: [registry] });

