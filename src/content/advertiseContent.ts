/**
 * Media kit + rate card — TimeGovern Advertise hub
 * Currency AUD; indicative until traffic baselines are locked.
 */

export const advertiseContent = {
  brand: 'TimeGovern',
  tagline: 'Where global professionals check time, plan meetings, and run business calculators',
  contactEmail: 'advertise@timegovern.com',
  contactPhone: '+61 3 9999 0100',
  hqLine: 'Level 12, 120 Collins Street, Melbourne VIC 3000, Australia',

  hero: {
    headline: 'Advertise on TimeGovern',
    subhead:
      'Premium, brand-safe placements beside world clocks, calendars, pay tools, astronomy, and live data — built for long sessions, not drive-by clicks.',
    ctaPrimary: 'Email media team',
    ctaSecondary: 'View placement list',
  },

  audience: {
    summary:
      'Professionals and teams who open world clocks, meeting planners, calendars, Australian pay calculators, astronomy, and live global data. Utility traffic with high intent and longer dwell on planning screens.',
    geos: ['Australia', 'United States', 'United Kingdom', 'Canada', 'Singapore', 'New Zealand', 'EU', 'India'],
    interests: [
      'Global teams & remote work',
      'Payroll, tax & salary planning (AU-strong)',
      'Travel, logistics & shift operations',
      'SaaS / API and developer tooling',
      'Education, research & STEM',
      'Finance, banking & fintech (brand-safe only)',
    ],
    whyBuyersCare: [
      'Users return to check time and deadlines — not one-off article reads.',
      'Context is calm and professional (tools, not outrage content).',
      'Australian HQ with clear advertising policy and rejection rights.',
    ],
  },

  whyUs: [
    'Long view-time on clocks and meeting planners — sticky units stay in view.',
    'Brand-safe utility environment suitable for banks, travel, education, and B2B SaaS.',
    'Named IAB sizes and fixed slot IDs for direct IO and future programmatic.',
    'Controlled density: we limit anchors and dual rails so ads do not break tools.',
    'Optional Supporter path (ad-free) keeps user trust while inventory funds free access.',
  ],

  slots: [
    {
      id: 'tg_header',
      name: 'Header leaderboard',
      sizes: '728×90 · 970×250 · responsive',
      placement: 'Below primary navigation, sitewide',
      priority: 'High — first brand impression',
      notes: 'Fixed min-height to protect layout and Core Web Vitals.',
    },
    {
      id: 'tg_rail_sticky',
      name: 'Sticky sidebar (premium)',
      sizes: '300×600',
      placement: 'Desktop right rail; sticky while the tool is used',
      priority: 'Premium — highest view-time',
      notes: 'Best for World Clock, Meeting Planner, and long calculator sessions.',
    },
    {
      id: 'tg_infeed',
      name: 'In-feed native',
      sizes: '300×250 · fluid native',
      placement: 'Between major tool sections (clocks, live data, calculators, news)',
      priority: 'High engagement',
      notes: 'Always labeled Advertisement; limited frequency for UX quality.',
    },
    {
      id: 'tg_rectangle',
      name: 'Medium rectangle (MREC)',
      sizes: '300×250',
      placement: 'Calculators, Company, News, secondary pages',
      priority: 'Standard',
      notes: 'Classic unit for direct and open-auction fill.',
    },
    {
      id: 'tg_footer',
      name: 'Footer board',
      sizes: '728×90',
      placement: 'Above site footer, run of site',
      priority: 'Efficient reach',
      notes: 'Always-on ROS option; pairs well with header in packages.',
    },
    {
      id: 'tg_mobile_anchor',
      name: 'Mobile anchor',
      sizes: '320×50 · 320×100',
      placement: 'Sticky bottom on mobile only',
      priority: 'Mobile only — single unit',
      notes: 'One mobile sticky max; user-dismissible; no stacked anchors.',
    },
  ],

  rateCardAud: {
    disclaimer:
      'Indicative AUD rates for planning (lab). Final pricing depends on traffic, geo mix, seasonality, and exclusivity. GST may apply for Australian buyers. Minimum terms apply.',
    packages: [
      {
        name: 'Starter ROS',
        includes: ['Header leaderboard', 'Footer board'],
        period: '30 days',
        fromAud: 450,
        notes: 'Run-of-site boards; shared rotation possible.',
      },
      {
        name: 'Premium Sticky',
        includes: ['Sticky sidebar 300×600'],
        period: '30 days',
        fromAud: 1200,
        notes: 'Limited rotation or exclusive on desktop sticky — flagship unit.',
      },
      {
        name: 'Tools Bundle',
        includes: ['Header', 'Sticky rail', 'In-feed native'],
        period: '30 days',
        fromAud: 1800,
        notes: 'Emphasis on World Clock, Live Data, and Calculators paths.',
      },
      {
        name: 'Mobile + Desktop',
        includes: ['Mobile anchor', 'In-feed or MREC'],
        period: '30 days',
        fromAud: 950,
        notes: 'Balanced reach without stacking mobile units.',
      },
      {
        name: 'Quarterly Brand',
        includes: ['All standard slots', 'Optional newsletter mention'],
        period: '90 days',
        fromAud: 4500,
        notes: 'Best unit rate; one mid-flight creative refresh included.',
      },
    ],
    cpmGuidance:
      'Programmatic open auction often clears lower. Direct-sold premium sticky and in-feed target material CPM uplift versus network fill. Share goals (awareness vs traffic) and we will recommend a mix.',
  },

  specs: {
    fileTypes: ['JPG', 'PNG', 'GIF (static preferred)', 'HTML5 by prior approval'],
    maxFileKb: 150,
    dimensions: 'Serve exact IAB sizes listed per slot; retina assets welcome if file size limit met',
    clickUrl: 'HTTPS landing pages only',
    leadTimeDays: 5,
    tracking: 'Secure third-party impression trackers by approval only',
    animation: 'Max 15s loop; no auto-play audio; no full-screen expansion on load',
  },

  policySummary: [
    'Every unit is labeled Advertisement — no fake system alerts or disguised editorial.',
    'No illegal products, adult content, malware, or deceptive finance claims (Australian Consumer Law).',
    'No pop-unders, forced redirects, or creatives that cover tool controls (clocks, forms, buttons).',
    'TimeGovern may reject or remove creatives that harm user trust, accessibility, or performance.',
    'Personal data for ad delivery is handled under our Privacy Policy (Australia, with transparency for other regions).',
    'Supporters who pay for ad-free browsing will not see standard display inventory.',
  ],

  process: [
    'Email advertise@timegovern.com with goals, geos, dates, and preferred slots.',
    'We confirm availability, package, and IO (insertion order).',
    'Send creatives 5+ business days before flight; we QA sizes and policy.',
    'Campaign goes live; optional mid-flight report on request once analytics baselines exist.',
  ],
};
