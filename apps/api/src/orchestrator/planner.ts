import dayjs from 'dayjs';
import { searchFlights, searchHotels, searchActivities } from './tools.js';
import { prisma } from '../db/prisma.js';
import { TripItemType, OfferType } from '@prisma/client';

type PlanRequest = {
  userId: string;
  origin?: string;
  destinations: string[];
  startDate: string;
  endDate: string;
  adults: number;
};

export async function generateItinerary(req: PlanRequest, tripId: string) {
  const start = dayjs(req.startDate);
  const end = dayjs(req.endDate);
  const totalDays = Math.max(1, end.diff(start, 'day') + 1);
  const city = req.destinations[0];

  const flights = await searchFlights({ origin: req.origin ?? 'Home', destination: city, departDate: start.format('YYYY-MM-DD'), returnDate: end.format('YYYY-MM-DD'), adults: req.adults });
  const hotels = await searchHotels({ destination: city, checkIn: start.format('YYYY-MM-DD'), checkOut: end.format('YYYY-MM-DD'), adults: req.adults });
  const activities = await searchActivities({ city, date: start.format('YYYY-MM-DD') });

  const days = await prisma.tripDay.findMany({ where: { tripId }, orderBy: { date: 'asc' } });
  if (days.length === 0) {
    await prisma.tripDay.createMany({
      data: Array.from({ length: totalDays }).map((_, i) => ({ tripId, date: start.add(i, 'day').toDate(), summary: `Day ${i + 1} in ${city}` })),
    });
  }
  const tripDays = await prisma.tripDay.findMany({ where: { tripId }, orderBy: { date: 'asc' } });

  // Create items: 1 flight in, 1 hotel, 2 activities
  const itemsData = [
    { tripDayId: tripDays[0].id, type: TripItemType.Flight, title: `Flight to ${city}`, details: { fetchedAt: new Date().toISOString() }, linkUrl: flights[0]?.linkUrl, provider: 'generic' },
    { tripDayId: tripDays[0].id, type: TripItemType.Hotel, title: `Hotel in ${city}`, details: { fetchedAt: new Date().toISOString() }, linkUrl: hotels[0]?.linkUrl, provider: 'booking.com' },
  ];
  if (tripDays[1]) itemsData.push({ tripDayId: tripDays[1].id, type: TripItemType.Activity, title: activities[0].title, details: { fetchedAt: activities[0].fetchedAt }, linkUrl: activities[0].linkUrl, provider: 'generic' } as any);
  if (tripDays[2]) itemsData.push({ tripDayId: tripDays[2].id, type: TripItemType.Activity, title: activities[1].title, details: { fetchedAt: activities[1].fetchedAt }, linkUrl: activities[1].linkUrl, provider: 'generic' } as any);

  await prisma.tripItem.createMany({ data: itemsData as any });

  await prisma.providerOffer.createMany({
    data: [
      { tripId, type: OfferType.Flight, provider: 'generic', offerRaw: flights[0], deeplinkUrl: flights[0]?.linkUrl, priceMinor: flights[0]?.priceMinor, currency: flights[0]?.currency },
      { tripId, type: OfferType.Hotel, provider: 'booking.com', offerRaw: hotels[0], deeplinkUrl: hotels[0]?.linkUrl, priceMinor: hotels[0]?.priceMinor, currency: hotels[0]?.currency },
    ],
  });

  return { tripId, itemsCreated: itemsData.length };
}

