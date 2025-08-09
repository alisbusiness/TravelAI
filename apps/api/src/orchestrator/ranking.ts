export type Offer = {
  priceMinor?: number;
  rating?: number;
  distanceKm?: number;
  cancelScore?: number;
};

export function scoreOffer(offer: Offer, weights = { price: 0.5, rating: 0.3, distance: 0.1, cancel: 0.1 }) {
  const priceScore = offer.priceMinor ? 1 / Math.max(1, offer.priceMinor) : 0;
  const ratingScore = (offer.rating ?? 0) / 5;
  const distanceScore = offer.distanceKm ? 1 / Math.max(1, offer.distanceKm) : 0;
  const cancelScore = offer.cancelScore ?? 0.5;
  const score =
    weights.price * priceScore + weights.rating * ratingScore + weights.distance * distanceScore + weights.cancel * cancelScore;
  return score;
}

export function rankOffers<T extends Offer>(offers: T[]) {
  return [...offers].sort((a, b) => scoreOffer(b) - scoreOffer(a));
}

