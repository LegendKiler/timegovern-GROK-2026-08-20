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
    title: 'TimeGovern Audio',
    subtitle: 'Weekly · Monthly · Yearly — text scripts now; audio URLs when hosted',
    description:
      'Short episodes on time zones, DST, calendars, astronomy and remote-team planning. Text scripts below are publish-ready; set audioUrl when you host MP3s (R2 / Buzzsprout).',
    episodes: [
      { id: 'w-001', cadence: 'weekly', title: 'DST traps for global meetings this week', date: '2026-08-18', duration: '12 min', summary: 'Which regions flip clocks, how IANA labels change, and how to avoid double-booking with TimeGovern Meeting Planner.', audioUrl: '', script: 'Open with current DST transitions. Cover one AU state note if relevant, then US/EU reminders. End with a 60-second tip: pin focal cities and use the hour strip.' },
      { id: 'w-002', cadence: 'weekly', title: 'UTC offsets vs abbreviations', date: '2026-08-11', duration: '10 min', summary: 'Why AEST and AEDT both say Australian Eastern and how to read offsets safely.', audioUrl: '', script: 'Explain that abbreviations are ambiguous. Always show UTC offset and IANA id. Demo Melbourne vs Sydney vs Brisbane.' },
      { id: 'w-003', cadence: 'weekly', title: 'Sunrise table for outdoor crews', date: '2026-08-04', duration: '11 min', summary: 'Using multi-day sun tables for construction, film and events.', audioUrl: '', script: 'Walk through Astronomy pillar multi-day table. Mention polar day/night messaging for extreme latitudes.' },
      { id: 'w-004', cadence: 'weekly', title: 'News desk: time policy headlines', date: '2026-07-28', duration: '9 min', summary: 'How we refresh free news feeds and why we do not sell personal data for ads targeting.', audioUrl: '', script: 'Privacy-first news section. Sources rotate; cache about 30s. No personalisation sold.' },
      { id: 'w-005', cadence: 'weekly', title: 'Leap seconds — rare but real', date: '2026-07-21', duration: '13 min', summary: 'What leap seconds are, why UTC needs them, and what product teams should monitor.', audioUrl: '', script: 'Simple science. Point to Live Data pillar. Advise critical systems use official UTC bulletins.' },
      { id: 'm-001', cadence: 'monthly', title: 'August sky: eclipses and bright moons', date: '2026-08-01', duration: '18 min', summary: 'Month astronomy briefing for photographers and educators.', audioUrl: '', script: 'Major phases, any eclipse windows, best local viewing tips with city selector.' },
      { id: 'm-002', cadence: 'monthly', title: 'Calendar hygiene for remote teams', date: '2026-07-01', duration: '16 min', summary: 'Week numbers, fiscal calendars and shared meeting windows.', audioUrl: '', script: 'Calendar pillar walkthrough. ISO week numbers. Avoid Friday late calls across the Pacific.' },
      { id: 'm-003', cadence: 'monthly', title: 'Pay and workday calculators AU focus', date: '2026-06-01', duration: '20 min', summary: 'Australian workday and pay tools overview; always verify with ATO guidance.', audioUrl: '', script: 'Disclaimer: not tax advice. Demo AU defaults and link to official sources.' },
      { id: 'm-004', cadence: 'monthly', title: 'Widgets and embeds for schools', date: '2026-05-01', duration: '15 min', summary: 'Safe embed patterns for classroom world clocks.', audioUrl: '', script: 'Widgets pillar. CSP notes. Prefer HTTPS embeds only.' },
      { id: 'm-005', cadence: 'monthly', title: 'Security culture at TimeGovern', date: '2026-04-01', duration: '14 min', summary: 'HTTPS, reporting channel, and what Security check means on the Trust Centre.', audioUrl: '', script: 'TLS via Cloudflare Universal SSL. Responsible disclosure to security@timegovern.com.' },
      { id: 'y-001', cadence: 'yearly', title: 'Year ahead: timezone reforms watchlist', date: '2026-01-05', duration: '25 min', summary: 'Countries discussing DST reform and what product teams should track.', audioUrl: '', script: 'Annual planning episode. List monitoring sources: IANA, government gazettes.' },
      { id: 'y-002', cadence: 'yearly', title: '2025 in review: clocks, calendars, sky', date: '2025-12-20', duration: '28 min', summary: 'Major DST stories, leap-second status, and product milestones.', audioUrl: '', script: 'Retrospective. Thank subscribers. Preview next year features.' },
      { id: 'y-003', cadence: 'yearly', title: 'Teaching time: curriculum ideas', date: '2025-11-15', duration: '22 min', summary: 'Classroom activities using world clocks and sun data.', audioUrl: '', script: 'Educators episode. Free tools only. No student PII collection.' },
      { id: 'y-004', cadence: 'yearly', title: 'Enterprise meeting culture', date: '2025-10-10', duration: '24 min', summary: 'Policies for fair meeting hours across continents.', audioUrl: '', script: 'Meeting Planner as fairness tool. Rotate inconvenience.' },
      { id: 'y-005', cadence: 'yearly', title: 'Australian compliance year-check', date: '2025-09-01', duration: '20 min', summary: 'Privacy, Spam Act, and consumer law checklist for our own ops.', audioUrl: '', script: 'Internal discipline made public. Link Trust Centre and Legal tabs.' },
    ],
  },

  newsletter: {
    weekly: {
      id: 'weekly',
      name: 'Weekly Bulletin',
      description: 'DST alerts, timezone changes, sky highlights and one product tip — every week. Express opt-in; unsubscribe in every email (Spam Act 2003).',
      samples: [
        { id: 'nw-1', subject: 'TimeGovern Weekly: DST flips this week', preview: 'Regions changing clocks, Meeting Planner tip, one sky note.' },
        { id: 'nw-2', subject: 'TimeGovern Weekly: IANA data refresh', preview: 'What tzdata updates mean for your saved cities.' },
        { id: 'nw-3', subject: 'TimeGovern Weekly: Sunrise table tip', preview: 'Plan outdoor work with multi-day sun times.' },
        { id: 'nw-4', subject: 'TimeGovern Weekly: Leap-second watch', preview: 'Why UTC occasionally needs a second — and where we show it.' },
        { id: 'nw-5', subject: 'TimeGovern Weekly: Fair meeting hours', preview: 'Hour-strip technique for AU–US–EU teams.' },
      ],
    },
    monthly: {
      id: 'monthly',
      name: 'Monthly Digest',
      description: 'Month overview: calendar notes, major astronomy events and product updates.',
      samples: [
        { id: 'nm-1', subject: 'August Digest: sky and schedules', preview: 'Moon phases, eclipse windows, calendar hygiene.' },
        { id: 'nm-2', subject: 'July Digest: mid-year timezone map', preview: 'Who is on DST, who is not, planner defaults.' },
        { id: 'nm-3', subject: 'June Digest: AU workday tools', preview: 'Calculators overview — not tax advice; verify with ATO.' },
        { id: 'nm-4', subject: 'May Digest: widgets for education', preview: 'Embed clocks safely in school sites.' },
        { id: 'nm-5', subject: 'April Digest: trust and security', preview: 'HTTPS, privacy contacts, how to report issues.' },
      ],
    },
    yearly: {
      id: 'yearly',
      name: 'Year in Time',
      description: 'Annual round-up of timezone reforms, leap-second context and year-ahead calendar.',
      samples: [
        { id: 'ny-1', subject: 'Year in Time 2026: reforms to watch', preview: 'DST policy debates and IANA monitoring list.' },
        { id: 'ny-2', subject: 'Year in Time: 2025 retrospective', preview: 'Clocks, calendars, astronomy highlights.' },
        { id: 'ny-3', subject: 'Year in Time: teaching edition', preview: 'Curriculum ideas with free TimeGovern tools.' },
        { id: 'ny-4', subject: 'Year in Time: enterprise edition', preview: 'Meeting culture and global ops playbook.' },
        { id: 'ny-5', subject: 'Year in Time: compliance checklist', preview: 'Privacy, Spam Act, ACL — our public checklist.' },
      ],
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
