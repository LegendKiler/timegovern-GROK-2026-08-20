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
    houseTitle: 'Reach decision-makers who check world time, calendars & pay tools daily.',
    houseCta: 'Advertise here',
    adFormat: 'horizontal',
  },
  tg_rail_sticky: {
    label: 'Sticky sidebar (premium)',
    sizeLabel: '300×600',
    width: 300,
    height: 600,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Highest view-time slot — users stay on clocks & planners for minutes.',
    houseCta: 'Book sticky rail',
    adFormat: 'vertical',
  },
  tg_infeed: {
    label: 'In-feed native',
    sizeLabel: '300×250 / fluid',
    width: 300,
    height: 250,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Native placement between tools — high engagement, brand-safe context.',
    houseCta: 'Request rates',
    adFormat: 'rectangle',
  },
  tg_footer: {
    label: 'Footer board',
    sizeLabel: '728×90',
    width: 728,
    height: 90,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Always-on footer inventory across all pillars.',
    houseCta: 'Advertise',
    adFormat: 'horizontal',
  },
  tg_mobile_anchor: {
    label: 'Mobile anchor',
    sizeLabel: '320×50 / 320×100',
    width: 320,
    height: 100,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Sticky mobile unit — limited to one for UX quality.',
    houseCta: 'Advertise',
    adFormat: 'horizontal',
  },
  tg_rectangle: {
    label: 'Medium rectangle',
    sizeLabel: '300×250',
    width: 300,
    height: 250,
    houseSponsor: 'TimeGovern Media',
    houseTitle: 'Classic MREC for calculators, news & company pages.',
    houseCta: 'Advertise',
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

  // ——— Live AdSense path (env-gated) ———
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

  // ——— House placeholders (default / lab) ———
  if (slotId === 'tg_rail_sticky') {
    return (
      <aside
        className={`hidden xl:flex w-[300px] shrink-0 flex-col ${className}`}
        data-ad-slot={slotId}
        aria-label={`Advertisement ${meta.sizeLabel}`}
      >
        <div
          className="sticky top-20 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/90 shadow-sm overflow-hidden flex flex-col"
          style={{ width: 300, minHeight: 600 }}
        >
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/80">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Advertisement</span>
            <span className="text-[9px] font-mono text-slate-400">{meta.sizeLabel}</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-5 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center">
              <Megaphone className="w-7 h-7 text-blue-600 dark:text-cyan-400" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-cyan-400">{meta.houseSponsor}</p>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{meta.houseTitle}</p>
            <p className="text-[11px] text-slate-500">
              Slot ID: <code className="font-mono">{slotId}</code>
            </p>
            <button
              type="button"
              onClick={goAdvertise}
              className="mt-2 w-full max-w-[220px] px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {meta.houseCta} <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-400 text-center">
            House ad · Set VITE_ADS_ENABLED=true for AdSense
          </div>
        </div>
      </aside>
    );
  }

  if (slotId === 'tg_header' || slotId === 'tg_footer') {
    return (
      <div className={`w-full max-w-7xl mx-auto ${className}`} data-ad-slot={slotId} aria-label={`Advertisement ${meta.sizeLabel}`}>
        <div
          className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 overflow-hidden shadow-sm"
          style={{ minHeight: meta.height }}
        >
          <div className="absolute top-1.5 left-2 flex items-center gap-2 z-10">
            <span className="text-[8px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
              Advertisement
            </span>
            <span className="text-[8px] font-mono text-slate-400 hidden sm:inline">
              {meta.sizeLabel} · {slotId}
            </span>
          </div>
          {!persistent && (
            <button type="button" onClick={() => setDismissed(true)} className="absolute top-1.5 right-2 text-slate-400 hover:text-slate-600 p-1 z-10" title="Hide ad">
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 pt-7 sm:pt-5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{meta.houseSponsor}</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{meta.houseTitle}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={goAdvertise}
              className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
            >
              {meta.houseCta} <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (slotId === 'tg_mobile_anchor') {
    return (
      <div
        className={`fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md shadow-lg ${className}`}
        data-ad-slot={slotId}
        aria-label="Advertisement mobile anchor"
      >
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2 px-3 py-2" style={{ minHeight: 50 }}>
          <div className="min-w-0">
            <span className="text-[8px] font-bold uppercase text-slate-400">Ad</span>
            <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{meta.houseTitle}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={goAdvertise} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold">
              {meta.houseCta}
            </button>
            {!persistent && (
              <button type="button" onClick={() => setDismissed(true)} className="p-1 text-slate-400">
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-4 ${className}`} data-ad-slot={slotId} aria-label={`Advertisement ${meta.sizeLabel}`}>
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 overflow-hidden shadow-sm" style={{ minHeight: Math.min(meta.height, 200) }}>
        <div className="flex items-center justify-between px-3 py-1 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Advertisement</span>
          <span className="text-[9px] font-mono text-slate-400">{meta.sizeLabel}</span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-blue-600 dark:text-cyan-400">{meta.houseSponsor}</p>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mt-0.5">{meta.houseTitle}</p>
            <p className="text-[10px] text-slate-400 mt-1 font-mono">{slotId}</p>
          </div>
          <button
            type="button"
            onClick={goAdvertise}
            className="shrink-0 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5"
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
