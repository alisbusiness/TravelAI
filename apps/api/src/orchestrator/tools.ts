import dayjs from 'dayjs';
import { bookingComDeeplink, genericActivityDeeplink, genericFlightDeeplink } from '../providers/deeplinks.js';
import { toolCallsCounter } from '../metrics.js';

export type SearchFlightsParams = { origin: string; destination: string; departDate: string; returnDate?: string; adults: number };
export type SearchHotelsParams = { destination: string; checkIn: string; checkOut: string; adults: number };
export type SearchActivitiesParams = { city: string; date?: string };

export async function searchFlights(params: SearchFlightsParams) {
  toolCallsCounter.inc();
  // Placeholder deterministic data
  return [
    {
      provider: 'generic',
      priceMinor: 50000,
      currency: 'USD',
      rating: 4.2,
      fetchedAt: new Date().toISOString(),
      linkUrl: genericFlightDeeplink({ origin: params.origin, dest: params.destination, depart: params.departDate, return: params.returnDate, adults: params.adults }),
    },
  ];
}

export async function searchHotels(params: SearchHotelsParams) {
  toolCallsCounter.inc();
  return [
    {
      provider: 'booking.com',
      priceMinor: 9000,
      currency: 'USD',
      rating: 4.5,
      fetchedAt: new Date().toISOString(),
      linkUrl: bookingComDeeplink({ destination: params.destination, checkIn: params.checkIn, checkOut: params.checkOut, adults: params.adults }),
    },
  ];
}

export async function searchActivities(params: SearchActivitiesParams) {
  toolCallsCounter.inc();
  return [
    { title: 'City Walking Tour', rating: 4.7, fetchedAt: new Date().toISOString(), linkUrl: genericActivityDeeplink({ city: params.city, query: 'Walking tour' }) },
    { title: 'Museum Pass', rating: 4.6, fetchedAt: new Date().toISOString(), linkUrl: genericActivityDeeplink({ city: params.city, query: 'Museum' }) },
  ];
}

export async function geocodePlace(name: string) {
  toolCallsCounter.inc();
  // Deterministic fake geocode
  return { name, lat: 48.8566, lng: 2.3522 };
}

