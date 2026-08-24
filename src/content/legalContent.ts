import { companyContent } from './companyContent';

/**
 * Legal & Trust Centre — informational website content.
 * Informed by Privacy Act 1988 (Cth) / APPs, Spam Act 2003 (Cth),
 * Australian Consumer Law, and US-facing access/deletion transparency.
 * NOT formal legal advice — have a solicitor review before commercial reliance.
 */

export const legalContent = {
  lastUpdated: companyContent.legal.lastUpdated,
  entity: companyContent.legalName,
  abn: companyContent.hq.abn,
  address: companyContent.hq.fullAddress,
  privacyEmail: companyContent.hq.privacyEmail,
  legalEmail: companyContent.hq.legalEmail,
  contactEmail: companyContent.hq.email,
  securityEmail: companyContent.hq.securityEmail,

  privacyPolicy: {
    title: 'Privacy Policy',
    intro:
      'TimeGovern Pty Ltd operates timegovern.com from Melbourne, Australia. This policy explains how we collect, use, store and disclose personal information. It is designed to align with the Australian Privacy Principles (APPs) under the Privacy Act 1988 (Cth). US and other visitors may request access, correction or deletion of personal information we hold by emailing privacy@timegovern.com.',
    sections: [
      { heading: '1. Who we are', body: 'Controller: TimeGovern Pty Ltd, Level 12, 120 Collins Street, Melbourne VIC 3000, Australia. Privacy: privacy@timegovern.com. Security: security@timegovern.com.' },
      { heading: '2. What we collect', body: 'Contact details you submit (name, email, phone); technical data (IP, browser, device, approximate location from IP); browser preferences (pinned cities, theme in localStorage); newsletter cadence choices when you opt in. Core clock tools do not require an account.' },
      { heading: '3. Purposes', body: 'Operate and improve the service, respond to enquiries, send opted-in newsletters or job alerts, security, aggregate analytics, legal compliance. We do not sell personal information.' },
      { heading: '4. Direct marketing and Spam Act 2003', body: 'Commercial electronic messages with an Australian link only with consent (express opt-in preferred). Every commercial email identifies TimeGovern and includes a functional unsubscribe. We honour opt-outs promptly (target within 5 working days).' },
      { heading: '5. Cookies', body: 'Essential storage for theme and pins. Analytics/ads cookies only if enabled later — see Cookie Notice. Third-party networks have their own policies.' },
      { heading: '6. Overseas disclosure', body: 'Cloudflare and similar providers may process data in multiple regions. We take reasonable steps consistent with APP 8. Public news/weather APIs process request metadata under their terms.' },
      { heading: '7. Security', body: 'HTTPS/TLS via Cloudflare Universal SSL on production. Report incidents to security@timegovern.com.' },
      { heading: '8. Retention', body: 'Kept while needed for the purpose or law, then deleted or de-identified. Browser data until you clear it.' },
      { heading: '9. Access, correction, deletion', body: 'Email privacy@timegovern.com. We respond within a reasonable time and may verify identity. Aligns with APPs and practical US visitor requests.' },
      { heading: '10. Children', body: 'General audience. Do not submit student personal data into public forms for school use.' },
      { heading: '11. Complaints', body: 'Contact privacy@timegovern.com first. In Australia you may also contact the OAIC (oaic.gov.au).' },
      { heading: '12. Changes', body: 'Last updated date changes when we revise this policy.' },
    ],
  },

  termsOfUse: {
    title: 'Terms of Use',
    intro: 'By using timegovern.com you agree to these terms. Governing law: Victoria, Australia. Structure similar to major time utilities (personal use, disclaimers, third-party ads).',
    sections: [
      { heading: '1. Service', body: 'World clocks, calendars, astronomy tools, calculators, weather context, news. LIVE indicators are best-effort, not paid SLAs unless contracted.' },
      { heading: '2. Licence', body: 'Personal and internal business reference. No abusive scraping, no reselling raw feeds, no misrepresenting TimeGovern as an official time authority.' },
      { heading: '3. Verification', body: 'Verify critical schedules with official sources. Information as-is; Australian Consumer Law guarantees that cannot be excluded still apply.' },
      { heading: '4. Acceptable use', body: 'No unlawful use, disruption, malware, or harvesting emails.' },
      { heading: '5. IP', body: 'Design and original content owned by TimeGovern Pty Ltd or licensors. Limited quotation with credit; systematic reuse needs permission (legal@timegovern.com).' },
      { heading: '6. Third parties', body: 'News, weather and ads are third-party; we are not liable for their errors.' },
      { heading: '7. Liability', body: 'To the maximum extent permitted by law, no liability for indirect loss. Non-excludable ACL rights remain.' },
      { heading: '8. Governing law', body: 'Laws of Victoria, Australia. Courts of Victoria non-exclusive jurisdiction.' },
    ],
  },

  advertisingPolicy: {
    title: 'Advertising Policy',
    intro: 'Ads help fund free tools. Brand-safe inventory; clear separation from tool accuracy.',
    sections: [
      { heading: '1. Inventory', body: 'Leaderboard, skyscraper and in-content frames; house ads or AdSense when env-enabled.' },
      { heading: '2. Prohibited', body: 'Illegal products, malware, deceptive finance, content violating our standards.' },
      { heading: '3. Data', body: 'Partners may process pseudonymous data under their policies. See Privacy Policy.' },
      { heading: '4. Media kit', body: 'advertise@timegovern.com or Advertise / Media kit from the footer.' },
    ],
  },

  cookieNotice: {
    title: 'Cookie Notice',
    body: 'Essential: theme, pins, UI flags. Analytics/ads only if enabled. Block non-essential in browser settings; some features may degrade.',
  },

  trustCentre: {
    title: 'Trust Centre',
    intro: 'How we approach security, privacy and uptime for timegovern.com — Australian operator, global users.',
    points: [
      { title: 'HTTPS / TLS (SSL)', text: 'Cloudflare Universal SSL: free auto-renewed certificates for the domain and www when DNS is proxied. Enable Always Use HTTPS.' },
      { title: 'Security check', text: 'In-app modal explains HTTPS and privacy contacts. On the public internet the browser padlock reflects real TLS. Optional deeper tests: SSL Labs after go-live.' },
      { title: 'Privacy Act and APPs', text: 'Transparency, purpose limitation, security, access/correction. privacy@timegovern.com' },
      { title: 'Spam Act 2003', text: 'Consent, identify sender, functional unsubscribe, honour opt-outs.' },
      { title: 'Australian Consumer Law', text: 'Non-excludable guarantees remain where ACL applies.' },
      { title: 'US visitors', text: 'Access/deletion requests accepted at privacy@timegovern.com. State-specific notices added if paid US billing expands.' },
      { title: 'Responsible disclosure', text: 'security@timegovern.com — good-faith reports, no exploitation.' },
      { title: 'Data minimisation', text: 'Core clocks work without accounts.' },
      { title: 'Third parties', text: 'Cloudflare, optional AdSense, public weather/news APIs.' },
      { title: 'Tool integrity', text: 'Accuracy over engagement tricks; news attributed to sources.' },
    ],
  },

  securityCheckExplainer: {
    title: 'How Security check works online',
    steps: [
      'Localhost uses HTTP; the padlock appears after HTTPS deploy.',
      'Point DNS to Cloudflare (proxied / orange cloud).',
      'Universal SSL issues and renews certificates automatically (free).',
      'SSL/TLS: Full (strict) when supported; Always Use HTTPS = On.',
      'Optional: SSL Labs test on https://timegovern.com after go-live.',
      'The in-app Security modal is educational; production trust is real TLS + policies + ops hygiene.',
    ],
  },

  sslSetup: {
    title: 'Enable SSL for timegovern.com (Cloudflare)',
    steps: [
      'Add domain to Cloudflare; update nameservers at the registrar.',
      'Cloudflare Pages project from GitHub; attach custom domain timegovern.com and www.',
      'Wait until Universal SSL status is Active (minutes to a few hours first time).',
      'Edge Certificates: Always Use HTTPS On; Automatic HTTPS Rewrites On.',
      'You do not need to buy a separate paid certificate for a standard public site.',
      'Renewal is automatic; if Pending Validation, check DNS and CAA records.',
    ],
  },
};
