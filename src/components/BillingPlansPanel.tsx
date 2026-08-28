import React, { useEffect, useState } from 'react';
import {
  Heart, Shield, Check, Sparkles, Ban, Clock, Pin, FileText, Star, X,
} from 'lucide-react';
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

/** Competitor-aligned tiers (timeanddate / time.is style). */
const ROWS: { label: string; guest: boolean; free: boolean; supporter: boolean }[] = [
  { label: 'World clocks, calendars, calculators, news', guest: true, free: true, supporter: true },
  { label: 'Save settings in this browser', guest: true, free: true, supporter: true },
  { label: 'Free account — sign-in & preferences', guest: false, free: true, supporter: true },
  { label: 'Pin more cities (up to 50)', guest: false, free: false, supporter: true },
  { label: 'Ad-free browsing (sitewide)', guest: false, free: false, supporter: true },
  { label: 'Sun & Moon times to the second', guest: false, free: false, supporter: true },
  { label: 'Priority layout — tools higher, less clutter', guest: false, free: false, supporter: true },
  { label: 'PDF calendar extras (multi-month / logo off)*', guest: false, free: false, supporter: true },
];

const PERKS = [
  {
    icon: Ban,
    title: 'Ad-free site',
    text: 'No leaderboard or in-feed house ads. Faster pages, tools higher on the screen — same idea as timeanddate Supporter and time.is Ad-free.',
  },
  {
    icon: Clock,
    title: 'Seconds precision',
    text: 'Sun rise/set and moon times shown to the second where the astronomy tools support it.',
  },
  {
    icon: Pin,
    title: 'More pinned cities',
    text: 'Free guests keep a short watchlist; Supporters unlock up to 50 pins for serious multi-city work.',
  },
  {
    icon: FileText,
    title: 'Calendar PDF extras*',
    text: 'Multi-month style printouts and option to hide site branding when PDF tools are enabled (*rolling out).',
  },
];

function Cell({ ok }: { ok: boolean }) {
  return ok ? (
    <Check className="w-4 h-4 text-emerald-500 mx-auto" aria-label="Included" />
  ) : (
    <X className="w-3.5 h-3.5 text-slate-400 mx-auto opacity-50" aria-label="Not included" />
  );
}

