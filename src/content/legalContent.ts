import { companyContent } from './companyContent';

/**
 * Legal & Trust Centre — structured policies for a consumer website.
 * Grounded in:
 * - Privacy Act 1988 (Cth) & Australian Privacy Principles (APPs)
 * - Spam Act 2003 (Cth)
 * - Australian Consumer Law (Competition and Consumer Act 2010 (Cth) Sch 2)
 * - Transparent practices expected under GDPR Art. 12–14 style notices for EU/UK visitors
 * - US access/deletion transparency (and CCPA-style sale disclosure where relevant)
 *
 * This is website policy text, not a substitute for advice from a qualified lawyer
 * in your jurisdiction. Entity/ABN/address are as configured in companyContent.
 */

const entity = companyContent.legalName;
const abn = companyContent.hq.abn;
const address = companyContent.hq.fullAddress;
const privacyEmail = companyContent.hq.privacyEmail || 'privacy@timegovern.com';
const legalEmail = companyContent.hq.legalEmail || 'legal@timegovern.com';
const contactEmail = companyContent.hq.email;
const securityEmail = companyContent.hq.securityEmail || 'security@timegovern.com';

export type LegalDocSection = { heading: string; body: string };
export type LegalDoc = { title: string; intro: string; sections: LegalDocSection[] };

