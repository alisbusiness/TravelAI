import { describe, it, expect } from 'vitest';
import { rankOffers, scoreOffer } from '../src/orchestrator/ranking.js';
import { bookingComDeeplink } from '../src/providers/deeplinks.js';
import { env } from '../src/config/env.js';

describe('Ranking & Deeplinks', () => {
  it('scores cheaper higher', () => {
    const a = scoreOffer({ priceMinor: 10000 });
    const b = scoreOffer({ priceMinor: 20000 });
    expect(a).toBeGreaterThan(b);
  });

  it('booking.com deeplink has partner id and UTM', () => {
    const url = new URL(
      bookingComDeeplink({ destination: 'Paris', checkIn: '2025-05-01', checkOut: '2025-05-05', adults: 2 }),
    );
    expect(url.searchParams.get('aid')).toBe(env.AFFILIATE_BOOKING_COM_PARTNER_ID);
    expect(url.searchParams.get('utm_source')).toBe(env.AFFILIATE_UTM_SOURCE);
  });
});

