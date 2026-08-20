/**
 * Email HTML templates for newsletter / transactional mail.
 * Wire to Resend, SendGrid, Amazon SES or similar via Worker secrets.
 * Auto-send requires: (1) subscriber DB (2) email provider API key (3) scheduled Worker/cron.
 */

export type NewsletterCadence = 'weekly' | 'monthly' | 'yearly';

export function welcomeEmailHtml(opts: { email: string; cadence: NewsletterCadence }) {
  const label =
    opts.cadence === 'weekly' ? 'Weekly Bulletin' : opts.cadence === 'monthly' ? 'Monthly Digest' : 'Year in Time';
  return `<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;padding:24px;">
    <tr><td>
      <h1 style="color:#22d3ee;font-size:22px;margin:0 0 12px;">Welcome to TimeGovern</h1>
      <p style="font-size:14px;line-height:1.5;">You subscribed to the <strong>${label}</strong>.</p>
      <p style="font-size:14px;line-height:1.5;">From Melbourne, Australia — world clocks, calendars, DST alerts and sky events.</p>
      <p style="font-size:12px;color:#94a3b8;">Unsubscribe anytime via the link in future emails. privacy@timegovern.com</p>
      <p style="font-size:12px;color:#64748b;">TimeGovern Pty Ltd · Level 12, 120 Collins Street, Melbourne VIC 3000</p>
    </td></tr>
  </table></body></html>`;
}

export function weeklyBulletinHtml(opts: { headline: string; bodyHtml: string; weekLabel: string }) {
  return `<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;background:#0f172a;color:#e2e8f0;padding:24px;">
  <table width="100%" style="max-width:560px;margin:0 auto;background:#1e293b;border-radius:12px;padding:24px;">
    <tr><td>
      <p style="color:#22d3ee;font-size:12px;font-weight:700;letter-spacing:0.05em;">TIMEGOVERN WEEKLY · ${opts.weekLabel}</p>
      <h1 style="font-size:20px;margin:8px 0 16px;">${opts.headline}</h1>
      <div style="font-size:14px;line-height:1.6;">${opts.bodyHtml}</div>
      <hr style="border:none;border-top:1px solid #334155;margin:24px 0;" />
      <p style="font-size:12px;color:#94a3b8;">You receive this because you opted in. <a href="{{UNSUBSCRIBE_URL}}" style="color:#22d3ee;">Unsubscribe</a></p>
      <p style="font-size:11px;color:#64748b;">TimeGovern Pty Ltd · Melbourne, Australia · Spam Act 2003 compliant opt-in list</p>
    </td></tr>
  </table></body></html>`;
}

export function monthlyDigestHtml(opts: { monthLabel: string; bodyHtml: string }) {
  return weeklyBulletinHtml({
    weekLabel: opts.monthLabel,
    headline: `Monthly Digest — ${opts.monthLabel}`,
    bodyHtml: opts.bodyHtml,
  }).replace('WEEKLY', 'MONTHLY');
}

export function yearlyRoundupHtml(opts: { year: number; bodyHtml: string }) {
  return weeklyBulletinHtml({
    weekLabel: String(opts.year),
    headline: `Year in Time — ${opts.year}`,
    bodyHtml: opts.bodyHtml,
  }).replace('WEEKLY', 'YEARLY');
}

export function contactAckHtml(opts: { name: string; ticketId: string }) {
  return `<!DOCTYPE html><html><body style="font-family:Inter,Arial,sans-serif;padding:24px;">
  <p>Hi ${opts.name},</p>
  <p>We received your message (ticket <strong>${opts.ticketId}</strong>). Our Melbourne team will respond as soon as possible.</p>
  <p>TimeGovern · contact@timegovern.com · Level 12, 120 Collins Street, Melbourne VIC 3000</p>
  </body></html>`;
}

/**
 * Production checklist for auto-send:
 * 1. Add RESEND_API_KEY or SENDGRID_API_KEY to Cloudflare secrets
 * 2. Store subscribers in D1 with cadence flags (weekly/monthly/yearly)
 * 3. Cron Trigger: weekly Monday 09:00 AEST, monthly 1st, yearly 1 Jan
 * 4. Generate content (editorial or scripted) → render template → send batch
 * 5. Honour unsubscribe immediately (Spam Act 2003)
 */
export const emailOpsNotes = {
  providerSuggestion: 'Resend or SendGrid',
  cronWeekly: '0 23 * * 0', // example UTC ≈ Monday morning AEST depending on DST
  cronMonthly: '0 23 1 * *',
  cronYearly: '0 23 1 1 *',
};
