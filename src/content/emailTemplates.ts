/**
 * Newsletter HTML/text templates — used when an email provider (Resend/SendGrid) is connected.
 * Until then, /api/newsletter stores the opt-in and the UI shows a preview of what would send.
 * Spam Act: every commercial email must identify sender + unsubscribe link.
 */

import { companyContent } from './companyContent';

export type NewsletterCadence = 'weekly' | 'monthly' | 'yearly';

export function buildNewsletterEmail(opts: {
  cadence: NewsletterCadence;
  toEmail: string;
  sampleSubject?: string;
}) {
  const c = companyContent;
  const name =
    opts.cadence === 'weekly'
      ? c.newsletter.weekly.name
      : opts.cadence === 'monthly'
        ? c.newsletter.monthly.name
        : c.newsletter.yearly.name;
  const subject = opts.sampleSubject || `${name} — ${c.brandName}`;
  const unsub = `https://${c.brandDomain}/?unsubscribe=1`;
  const text = [
    `${name}`,
    ``,
    `Hello,`,
    ``,
    `Thanks for subscribing to TimeGovern (${c.brandDomain}).`,
    `This is a ${opts.cadence} update on time zones, calendars, astronomy and product tips.`,
    ``,
    `— Sample highlights —`,
    `• Check World Clock pins and Meeting Planner before cross-region calls`,
    `• Astronomy: multi-day sunrise table for your city`,
    `• News: free feeds, refreshed often`,
    ``,
    `You received this because you opted in on ${c.brandDomain}.`,
    `Unsubscribe: ${unsub}`,
    `Privacy: ${c.hq.privacyEmail}`,
    ``,
    `${c.legalName} · ${c.hq.fullAddress}`,
    `ABN ${c.hq.abn}`,
  ].join('\n');

  const html = `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#020617;border:1px solid #334155;border-radius:12px;padding:24px">
    <h1 style="color:#22d3ee;font-size:18px">${name}</h1>
    <p>Thanks for subscribing to <strong>TimeGovern</strong>.</p>
    <p style="color:#94a3b8;font-size:14px">This is a <strong>${opts.cadence}</strong> update on time zones, calendars, astronomy and product tips.</p>
    <ul style="color:#cbd5e1;font-size:14px">
      <li>World Clock pins & Meeting Planner</li>
      <li>Astronomy multi-day sunrise table</li>
      <li>Free news feeds</li>
    </ul>
    <p style="font-size:12px;color:#64748b">You opted in on ${c.brandDomain}.
      <a href="${unsub}" style="color:#22d3ee">Unsubscribe</a> · ${c.hq.privacyEmail}</p>
    <p style="font-size:11px;color:#475569">${c.legalName} · ${c.hq.fullAddress} · ABN ${c.hq.abn}</p>
  </div></body></html>`;

  return { subject, text, html, from: c.hq.email };
}

export function welcomeEmailHtml(opts: { email: string; cadence: NewsletterCadence }) {
  const label =
    opts.cadence === 'weekly' ? 'Weekly Bulletin' : opts.cadence === 'monthly' ? 'Monthly Digest' : 'Year in Time';
  return `<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;">
  <table width="100%" style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;padding:24px;">
    <tr><td>
      <h1 style="color:#22d3ee;font-size:22px;">Welcome to TimeGovern</h1>
      <p>You subscribed to the <strong>${label}</strong>.</p>
      <p style="font-size:12px;color:#94a3b8;">Unsubscribe in future emails. privacy@timegovern.com</p>
    </td></tr>
  </table></body></html>`;
}

export const emailOpsNotes = {
  providerSuggestion: 'Resend or SendGrid',
  note: 'Until API key is set, UI shows would-send preview only (Spam Act opt-in still recorded).',
};
