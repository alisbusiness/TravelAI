import { env } from '../config/env.js';

function withUtm(url: URL) {
  url.searchParams.set('utm_source', env.AFFILIATE_UTM_SOURCE);
  url.searchParams.set('utm_medium', env.AFFILIATE_UTM_MEDIUM);
  url.searchParams.set('utm_campaign', 'share');
  return url.toString();
}

export function bookingComDeeplink(params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms?: number;
}) {
  const url = new URL('https://www.booking.com/searchresults.html');
  url.searchParams.set('ss', params.destination);
  url.searchParams.set('checkin', params.checkIn);
  url.searchParams.set('checkout', params.checkOut);
  url.searchParams.set('group_adults', String(params.adults));
  url.searchParams.set('no_rooms', String(params.rooms ?? 1));
  url.searchParams.set('aid', env.AFFILIATE_BOOKING_COM_PARTNER_ID);
  return withUtm(url);
}

export function genericFlightDeeplink(params: { origin: string; dest: string; depart: string; return?: string; adults: number }) {
  const url = new URL('https://www.google.com/travel/flights');
  url.searchParams.set('q', `${params.origin} to ${params.dest} ${params.depart}`);
  return withUtm(url);
}

export function genericActivityDeeplink(params: { city: string; query?: string }) {
  const url = new URL('https://www.google.com/travel/things-to-do');
  url.searchParams.set('q', `${params.query ?? 'Top activities'} in ${params.city}`);
  return withUtm(url);
}

