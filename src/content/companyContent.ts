/**
 * ============================================================
 *  TIMEGOVERN – COMPANY & ABOUT CONTENT TEMPLATE
 * ============================================================
 *  HOW TO EDIT:
 *  1. Change any text below.
 *  2. Save the file.
 *  3. Refresh the website (npm run dev already running).
 *  4. Do NOT change the keys (left side) – only the values.
 * ============================================================
 */

export const companyContent = {
  // ---------- Brand ----------
  brandName: 'TimeGovern',
  brandDomain: 'timegovern.com',
  tagline: 'Global time, calendars, astronomy & timezone tools',
  shortDescription:
    'TimeGovern is a free global time platform: world clocks, meeting planners, calendars, sunrise/sunset, calculators, weather and live news — built for professionals and everyone who works across time zones.',

  // ---------- Headquarters (edit to your real details) ----------
  hq: {
    city: 'Melbourne',
    country: 'Australia',
    address: 'Office 1, Sydney Road, Brunswick, VIC 3056, Australia',
    phone: '+61 (03) 9000 1000',
    email: 'contact@timegovern.com',
    whatsapp: '61390001000',
  },

  // ---------- About Us (main story) ----------
  aboutUs: {
    title: 'About TimeGovern',
    lead: 'We build precise, free tools so the world can stay in sync.',
    paragraphs: [
      'TimeGovern helps people and teams understand time across the planet: live world clocks, timezone conversion, meeting planning, calendars with holidays, astronomy (sun, moon, twilight), business day calculators, weather context and continuously updated news.',
      'Our goal is simple: match and exceed the usefulness of established sites like timeanddate.com, while staying fast, modern, and free to use for core tools.',
      'The platform runs on modern web technology (React, edge delivery) so clocks and data stay accurate with the IANA timezone database and open scientific sources.',
    ],
    mission:
      'Make accurate global time tools available to everyone — students, travelers, remote teams, and enterprises — without locking essential features behind paywalls.',
    vision:
      'Become the most trusted free destination for world time, calendars, and sky events.',
  },

  // ---------- What we offer (section blurbs) ----------
  sections: {
    worldClock: {
      title: 'World Clock',
      description:
        'Live local times for cities worldwide, with timezone names, offsets and DST awareness.',
    },
    meetingPlanner: {
      title: 'Meeting Planner',
      description:
        'Find overlapping work hours across multiple cities for remote teams and international calls.',
    },
    calendar: {
      title: 'Calendar',
      description:
        'Interactive monthly calendars, week numbers, and holiday-aware planning tools.',
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
        'Free multi-source RSS headlines (Google News, BBC, Guardian, NPR, NASA, ESA) auto-refreshed about every 45–60 seconds.',
    },
  },

  // ---------- Values ----------
  values: [
    { title: 'Accuracy', text: 'IANA timezones, careful DST handling, and clear UTC offsets.' },
    { title: 'Open & free core', text: 'Essential clocks, converters and calculators stay free to use.' },
    { title: 'Clarity', text: 'Clean layout so you find the right time in seconds, not minutes.' },
    { title: 'Global', text: 'Built for every continent — from Sydney to New York to Lagos.' },
  ],

  // ---------- Legal / footer lines ----------
  legal: {
    copyrightName: 'TimeGovern',
    year: new Date().getFullYear(),
    disclaimer:
      'Times are calculated using standard timezone data. Always verify critical schedules with official sources.',
  },
};

export type CompanyContent = typeof companyContent;
