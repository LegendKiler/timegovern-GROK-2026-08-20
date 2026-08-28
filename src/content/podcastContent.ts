/**
 * TimeGovern Podcast — show notes & episode list (text-first; audio URLs optional later).
 */

export interface PodcastEpisode {
  id: string;
  number: number;
  title: string;
  cadence: 'weekly' | 'monthly' | 'special';
  published: string; // YYYY-MM-DD
  durationMin: number;
  hosts: string[];
  summary: string;
  topics: string[];
  showNotes: string[];
  takeaways: string[];
  /** Optional future audio file or external URL */
  audioUrl?: string | null;
}

export const podcastContent = {
  showName: 'TimeGovern Time Talk',
  tagline: 'World clocks, calendars, the sky — and how people actually plan across time zones.',
  description:
    'A TimeGovern series for remote teams, travellers, teachers and the curious. We explain civil time, DST, meeting overlap, sun and moon tables, and practical tools on timegovern.com — without overstating precision.',
  hostNote: 'Hosted by the TimeGovern editorial team (Melbourne). Episodes are published as show notes first; audio can be linked when hosting is ready.',
  subscribeHint: 'Prefer email? Use Company → Newsletters for weekly, monthly and yearly digests that pair with these episodes.',

  episodes: [
    {
      id: 'ep-01',
      number: 1,
      title: 'Why “what time is it there?” is harder than it looks',
      cadence: 'weekly',
      published: '2026-05-05',
      durationMin: 18,
      hosts: ['TimeGovern Editorial'],
      summary:
        'An introduction to civil time, local clocks, and why phone time and meeting invites still surprise people every week.',
      topics: ['civil time', 'time zones', 'UTC'],
      showNotes: [
        'Civil time vs atomic time in plain language',
        'Why TimeGovern shows many city clocks at once',
        'When to trust a website clock vs an official source',
      ],
      takeaways: [
        'Always name the city and the zone, not only “+10”',
        'Critical legal deadlines still need official authorities',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-02',
      number: 2,
      title: 'Meeting planner 101: finding the overlap',
      cadence: 'weekly',
      published: '2026-05-12',
      durationMin: 22,
      hosts: ['TimeGovern Editorial'],
      summary:
        'How hour-strip planners help remote teams avoid 6am calls — and the limits of any web tool.',
      topics: ['meetings', 'remote work', 'world clock'],
      showNotes: [
        'Business-hours bands vs night hours',
        'Pinning cities on TimeGovern World Clock',
        'Culture and courtesy: rotating meeting times',
      ],
      takeaways: [
        'Share a link or screenshot with zone labels',
        'Re-check after DST changes on either side',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-03',
      number: 3,
      title: 'Daylight saving: who changes, who does not',
      cadence: 'weekly',
      published: '2026-05-19',
      durationMin: 20,
      hosts: ['TimeGovern Editorial'],
      summary:
        'A practical tour of DST rules, why offsets jump, and how IANA data underpins modern apps.',
      topics: ['DST', 'IANA', 'offsets'],
      showNotes: [
        'Spring forward / fall back in everyday language',
        'Regions that never observe DST',
        'How TimeGovern follows public timezone data',
      ],
      takeaways: [
        'Never hard-code “always UTC+10” for Australia',
        'Verify state-level rules for border towns',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-04',
      number: 4,
      title: 'Sunrise, sunset and why “noon” is not always 12:00',
      cadence: 'weekly',
      published: '2026-05-26',
      durationMin: 24,
      hosts: ['TimeGovern Editorial'],
      summary:
        'Solar noon, equation of time, and reading TimeGovern’s sun tables without overclaiming precision.',
      topics: ['astronomy', 'solar noon', 'equation of time'],
      showNotes: [
        'Clock noon vs solar culmination',
        'Longitude and standard meridians',
        'Using the Solar Noon and Sun Ephemeris tabs',
      ],
      takeaways: [
        'Outdoor plans: check both civil clock and sun table',
        'Polar day/night needs special messaging',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-05',
      number: 5,
      title: 'Moon phases for planners and photographers',
      cadence: 'weekly',
      published: '2026-06-02',
      durationMin: 19,
      hosts: ['TimeGovern Editorial'],
      summary:
        'Illumination, age of the moon, and how the LIVE moon disc complements calendar planning.',
      topics: ['moon', 'photography', 'LIVE data'],
      showNotes: [
        'Phase names in plain English',
        'Why altitude matters for “is the moon up?”',
        'TimeGovern lunar calendar overview',
      ],
      takeaways: [
        'Pair moon phase with local weather',
        'LIVE disc is indicative, not a telescope ephemeris',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-06',
      number: 6,
      title: 'Calendars across cultures: week numbers and fiscal years',
      cadence: 'monthly',
      published: '2026-06-09',
      durationMin: 26,
      hosts: ['TimeGovern Editorial'],
      summary:
        'ISO week numbers, school terms, and why “Q1” is not universal — with a nod to TimeGovern calendar tools.',
      topics: ['calendar', 'ISO weeks', 'business'],
      showNotes: [
        'ISO 8601 week-year quirks at year boundaries',
        'Public holidays as local facts, not global constants',
        'Exporting calendars as a future Supporter theme',
      ],
      takeaways: [
        'Label week numbers with the standard you mean',
        'Confirm holidays with official government sources',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-07',
      number: 7,
      title: 'Leap seconds: rare, real, and easy to misunderstand',
      cadence: 'special',
      published: '2026-06-16',
      durationMin: 21,
      hosts: ['TimeGovern Editorial'],
      summary:
        'What leap seconds are, why networks care, and how TimeGovern talks about them without scare headlines.',
      topics: ['leap second', 'UTC', 'systems'],
      showNotes: [
        'UTC vs smoothed time scales in one minute',
        'Where consumer apps rarely expose leap seconds',
        'Leap Second utility on the site',
      ],
      takeaways: [
        'Most users never notice leap seconds',
        'Infrastructure teams monitor IERS/ITU notices',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-08',
      number: 8,
      title: 'Travel day: landing, jet lag, and local clocks',
      cadence: 'weekly',
      published: '2026-06-23',
      durationMin: 17,
      hosts: ['TimeGovern Editorial'],
      summary:
        'A traveller’s checklist: destination clocks, airport days, and not missing a hotel booking timezone.',
      topics: ['travel', 'jet lag', 'world clock'],
      showNotes: [
        'Pin home and destination before you fly',
        'Booking confirmations in local time',
        'Sun table for first morning light at destination',
      ],
      takeaways: [
        'Set phone to automatic time zone when possible',
        'Double-check tour start times in local zone',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-09',
      number: 9,
      title: 'News and weather next to the clock — why context matters',
      cadence: 'weekly',
      published: '2026-06-30',
      durationMin: 16,
      hosts: ['TimeGovern Editorial'],
      summary:
        'How TimeGovern pairs live context with time tools, and how we attribute sources honestly.',
      topics: ['news', 'weather', 'attribution'],
      showNotes: [
        'Free feeds and rate limits in plain language',
        'Why headlines are not advice',
        'Refreshing LIVE panels without flooding APIs',
      ],
      takeaways: [
        'Treat news cards as leads, not the full story',
        'Weather is location-sensitive — pick the right city',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-10',
      number: 10,
      title: 'Calculators that save a spreadsheet',
      cadence: 'monthly',
      published: '2026-07-07',
      durationMin: 23,
      hosts: ['TimeGovern Editorial'],
      summary:
        'From working-day counters to pay-style calculators — when a browser tool is enough, and when it is not.',
      topics: ['calculators', 'business', 'education'],
      showNotes: [
        'Working days vs calendar days',
        'AU-focused salary tools as education, not tax advice',
        'ICT and physics extras for students',
      ],
      takeaways: [
        'Always read disclaimers on financial calculators',
        'Cross-check with an accountant for real decisions',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-11',
      number: 11,
      title: 'Eclipses without the hype',
      cadence: 'special',
      published: '2026-07-14',
      durationMin: 20,
      hosts: ['TimeGovern Editorial'],
      summary:
        'Reading an eclipse catalogue, safety basics, and how TimeGovern lists events for planning — not predictions of doom.',
      topics: ['eclipses', 'astronomy', 'safety'],
      showNotes: [
        'Solar vs lunar eclipses in one analogy',
        'Eye safety is non-negotiable',
        'Using the Eclipses tab as a starting list',
      ],
      takeaways: [
        'Never look at the sun without proper filters',
        'Local weather can hide a perfect geometric event',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-12',
      number: 12,
      title: 'Building for Melbourne, serving the world',
      cadence: 'monthly',
      published: '2026-07-21',
      durationMin: 18,
      hosts: ['TimeGovern Editorial'],
      summary:
        'Why TimeGovern is Australian-operated, how that shapes support hours, and what “global product” means day to day.',
      topics: ['company', 'Melbourne', 'product'],
      showNotes: [
        'Collins Street HQ and remote-friendly culture',
        'Support hours in AEST/AEDT',
        'Careers and how we hire with AU work rights',
      ],
      takeaways: [
        'Contact forms go to Melbourne-based operations',
        'Product decisions prioritise clarity over hype',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-13',
      number: 13,
      title: 'Widgets, embeds and not breaking the host page',
      cadence: 'weekly',
      published: '2026-07-28',
      durationMin: 15,
      hosts: ['TimeGovern Editorial'],
      summary:
        'For developers and publishers: embedding a clock responsibly, themes, and performance basics.',
      topics: ['widgets', 'embed', 'developers'],
      showNotes: [
        'Light vs dark embed surfaces',
        'Caching and refresh expectations',
        'When to link out instead of embedding',
      ],
      takeaways: [
        'Test embeds on mobile widths',
        'Respect reduced-motion preferences',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-14',
      number: 14,
      title: 'Supporters, ads and keeping tools free',
      cadence: 'monthly',
      published: '2026-08-04',
      durationMin: 19,
      hosts: ['TimeGovern Editorial'],
      summary:
        'How free tiers, optional Supporter plans and advertising can coexist without dark patterns.',
      topics: ['supporter', 'ads', 'trust'],
      showNotes: [
        'What stays free by design',
        'Ad slots as labelled inventory',
        'Privacy-minded expectations',
      ],
      takeaways: [
        'Hide-ads controls should stay obvious',
        'Paid features should be explained in plain language',
      ],
      audioUrl: null,
    },
    {
      id: 'ep-15',
      number: 15,
      title: 'Listener FAQ: offsets, “wrong time”, and bug reports',
      cadence: 'weekly',
      published: '2026-08-11',
      durationMin: 25,
      hosts: ['TimeGovern Editorial'],
      summary:
        'The most common questions from users — and how to report a real timezone data issue helpfully.',
      topics: ['FAQ', 'support', 'IANA'],
      showNotes: [
        'Cached pages vs live ticks',
        'Device clock wrong vs site wrong',
        'What to include in a support email',
      ],
      takeaways: [
        'Include city, expected time, and your device zone',
        'We fix product bugs; governments set legal time',
      ],
      audioUrl: null,
    },
  ] as PodcastEpisode[],
};

export type PodcastContent = typeof podcastContent;
