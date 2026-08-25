import React, { useEffect, useState } from 'react';
import { Heart, Shield, CreditCard, Check, Sparkles } from 'lucide-react';
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

/**
 * F2 — Simple Supporter plans (timeanddate-style clarity):
 * - 3 perk bullets
 * - Yearly primary (A$29.99), Quarterly secondary (A$9.99)
 * - Calendar branding as optional second product
 * - One-click subscribe (sign-in first if needed)
 */
export const BillingPlansPanel: React.FC<Props> = ({ user, onNeedAccount, onNotice, onError }) => {
  const c = companyContent;
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState<PlanCode | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const refreshBilling = async () => {
    const st = await fetchBillingStatus();
    setBillingStatus(st);
  };

  useEffect(() => {
    void refreshBilling();
  }, [user?.id]);

  const buy = async (plan: PlanCode) => {
    if (!user) {
      onNeedAccount();
      onNotice('Create a free account (30 seconds), then tap Subscribe again.');
      return;
    }
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
    onNotice(r.message || 'You are now a Supporter. Ads will hide after refresh.');
    await refreshBilling();
  };

  const isSupporter = !!billingStatus?.supporter;

  return (
    <div className="space-y-5 text-sm">
      {/* Hero — match T&D simplicity */}
      <div className="rounded-2xl border border-rose-500/25 bg-gradient-to-br from-rose-950/40 to-slate-950 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-rose-500 to-pink-700 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base">Love Our Site? Become a Supporter</h4>
            <p className="text-[12px] text-slate-400 mt-1">
              Same tools you already use — without ads, with a few extra perks.
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-[13px] text-slate-200">
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Browse our site <strong className="text-white">advert free</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Sun &amp; Moon times <strong className="text-white">precise to the second</strong>
            </span>
          </li>
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-white">Exclusive calendar templates</strong> for PDF calendars
            </span>
          </li>
        </ul>

        {isSupporter && (
          <p className="mt-4 text-[12px] font-semibold text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            You are a Supporter until{' '}
            {billingStatus?.supporterUntil
              ? new Date(billingStatus.supporterUntil).toLocaleDateString()
              : '—'}
          </p>
        )}
      </div>

      {/* Primary: Yearly */}
      <button
        type="button"
        disabled={checkoutBusy !== null}
        onClick={() => buy('supporter_yearly')}
        className="w-full text-left rounded-2xl border-2 border-cyan-500/50 bg-slate-950 p-4 hover:border-cyan-400 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-cyan-400">Best value</div>
            <div className="text-2xl font-black text-white mt-0.5">A$29.99</div>
            <div className="text-[12px] text-slate-400">per year · about A$2.50 / month</div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-bold shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
            {checkoutBusy === 'supporter_yearly' ? 'Working…' : 'Subscribe yearly'}
          </span>
        </div>
      </button>

      {/* Secondary: Quarterly */}
      <button
        type="button"
        disabled={checkoutBusy !== null}
        onClick={() => buy('supporter_quarterly')}
        className="w-full text-left rounded-2xl border border-slate-700 bg-slate-950/80 p-4 hover:border-slate-500 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Quarterly</div>
            <div className="text-xl font-black text-white mt-0.5">A$9.99</div>
            <div className="text-[12px] text-slate-400">every 3 months</div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold shrink-0">
            {checkoutBusy === 'supporter_quarterly' ? 'Working…' : 'Subscribe'}
          </span>
        </div>
      </button>

      {!user && (
        <button
          type="button"
          onClick={onNeedAccount}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white"
        >
          Create free account first (required to subscribe)
        </button>
      )}

      {/* Optional Calendar product — collapsed by default */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className="w-full px-4 py-3 text-left text-[12px] font-semibold text-slate-300 hover:bg-slate-900 flex justify-between"
        >
          <span>Need branded PDF calendars for your team?</span>
          <span className="text-slate-500">{showCalendar ? '−' : '+'}</span>
        </button>
        {showCalendar && (
          <div className="px-4 pb-4 border-t border-slate-800 pt-3">
            <p className="text-[12px] text-slate-400 mb-3">
              Add your company logo to printable multi-month calendars. Separate from Supporter.
            </p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-black text-white">A$79</div>
                <div className="text-[11px] text-slate-500">per year</div>
                {billingStatus?.calendar && (
                  <p className="text-[11px] text-emerald-300 mt-1">
                    Active until{' '}
                    {billingStatus.calendarUntil
                      ? new Date(billingStatus.calendarUntil).toLocaleDateString()
                      : '—'}
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={checkoutBusy !== null}
                onClick={() => buy('calendar_yearly')}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40"
              >
                {checkoutBusy === 'calendar_yearly' ? 'Working…' : 'Subscribe'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 p-3 text-[11px] text-slate-400 space-y-1.5">
        <p className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-200">Not a charitable donation.</strong> {c.legalName}
            {c.hq.abn ? ` · ABN ${c.hq.abn}` : ''}. Cards via Stripe when live keys are set.
          </span>
        </p>
        <p className="text-slate-500 pl-5">Cancel anytime · Core clocks stay free for everyone</p>
      </div>

      {user && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              const r = await openCustomerPortal();
              if (r.url) window.location.href = r.url;
              else onNotice(r.error || 'Manage billing after a real Stripe checkout.');
            }}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 border border-slate-700"
          >
            Manage subscription
          </button>
          {(billingStatus?.mode === 'lab-mock' || billingStatus?.mode === 'test') && (
            <button
              type="button"
              onClick={async () => {
                await labRevoke();
                onNotice('Demo entitlement cleared.');
                await refreshBilling();
              }}
              className="px-3 py-2 rounded-xl text-[11px] text-slate-500 border border-slate-800"
            >
              Reset demo
            </button>
          )}
        </div>
      )}
    </div>
  );
};
