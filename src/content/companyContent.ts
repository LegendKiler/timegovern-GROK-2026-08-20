/**
 * ============================================================
 *  TIMEGOVERN – COMPANY & ABOUT CONTENT TEMPLATE
 * ============================================================
 *  HOW TO EDIT: Change text values only, then refresh the site.
 * ============================================================
 */

export const companyContent = {
  brandName: 'TimeGovern',
  brandDomain: 'timegovern.com',
  tagline: 'Global time, calendars, astronomy & timezone tools',
  shortDescription:
    'TimeGovern is Australia’s global time platform: world clocks, meeting planners, calendars, sunrise and sunset, business calculators, weather context and free live news — built for remote teams, travellers and professionals worldwide.',

  hq: {
    city: 'Melbourne',
    state: 'Victoria',
    country: 'Australia',
    addressLine1: 'Level 12, 120 Collins Street',
    addressLine2: 'Melbourne VIC 3000',
    fullAddress: 'Level 12, 120 Collins Street, Melbourne VIC 3000, Australia',
    phone: '+61 3 9650 4200',
    phoneDisplay: '+61 (03) 9650 4200',
    email: 'contact@timegovern.com',
    supportEmail: 'support@timegovern.com',
    pressEmail: 'press@timegovern.com',
    whatsapp: '61396504200',
    abn: '12 345 678 901',
    hours: 'Monday–Friday, 9:00 AM – 5:30 PM AEST',
  },

  aboutUs: {
    title: 'About TimeGovern',
    lead: 'Based in Melbourne, we build precise free tools so the world can stay in sync.',
    paragraphs: [
      'TimeGovern is headquartered on Collins Street in Melbourne’s central business district. From Australia we serve users in every timezone with live world clocks, meeting planners, calendars, astronomy tools, calculators and free multi-source news.',
      'Our mission is to match and exceed the usefulness of global time sites while remaining fast, modern and free for core tools — no account required for everyday use.',
      'We rely on the IANA timezone database, open scientific sources for sun and moon data, and free public news feeds so information stays current without paid API lock-in.',
    ],
    mission:
      'Make accurate global time tools available to everyone — students, travellers, remote teams and businesses — without locking essential features behind paywalls.',
    vision:
      'Become the most trusted free destination for world time, calendars and sky events, operated from Melbourne for a global audience.',
  },

  sections: {
    worldClock: {
      title: 'World Clock',
      description:
        'Live local times for cities worldwide, with timezone names, offsets and daylight saving awareness.',
    },
    meetingPlanner: {
      title: 'Meeting Planner',
      description:
        'Find overlapping work hours across multiple cities for remote teams and international calls.',
    },
    calendar: {
      title: 'Calendar',
      description:
        'Interactive monthly calendars, week numbers and holiday-aware planning tools.',
    },
    astronomy: {
      title: 'Sun & Moon',
      description:
        'Sunrise, sunset, twilight, moon phases and related sky data for any location.',
    },
    calculators: {
      title: 'Calculators',
      description:
        'Date difference, working days, deadlines, countdowns and practical time math.',
    },
    weather: {
      title: 'Weather',
      description: 'Location-aware weather context alongside local time.',
    },
    news: {
      title: 'Live News',
      description:
        'Free multi-source RSS headlines auto-refreshed about every 45–60 seconds.',
    },
  },

  values: [
    { title: 'Accuracy', text: 'IANA timezones, careful DST handling and clear UTC offsets.' },
    { title: 'Open & free core', text: 'Essential clocks, converters and calculators stay free to use.' },
    { title: 'Melbourne-built', text: 'Designed and operated from Collins Street, Melbourne, Australia.' },
    { title: 'Global reach', text: 'Built for every continent — from Sydney to New York to Lagos.' },
  ],

  legal: {
    copyrightName: 'TimeGovern Pty Ltd',
    year: new Date().getFullYear(),
    disclaimer:
      'Times are calculated using standard timezone data. Always verify critical schedules with official sources. Company address details on this site are for contact purposes.',
  },
};

export type CompanyContent = typeof companyContent;
