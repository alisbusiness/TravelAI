import { PrismaClient, Plan, Role, TripItemType, TripStyle, OfferType } from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  const demoEmail = 'demo@tripgenie.ai';
  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      name: 'Demo User',
      role: Role.user,
      subscription: {
        create: {
          plan: Plan.Premium,
          status: 'active',
        },
      },
      preferences: {
        create: {
          hotelMinStars: 4,
          likesMuseums: true,
          cuisinePrefs: { likes: ['French', 'Italian'] },
        },
      },
    },
    include: { subscription: true },
  });

  const startDate = dayjs().add(20, 'day');
  const endDate = startDate.add(4, 'day');

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      title: 'Paris 5 days',
      origin: 'NYC',
      destinations: { cities: ['Paris'] },
      startDate: startDate.toDate(),
      endDate: endDate.toDate(),
      travelers: 2,
      style: TripStyle.Balanced,
      days: {
        create: Array.from({ length: 5 }).map((_, i) => ({
          date: startDate.add(i, 'day').toDate(),
          summary: `Day ${i + 1} in Paris`,
        })),
      },
    },
  });

  const days = await prisma.tripDay.findMany({ where: { tripId: trip.id }, orderBy: { date: 'asc' } });
  if (days.length) {
    await prisma.tripItem.createMany({
      data: [
        {
          tripDayId: days[0].id,
          type: TripItemType.Flight,
          title: 'Flight to Paris',
          details: { airline: 'DemoAir', fetchedAt: new Date().toISOString() },
          linkUrl: 'https://example.com/flight',
          provider: 'demo',
        },
        {
          tripDayId: days[0].id,
          type: TripItemType.Hotel,
          title: 'Hotel Le Demo',
          details: { stars: 4, fetchedAt: new Date().toISOString() },
          linkUrl: 'https://example.com/hotel',
          provider: 'demo',
        },
        {
          tripDayId: days[1].id,
          type: TripItemType.Activity,
          title: 'Louvre Museum',
          details: { fetchedAt: new Date().toISOString() },
          linkUrl: 'https://example.com/activity1',
          provider: 'demo',
        },
        {
          tripDayId: days[2].id,
          type: TripItemType.Activity,
          title: 'Eiffel Tower',
          details: { fetchedAt: new Date().toISOString() },
          linkUrl: 'https://example.com/activity2',
          provider: 'demo',
        },
      ],
    });
  }

  await prisma.providerOffer.createMany({
    data: [
      {
        tripId: trip.id,
        type: OfferType.Flight,
        provider: 'demo',
        offerRaw: { airline: 'DemoAir', fetchedAt: new Date().toISOString() },
        deeplinkUrl: 'https://example.com/flight',
        priceMinor: 50000,
        currency: 'USD',
      },
      {
        tripId: trip.id,
        type: OfferType.Hotel,
        provider: 'demo',
        offerRaw: { hotel: 'Hotel Le Demo', stars: 4, fetchedAt: new Date().toISOString() },
        deeplinkUrl: 'https://example.com/hotel',
        priceMinor: 8000,
        currency: 'USD',
      },
    ],
  });

  console.log('Seeded demo user and trip:', { user: user.email, trip: trip.title });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

