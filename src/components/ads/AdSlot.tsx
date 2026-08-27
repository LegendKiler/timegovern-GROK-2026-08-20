/**
 * Professional IAB-style ad inventory for TimeGovern.
 * Default: house placeholders. Live AdSense only when env enables it.
 */
import React, { useState } from 'react';
import { ExternalLink, EyeOff, Megaphone, Building2 } from 'lucide-react';
import { canRenderLiveAd, AdSlotId as ConfigSlotId } from '../../lib/adsConfig';
import { AdSenseUnit } from './AdSenseUnit';

export type AdSlotId = ConfigSlotId;

interface AdSlotProps {
  slotId: AdSlotId;
  className?: string;
  persistent?: boolean;
}

const SLOT_META: Record<
  AdSlotId,
  {
    label: string;
    sizeLabel: string;
    width: number;
    height: number;
    houseSponsor: string;
    houseTitle: string;
    houseSub: string;
    houseCta: string;
    adFormat: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  }
> = {
  tg_header: {
    label: 'Header leaderboard',
    sizeLabel: '728×90 / 970×250',
    width: 728,
    height: 90,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Be the first brand professionals see before they plan the day.',
    houseSub: 'Sitewide leaderboard · world clocks, calendars & pay tools',
    houseCta: 'Book header',
    adFormat: 'horizontal',
  },
  tg_rail_sticky: {
    label: 'Sticky sidebar (premium)',
    sizeLabel: '300×600',
    width: 300,
    height: 600,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Premium sticky — in view while users work the clocks.',
    houseSub: 'Long sessions on World Clock & Meeting Planner',
    houseCta: 'Book sticky rail',
    adFormat: 'vertical',
  },
  tg_infeed: {
    label: 'In-feed native',
    sizeLabel: '300×250 / fluid',
    width: 300,
    height: 250,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Native between tools — calm, brand-safe, high intent.',
    houseSub: 'Seen with calculators, live data & planning workflows',
    houseCta: 'Request rates',
    adFormat: 'rectangle',
  },
  tg_footer: {
    label: 'Footer board',
    sizeLabel: '728×90',
    width: 728,
    height: 90,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Always-on footer reach across every pillar.',
    houseSub: 'Efficient run-of-site visibility',
    houseCta: 'Advertise here',
    adFormat: 'horizontal',
  },
  tg_mobile_anchor: {
    label: 'Mobile anchor',
    sizeLabel: '320×50 / 320×100',
    width: 320,
    height: 100,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'One mobile sticky — we protect UX so your brand stands alone.',
    houseSub: 'Limited inventory · user-dismissible',
    houseCta: 'Book mobile',
    adFormat: 'horizontal',
  },
  tg_rectangle: {
    label: 'Medium rectangle',
    sizeLabel: '300×250',
    width: 300,
    height: 250,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'MREC beside calculators, news and company pages.',
    houseSub: 'Classic IAB unit for direct or network fill',
    houseCta: 'Advertise here',
    adFormat: 'rectangle',
  },
};

