/**
 * Media kit + rate card copy for TimeGovern Advertise hub (lab).
 * Currency AUD; adjust when traffic baselines are known.
 */

export const advertiseContent = {
  brand: 'TimeGovern',
  tagline: 'Professional time, calendar & business tools — premium brand-safe inventory',
  contactEmail: 'advertise@timegovern.com',
  contactPhone: '+61 3 9999 0100',
  hqLine: 'Level 12, 120 Collins Street, Melbourne VIC 3000, Australia',

  audience: {
    summary:
      'Professionals and teams who open world clocks, meeting planners, calendars, pay calculators, and astronomy tools — high-intent utility traffic with long dwell on key screens.',
    geos: ['Australia', 'United States', 'United Kingdom', 'Canada', 'Singapore', 'New Zealand', 'EU'],
    interests: [
      'Global teams & remote work',
      'Payroll & tax planning (AU focus)',
      'Travel & logistics',
      'Software / SaaS developers (API buyers)',
      'Education & research',
    ],
  },

  whyUs: [
    'Utility behaviour: users stay on-screen (clocks, planners) — strong viewability on sticky units.',
    'Brand-safe context: tools and reference content, not sensational news.',
    'Clear IAB sizes and named slots for direct and programmatic buy.',
    'Australian headquarters with transparent advertising policy.',
  ],

  slots: [
    {
      id: 'tg_header',
      name: 'Header leaderboard',
      sizes: '728×90 (desktop), 320×100 (mobile equivalent)',
      placement: 'Below primary navigation, sitewide',
      notes: 'First brand impression; fixed min-height to protect Core Web Vitals.',
    },
    {
      id: 'tg_rail_sticky',
      name: 'Sticky sidebar (premium)',
      sizes: '300×600',
      placement: 'Desktop right rail; sticky while content is viewed',
      notes: 'Highest priority inventory — long in-view time on World Clock & Meeting Planner.',
    },
    {
      id: 'tg_infeed',
      name: 'In-feed / native',
      sizes: '300×250 or fluid native',
      placement: 'Between tool sections (clocks, calculators, news)',
      notes: 'Labeled Advertisement; limited density for UX quality.',
    },
    {
      id: 'tg_rectangle',
      name: 'Medium rectangle',
      sizes: '300×250',
      placement: 'Calculators, Company, secondary pages',
      notes: 'Classic MREC for programmatic and direct.',
    },
    {
      id: 'tg_footer',
      name: 'Footer board',
      sizes: '728×90',
      placement: 'Above site footer',
      notes: 'Always-on ROS (run of site) option.',
    },
    {
      id: 'tg_mobile_anchor',
      name: 'Mobile anchor',
      sizes: '320×50 / 320×100',
      placement: 'Sticky bottom on mobile only',
      notes: 'Single unit max; user-dismissible.',
    },
  ],

  /** Indicative lab rates — replace with real media kit after traffic baseline */
  rateCardAud: {
    disclaimer:
      'Indicative AUD rates for planning only (lab). Final pricing depends on traffic, geo mix, and seasonality. Minimum terms apply.',
    packages: [
      {
        name: 'Starter ROS',
        includes: ['tg_header', 'tg_footer'],
        period: '30 days',
        fromAud: 450,
        notes: 'Run-of-site boards; shared rotation possible.',
      },
      {
        name: 'Premium Sticky',
        includes: ['tg_rail_sticky'],
        period: '30 days',
        fromAud: 1200,
        notes: 'Exclusive or limited rotation on desktop sticky 300×600.',
      },
      {
        name: 'Tools Bundle',
        includes: ['tg_header', 'tg_rail_sticky', 'tg_infeed'],
        period: '30 days',
        fromAud: 1800,
        notes: 'Homepage + World Clock / Calculators emphasis.',
      },
      {
        name: 'Quarterly Brand',
        includes: ['All standard slots', 'Optional newsletter mention'],
        period: '90 days',
        fromAud: 4500,
        notes: 'Best unit rate; creative refresh mid-flight included.',
      },
    ],
    cpmGuidance:
      'Open-auction programmatic often clears lower; direct-sold premium sticky targets material CPM uplift vs network fill.',
  },

  specs: {
    fileTypes: ['JPG', 'PNG', 'GIF (static preferred)', 'HTML5 by approval'],
    maxFileKb: 150,
    clickUrl: 'HTTPS required',
    leadTimeDays: 5,
    tracking: 'Third-party impression trackers by approval (secure only)',
  },

  policySummary: [
    'All creatives labeled as advertising; no misleading “system alerts”.',
    'No illegal products, adult content, malware, or deceptive finance claims under Australian Consumer Law.',
    'TimeGovern may reject or remove creatives that harm user trust or site performance.',
    'Personal data for ad delivery handled under our Privacy Policy (Australia).',
  ],
};
