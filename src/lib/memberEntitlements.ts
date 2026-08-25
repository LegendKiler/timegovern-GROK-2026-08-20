/**
 * F3 — client-side member entitlements (sync, from billing local mirror).
 * Source of truth after checkout: localStorage tg_billing_entitlements_v1
 * and/or /api/billing/status (mirrored by fetchBillingStatus).
 */

const LOCAL_KEY = 'tg_billing_entitlements_v1';

export const FREE_PIN_LIMIT = 12;
export const SUPPORTER_PIN_LIMIT = 50;

export type MemberEntitlements = {
  supporter: boolean;
  calendar: boolean;
  supporterUntil: string | null;
  calendarUntil: string | null;
  /** Sun/Moon HH:mm:ss */
  preciseAstro: boolean;
  /** Strip TimeGovern logo/branding on PDF */
  removePdfBranding: boolean;
  /** Multi-month PDF templates */
  multiMonthPdf: boolean;
  /** Company logo on PDF (Calendar product) */
  brandedPdf: boolean;
  pinLimit: number;
};

type Stored = {
  supporterUntil?: string | null;
  calendarUntil?: string | null;
};

function loadStored(): Stored {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}');
  } catch {
    return {};
  }
}

function stillActive(until: string | null | undefined): boolean {
  if (!until) return false;
  return new Date(until).getTime() > Date.now();
}

export function getMemberEntitlements(): MemberEntitlements {
  const s = loadStored();
  const supporter = stillActive(s.supporterUntil);
  const calendar = stillActive(s.calendarUntil);
  return {
    supporter,
    calendar,
    supporterUntil: supporter ? s.supporterUntil || null : null,
    calendarUntil: calendar ? s.calendarUntil || null : null,
    preciseAstro: supporter,
    removePdfBranding: supporter || calendar,
    multiMonthPdf: supporter || calendar,
    brandedPdf: calendar,
    pinLimit: supporter ? SUPPORTER_PIN_LIMIT : FREE_PIN_LIMIT,
  };
}

/** Format clock time — minutes for free, seconds for Supporter. */
export function formatMemberTime(d: Date | null | undefined, precise?: boolean): string {
  if (!d || Number.isNaN(d.getTime())) return '—';
  const useSeconds = precise ?? getMemberEntitlements().preciseAstro;
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    ...(useSeconds ? { second: '2-digit' as const } : {}),
  });
}
