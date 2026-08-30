import { companyContent } from './companyContent';
import type { LegalDoc } from './legalContent';

const entity = companyContent.legalName;
const privacyEmail = companyContent.hq.privacyEmail || 'privacy@timegovern.com';
const legalEmail = companyContent.hq.legalEmail || 'legal@timegovern.com';
const contactEmail = companyContent.hq.email;

/** Overrides for thinner default policies — AU / US / EU / South Asia. */
export const legalExpand = {
  disclaimer: {
    title: 'Disclaimer',
    intro: `This Disclaimer applies to timegovern.com operated by ${entity}. It limits reliance on site data and tools. Read with our Terms of Use and Privacy Policy. Nothing excludes rights under the Australian Consumer Law or other mandatory consumer laws that apply to you.`,
    sections: [
      {
        heading: '1. Not an official time signal',
        body: 'Times, time zones, DST rules, calendars, sun and moon times, leap-second information and related tools are computed or aggregated references. They are not a broadcast from a national metrology institute (e.g. Australia’s NMI, NIST in the US, PTB in Germany). Network delay and device clock error can affect what you see. For legal deadlines, transport, medicine or safety-critical decisions, confirm with official authorities.',
      },
      {
        heading: '2. Not professional advice (AU, US, EU, South Asia)',
        body: 'Pay, tax, FBT, leave, workday, astronomy and other calculators are educational only — not accounting, tax, legal, immigration or financial advice.\n\n• Australia: verify with a registered tax agent and the ATO / Fair Work where relevant.\n• United States: verify with a qualified professional and the IRS or state agencies.\n• Europe / UK: verify with local advisers and national authorities.\n• India and South Asia: verify with qualified professionals and local tax authorities.\n\nYou remain responsible for decisions made using site information.',
      },
      {
        heading: '3. Third-party data and live feeds',
        body: 'News, weather, maps and population-style counters may come from third parties or estimates. They can be delayed, incomplete or unavailable. We do not guarantee continuous uptime or second-perfect currency of every feed.',
      },
      {
        heading: '4. No warranty on completeness',
        body: 'To the maximum extent permitted by law, content is provided “as is” and “as available”. Where Australian Consumer Law or other mandatory laws give non-excludable guarantees, those still apply; liability is limited to remedies those laws allow.',
      },
      {
        heading: '5. User responsibility',
        body: 'Keep critical systems on official time sources and do not rely solely on a consumer website for compliance or safety.',
      },
    ],
  } satisfies LegalDoc,

  cookieNotice: {
    title: 'Cookies & similar technologies',
    intro: `How ${entity} uses cookies and similar storage on timegovern.com. Read with our Privacy Policy. EU/UK rules on non-essential cookies are stricter than Australia’s Privacy Act focus on personal information.`,
    sections: [
      {
        heading: '1. What are cookies and local storage?',
        body: 'Cookies are small browser files. Local/session storage holds preferences (theme, pinned cities). Some storage is essential; analytics or advertising storage is optional if enabled.',
      },
      {
        heading: '2. Essential / strictly necessary',
        body: 'Used for theme, session continuity, security, and tool settings you choose. EU/UK guidance generally does not require prior consent for strictly necessary cookies, but we disclose them. Australian privacy law still applies if personal information is involved.',
      },
      {
        heading: '3. Preferences',
        body: 'May remember 12h/24h format, home city and similar choices. Clear site data in your browser anytime.',
      },
      {
        heading: '4. Analytics (if enabled)',
        body: 'If privacy-respecting analytics are enabled, we will list provider and purpose here and request consent where required (especially EU/UK).',
      },
      {
        heading: '5. Advertising (if enabled)',
        body: 'Ad networks may set cookies under their policies. EU/UK users should get a consent choice for non-essential ad cookies. US users may have state opt-outs (e.g. California). See Advertising Policy.',
      },
      {
        heading: '6. Regional notes (AU · EU/UK · US · South Asia)',
        body: '• Australia: Privacy Act 1988 / APPs apply to personal information.\n• EU/EEA & UK: non-essential cookies generally need prior opt-in; reject as easy as accept.\n• United States: CCPA/CPRA and other state laws may require disclosure and opt-outs.\n• India (DPDP Act 2023): notice and lawful basis (often consent) for personal data.\n• Singapore (PDPA): purpose limitation and consent/notification principles.',
      },
      {
        heading: '7. How to control cookies',
        body: `Browser settings can block or delete cookies. Blocking essential storage may break sign-in or pins. Contact ${privacyEmail} for privacy questions.`,
      },
      {
        heading: '8. Updates',
        body: 'We update this notice when technologies change. The Last updated date on legal pages reflects the current version.',
      },
    ],
  } satisfies LegalDoc,

  advertisingPolicy: {
    title: 'Advertising Policy',
    intro: `How advertising may appear on timegovern.com and standards we apply. ${entity} aims to keep core time tools usable. Supporters may receive fewer ads where that benefit is offered.`,
    sections: [
      {
        heading: '1. Placement and user experience',
        body: 'Ads may appear in labelled slots (leaderboard, sidebar, in-feed). We aim not to permanently cover primary clock or calculator controls.',
      },
      {
        heading: '2. Networks and partners',
        body: 'We may use partners such as Google AdSense or direct sponsors. Their policies apply to their tags and cookies.',
      },
      {
        heading: '3. Prohibited and restricted categories',
        body: `We do not intentionally accept ads for illegal activity, malware, phishing, child exploitation, or clearly deceptive health/finance claims. Australian Consumer Law and comparable US FTC / EU rules against misleading conduct apply. Report issues to ${contactEmail}.`,
      },
      {
        heading: '4. Labelling and transparency',
        body: 'Paid placements should be identifiable as advertising or sponsorship and must not impersonate editorial tools without disclosure.',
      },
      {
        heading: '5. Data, cookies and regional rules',
        body: 'See Privacy Policy and Cookie Notice. EU/UK: consent for non-essential ad cookies. US: state opt-outs may apply. Australia: APPs. India/Singapore: notice/consent rules may apply.',
      },
      {
        heading: '6. Direct advertising',
        body: `Direct sponsorship enquiries: ${contactEmail}. We may refuse campaigns that conflict with this policy.`,
      },
      {
        heading: '7. Supporter ad-light experience',
        body: 'Where a paid benefit includes fewer ads, we honour it for the active subscription period under the Terms of Use.',
      },
    ],
  } satisfies LegalDoc,

  linkPolicy: {
    title: 'Link Policy',
    intro: `How others may link to timegovern.com and how we treat outbound links (${entity}).`,
    sections: [
      {
        heading: '1. Linking to TimeGovern (inbound)',
        body: 'You may link to public pages if the link is not misleading, does not imply endorsement without permission, and does not misuse our marks. Australian Consumer Law and similar rules elsewhere prohibit deceptive association.',
      },
      {
        heading: '2. Framing and embedding',
        body: 'Do not frame our site to hide URL, branding or legal notices without written agreement. Official widgets may be used under their terms.',
      },
      {
        heading: '3. Our outbound links',
        body: 'Links to third parties are for convenience, not endorsement. We are not responsible for their content or privacy practices.',
      },
      {
        heading: '4. Removal requests',
        body: `Contact ${legalEmail} for unlawful or infringing link issues.`,
      },
      {
        heading: '5. Regional note',
        body: 'Misrepresentation rules differ by country; do not confuse users about who operates timegovern.com.',
      },
    ],
  } satisfies LegalDoc,
};
