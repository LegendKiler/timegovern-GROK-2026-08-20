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
    lead:
      'TimeGovern is a Melbourne-built platform for world clocks, meeting planning, calendars, astronomy and practical time tools — free at the core, designed for global teams and everyday users.',
    paragraphs: [
      'We are TimeGovern Pty Ltd, based on Collins Street in Melbourne, Australia. From here we serve a worldwide audience that needs clear local times, reliable offsets and honest limits on what any web tool can claim.',
      'Our purpose is simple: make accurate global time tools easy to use. World clocks stay live; meeting planners help find overlapping hours; calendars and sun/moon tables support outdoor work, travel and education.',
      'Essential clocks and converters remain free. Optional Supporter plans help fund ad-free browsing and advanced calendar exports. We do not pretend to replace official time laboratories or government gazettes — we help you plan, then you verify critical deadlines with the right authority.',
      'Data foundations include the public IANA time zone database for civil time, established algorithms for solar and lunar events, and clearly attributed news and weather context where those panels appear.',
    ],
    mission:
      'Give everyone free access to accurate world time tools, without locking essential clocks and converters behind a paywall.',
    vision:
      'Be the trusted, modern destination for global time, calendars and sky events — operated from Melbourne for a global audience.',
  },

  values: [
    { title: 'Accuracy first', text: 'IANA zones, explicit UTC offsets and careful daylight-saving handling — abbreviations alone are not enough.' },
    { title: 'Free at the core', text: 'World clocks, converters and core planning tools stay usable without an account or payment.' },
    { title: 'Melbourne-built, globally useful', text: 'Designed and operated from Australia with users and teams across every continent in mind.' },
    { title: 'Clear & compliant', text: 'Privacy, consumer and electronic messaging practices aligned with Australian law, with transparent rights for international visitors.' },
  ],

  sections: {
    worldClock: { title: 'World Clock', description: 'Live local times worldwide with offsets and DST.' },
    meetingPlanner: { title: 'Meeting Planner', description: 'Find overlapping hours across cities.' },
    calendar: { title: 'Calendar', description: 'Months, week numbers and planning tools.' },
    astronomy: { title: 'Sun & Moon', description: 'Sunrise, sunset, twilight and moon phases.' },
    calculators: { title: 'Calculators', description: 'Date math, workdays and countdowns.' },
    weather: { title: 'Weather', description: 'Weather context with local time.' },
    news: { title: 'Live News', description: 'Free RSS headlines refreshed about every 30–60 seconds.' },
    podcast: { title: 'Podcast', description: 'Plain-language briefings on zones, DST, calendars and the sky.' },
  },

  metrics: [
    { label: 'Responsive tools', value: 'Fast UI', hint: 'Clocks and planners stay snappy in the browser' },
    { label: 'Availability goal', value: '99.9%+', hint: 'Public tools designed for continuous use' },
    { label: 'Time reference', value: 'UTC-based', hint: 'Civil time via IANA rules' },
  ],

  engineeringPillars: [
    {
      id: 'metrology',
      title: 'Precision Metrology',
      text: 'Clear UTC offsets, drift awareness and careful daylight-saving handling so teams plan on the same clock.',
      icon: 'precision',
    },
    {
      id: 'resilience',
      title: 'Enterprise Resilience',
      text: 'World clocks, meeting planners and calculators built to stay usable for distributed teams under everyday load.',
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
    role: 'Melbourne · Global temporal tools',
  },

  podcast: {
    title: 'TimeGovern Audio',
    subtitle: 'Short briefings on time zones, calendars and the sky — weekly, monthly and yearly themes',
    description:
      'Episodes explain daylight saving, offsets, meeting culture and astronomy in plain language. Text scripts are ready to publish; audio files can be linked when you host them.',
    episodes: [
      { id: 'w-001', cadence: 'weekly', title: 'Daylight saving traps for global meetings', date: '2026-08-18', duration: '12 min', summary: 'Which regions change clocks this season, how labels shift, and how to avoid double-booking with the meeting planner.', audioUrl: '', script: 'Open with current DST transitions for Australia, North America and Europe. Show why pinning focal cities and reading the hour strip prevents awkward early calls. Close with one tip: always show the UTC offset next to a city name.' },
      { id: 'w-002', cadence: 'weekly', title: 'UTC offsets vs abbreviations', date: '2026-08-11', duration: '10 min', summary: 'Why AEST and AEDT both say Australian Eastern, and how to read offsets safely.', audioUrl: '', script: 'Explain that abbreviations are ambiguous across countries. Prefer IANA ids such as Australia/Melbourne. Compare Melbourne, Sydney and Brisbane when Queensland is not on daylight saving.' },
      { id: 'w-003', cadence: 'weekly', title: 'Sunrise tables for outdoor teams', date: '2026-08-04', duration: '11 min', summary: 'Using multi-day sun tables for construction, film, events and fieldwork.', audioUrl: '', script: 'Walk through the Sun and Moon multi-day table. Mention polar day and night messaging for high latitudes. Remind listeners that local terrain can change the visible horizon.' },
      { id: 'w-004', cadence: 'weekly', title: 'Fair hours across continents', date: '2026-07-28', duration: '12 min', summary: 'Rotating inconvenience so AU–US–EU teams share the load.', audioUrl: '', script: 'Demonstrate the hour strip. Suggest rotating early and late slots. End with a checklist before sending a recurring invite.' },
      { id: 'w-005', cadence: 'weekly', title: 'When news and clocks meet', date: '2026-07-21', duration: '9 min', summary: 'Why live headlines sit next to world time tools — and how to stay critical of sources.', audioUrl: '', script: 'Describe the news panel as context, not a wire service. Attribute sources. Encourage readers to open original publishers for full stories.' },
      { id: 'm-001', cadence: 'monthly', title: 'Month ahead: moon and meetings', date: '2026-08-01', duration: '18 min', summary: 'Notable moon phases, twilight windows and calendar hygiene for the month.', audioUrl: '', script: 'Cover major lunar phases and any widely watched sky events. Suggest a monthly review of pinned cities and team defaults.' },
      { id: 'm-002', cadence: 'monthly', title: 'Teaching with free time tools', date: '2026-07-01', duration: '16 min', summary: 'Classroom ideas for geography, science and remote collaboration.', audioUrl: '', script: 'Outline a 30-minute lesson using world clocks and sun tables. No student personal data required for core tools.' },
      { id: 'm-003', cadence: 'monthly', title: 'Australian workday helpers', date: '2026-06-01', duration: '15 min', summary: 'What our calculators are for — and what they are not.', audioUrl: '', script: 'Show workday and pay helpers as educational. Direct listeners to the ATO and qualified advisers for binding figures.' },
      { id: 'm-004', cadence: 'monthly', title: 'Security culture at TimeGovern', date: '2026-04-01', duration: '14 min', summary: 'HTTPS in production, privacy contacts and what Security check means for visitors.', audioUrl: '', script: 'Explain the browser padlock on the public site. Point to privacy and security addresses. No vendor runbooks.' },
      { id: 'm-005', cadence: 'monthly', title: 'Widgets without clutter', date: '2026-03-01', duration: '13 min', summary: 'Embedding clocks and calendars on school or office pages responsibly.', audioUrl: '', script: 'Discuss lightweight embeds, accessibility and not overloading public screens with noise.' },
      { id: 'y-001', cadence: 'yearly', title: 'Year in time zones', date: '2026-01-10', duration: '22 min', summary: 'Policy debates and IANA updates worth watching over the year.', audioUrl: '', script: 'Summarise major civil-time policy themes without speculation. Encourage annual review of saved cities.' },
      { id: 'y-002', cadence: 'yearly', title: 'Leap seconds in plain language', date: '2025-12-01', duration: '20 min', summary: 'Why UTC sometimes needs a second — and how platforms soften the step.', audioUrl: '', script: 'Define leap seconds via IERS decisions. Describe smear techniques used by large platforms. Reassure planners that civil calendars rarely change mid-day for this reason.' },
      { id: 'y-003', cadence: 'yearly', title: 'Education year-check', date: '2025-11-01', duration: '18 min', summary: 'Free tools for teachers and science clubs.', audioUrl: '', script: 'List classroom-safe features. Stress that core tools need no student accounts.' },
      { id: 'y-004', cadence: 'yearly', title: 'Enterprise meeting culture', date: '2025-10-10', duration: '24 min', summary: 'Policies for fair meeting hours across continents.', audioUrl: '', script: 'Treat the meeting planner as a fairness tool. Rotate inconvenience. Document team norms.' },
      { id: 'y-005', cadence: 'yearly', title: 'Australian compliance year-check', date: '2025-09-01', duration: '20 min', summary: 'Privacy, Spam Act and consumer-law checklist for our own operations — published for transparency.', audioUrl: '', script: 'Walk Trust Centre and Legal tabs. Invite questions to legal and privacy contacts.' },
    ],
  },

  newsletter: {
    weekly: {
      id: 'weekly',
      name: 'Weekly Bulletin',
      description:
        'A short weekly note: daylight-saving changes, zone tips, one sky highlight and one product tip. Express opt-in only; every email includes unsubscribe (Spam Act 2003).',
      samples: [
        { id: 'nw-1', subject: 'TimeGovern Weekly: DST flips this week', preview: 'Regions changing clocks, Meeting Planner tip, one sky note.' },
        { id: 'nw-2', subject: 'TimeGovern Weekly: IANA data refresh', preview: 'What zone-data updates mean for your saved cities.' },
        { id: 'nw-3', subject: 'TimeGovern Weekly: Sunrise table tip', preview: 'Plan outdoor work with multi-day sun times.' },
        { id: 'nw-4', subject: 'TimeGovern Weekly: Leap-second watch', preview: 'Why UTC occasionally needs a second — and where we explain it.' },
        { id: 'nw-5', subject: 'TimeGovern Weekly: Fair meeting hours', preview: 'Hour-strip technique for AU–US–EU teams.' },
      ],
    },
    monthly: {
      id: 'monthly',
      name: 'Monthly Digest',
      description:
        'A monthly overview of calendar notes, notable sky events and meaningful product updates — written for planners and curious readers.',
      samples: [
        { id: 'nm-1', subject: 'August Digest: sky and schedules', preview: 'Moon phases, twilight windows, calendar hygiene.' },
        { id: 'nm-2', subject: 'July Digest: mid-year timezone map', preview: 'Who is on DST, who is not, planner defaults.' },
        { id: 'nm-3', subject: 'June Digest: AU workday tools', preview: 'Calculators overview — not tax advice; verify with ATO.' },
        { id: 'nm-4', subject: 'May Digest: widgets for education', preview: 'Embed clocks safely in school sites.' },
        { id: 'nm-5', subject: 'April Digest: trust and security', preview: 'HTTPS, privacy contacts, how to report issues.' },
      ],
    },
    yearly: {
      id: 'yearly',
      name: 'Year in Time',
      description:
        'An annual round-up of civil-time reforms to watch, leap-second context in plain language, and a year-ahead planning checklist.',
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
    lastUpdated: '25 August 2026',
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