export const legalContent = {
  lastUpdated: companyContent.legal.lastUpdated || '25 August 2026',
  entity,
  abn,
  address,
  privacyEmail,
  legalEmail,
  contactEmail,
  securityEmail,

  privacyPolicy: {
    title: 'Privacy Policy',
    intro:
      `${entity} (ABN ${abn}) operates timegovern.com from Melbourne, Australia. This Privacy Policy describes how we collect, hold, use and disclose personal information when you use our website and related services. It is written to align with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). Visitors in the European Economic Area, United Kingdom, United States and elsewhere may also exercise access, correction and deletion rights described below by contacting ${privacyEmail}.`,
    sections: [
      {
        heading: '1. Who we are (controller)',
        body: `The organisation responsible for personal information collected via timegovern.com is ${entity}, ${address}. Contact: ${contactEmail}. Privacy enquiries: ${privacyEmail}. Security reports: ${securityEmail}.`,
      },
      {
        heading: '2. Scope',
        body: 'This policy applies to personal information collected through timegovern.com, related forms (contact, newsletter, job alerts, supporter account), and technical logs generated when you use the site. It does not cover third-party websites we link to (news sources, payment processors, social networks), which have their own policies.',
      },
      {
        heading: '3. What we collect',
        body: 'Information you provide: name, email, phone, message content, newsletter frequency preferences, account credentials if you register. Technical data: IP address, browser type, device type, approximate location derived from IP, pages viewed, timestamps, referrer. Preferences stored in your browser (e.g. pinned cities, theme, feedback votes) via localStorage or similar. Payment data for paid plans is processed by our payment provider (e.g. Stripe); we do not store full card numbers on our servers.',
      },
      {
        heading: '4. How we collect',
        body: 'Directly from you (forms, account registration); automatically when you use the site (logs, cookies/local storage as described in the Cookie Notice); and from service providers who process data on our behalf (hosting, email delivery, payments). We do not buy marketing lists for cold outreach.',
      },
      {
        heading: '5. Purposes of use (APP 6)',
        body: 'We use personal information to: operate and improve world clock, calendar, astronomy and related tools; respond to enquiries; send newsletters or alerts only where you have opted in; provide supporter/account features you request; protect security and prevent abuse; comply with law; and produce aggregated, non-identifying statistics. We do not sell personal information.',
      },
      {
        heading: '6. Direct marketing and Spam Act 2003 (Cth)',
        body: 'Commercial electronic messages with an Australian link are sent only with consent (express opt-in is our standard). Each message identifies TimeGovern as sender and includes a functional unsubscribe method. We process opt-outs promptly (target within five business days). Transactional messages about your account or security may be sent as permitted by law.',
      },
      {
        heading: '7. Cookies and similar technologies',
        body: 'We use essential storage for site function (theme, pins, session). Analytics or advertising technologies, if enabled, are described in the Cookie Notice and Advertising Policy. You can clear localStorage via browser settings; some features may reset.',
      },
      {
        heading: '8. Disclosure to others',
        body: 'We may disclose personal information to: infrastructure providers (e.g. Cloudflare for hosting and security); email or payment processors acting on our instructions; professional advisers; and authorities where required by law or to protect rights and safety. We require service providers to protect information appropriately for the services they perform.',
      },
      {
        heading: '9. Overseas disclosure (APP 8)',
        body: 'Infrastructure and subprocessors may process data in Australia, the United States, the European Union and other regions. Where we disclose personal information outside Australia, we take reasonable steps consistent with the APPs so that overseas recipients handle information in a way that is substantially similar to the APPs, or we rely on another permitted exception under the Privacy Act.',
      },
      {
        heading: '10. Security (APP 11)',
        body: 'We use HTTPS/TLS in production, access controls, and operational practices aimed at protecting personal information from misuse, interference, loss, and unauthorised access, modification or disclosure. No method of transmission or storage is completely secure; please use strong unique passwords for any account.',
      },
      {
        heading: '11. Retention',
        body: 'We keep personal information only as long as needed for the purposes above, or as required by law (for example tax or dispute records). Contact and support tickets may be retained for a reasonable period to manage ongoing enquiries. You may request deletion as set out below.',
      },
      {
        heading: '12. Access, correction and deletion (APP 12–13; GDPR-style rights; US transparency)',
        body: `You may request access to, correction of, or deletion of personal information we hold about you by emailing ${privacyEmail}. We will respond within a reasonable period (and within any statutory timeframe that applies). We may need to verify your identity. We may refuse a request in limited circumstances permitted by law and will explain the reason where we can. EU/UK users may also have rights to restrict processing, object, and data portability where applicable. California and other US state residents may have additional rights under applicable state law; we will not discriminate against you for exercising privacy rights.`,
      },
      {
        heading: '13. Children',
        body: 'The site is a general-audience time and calendar tool. We do not knowingly collect personal information from children under 13 (or higher age required in your region) for marketing. If you believe a child has provided personal information, contact us and we will take appropriate steps.',
      },
      {
        heading: '14. Complaints',
        body: `Contact ${privacyEmail} first with details of your concern. If you are not satisfied with our response, individuals in Australia may complain to the Office of the Australian Information Commissioner (OAIC) at oaic.gov.au. EU/UK users may contact their local supervisory authority. US users may contact their state attorney general or other regulator as applicable.`,
      },
      {
        heading: '15. Changes',
        body: `We may update this policy from time to time. The “last updated” date will change when we do. Material changes may be highlighted on the site. Continued use after an update constitutes acceptance of the revised policy where permitted by law.`,
      },
    ],
  } satisfies LegalDoc,

  termsOfUse: {
    title: 'Terms of Use',
    intro: `These Terms of Use govern access to and use of timegovern.com operated by ${entity} (ABN ${abn}), ${address}. By using the site you agree to these terms. If you do not agree, do not use the site.`,
    sections: [
      {
        heading: '1. Service description',
        body: 'TimeGovern provides world clock, calendar, astronomy, weather context, calculators, news headlines and related tools. Features may change. Some features may require a free account or a paid Supporter / product subscription.',
      },
      {
        heading: '2. Licence to use',
        body: 'We grant you a limited, non-exclusive, non-transferable licence to access and use the site for personal or internal business purposes in accordance with these terms. You must not scrape, overload, reverse engineer (except as allowed by law), or use the service to break the law or harm others.',
      },
      {
        heading: '3. Accuracy of time and data',
        body: 'Times, offsets, sunrise/sunset, holidays and calculators are provided using widely used datasets (including IANA time zone data) and open scientific methods. Results can be affected by device clocks, network delay, data updates and edge cases (polar regions, historical zones). Always verify critical schedules with official sources. The site is not a certified timing laboratory or legal time authority.',
      },
      {
        heading: '4. Accounts and security',
        body: 'You are responsible for credentials you create and for activity under your account. Notify us of unauthorised use. We may suspend accounts that threaten security or breach these terms.',
      },
      {
        heading: '5. Paid features',
        body: 'Paid Supporter or product fees are shown at checkout in the stated currency (e.g. AUD). Subscriptions renew until cancelled according to the payment provider’s flow. Fees are generally not charitable donations. Refunds are handled as required by Australian Consumer Law and any stated refund policy at purchase.',
      },
      {
        heading: '6. User content and feedback',
        body: 'If you submit feedback, comments or other content, you grant us a non-exclusive licence to use it to operate and improve the service. Public feedback appears only if you request publication and we approve it. Do not submit unlawful, defamatory or confidential third-party information.',
      },
      {
        heading: '7. Third-party services and links',
        body: 'News, weather, maps, payments and ads may involve third parties. Their terms and privacy policies apply to their services. We are not responsible for third-party sites.',
      },
      {
        heading: '8. Disclaimers',
        body: 'To the maximum extent permitted by law, the site is provided “as is” and “as available”. We do not warrant uninterrupted or error-free operation. Nothing in these terms excludes, restricts or modifies non-excludable rights under the Australian Consumer Law or other mandatory consumer protections.',
      },
      {
        heading: '9. Limitation of liability',
        body: 'To the maximum extent permitted by law, we are not liable for indirect, incidental, special or consequential loss, or loss of profits, data or goodwill, arising from use of the site. Our aggregate liability for claims relating to the site is limited to the amount you paid us for the service in the 12 months before the claim (or AUD $100 if you paid nothing), except where liability cannot be limited by law.',
      },
      {
        heading: '10. Indemnity',
        body: 'You agree to indemnify us against claims arising from your misuse of the site or breach of these terms, to the extent permitted by law.',
      },
      {
        heading: '11. Governing law',
        body: 'These terms are governed by the laws of Victoria, Australia. Courts of Victoria (and appellate courts) have non-exclusive jurisdiction, without preventing you from relying on mandatory consumer protections in your place of residence where they apply.',
      },
      {
        heading: '12. Contact',
        body: `Questions about these terms: ${legalEmail} or ${contactEmail}.`,
      },
    ],
  } satisfies LegalDoc,

  advertisingPolicy: {
    title: 'Advertising Policy',
    intro: 'How advertising may appear on timegovern.com and standards we apply.',
    sections: [
      {
        heading: '1. Placement',
        body: 'Ads may appear in designated slots (e.g. leaderboard, sidebar, in-feed). We aim not to obscure core tools. Supporters may receive an advert-free experience where that benefit is active.',
      },
      {
        heading: '2. Networks',
        body: 'We may use Google AdSense or similar partners. Their policies and privacy notices apply to their tags and cookies.',
      },
      {
        heading: '3. Prohibited categories',
        body: 'We do not intentionally run ads for illegal products, malware, or content that exploits children. Report problematic ads to ${contactEmail}.',
      },
      {
        heading: '4. Data',
        body: 'Ad partners may process pseudonymous identifiers under their policies. See our Privacy Policy and Cookie Notice.',
      },
    ],
  } satisfies LegalDoc,

  linkPolicy: {
    title: 'Link Policy',
    intro: 'Rules for linking to and from timegovern.com.',
    sections: [
      {
        heading: '1. Linking to us',
        body: 'You may link to public pages of timegovern.com if the link is not misleading and does not imply endorsement without permission. Do not frame our pages in a way that disguises the origin of content.',
      },
      {
        heading: '2. Our outbound links',
        body: 'Links to news, weather or reference sites are for convenience. We are not responsible for their content or availability.',
      },
    ],
  } satisfies LegalDoc,

  disclaimer: {
    title: 'Disclaimer',
    intro: 'Important limits on reliance on site data.',
    sections: [
      {
        heading: '1. Not official time',
        body: 'Displayed times are calculated tools, not a national metrology institute broadcast. For legal deadlines, transport, medicine or safety-critical decisions, confirm with official authorities.',
      },
      {
        heading: '2. Not professional advice',
        body: 'Calculators (including pay, tax-related helpers, or workdays) are educational. They are not accounting, tax or legal advice. Verify with a qualified professional and official agencies (e.g. ATO in Australia, IRS in the US).',
      },
    ],
  } satisfies LegalDoc,

  cookieNotice: {
    title: 'Cookie Notice',
    intro: 'How we use cookies and similar storage.',
    sections: [
      {
        heading: '1. Essential',
        body: 'Required for theme, pinned cities, session continuity and security. These do not require consent under many regimes because they are strictly necessary.',
      },
      {
        heading: '2. Analytics and advertising',
        body: 'If enabled, we will describe categories here and, where required, request consent. You can control browser cookies in your browser settings.',
      },
    ],
  } satisfies LegalDoc,

  trustCentre: {
    title: 'Trust Centre',
    intro: 'How we approach security, privacy and uptime for timegovern.com — Australian operator, global users.',
    points: [
      { title: 'HTTPS / TLS (SSL)', text: 'Production traffic should use HTTPS via Cloudflare (or equivalent) with certificates auto-issued and renewed.' },
      { title: 'Privacy Act and APPs', text: `Transparency, purpose limitation, security, access and correction. Contact ${privacyEmail}.` },
      { title: 'Spam Act 2003', text: 'Consent, identify sender, functional unsubscribe, honour opt-outs.' },
      { title: 'Australian Consumer Law', text: 'Non-excludable consumer guarantees remain where the ACL applies.' },
      { title: 'US and other visitors', text: `Access and deletion requests: ${privacyEmail}. Additional state notices may be added if US paid processing expands.` },
      { title: 'EU/UK visitors', text: 'We provide the information required for transparency; contact us to exercise applicable rights.' },
      { title: 'Responsible disclosure', text: `${securityEmail} — good-faith reports only; no exploitation.` },
      { title: 'Data minimisation', text: 'Core clocks and many tools work without creating an account.' },
    ],
  },

  securityCheckExplainer: {
    title: 'How Security check works online',
    steps: [
      'Local development may use HTTP; the browser padlock appears after HTTPS is deployed.',
      'Point DNS to your host (e.g. Cloudflare) with proxy enabled where required.',
      'Universal SSL or equivalent issues certificates automatically.',
      'Enable Always Use HTTPS at the edge when available.',
      'Optional: test with SSL Labs after go-live.',
    ],
  },
};
