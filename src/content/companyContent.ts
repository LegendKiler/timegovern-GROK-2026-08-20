/**
 * TIMEGOVERN – SINGLE SOURCE OF TRUTH for company / HQ / contact copy
 * HOW TO EDIT: see docs/COMPANY_EDIT.md
 */

export const companyContent = {
  brandName: 'TimeGovern',
  brandDomain: 'timegovern.com',
  legalName: 'TimeGovern Pty Ltd',
  tagline: 'Global time, calendars, astronomy & timezone tools',
  shortDescription:
    'TimeGovern is an Australian global time platform: world clocks, meeting planners, calendars, sun and moon data, calculators, weather context and free live news.',

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
    legalEmail: 'legal@timegovern.com',
    privacyEmail: 'privacy@timegovern.com',
    securityEmail: 'security@timegovern.com',
    advertiseEmail: 'advertise@timegovern.com',
    whatsapp: '61396504200',
    abn: '12 345 678 901',
    hours: 'Monday–Friday, 9:00 AM – 5:30 PM AEST / AEDT',
  },

  contactTemplates: {
    whatsappPrefill: 'Hello TimeGovern Melbourne, I have an inquiry about timegovern.com',
    emailSubject: 'Enquiry — TimeGovern',
    emailBody: 'Hello TimeGovern team,\n\n',
  },

  aboutUs: {
    title: 'About TimeGovern',
    lead: 'Based in Melbourne, we build precise free tools so the world can stay in sync.',
    paragraphs: [
      'TimeGovern is headquartered on Collins Street in Melbourne CBD. From Australia we serve users worldwide with live world clocks, meeting planners, calendars, astronomy tools, calculators and free multi-source news.',
      'Core tools are free. We aim to match and exceed the usefulness of established global time sites while staying fast and modern.',
      'We use the IANA timezone database, open scientific sources for solar and lunar data, and free public news feeds.',
    ],
    mission:
      'Make accurate global time tools available to everyone without locking essential features behind paywalls.',
    vision:
      'Become the most trusted free destination for world time, calendars and sky events, operated from Melbourne for a global audience.',
  },

  values: [
    { title: 'Accuracy', text: 'IANA timezones, careful DST handling and clear UTC offsets.' },
    { title: 'Open & free core', text: 'Essential clocks, converters and calculators stay free to use.' },
    { title: 'Melbourne-built', text: 'Designed and operated from Collins Street, Melbourne, Australia.' },
    { title: 'Australian compliance', text: 'Privacy, consumer and spam practices aligned with Australian law.' },
  ],

  sections: {
    worldClock: { title: 'World Clock', description: 'Live local times worldwide with offsets and DST.' },
    meetingPlanner: { title: 'Meeting Planner', description: 'Find overlapping hours across cities.' },
    calendar: { title: 'Calendar', description: 'Months, week numbers and planning tools.' },
    astronomy: { title: 'Sun & Moon', description: 'Sunrise, sunset, twilight and moon phases.' },
    calculators: { title: 'Calculators', description: 'Date math, workdays and countdowns.' },
    weather: { title: 'Weather', description: 'Weather context with local time.' },
    news: { title: 'Live News', description: 'Free RSS headlines refreshed about every 30–60 seconds.' },
    podcast: { title: 'Weekly Podcast', description: 'Time, calendars, DST and sky events — weekly episodes.' },
  },

  metrics: [
    { label: 'Global Latency', value: '< 12ms', hint: 'Edge-aware time delivery' },
    { label: 'Active NTP Nodes', value: '99.998%', hint: 'Uptime target' },
    { label: 'Sync Standard', value: 'UTC(NIST)', hint: 'Aligned reference' },
  ],

  engineeringPillars: [
    {
      id: 'metrology',
      title: 'Precision Metrology',
      text: 'Nanosecond-aware tooling, drift awareness, and clear UTC offsets so teams plan on the same clock.',
      icon: 'precision',
    },
    {
      id: 'resilience',
      title: 'Enterprise Resilience',
      text: 'High-availability patterns for distributed teams: world clocks, meeting planners, and calculators that stay usable under load.',
      icon: 'resilience',
    },
    {
      id: 'governance',
      title: 'Open Governance',
      text: 'Transparent policies, Australian-facing legal copy, and free core tools without locking essential time features behind paywalls.',
      icon: 'governance',
    },
  ],

  ethosQuote: {
    quote:
      'Time is not a footnote in modern systems — it is a structural variable. When clocks disagree, everything downstream becomes a negotiation.',
    attribution: 'TimeGovern Engineering Ethos',
    role: 'Melbourne · Global temporal infrastructure',
  },

  podcast: {
    title: 'TimeGovern Weekly',
    subtitle: 'A short weekly podcast on time zones, calendars, DST and astronomy',
    description:
      'Every week we cover daylight saving changes, leap-second context, notable sky events and practical tips for remote teams.',
    episodes: [
      {
        id: 'ep-001',
        title: 'Why the world still argues about daylight saving',
        date: '2026-08-18',
        duration: '18 min',
        summary: 'A practical overview of DST around the world and how it affects meeting planners.',
        audioUrl: '',
      },
      {
        id: 'ep-002',
        title: 'IANA timezones explained simply',
        date: '2026-08-11',
        duration: '14 min',
        summary: 'How tzdata updates reach your phone, laptop and TimeGovern.',
        audioUrl: '',
      },
      {
        id: 'ep-003',
        title: 'Sun, moon and twilight for planners',
        date: '2026-08-04',
        duration: '16 min',
        summary: 'Using sunrise and moon phase data for outdoor events and photography.',
        audioUrl: '',
      },
    ],
  },

  newsletter: {
    weekly: {
      id: 'weekly',
      name: 'Weekly Bulletin',
      description: 'DST alerts, timezone changes, sky highlights and one product tip — every week.',
    },
    monthly: {
      id: 'monthly',
      name: 'Monthly Digest',
      description: 'Month overview: calendar notes, major astronomy events and product updates.',
    },
    yearly: {
      id: 'yearly',
      name: 'Year in Time',
      description: 'Annual round-up of timezone reforms, leap-second context and year-ahead calendar.',
    },
  },

  social: {
    facebook: '',
    twitter: '',
    linkedin: '',
    youtube: '',
  },

  legal: {
    copyrightName: 'TimeGovern Pty Ltd',
    year: new Date().getFullYear(),
    governingLaw: 'Laws of Victoria, Australia',
    disclaimer:
      'Times are calculated using standard timezone data. Always verify critical schedules with official sources.',
    lastUpdated: '24 August 2026',
  },
};

export type CompanyContent = typeof companyContent;

export function companyMailto(subject?: string, body?: string) {
  const s = subject ?? companyContent.contactTemplates.emailSubject;
  const b = body ?? companyContent.contactTemplates.emailBody;
  return `mailto:${companyContent.hq.email}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`;
}

export function companyWhatsAppUrl(text?: string) {
  const t = text ?? companyContent.contactTemplates.whatsappPrefill;
  return `https://wa.me/${companyContent.hq.whatsapp}?text=${encodeURIComponent(t)}`;
}

export function companyTelHref() {
  return `tel:${companyContent.hq.phone.replace(/\s/g, '')}`;
}
