import { companyContent } from './companyContent';

export type NewsletterCadence = 'weekly' | 'monthly' | 'yearly';

const INTERESTING: Record<NewsletterCadence, { subject: string; bullets: string[]; tip: string }> = {
  weekly: {
    subject: 'TimeGovern Weekly: clocks, zones and one clear tip',
    bullets: [
      'Daylight-saving and zone notes worth checking before you send global invites.',
      'One Meeting Planner habit: pin focal cities and read the hour strip before locking a time.',
      'A short sky note — sunrise, moon phase or twilight — tied to planning, not sensationalism.',
      'Product tip of the week from World Clock, Calendar or Sun & Moon.',
    ],
    tip: 'When in doubt, show the UTC offset next to the city name. Abbreviations alone are easy to misread.',
  },
  monthly: {
    subject: 'TimeGovern Monthly: sky calendar and team hygiene',
    bullets: [
      'Moon phases and useful twilight windows for the month ahead.',
      'Calendar hygiene: week numbers, holidays and printable schedules for your team.',
      'Australian workday helpers in context — educational only; confirm critical figures with official sources.',
      'Widgets and embeds: practical patterns for schools and shared screens.',
    ],
    tip: 'Supporters can export multi-month PDF calendars without site branding — useful for office walls and studios.',
  },
  yearly: {
    subject: 'Year in Time: reforms, leaps and steady habits',
    bullets: [
      'Civil-time and daylight-saving policy themes to watch over the coming year.',
      'Leap seconds in plain language — rare, but we keep the explanation clear on the site.',
      'Teaching edition: free tools for classrooms and science clubs without student accounts for core clocks.',
      'Enterprise habits: fair meeting hours across Australia, the Americas and Europe.',
    ],
    tip: 'Once a year, review your pinned cities when daylight-saving maps change.',
  },
};

export function buildNewsletterEmail(opts: {
  cadence: NewsletterCadence;
  toEmail: string;
}): { subject: string; text: string; html: string } {
  const c = companyContent;
  const pack = INTERESTING[opts.cadence];
  const name =
    opts.cadence === 'weekly'
      ? c.newsletter.weekly.name
      : opts.cadence === 'monthly'
        ? c.newsletter.monthly.name
        : c.newsletter.yearly.name;

  const subject = pack.subject;
  const text = [
    `Hello from ${c.brandName} (${c.hq.city})`,
    '',
    `You are subscribed to: ${name}`,
    '',
    ...pack.bullets.map((b, i) => `${i + 1}. ${b}`),
    '',
    `Tip: ${pack.tip}`,
    '',
    '—',
    `${c.legalName} · ${c.hq.fullAddress}`,
    `Privacy: ${c.hq.privacyEmail || c.hq.email}`,
    'Unsubscribe: reply with UNSUBSCRIBE or use the link in production emails.',
    'This message is sent only with your opt-in (Spam Act 2003).',
  ].join('\n');

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#0f172a">
  <p>Hello from <strong>${c.brandName}</strong> (${c.hq.city})</p>
  <p>You are subscribed to: <strong>${name}</strong></p>
  <ol>${pack.bullets.map((b) => `<li>${b}</li>`).join('')}</ol>
  <p><em>Tip: ${pack.tip}</em></p>
  <hr/>
  <p style="font-size:12px;color:#64748b">${c.legalName} · ${c.hq.fullAddress}<br/>Privacy: ${c.hq.privacyEmail || c.hq.email}<br/>Unsubscribe available on every commercial email (Spam Act 2003).</p>
  </body></html>`;

  return { subject, text, html };
}
