/**
 * Client helpers for Phase 3 Stripe / lab-mock billing.
 */
import { getAuthToken, getSession } from './accountAuth';

export type PlanCode = 'supporter_quarterly' | 'supporter_yearly' | 'calendar_yearly';

export type BillingStatus = {
  success: boolean;
  stripeConfigured?: boolean;
  mode?: 'live' | 'test' | 'lab-mock';
  supporter?: boolean;
  calendar?: boolean;
  supporterUntil?: string | null;
  calendarUntil?: string | null;
  error?: string;
};

const LOCAL_ENTITLEMENTS_KEY = 'tg_billing_entitlements_v1';

type LocalEnt = {
  supporterUntil?: string | null;
  calendarUntil?: string | null;
};

function loadLocalEnt(): LocalEnt {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_ENTITLEMENTS_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveLocalEnt(e: LocalEnt) {
  localStorage.setItem(LOCAL_ENTITLEMENTS_KEY, JSON.stringify(e));
}

function periodEnd(plan: PlanCode): string {
  const d = new Date();
  if (plan === 'supporter_quarterly') d.setMonth(d.getMonth() + 3);
  else d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
}

export function getLocalEntitlements(): {
  supporter: boolean;
  calendar: boolean;
  supporterUntil: string | null;
  calendarUntil: string | null;
} {
  const e = loadLocalEnt();
  const now = Date.now();
  const sOk = !!(e.supporterUntil && new Date(e.supporterUntil).getTime() > now);
  const cOk = !!(e.calendarUntil && new Date(e.calendarUntil).getTime() > now);
  return {
    supporter: sOk,
    calendar: cOk,
    supporterUntil: sOk ? e.supporterUntil || null : null,
    calendarUntil: cOk ? e.calendarUntil || null : null,
  };
}

export function applyLocalPlan(plan: PlanCode) {
  const e = loadLocalEnt();
  const end = periodEnd(plan);
  if (plan.startsWith('supporter')) e.supporterUntil = end;
  if (plan.startsWith('calendar')) e.calendarUntil = end;
  saveLocalEnt(e);
  return getLocalEntitlements();
}

export function clearLocalEntitlements() {
  localStorage.removeItem(LOCAL_ENTITLEMENTS_KEY);
}

async function api(path: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { ...init, headers });
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    /* */
  }
  return { ok: res.ok, status: res.status, data };
}

export async function fetchBillingStatus(): Promise<BillingStatus> {
  const session = getSession();
  if (!session) {
    const local = getLocalEntitlements();
    return { success: true, mode: 'lab-mock', ...local };
  }
  try {
    const { ok, data } = await api('/api/billing/status');
    if (ok && data.success) {
      // Mirror cloud into local for ad-hiding offline
      saveLocalEnt({
        supporterUntil: data.supporterUntil,
        calendarUntil: data.calendarUntil,
      });
      return data as BillingStatus;
    }
  } catch {
    /* offline */
  }
  const local = getLocalEntitlements();
  return { success: true, mode: 'lab-mock', ...local };
}

export async function startCheckout(plan: PlanCode): Promise<{
  success: boolean;
  url?: string | null;
  mode?: string;
  message?: string;
  error?: string;
  periodEnd?: string;
}> {
  const session = getSession();
  if (!session) {
    return { success: false, error: 'Create a free account and sign in before checkout.' };
  }

  try {
    const { ok, data, status } = await api('/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    });

    if (ok && data.success) {
      if (data.url) {
        return { success: true, url: data.url, mode: data.mode };
      }
      // lab-mock granted on server
      if (data.periodEnd) {
        if (plan.startsWith('supporter')) {
          saveLocalEnt({ ...loadLocalEnt(), supporterUntil: data.periodEnd });
        } else {
          saveLocalEnt({ ...loadLocalEnt(), calendarUntil: data.periodEnd });
        }
      } else {
        applyLocalPlan(plan);
      }
      return {
        success: true,
        url: null,
        mode: data.mode || 'lab-mock',
        message: data.message,
        periodEnd: data.periodEnd,
      };
    }

    // API missing (pure Vite without Worker) → pure local mock
    if (status === 404 || status === 0) {
      const ent = applyLocalPlan(plan);
      return {
        success: true,
        url: null,
        mode: 'lab-mock',
        message: 'Local lab mock — plan activated on this device until ' + (ent.supporterUntil || ent.calendarUntil),
        periodEnd: plan.startsWith('supporter') ? ent.supporterUntil || undefined : ent.calendarUntil || undefined,
      };
    }

    return { success: false, error: data.error || 'Checkout failed' };
  } catch {
    const ent = applyLocalPlan(plan);
    return {
      success: true,
      url: null,
      mode: 'lab-mock',
      message: 'Offline lab mock activated on this device.',
      periodEnd: plan.startsWith('supporter') ? ent.supporterUntil || undefined : ent.calendarUntil || undefined,
    };
  }
}

export async function openCustomerPortal(): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { ok, data } = await api('/api/billing/portal', { method: 'POST', body: '{}' });
    if (ok && data.url) return { success: true, url: data.url };
    return { success: false, error: data.error || 'Portal unavailable' };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function labRevoke(): Promise<void> {
  clearLocalEntitlements();
  try {
    await api('/api/billing/lab-revoke', { method: 'POST', body: '{}' });
  } catch {
    /* */
  }
}
