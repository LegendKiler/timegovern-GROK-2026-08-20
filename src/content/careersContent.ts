/**
 * TimeGovern careers — uniform SEEK-style ads + Australian work-rights eligibility.
 * Applications: careers@timegovern.com
 *
 * Work rights (summary for candidates; not legal advice):
 * - Home Affairs: legal work if Australian citizen OR valid visa with permission to work.
 * - Employers must verify right to work (citizenship docs or VEVO for non-citizens).
 * - Fair Work protections apply regardless of migration status once lawfully employed.
 * Sources: immi.homeaffairs.gov.au; fairwork.gov.au; Migration Act 1958 (Cth).
 */

export type JobLevel = 'Internship' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Internship';

/** Every role uses this same shape */
export interface CareerJob {
  id: string;
  title: string;
  department: string;
  category: string;
  level: JobLevel;
  type: JobType;
  location: string;
  remote: string;
  salaryAud: string;
  posted: string;
  applicationVolume: string;
  summary: string;
  aboutUs: string;
  aboutRole: string;
  responsibilities: string[];
  requirements: string[];
  preferred: string[];
  benefits: string[];
  howToApply: string;
  employerQuestions: string[];
  /** Same eligibility text on every role */
  workRightsEligibility: string[];
}

const ABOUT_US =
  'TimeGovern Pty Ltd operates timegovern.com from Level 12, 120 Collins Street, Melbourne VIC 3000, Australia. We build global world clocks, meeting planners, calendars, sun & moon tools, calculators and related services for a worldwide audience. Essential tools stay free; optional Supporter plans help fund the platform. We value accurate civil time, clear communication and respectful service.';

/** Shared on every advertisement — Australian work rights */
const WORK_RIGHTS_ELIGIBILITY = [
  'You must have an unrestricted legal right to work in Australia for the full duration of employment (or internship period).',
  'Eligible: Australian citizens; Australian permanent residents; New Zealand citizens holding a Special Category visa (subclass 444); or holders of another valid Australian visa that expressly permits the type and hours of work required for this role.',
  'Offers of employment are conditional on successful right-to-work verification before your start date, in line with the Migration Act 1958 (Cth).',
  'Australian citizens / permanent residents: we will ask you to declare your status and may sight evidence such as an Australian passport, or an Australian birth certificate or citizenship certificate together with photo ID (as guided by official employer guidance). Medicare cards, TFNs or driver licences alone are not accepted as proof of citizenship.',
  'Visa holders: we require your consent to check work entitlements through the Department of Home Affairs Visa Entitlement Verification Online (VEVO) system, and a copy of your passport/ImmiCard as required. Work must not breach any visa condition.',
  'TimeGovern does not provide immigration advice. Visa decisions are made only by the Department of Home Affairs (immi.homeaffairs.gov.au / 131 881).',
  'These roles are not open to candidates who cannot lawfully work in Australia. We are not offering visa sponsorship for the roles listed on this page unless a future advertisement expressly states otherwise.',
];

const WORK_RIGHTS_QUESTIONS = [
  'Which statement best describes your right to work in Australia? (Australian citizen / Australian permanent resident / New Zealand citizen with SCV 444 / valid visa with work rights — please specify subclass if known / none of the above)',
  'If you hold a visa, does it allow the full-time or part-time hours required for this role without breach of conditions?',
  'Are you able to provide evidence of work rights before a start date (citizenship documents or VEVO check with consent)?',
];

function stdHowToApply(title: string): string {
  return `Email ${'careers@timegovern.com'} with subject “Application — ${title}”. Attach a PDF curriculum vitae and a brief cover letter addressing the employer questions, including your right to work in Australia. Incomplete applications may not be considered. We aim to respond to complete applications within 10 business days.`;
}

function withWorkRights(baseQuestions: string[]): string[] {
  return [...baseQuestions, ...WORK_RIGHTS_QUESTIONS];
}

