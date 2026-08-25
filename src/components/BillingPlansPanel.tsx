import React, { useEffect, useState } from 'react';
import { Heart, Shield, CreditCard, Calendar } from 'lucide-react';
import { companyContent } from '../content/companyContent';
import {
  startCheckout,
  fetchBillingStatus,
  openCustomerPortal,
  labRevoke,
  type PlanCode,
  type BillingStatus,
} from '../lib/billing';
import type { AuthUser } from '../lib/accountAuth';

type Props = {
  user: AuthUser | null;
  onNeedAccount: () => void;
  onNotice: (msg: string | null) => void;
  onError: (msg: string | null) => void;
};

/** Phase 3 — Supporter (A$9.99 / A$29.99) + Calendar PDF (A$79) via Stripe or lab-mock */
export const BillingPlansPanel: React.FC<Props> = ({ user, onNeedAccount, onNotice, onError }) => {
  const c = companyContent;
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState<PlanCode | null>(null);

  const refreshBilling = async () => {
    const st = await fetchBillingStatus();
    setBillingStatus(st);
  };

  useEffect(() => {
    void refreshBilling();
  }, [user?.id]);

  const buy = async (plan: PlanCode) => {
    setCheckoutBusy(plan);
    onError(null);
    onNotice(null);
    const r = await startCheckout(plan);
    setCheckoutBusy(null);
    if (!r.success) {
      onError(r.error || 'Checkout failed');
      return;
    }
    if (r.url) {
      window.location.href = r.url;
      return;
    }
    onNotice(r.message || 'Plan activated (lab mock).');
    await refreshBilling();
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4">
        <h4 className="font-bold text-white flex items-center gap-2 mb-2">
          <Heart className="w-4 h-4 text-rose-400" /> TimeGovern Supporter
        </h4>
        <ul className="mt-2 space-y-1.5 text-xs text-slate-300 list-disc pl-4">
          <li>Ad-free browsing sitewide</li>
          <li>Sun & Moon times to the second (as shipped)</li>
          <li>Extra PDF calendar templates · remove TimeGovern logo</li>
          <li>Higher city pin limits · export perks</li>
        </ul>
        {billingStatus?.supporter && (
          <p className="mt-3 text-[11px] text-emerald-300 font-semibold">
            Active until{' '}
            {billingStatus.supporterUntil
              ? new Date(billingStatus.supporterUntil).toLocaleDateString()
              : '—'}
            {billingStatus.mode ? ` · ${billingStatus.mode}` : ''}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-slate-700 p-4 bg-slate-950 flex flex-col">
          <div className="text-[10px] font-bold uppercase text-slate-500">Quarterly</div>
          <div className="text-xl font-black text-white mt-1">A$9.99</div>
          <div className="text-[11px] text-slate-400 mb-3">≈ US$5.99 · every 3 months</div>
          <button
            type="button"
            disabled={!user || checkoutBusy !== null}
            onClick={() => buy('supporter_quarterly')}
            className="mt-auto w-full py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {checkoutBusy === 'supporter_quarterly' ? 'Working…' : 'Subscribe'}
          </button>
        </div>
        <div className="rounded-xl border border-cyan-500/40 p-4 bg-slate-950 flex flex-col">
          <div className="text-[10px] font-bold uppercase text-cyan-400">Yearly · best value</div>
          <div className="text-xl font-black text-white mt-1">A$29.99</div>
          <div className="text-[11px] text-slate-400 mb-3">≈ US$14.99 · per year</div>
          <button
            type="button"
            disabled={!user || checkoutBusy !== null}
            onClick={() => buy('supporter_yearly')}
            className="mt-auto w-full py-2 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {checkoutBusy === 'supporter_yearly' ? 'Working…' : 'Subscribe'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
        <h4 className="font-bold text-white flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-amber-400" /> Calendar PDF + Logo
        </h4>
        <p className="text-xs text-slate-300 mb-2">
          Branded multi-month printable calendars with your company logo. Separate from Supporter.
        </p>
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <div className="text-xl font-black text-white">A$79</div>
            <div className="text-[11px] text-slate-400">per year · ≈ US$49</div>
            {billingStatus?.calendar && (
              <p className="text-[11px] text-emerald-300 font-semibold mt-1">
                Active until{' '}
                {billingStatus.calendarUntil
                  ? new Date(billingStatus.calendarUntil).toLocaleDateString()
                  : '—'}
              </p>
            )}
          </div>
          <button
            type="button"
            disabled={!user || checkoutBusy !== null}
            onClick={() => buy('calendar_yearly')}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {checkoutBusy === 'calendar_yearly' ? 'Working…' : 'Subscribe'}
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 p-3 text-[11px] text-slate-400 space-y-2">
        <p className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-200">Not a charitable donation.</strong> {c.legalName} · ABN{' '}
            {c.hq.abn}. Cards via Stripe (Apple Pay / Google Pay when available). No PayPal in this
            phase.
          </span>
        </p>
        <p className="text-slate-500">
          Mode: <span className="text-slate-300">{billingStatus?.mode || '…'}</span>
          {billingStatus?.stripeConfigured
            ? ' · Stripe configured'
            : ' · lab mock until STRIPE_SECRET_KEY is set'}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!user}
          onClick={async () => {
            const r = await openCustomerPortal();
            if (r.url) window.location.href = r.url;
            else onNotice(r.error || 'Portal available after a real Stripe checkout.');
          }}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 disabled:opacity-40"
        >
          Manage subscription
        </button>
        {(billingStatus?.mode === 'lab-mock' || billingStatus?.mode === 'test') && user && (
          <button
            type="button"
            onClick={async () => {
              await labRevoke();
              onNotice('Lab entitlements cleared.');
              await refreshBilling();
            }}
            className="px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 border border-slate-700 hover:text-rose-300"
          >
            Revoke lab
          </button>
        )}
      </div>

      {!user && (
        <button
          type="button"
          onClick={onNeedAccount}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
        >
          Create free account first
        </button>
      )}
    </div>
  );
};
