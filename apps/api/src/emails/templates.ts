export function magicLinkEmail(link: string) {
  return {
    subject: 'Your TripGenie magic sign-in link',
    text: `Click to sign in: ${link}\nIf you did not request this, ignore this email.`,
    html: `<p>Click to sign in:</p><p><a href="${link}">${link}</a></p><p>If you did not request this, ignore this email.</p>`,
  };
}

export function priceDropEmail(details: { title: string; oldPrice: number; newPrice: number; url: string }) {
  return {
    subject: `Price drop for ${details.title}`,
    text: `Good news! Price dropped from ${details.oldPrice} to ${details.newPrice}. Book: ${details.url}`,
    html: `<p>Good news! Price dropped from <b>${details.oldPrice}</b> to <b>${details.newPrice}</b>.</p><p><a href="${details.url}">Book now</a></p>`,
  };
}