export const careersContent = {
  careersEmail: 'careers@timegovern.com',
  hrEmail: 'hr@timegovern.com',
  applySubjectPrefix: 'Application — TimeGovern',

  hero: {
    title: 'Careers at TimeGovern',
    subtitle:
      'Melbourne-based · remote-friendly Australia where stated. All roles require a lawful right to work in Australia (citizen, permanent resident, NZ Special Category visa, or valid visa with suitable work rights — verified before commencement).',
  },

  aboutCompany: {
    title: 'About TimeGovern',
    paragraphs: [
      ABOUT_US,
      'We hire for craft, curiosity and reliability across technology, design, content, growth, support, finance, operations and commercial roles.',
      'We comply with Australian workplace laws (including the Fair Work Act 2009) and immigration compliance expectations under the Migration Act 1958. National workplace protections apply to workers regardless of migration status once they are lawfully employed.',
    ],
    perks: [
      'Hybrid Collins Street HQ + remote Australia where the role allows',
      'Superannuation in line with Australian law',
      'Equipment stipend for permanent roles',
      'Learning budget for courses and conferences',
      'Flexible hours around deep work where operationally possible',
      'Staff access to ad-free Supporter features',
    ],
  },

  /** Page-level work rights notice (shown above job list) */
  workRightsNotice: {
    title: 'Right to work in Australia (all roles)',
    intro:
      'Under Australian law, a person may work in Australia if they are an Australian citizen or hold a valid visa with permission to work. TimeGovern must not employ someone who is an unlawful non-citizen or who would work in breach of visa conditions. We verify work rights before employment starts.',
    points: WORK_RIGHTS_ELIGIBILITY,
    officialLinks: [
      { label: 'Department of Home Affairs — Hiring someone in Australia', href: 'https://immi.homeaffairs.gov.au/visas/employing-and-sponsoring-someone/hire-someone-in-australia' },
      { label: 'VEVO (Visa Entitlement Verification Online)', href: 'https://immi.homeaffairs.gov.au/visas/already-have-a-visa/check-visa-details-and-conditions/check-conditions-online' },
      { label: 'Fair Work Ombudsman — Workplace rights', href: 'https://www.fairwork.gov.au/' },
    ],
    disclaimer:
      'This notice is general information for applicants, not immigration or legal advice. Always check your own visa conditions with Home Affairs.',
  },

  howToApply:
    'Open a role below, expand the full advertisement, then use Apply by email. Attach a PDF CV and answer the employer questions, including work-rights questions. Primary inbox: careers@timegovern.com.',

  equalOpportunity:
    'TimeGovern is an equal opportunity employer. We welcome applications from all backgrounds and do not discriminate on the basis of age, gender, race, religion, disability, sexual orientation or any other attribute protected under Australian law. Eligibility to work in Australia is a lawful condition of employment, not a substitute for discrimination.',

  jobs: [
    {
      id: 'it-support',
      title: 'IT Technical Support Specialist',
      department: 'IT & Infrastructure',
      category: 'Help Desk & IT Support (Information & Communication Technology)',
      level: 'Mid',
      type: 'Full-time',
      location: 'Carlton / Melbourne CBD fringe, VIC',
      remote: 'Hybrid (2–3 days in office)',
      salaryAud: 'A$75,000 – A$95,000 + super',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Level 1–2 support for staff systems: hardware, software, identity, endpoints and clear documentation.',
      aboutUs: ABOUT_US,
      aboutRole:
        'The IT Technical Support Specialist provides technical assistance to end-users and supports efficient operation of technology within TimeGovern. The role focuses on Level 1 and Level 2 support with solid expertise in hardware, software, network-related issues, system administration, reporting, integration, documentation, troubleshooting and training. You are a primary contact for internal IT support and work with the broader technology team to meet business requirements and keep operations smooth.',
      responsibilities: [
        'Act as first and second point of contact for staff IT incidents and service requests',
        'Troubleshoot Windows endpoints, Microsoft 365 and common business applications',
        'Support mobile devices (Android/iOS) and basic MDM tasks',
        'Assist with identity basics (directory, MFA enrolments) under senior guidance',
        'Maintain technical notes, runbooks and ticket hygiene',
        'Collaborate across teams on outages and change windows',
        'Escalate complex issues with clear reproduction steps',
      ],
      requirements: [
        'Certificate IV or Diploma in Information Technology, Computer Science, or related field',
        'Minimum 3–5 years in helpdesk or IT support, ideally recent Level 2 experience',
        'Strong knowledge of Windows operating systems',
        'Knowledge of Android and iOS for mobile devices',
        'Familiarity with Microsoft 365 and common business apps',
        'Basic networking concepts (TCP/IP, DNS, DHCP)',
        'Excellent communication and customer service skills',
        'Ability to work independently and as part of a team',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: [
        'ITIL-style tools (ServiceNow, Jira Service Management, ManageEngine)',
        'Active Directory, Group Policy, Intune, Autopilot, Exchange basics',
        'Remote support tools (TeamViewer, AnyDesk, RDP)',
        'Mobile device management (MDM)',
        'Cybersecurity hygiene awareness',
        'CompTIA A+, Network+, or Microsoft Modern Desktop Administrator',
      ],
      benefits: ['Hybrid Melbourne', 'Superannuation', 'Equipment support'],
      howToApply: stdHowToApply('IT Technical Support Specialist'),
      employerQuestions: withWorkRights([
        'Have you completed a qualification in ICT?',
        'How many years’ experience do you have as an IT support specialist?',
        'Do you have customer service experience?',
        'How much notice are you required to give your current employer?',
        'Which issue/ticket tools have you used (e.g. Jira, ServiceNow)?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'fe-senior',
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      category: 'Developers/Programmers (Information & Communication Technology)',
      level: 'Senior',
      type: 'Full-time',
      location: 'Melbourne, VIC (Collins Street)',
      remote: 'Hybrid / remote Australia considered',
      salaryAud: 'A$140,000 – A$175,000 + super',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Lead React/TypeScript delivery for world clocks, astronomy and calendar experiences used globally.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You own frontend quality for high-traffic product pillars: live clocks, planners, astronomy and company surfaces. You set standards for performance, accessibility and maintainable component design, and mentor others through review.',
      responsibilities: [
        'Design and ship React + TypeScript features on Vite',
        'Protect Core Web Vitals, reduce layout shift and bundle weight',
        'Implement accessible patterns (keyboard, contrast, reduced motion)',
        'Partner with design on dark/light themes and dense data UI',
        'Review PRs and document component contracts',
        'Improve error boundaries, empty and loading states',
      ],
      requirements: [
        '5+ years professional frontend; 3+ years React + TypeScript',
        'Strong CSS/Tailwind and responsive layout skill',
        'Proven performance and accessibility work on production sites',
        'Fluent written English for design/engineering collaboration',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['Cloudflare Pages', 'date-fns / Intl time zones', 'Design systems', 'Playwright or similar'],
      benefits: ['Hybrid HQ', 'Learning budget', 'Superannuation'],
      howToApply: stdHowToApply('Senior Frontend Engineer'),
      employerQuestions: withWorkRights([
        'How many years’ commercial React experience do you have?',
        'Have you shipped WCAG-oriented UI in production?',
        'Are you comfortable with TypeScript strict mode?',
        'What is your notice period?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'design-product',
      title: 'Product Designer (UI/UX)',
      department: 'Design',
      category: 'Design & User Experience',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$110,000 – A$140,000 + super',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Craft a premium, trustworthy interface for global time tools across web and PWA surfaces.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You own end-to-end design for key journeys: finding a city time, planning a meeting, reading astronomy tables and company flows. Deliver research insights, wireframes, high-fidelity UI and clear handoff.',
      responsibilities: [
        'Map user journeys for travellers, remote teams and educators',
        'Produce Figma specs, components and prototypes',
        'Improve empty, error and loading states',
        'Champion readability of dense numeric data',
        'Collaborate weekly with engineering on feasibility',
      ],
      requirements: [
        'Portfolio of shipped web products',
        'Advanced Figma skills',
        'Strong visual and interaction design',
        'Ability to explain design decisions in plain English',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['Motion design', 'Design systems', 'B2B or utility products', 'Basic HTML/CSS literacy'],
      benefits: ['Hybrid Melbourne', 'Equipment stipend', 'Superannuation'],
      howToApply: stdHowToApply('Product Designer (UI/UX)'),
      employerQuestions: withWorkRights([
        'Link to your portfolio?',
        'Have you designed both light and dark themes?',
        'Years of product design experience?',
        'Notice period?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'content-editor',
      title: 'Content & Astronomy Editor',
      department: 'Content',
      category: 'Editorial & Content Writing',
      level: 'Mid',
      type: 'Part-time',
      location: 'Remote Australia',
      remote: 'Fully remote (AU time zones preferred)',
      salaryAud: 'A$45 – A$65 per hour',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Write and edit accurate explainers on civil time, DST, calendars and sky events.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You produce trustworthy educational content and in-product microcopy. You fact-check against public sources and never overstate precision. You support newsletter outlines and work with product on clarity.',
      responsibilities: [
        'Research and draft articles and tool tips',
        'Edit for accuracy, tone and accessible language',
        'Maintain a simple source list for claims',
        'Support weekly/monthly newsletter structures',
        'Flag product copy that could mislead users',
      ],
      requirements: [
        'Excellent written English',
        'Demonstrated interest in science, astronomy or timekeeping',
        'Ability to cite and verify sources',
        'Reliable remote work habits',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['Science journalism', 'SEO fundamentals', 'Education or museum writing', 'CMS experience'],
      benefits: ['Flexible hours', 'Fully remote AU'],
      howToApply: stdHowToApply('Content & Astronomy Editor'),
      employerQuestions: withWorkRights([
        'Do you have published writing samples?',
        'Have you written for a non-specialist audience?',
        'Hours available per week?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'growth',
      title: 'Growth Marketing Manager',
      department: 'Growth',
      category: 'Marketing & Communications',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$100,000 – A$130,000 + super',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Grow ethical organic and partner acquisition for a utility brand people trust with their time.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You plan SEO, content distribution and measurement for timegovern.com. No dark patterns: clear value, clear privacy, measurable experiments.',
      responsibilities: [
        'Own keyword and content priorities with the editor',
        'Run landing and CTA experiments for tools and Supporter',
        'Report funnel metrics to leadership monthly',
        'Coordinate with advertising sales on brand-safe campaigns',
      ],
      requirements: [
        '3+ years growth, digital marketing or similar',
        'Practical SEO experience',
        'Comfort with analytics and experimentation',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['SaaS or media', 'Basic HTML', 'Email lifecycle tools', 'Partnership development'],
      benefits: ['Hybrid', 'Superannuation', 'Bonus eligible'],
      howToApply: stdHowToApply('Growth Marketing Manager'),
      employerQuestions: withWorkRights([
        'Years in growth/marketing?',
        'Have you owned SEO for a content-heavy site?',
        'Notice period?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'support',
      title: 'Customer Support Specialist',
      department: 'Support',
      category: 'Call Centre & Customer Service',
      level: 'Junior',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$65,000 – A$80,000 + super',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Email-first support for accounts, billing questions and product guidance with calm, precise writing.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You are the friendly voice of TimeGovern for support inboxes. You resolve routine issues, escalate bugs with clear steps and help improve FAQs.',
      responsibilities: [
        'Respond to support and billing enquiries within agreed SLAs',
        'Maintain macros and help-centre drafts',
        'Log product defects with screenshots and steps',
        'Identify recurring pain points for product',
      ],
      requirements: [
        'Excellent written communication',
        'Patience with non-technical customers',
        'Basic comfort with web applications and email tools',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['Zendesk, Intercom or similar', 'Bilingual skills valued in AU communities', 'Prior SaaS support'],
      benefits: ['Hybrid HQ', 'Superannuation', 'Path into ops or CS leadership'],
      howToApply: stdHowToApply('Customer Support Specialist'),
      employerQuestions: withWorkRights([
        'Do you have customer service experience?',
        'Are you comfortable with written-only support?',
        'Notice period?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'finance',
      title: 'Finance & Payroll Officer',
      department: 'Finance',
      category: 'Accounting & Finance',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$85,000 – A$105,000 + super',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Accounts, superannuation administration support, supplier payments and basic management reporting.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You keep books tidy, support payroll/super processes with advisors, reconcile subscription payouts and prepare clear monthly packs for directors.',
      responsibilities: [
        'Process accounts payable/receivable',
        'Assist payroll and superannuation administration',
        'Reconcile payment provider payouts',
        'Maintain GST-ready records with external accountant',
        'Prepare simple cash and recurring-revenue summaries',
      ],
      requirements: [
        'Certificate or degree in accounting/bookkeeping or equivalent experience',
        '2+ years in a similar officer role',
        'Familiarity with Australian BAS/super concepts',
        'High accuracy and discretion',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['Xero or similar', 'Stripe or SaaS billing exposure', 'Payroll certification'],
      benefits: ['Hybrid', 'Superannuation', 'Professional development support'],
      howToApply: stdHowToApply('Finance & Payroll Officer'),
      employerQuestions: withWorkRights([
        'Which accounting systems have you used?',
        'Do you have experience with superannuation administration?',
        'Years in finance/bookkeeping roles?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'ops',
      title: 'Operations Coordinator',
      department: 'Operations',
      category: 'Office & Business Administration',
      level: 'Junior',
      type: 'Full-time',
      location: 'Melbourne, VIC (Collins Street)',
      remote: 'On-site / hybrid',
      salaryAud: 'A$70,000 – A$85,000 + super',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Keep the Melbourne office and vendor relationships running so product teams can focus on shipping.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You coordinate facilities, suppliers, travel basics, meeting logistics and operational checklists. You are organised, proactive and calm under time pressure.',
      responsibilities: [
        'Office supplies, access coordination and visitor logistics',
        'Vendor scheduling (cleaners, IT assets, couriers)',
        'Support onboarding checklists for new starters',
        'Maintain shared calendars for company rituals',
        'Light document control for policies and signed forms',
      ],
      requirements: [
        'Strong administration and calendar management',
        'Professional written and verbal communication',
        'Proficiency with Google Workspace or Microsoft 365',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['Prior EA or office coordinator experience', 'Event logistics', 'Basic procurement'],
      benefits: ['CBD office', 'Superannuation', 'Hybrid flexibility after probation'],
      howToApply: stdHowToApply('Operations Coordinator'),
      employerQuestions: withWorkRights([
        'Do you have office administration experience?',
        'Are you available for hybrid CBD work?',
        'Notice period?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'advertise-sales',
      title: 'Advertising Partnerships Executive',
      department: 'Commercial',
      category: 'Sales & Account Management',
      level: 'Mid',
      type: 'Full-time',
      location: 'Melbourne, VIC',
      remote: 'Hybrid',
      salaryAud: 'A$90,000 – A$120,000 + super + commission',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        'Sell and manage brand-safe site inventory (header, in-feed, sponsor) to agencies and direct advertisers.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You own outreach against our media kit, run proposals, and ensure campaigns meet advertising standards. You balance revenue with user experience — no formats that break tools.',
      responsibilities: [
        'Prospect and close direct and agency deals',
        'Maintain CRM pipeline and forecast',
        'Coordinate creatives against placement specs',
        'Report delivery and renewals',
        'Uphold ad policy and brand safety',
      ],
      requirements: [
        '2+ years digital media sales or account management',
        'Confident presenter and writer',
        'Comfort with rate cards and insertion-order basics',
        'Must meet TimeGovern work-rights eligibility (see Right to work section)',
      ],
      preferred: ['Publisher or ad-tech background', 'Programmatic literacy', 'Existing agency relationships'],
      benefits: ['Hybrid', 'Commission', 'Superannuation'],
      howToApply: stdHowToApply('Advertising Partnerships Executive'),
      employerQuestions: withWorkRights([
        'Years in media/digital sales?',
        'Have you sold site sponsorships or display packages?',
        'Notice period?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
    {
      id: 'intern-swe',
      title: 'Software Engineering Intern',
      department: 'Engineering',
      category: 'Internships & Graduate',
      level: 'Internship',
      type: 'Internship',
      location: 'Melbourne, VIC',
      remote: 'On-site preferred / hybrid',
      salaryAud: 'Award / A$30 – A$40 per hour',
      posted: '2026-08',
      applicationVolume: 'Standard volume',
      summary:
        '12-week internship shipping a real feature on a production global time platform with mentorship.',
      aboutUs: ABOUT_US,
      aboutRole:
        'You work with senior engineers on a scoped feature (UI component, calculator improvement or data QA script). You learn code review, testing habits and how production releases work.',
      responsibilities: [
        'Implement an agreed feature with guidance',
        'Write tests or a manual QA checklist',
        'Document what you built',
        'Present a short demo at the end of the internship',
      ],
      requirements: [
        'Currently enrolled in a relevant degree in Australia',
        'Basic JavaScript or TypeScript',
        'Curiosity about how the web works',
        'Must meet TimeGovern work-rights eligibility for the internship period (citizen, PR, NZ SCV, or visa allowing the required work hours)',
      ],
      preferred: ['React coursework', 'Personal projects on GitHub', 'Interest in time zones or astronomy'],
      benefits: ['Mentorship', 'Possible graduate pathway', 'Melbourne office exposure'],
      howToApply: stdHowToApply('Software Engineering Intern'),
      employerQuestions: withWorkRights([
        'What is your current course and year?',
        'When can you start a 12-week block?',
        'Do you have an active GitHub or portfolio?',
      ]),
      workRightsEligibility: WORK_RIGHTS_ELIGIBILITY,
    },
  ] as CareerJob[],
};

export type CareersContent = typeof careersContent;
