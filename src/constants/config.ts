// Everything the charity might want to change lives here.
// Content that changes often (events, fundraising total) is loaded from the
// website at runtime, so it can be updated without releasing a new app.

const SITE = 'https://www.anyasjourney.com';

export const config = {
  siteUrl: SITE,

  // Set by the GitHub Pages preview build only (EXPO_PUBLIC_PREVIEW=1), so the
  // preview can show features the charity hasn't switched on yet.
  previewMode: process.env.EXPO_PUBLIC_PREVIEW === '1',

  images: {
    logo: `${SITE}/assets/img/logo.png`,
    hero: `${SITE}/assets/img/me.jpg`,
    playground: `${SITE}/assets/img/blog-post-1.jpg`,
    gallery: [1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(
      (n) => `${SITE}/assets/img/gallery/gallery-${n}.jpg`,
    ),
  },

  // Announcements tab: an in-app browser window showing this page. The charity
  // posts new events on the website and they appear in the app straight away.
  eventsUrl: `${SITE}/events.html`,

  // Fundraising thermometer, first choice: the charity's Google Sheet,
  // published to the web as CSV (File > Share > Publish to web > CSV).
  // Paste the link here. See docs/fundraising-sheet.md.
  fundraisingSheetCsvUrl: '',

  // Fundraising thermometer: a small JSON file the charity uploads to their
  // website. See docs/fundraising.json for the format.
  fundraisingUrl: `${SITE}/app/fundraising.json`,

  // Shown until the JSON file above is uploaded, or if it can't be reached.
  fundraisingFallback: {
    title: 'Fuller Lake Inclusive Playground',
    goal: 500000,
    raised: 128420, // matches the website's thermometer on 2026-10-14
    updated: '',
  },

  // Playground finder: free OpenStreetMap services, no API keys.
  overpassEndpoints: [
    'https://overpass-api.de/api/interpreter',
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  ],
  mapStyleUrl: 'https://tiles.openfreemap.org/styles/liberty',
  // Used when the user doesn't share their location (Chemainus, BC).
  defaultCenter: { latitude: 48.925, longitude: -123.716 },
  searchRadiusKm: 25,

  // Wine Survivor play-along game: on/off switch, next date, tribes and draw
  // results. See docs/wine-survivor.json for the format.
  wineSurvivorUrl: `${SITE}/app/wine-survivor.json`,

  storyUrl: `${SITE}/mystory.html`,
  lssUrl: 'https://www.lambshaffer.org',

  // Same donation options as the website's Donations section.
  donate: {
    goFundMe: 'https://www.gofundme.com/u/anyasjourney',
    payPal: 'https://paypal.me/anyasjourney',
    // TODO: the email (or merchant ID) of the charity's PayPal account. Once set,
    // equipment donations open PayPal with the amount AND the item filled in.
    // Until then they use the paypal.me link above, which only takes the amount.
    payPalBusiness: '',
    canadaHelps: 'https://www.canadahelps.org/en/charities/anyas-journey-foundation/',
    eTransferEmail: 'donations@anyasjourney.com',
  },

  social: {
    facebook: 'https://www.facebook.com/anyasjourneyfoundation',
    instagram: 'https://www.instagram.com/anyasjourneyfoundation',
  },

  contactEmail: 'contact@anyasjourney.com',
  charityNumber: '75992 7007 RR0001',
};
