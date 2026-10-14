// Everything the charity might want to change lives here.
// Content that changes often (events, fundraising total) is loaded from the
// website at runtime, so it can be updated without releasing a new app.

const SITE = 'https://www.anyasjourney.com';

export const config = {
  siteUrl: SITE,

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

  // Fundraising thermometer: a small JSON file the charity uploads to their
  // website. See docs/fundraising.json for the format.
  fundraisingUrl: `${SITE}/app/fundraising.json`,

  // Shown until the JSON file above is uploaded, or if it can't be reached.
  fundraisingFallback: {
    title: 'Fuller Lake Inclusive Playground',
    goal: 500000,
    raised: 0,
    updated: '',
  },

  storyUrl: `${SITE}/mystory.html`,
  lssUrl: 'https://www.lambshaffer.org',

  donate: {
    goFundMe: 'https://www.gofundme.com/u/anyasjourney',
    // TODO: replace with the charity's GiveSendGo campaign link.
    giveSendGo: 'https://www.givesendgo.com/',
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