export const BillingPlansPanel: React.FC<Props> = ({
  user,
  onNeedAccount,
  onNotice,
  onError,
}) => {
  const c = companyContent;
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState<PlanCode | null>(null);

  const refreshBilling = async () => {
    const st = await fetchBillingStatus();
    setBillingStatus(st);
    // Let the rest of the app hide ads immediately
    try {
      window.dispatchEvent(new CustomEvent('tg-billing-updated', { detail: st }));
    } catch {
      /* */
    }
  };

  useEffect(() => {
    void refreshBilling();
  }, [user?.id]);

  const buy = async (plan: PlanCode) => {
    if (!user) {
      onNeedAccount();
      onNotice('Create a free account first (about 30 seconds), then tap Subscribe again.');
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
    onNotice(
      r.message ||
        'You are a Supporter on this device. Ads hide after a moment — refresh if needed.'
    );
    await refreshBilling();
  };

  const isSupporter = !!billingStatus?.supporter;

  return (
    <div className="space-y-5 text-sm">
      {/* Hero */}
      <div className="rounded-2xl border border-rose-300/40 dark:border-rose-500/30 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/50 dark:to-slate-950 p-5">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-rose-500 to-pink-700 flex items-center justify-center shrink-0 shadow-lg shadow-rose-500/30">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300">
              Support TimeGovern
            </p>
            <h4 className="font-black text-slate-900 dark:text-white text-lg leading-tight">
              Why become a Supporter?
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Core clocks stay <strong className="text-slate-800 dark:text-slate-100">free forever</strong>.
              Supporter is optional — same idea as{' '}
              <span className="font-semibold">timeanddate Supporter</span> and{' '}
              <span className="font-semibold">time.is Ad-free</span>: you fund the tools and get a calmer,
              more precise workspace.
            </p>
          </div>
        </div>
      </div>

      {isSupporter && (
        <div className="rounded-xl border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-300 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-100">
            <p className="font-bold">You are an active Supporter</p>
            <p className="mt-0.5 opacity-90">
              Until{' '}
              {billingStatus?.supporterUntil
                ? new Date(billingStatus.supporterUntil).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })
                : '—'}
              {billingStatus?.mode === 'lab-mock' ? ' · lab demo on this device' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            What’s in it for you
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                <th className="text-left p-2.5 font-semibold">Feature</th>
                <th className="p-2.5 font-semibold w-16">Guest</th>
                <th className="p-2.5 font-semibold w-16">Free</th>
                <th className="p-2.5 font-semibold w-20 text-rose-600 dark:text-rose-300">Supporter</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-slate-100 dark:border-slate-800/80 text-slate-700 dark:text-slate-300"
                >
                  <td className="p-2.5 text-left">{row.label}</td>
                  <td className="p-2.5">
                    <Cell ok={row.guest} />
                  </td>
                  <td className="p-2.5">
                    <Cell ok={row.free} />
                  </td>
                  <td className="p-2.5 bg-rose-50/50 dark:bg-rose-950/20">
                    <Cell ok={row.supporter} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-3 py-2 text-[10px] text-slate-500 border-t border-slate-200 dark:border-slate-700">
          Free account = sign-up only (no charge). Supporter = paid plan. *PDF extras activate as calendar
          exports ship.
        </p>
      </div>

      {/* Perk cards */}
      <div className="grid sm:grid-cols-2 gap-2.5">
        {PERKS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-3"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-rose-500" />
                <p className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</p>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{p.text}</p>
            </div>
          );
        })}
      </div>

      {/* Pricing */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-rose-400 dark:border-rose-500/50 bg-white dark:bg-slate-900 p-4 relative shadow-md">
          <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white">
            BEST VALUE
          </span>
          <p className="text-[10px] font-bold uppercase text-slate-500 mt-1">Yearly</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            A$29.99<span className="text-sm font-semibold text-slate-500">/year</span>
          </p>
          <p className="text-[11px] text-slate-500 mb-3">≈ A$2.50 / month · billed once a year</p>
          <button
            type="button"
            disabled={checkoutBusy !== null || isSupporter}
            onClick={() => buy('supporter_yearly')}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white disabled:opacity-40 transition-colors"
          >
            {isSupporter
              ? 'Already active'
              : checkoutBusy === 'supporter_yearly'
                ? 'Working…'
                : user
                  ? 'Become Supporter — yearly'
                  : 'Sign in, then subscribe'}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4">
          <p className="text-[10px] font-bold uppercase text-slate-500">Quarterly</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            A$9.99<span className="text-sm font-semibold text-slate-500">/3 mo</span>
          </p>
          <p className="text-[11px] text-slate-500 mb-3">≈ A$3.33 / month · flexible term</p>
          <button
            type="button"
            disabled={checkoutBusy !== null || isSupporter}
            onClick={() => buy('supporter_quarterly')}
            className="w-full py-2.5 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:border-rose-400 disabled:opacity-40"
          >
            {isSupporter
              ? 'Already active'
              : checkoutBusy === 'supporter_quarterly'
                ? 'Working…'
                : user
                  ? 'Become Supporter — quarterly'
                  : 'Sign in, then subscribe'}
          </button>
        </div>
      </div>

      {!user && (
        <button
          type="button"
          onClick={onNeedAccount}
          className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          Create free account first (required for Supporter)
        </button>
      )}

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
        <p className="flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-800 dark:text-slate-200">Not a charitable donation.</strong>{' '}
            {c.legalName}
            {c.hq?.abn ? ` · ABN ${c.hq.abn}` : ''}. Live card payments use Stripe when keys are configured;
            in local lab, Subscribe activates a <em>demo</em> entitlement on this browser.
          </span>
        </p>
        <p className="pl-5">Cancel anytime when Stripe is live · Core clocks stay free for everyone</p>
      </div>

      {user && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={async () => {
              const r = await openCustomerPortal();
              if (r.url) window.location.href = r.url;
              else onNotice(r.error || 'Manage billing after a real Stripe checkout in production.');
            }}
            className="flex-1 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
          >
            Manage subscription
          </button>
          {(billingStatus?.mode === 'lab-mock' || billingStatus?.mode === 'test' || isSupporter) && (
            <button
              type="button"
              onClick={async () => {
                await labRevoke();
                onNotice('Demo Supporter cleared on this device.');
                await refreshBilling();
              }}
              className="px-3 py-2 rounded-xl text-[11px] text-slate-500 border border-slate-300 dark:border-slate-700"
            >
              Reset demo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingPlansPanel;
