/**
 * Newsletter HTML/text templates — weekly / monthly / yearly.
 */
import { companyContent } from './companyContent';

export type NewsletterCadence = 'weekly' | 'monthly' | 'yearly';

const INTERESTING: Record<NewsletterCadence, { subject: string; bullets: string[]; tip: string }> = {
  weekly: {
    subject: 'TimeGovern Weekly: clocks, DST, and one sky note',
    bullets: [
      'Which regions change clocks this week (and how Meeting Planner avoids 2 a.m. surprises).',
      'One IANA / tzdata reminder: saved cities follow the latest rules automatically.',
      'Sunrise table tip: pick a city, scan 7–14 days for outdoor or shift work.',
      'Live news desk: time-policy headlines we surface on the News pillar.',
    ],
    tip: 'Pin your three busiest cities and enable “only pinned” on World Clock for a calmer morning scan.',
  },
  monthly: {
    subject: 'TimeGovern Monthly: sky calendar + team hygiene',
    bullets: [
      'Moon phases and notable twilight windows for the month ahead.',
      'Calendar hygiene: week numbers, public holidays, and PDF schedules for your team.',
      'AU workday & calculator notes (always verify critical figures with official sources).',
      'Widgets & embeds: safe patterns for schools and public screens.',
    ],
    tip: 'Export a logo-free multi-month PDF if you are a Supporter — ideal for office walls.',
  },
  yearly: {
    subject: 'Year in Time: reforms, leaps, and what we built',
    bullets: [
      'Timezone and DST policy watchlist for the year ahead.',
      'Leap-second context: rare, but we keep the story clear on the site.',
      'Teaching edition: free tools for classrooms and science clubs.',
      'Enterprise habits: fair meeting hours across AU–US–EU.',
    ],
    tip: 'Review your pinned cities once a year when daylight-saving maps shift.',
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
    `Unsubscribe: reply STOP or use the link in a live send (Spam Act 2003 — Australia).`,
    `Contact: ${c.hq.email}`,
    '',
    `— ${c.legalName}`,
  ].join('\n');

  const html = `
  <div style="font-family:system-ui,Segoe UI,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <h1 style="font-size:20px;color:#0e7490">${subject}</h1>
    <p style="color:#64748b;font-size:14px">From ${c.brandName} · ${c.hq.city}</p>
    <p style="font-size:14px">You are on the <strong>${name}</strong> list.</p>
    <ol style="font-size:14px;line-height:1.5;color:#334155">
      ${pack.bullets.map((b) => `<li style="margin-bottom:8px">${b}</li>`).join('')}
    </ol>
    <p style="background:#ecfeff;border-left:4px solid #06b6d4;padding:12px;font-size:14px"><strong>Tip:</strong> ${pack.tip}</p>
    <p style="font-size:12px;color:#94a3b8">Spam Act 2003 (Cth) · Unsubscribe in every live email · ${c.hq.email}</p>
  </div>`;

  return { subject, text, html };
}

export function welcomeEmailHtml(opts: { email: string; cadence: NewsletterCadence }) {
  const label =
    opts.cadence === 'weekly' ? 'Weekly Bulletin' : opts.cadence === 'monthly' ? 'Monthly Digest' : 'Year in Time';
  return buildNewsletterEmail({ cadence: opts.cadence, toEmail: opts.email }).html.replace(
    'You are on the',
    `Welcome — you joined <strong>${label}</strong>. You are on the`
  );
}
