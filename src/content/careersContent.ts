/**
 * TimeGovern careers — single source of truth for open roles.
 * Applications: careersEmail (mailto + form).
 */

export type JobLevel = 'Internship' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

export interface CareerJob {
  id: string;
  title: string;
  department: string;
  level: JobLevel;
  type: JobType;
  location: string;
  remote: string;
  salaryAud: string;
  posted: string;
  summary: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave: string[];
  benefits: string[];
}

export const careersContent = {
  careersEmail: 'careers@timegovern.com',
  hrEmail: 'hr@timegovern.com',
  applySubjectPrefix: 'Application — TimeGovern',

  hero: {
    title: 'Build the global time platform',
    subtitle:
      'TimeGovern is hiring in Melbourne and remote-first across Australia. Join a product used worldwide for clocks, calendars, astronomy and planning tools.',
  },

  aboutCompany: {
    title: 'Why TimeGovern',
    paragraphs: [
      'TimeGovern Pty Ltd is a Melbourne-based company building timegovern.com — world clocks, meeting planners, calendars, sun & moon data, calculators and live context for a global audience.',
      'We are a product-led team: careful engineering, clear design, and honest limits on what any web tool can claim. Essential tools stay free; Supporters help fund the platform.',
      'HQ: Level 12, 120 Collins Street, Melbourne VIC 3000, Australia. We hire for craft, curiosity and respect for users who depend on accurate civil time.',
    ],
    perks: [
      'Hybrid Melbourne HQ + remote Australia',
      'Flexible hours around deep work',
      'Equipment stipend',
      'Learning budget for courses & conferences',
      'Ad-free Supporter access for staff',
      'Inclusive, low-ego culture',
    ],
  },

  howToApply:
    'Choose a role, click Apply, and send your CV (PDF) plus a short note on why TimeGovern. We reply to every complete application within 10 business days.',

  equalOpportunity:
    'TimeGovern is an equal opportunity employer. We welcome applications from all backgrounds. We do not discriminate on the basis of age, gender, race, religion, disability, sexual orientation or any other protected attribute under Australian law.',

  jobs: [
    {
      id: 'fe-senior',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      level: 'Senior',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid / remote Australia',
      salaryAud: 'A$140,000 – A$175,000 + super',
      posted: '2026-08',
      summary:
        'Own React performance, accessibility and the live world-clock experience on timegovern.com.',
      aboutRole:
        'You will lead frontend architecture for our flagship world clock, astronomy and calendar pillars — TypeScript, React, Vite — with a focus on sub-second perceived performance and WCAG-minded UI.',
      responsibilities: [
        'Ship and maintain high-traffic React pillars (clocks, astronomy, calculators)',
        'Profile and fix layout shift, bundle size and hydration issues',
        'Partner with design on motion, dark/light themes and responsive layouts',
        'Write clear component APIs and review pull requests',
        'Instrument core UX for reliability (error boundaries, empty states)',
      ],
      requirements: [
        '5+ years frontend, 3+ years React + TypeScript',
        'Strong CSS/Tailwind and responsive design',
        'Experience with performance budgets and accessibility',
        'Comfortable with Git, code review and async collaboration',
      ],
      niceToHave: ['Cloudflare Pages / Workers', 'date-fns / timezone libraries', 'Design systems'],
      benefits: ['Hybrid Melbourne', 'Learning budget', 'Equipment stipend'],
    },
    {
      id: 'fs-workers',
      title: 'Full-Stack Engineer (Edge & API)',
      department: 'Engineering',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Remote Australia OK',
      salaryAud: 'A$120,000 – A$150,000 + super',
      posted: '2026-08',
      summary: 'Build Cloudflare Workers APIs, auth and data paths that keep TimeGovern live and secure.',
      aboutRole:
        'You will design and implement edge APIs for time sync, news aggregation, auth sessions and application intake — TypeScript on Cloudflare Workers, D1 and related tooling.',
      responsibilities: [
        'Develop and document REST-style Worker routes',
        'Harden auth, rate limits and input validation',
        'Integrate third-party feeds with clear failure modes',
        'Own observability: logs, basic metrics, incident notes',
      ],
      requirements: [
        '3+ years full-stack TypeScript or similar',
        'HTTP APIs, SQL basics, security awareness',
        'Experience deploying serverless or edge runtimes',
      ],
      niceToHave: ['Cloudflare Workers / D1', 'OAuth', 'Stripe webhooks'],
      benefits: ['Remote-friendly', 'Learning budget'],
    },
    {
      id: 'design-product',
      title: 'Product Designer (UI/UX)',
      department: 'Design',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$110,000 – A$140,000 + super',
      posted: '2026-08',
      summary: 'Shape a premium, trustworthy visual system for global time tools.',
      aboutRole:
        'Design end-to-end flows for clocks, planners and company surfaces. Deliver high-fidelity specs, prototypes and a coherent design language that works in light and dark modes.',
      responsibilities: [
        'User research with power users (remote teams, educators, travellers)',
        'Wireframes, UI kits and handoff to engineering',
        'Improve empty, loading and error states across pillars',
        'Champion accessibility and readability of dense data',
      ],
      requirements: [
        'Portfolio of shipped web products',
        'Figma proficiency',
        'Strong visual and interaction design',
      ],
      niceToHave: ['Motion design', 'Design systems', 'B2B SaaS'],
      benefits: ['Hybrid HQ', 'Equipment stipend'],
    },
    {
      id: 'content-astro',
      title: 'Astronomy & Time Content Editor',
      department: 'Content',
      level: 'Mid',
      type: 'Part-time',
      location: 'Remote Australia',
      remote: 'Fully remote',
      salaryAud: 'A$45 – A$65 / hour',
      posted: '2026-08',
      summary: 'Write accurate, engaging copy for sun/moon, calendars and educational explainers.',
      aboutRole:
        'Produce and edit articles, tool tips and newsletter drafts that explain civil time, DST, eclipses and calendars without overstating precision.',
      responsibilities: [
        'Research and draft astronomy/time explainers',
        'Fact-check against public sources (IANA, almanacs)',
        'Support weekly/monthly newsletter outlines',
        'Coordinate with product on in-app microcopy',
      ],
      requirements: [
        'Excellent written English',
        'Interest in astronomy or timekeeping',
        'Ability to cite sources clearly',
      ],
      niceToHave: ['Science journalism', 'SEO basics', 'Education experience'],
      benefits: ['Flexible hours', 'Remote'],
    },
    {
      id: 'data-tz',
      title: 'Data Engineer (Time Zones & Reference Data)',
      department: 'Engineering',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne / remote AU',
      remote: 'Remote Australia OK',
      salaryAud: 'A$125,000 – A$155,000 + super',
      posted: '2026-08',
      summary: 'Keep city, timezone and reference datasets correct, versioned and explainable.',
      aboutRole:
        'Own pipelines and QA for IANA-backed zone data, city databases and derived tables used by world clocks and planners.',
      responsibilities: [
        'Automate checks when tzdb updates land',
        'Document data lineage for critical tables',
        'Partner with frontend on edge cases (DST gaps, ambiguous local times)',
      ],
      requirements: [
        'Python or TypeScript data tooling',
        'Comfort with public datasets and git',
        'Strong attention to edge cases',
      ],
      niceToHave: ['IANA tzdb', 'Geospatial basics', 'SQL'],
      benefits: ['Remote-friendly', 'Learning budget'],
    },
    {
      id: 'growth',
      title: 'Growth Marketing Manager',
      department: 'Growth',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$100,000 – A$130,000 + super',
      posted: '2026-08',
      summary: 'Grow organic and partner acquisition for a utility brand people trust.',
      aboutRole:
        'Plan SEO content, partnerships and measurement for timegovern.com without dark patterns — clear value, clear privacy.',
      responsibilities: [
        'Keyword and content strategy with the editor',
        'Landing experiments for tools and Supporter plans',
        'Report funnel metrics to founders',
      ],
      requirements: [
        '3+ years growth or digital marketing',
        'SEO fundamentals',
        'Analytical mindset',
      ],
      niceToHave: ['SaaS or media experience', 'Basic HTML'],
      benefits: ['Hybrid', 'Performance bonus eligible'],
    },
    {
      id: 'support',
      title: 'Customer Support Specialist',
      department: 'Support',
      level: 'Junior',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$65,000 – A$80,000 + super',
      posted: '2026-08',
      summary: 'Help users with accounts, billing questions and product guidance.',
      aboutRole:
        'Be the friendly, precise voice of TimeGovern via email and ticket queue — escalate product bugs with clear reproduction steps.',
      responsibilities: [
        'Respond to support@ and billing enquiries',
        'Maintain help macros and FAQ drafts',
        'Flag recurring issues to engineering',
      ],
      requirements: [
        'Excellent written communication',
        'Patience with non-technical users',
        'Basic comfort with web apps',
      ],
      niceToHave: ['Zendesk or similar', 'Bilingual AU community languages'],
      benefits: ['Hybrid HQ', 'Career path into ops or CS leadership'],
    },
    {
      id: 'mobile-pwa',
      title: 'Mobile / PWA Engineer',
      department: 'Engineering',
      level: 'Mid',
      type: 'Contract',
      location: 'Remote Australia',
      remote: 'Fully remote',
      salaryAud: 'A$90 – A$120 / hour',
      posted: '2026-08',
      summary: 'Improve installable PWA, offline shells and mobile performance.',
      aboutRole:
        'Contract engagement to harden service worker strategy, home-screen install UX and mobile layout for core tools.',
      responsibilities: [
        'Audit and improve PWA install path',
        'Optimize touch targets and mobile nav',
        'Document offline limitations honestly',
      ],
      requirements: [
        'Strong web mobile experience',
        'Service workers / caching strategies',
        'React',
      ],
      niceToHave: ['iOS/Android WebView quirks', 'Lighthouse CI'],
      benefits: ['Flexible contract length', 'Remote'],
    },
    {
      id: 'sre',
      title: 'Site Reliability / DevOps Engineer',
      department: 'Engineering',
      level: 'Senior',
      type: 'Full-time',
      location: 'Melbourne / remote AU',
      remote: 'Remote Australia OK',
      salaryAud: 'A$145,000 – A$180,000 + super',
      posted: '2026-08',
      summary: 'Uptime, deploys and incident response for a globally cached static + edge app.',
      aboutRole:
        'Own CI/CD, Cloudflare configuration, monitoring and runbooks so timegovern.com stays fast and recoverable.',
      responsibilities: [
        'Automate deploys and preview environments',
        'Define SLOs for critical pages',
        'Lead incident retrospectives',
      ],
      requirements: [
        'Production experience with CDN/edge platforms',
        'CI systems (GitHub Actions or similar)',
        'Security and least-privilege mindset',
      ],
      niceToHave: ['Cloudflare', 'Terraform', 'On-call experience'],
      benefits: ['Remote-friendly', 'On-call allowance if rostered'],
    },
    {
      id: 'intern-swe',
      title: 'Software Engineering Intern',
      department: 'Engineering',
      level: 'Internship',
      type: 'Internship',
      location: 'Melbourne, VIC',
      remote: 'On-site preferred / hybrid',
      salaryAud: 'Award rate / A$30 – A$40 / hour',
      posted: '2026-08',
      summary: '12-week internship building real features on a production time platform.',
      aboutRole:
        'Work with senior engineers on a scoped feature (UI component, calculator, or data QA script). Mentorship and portfolio-worthy shipping.',
      responsibilities: [
        'Implement a small feature end-to-end with review',
        'Write tests or manual QA checklists',
        'Present a short demo at internship end',
      ],
      requirements: [
        'Currently enrolled in CS or related degree (AU)',
        'Basic JavaScript or TypeScript',
        'Curiosity about how the web works',
      ],
      niceToHave: ['React coursework', 'Personal projects on GitHub'],
      benefits: ['Mentorship', 'Possible graduate path'],
    },
  ] as CareerJob[],
};

export type CareersContent = typeof careersContent;