export const AdSlot: React.FC<AdSlotProps> = ({ slotId, className = '', persistent = false }) => {
  const [dismissed, setDismissed] = useState(false);
  const meta = SLOT_META[slotId];

  if (dismissed && !persistent) return null;

  const goAdvertise = () => {
    window.location.hash = 'advertise';
    window.dispatchEvent(new CustomEvent('tg-open-advertise'));
  };

  if (canRenderLiveAd(slotId)) {
    if (slotId === 'tg_rail_sticky') {
      return (
        <aside className={`hidden xl:flex w-[300px] shrink-0 flex-col ${className}`} aria-label="Advertisement">
          <div className="sticky top-20 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900" style={{ width: 300, minHeight: 600 }}>
            <div className="px-2 py-1 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">
              Advertisement
            </div>
            <AdSenseUnit slotId={slotId} format={meta.adFormat} minHeight={580} className="p-1" />
          </div>
        </aside>
      );
    }
    if (slotId === 'tg_mobile_anchor') {
      return (
        <div className={`fixed bottom-0 inset-x-0 z-40 md:hidden border-t bg-white/95 dark:bg-slate-950/95 backdrop-blur-md ${className}`}>
          <div className="max-w-lg mx-auto">
            <AdSenseUnit slotId={slotId} format="horizontal" minHeight={50} />
          </div>
        </div>
      );
    }
    return (
      <div className={`w-full ${className}`} aria-label="Advertisement">
        <div className="text-[9px] font-bold uppercase text-slate-400 mb-0.5 px-1">Advertisement</div>
        <AdSenseUnit slotId={slotId} format={meta.adFormat} minHeight={meta.height} />
      </div>
    );
  }

  if (slotId === 'tg_rail_sticky') {
    return (
      <aside
        className={`hidden xl:flex w-[300px] shrink-0 flex-col ${className}`}
        data-ad-slot={slotId}
        aria-label={`Advertisement ${meta.sizeLabel}`}
      >
        <div
          className="sticky top-20 rounded-2xl border border-indigo-500/30 bg-slate-900 shadow-md overflow-hidden flex flex-col"
          style={{ width: 300, minHeight: 600 }}
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700 bg-slate-950/80">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Advertisement</span>
            <span className="text-[9px] font-mono text-slate-500">{meta.sizeLabel}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-5 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Megaphone className="w-7 h-7 text-indigo-300" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-300">{meta.houseSponsor}</p>
            <p className="text-sm font-semibold text-white leading-snug">{meta.houseTitle}</p>
            <p className="text-[11px] text-slate-400 leading-snug max-w-[220px]">{meta.houseSub}</p>
            <button
              type="button"
              onClick={goAdvertise}
              className="mt-2 w-full max-w-[220px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {meta.houseCta} <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-3 py-2 border-t border-slate-700 text-[9px] text-slate-500 text-center">
            Premium inventory · Melbourne HQ
          </div>
        </div>
      </aside>
    );
  }

  if (slotId === 'tg_header' || slotId === 'tg_footer') {
    return (
      <div className={`w-full max-w-7xl mx-auto ${className}`} data-ad-slot={slotId} aria-label={`Advertisement ${meta.sizeLabel}`}>
        <div className="rounded-xl border border-indigo-500/25 bg-gradient-to-r from-slate-900 to-indigo-950 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Advertisement</span>
              <p className="text-xs font-bold text-indigo-300 mt-0.5">{meta.houseSponsor}</p>
              <p className="text-sm font-semibold text-white">{meta.houseTitle}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{meta.houseSub}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button type="button" onClick={goAdvertise} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold">
                {meta.houseCta}
              </button>
              {!persistent && (
                <button type="button" onClick={() => setDismissed(true)} className="p-1 text-slate-400" aria-label="Hide ad">
                  <EyeOff className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slotId === 'tg_mobile_anchor') {
    return (
      <div
        className={`fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-slate-700 bg-slate-950/95 backdrop-blur-md ${className}`}
        data-ad-slot={slotId}
        aria-label="Advertisement mobile anchor"
      >
        <div className="max-w-lg mx-auto px-3 py-2 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-indigo-300">{meta.houseSponsor}</p>
            <p className="text-xs text-white truncate">{meta.houseTitle}</p>
          </div>
          <button type="button" onClick={goAdvertise} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-[10px] font-bold shrink-0">
            {meta.houseCta}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-4 ${className}`} data-ad-slot={slotId} aria-label={`Advertisement ${meta.sizeLabel}`}>
      <div className="rounded-xl border border-indigo-500/25 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 overflow-hidden shadow-md">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700/80 bg-slate-950/50">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Advertisement</span>
          <span className="text-[9px] font-mono text-slate-500">{meta.sizeLabel}</span>
        </div>
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6 text-indigo-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-300">{meta.houseSponsor}</p>
            <p className="text-sm sm:text-base font-semibold text-white mt-0.5 leading-snug">{meta.houseTitle}</p>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">{meta.houseSub}</p>
          </div>
          <button
            type="button"
            onClick={goAdvertise}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/20"
          >
            {meta.houseCta} <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export type LegacyAdType =
  | 'leaderboard'
  | 'skyscraper-left'
  | 'skyscraper-right'
  | 'in-feed'
  | 'rectangle'
  | 'anchor-bottom';

export function legacyTypeToSlotId(type: LegacyAdType): AdSlotId {
  switch (type) {
    case 'leaderboard':
      return 'tg_header';
    case 'skyscraper-left':
    case 'skyscraper-right':
      return 'tg_rail_sticky';
    case 'in-feed':
      return 'tg_infeed';
    case 'rectangle':
      return 'tg_rectangle';
    case 'anchor-bottom':
      return 'tg_mobile_anchor';
    default:
      return 'tg_rectangle';
  }
}
