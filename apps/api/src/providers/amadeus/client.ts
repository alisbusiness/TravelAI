import { env } from '../../config/env.js';

export class AmadeusClient {
  constructor(private apiKey = env.AMADEUS_API_KEY, private apiSecret = env.AMADEUS_API_SECRET) {}
  isEnabled() {
    return env.PROVIDER_AMADEUS_ENABLED && !!this.apiKey && !!this.apiSecret;
  }
}

