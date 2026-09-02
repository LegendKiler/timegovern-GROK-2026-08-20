/**
 * Professional IAB-style ad inventory for TimeGovern.
 * Sizes aligned with timeanddate.com: header 970x90/728x90, sky 300x600.
 * Default: rotating DEMO creatives (makeup ads) so inventory can be QA'd.
 * Live AdSense only when env enables it via canRenderLiveAd.
 */
import React, { useState, useEffect } from 'react';
import { ExternalLink, EyeOff, Megaphone } from 'lucide-react';
import { canRenderLiveAd, AdSlotId as ConfigSlotId } from '../../lib/adsConfig';
import { AdSenseUnit } from './AdSenseUnit';

export type AdSlotId = ConfigSlotId;

interface AdSlotProps {
  slotId: AdSlotId;
  className?: string;
  persistent?: boolean;
}

/** Fictional demo advertisers — for layout testing only (not real partners). */
const DEMO_ADS = [
  {
    brand: 'ChronoCloud',
    tagline: 'Sync every team, every zone',
    body: 'Enterprise meeting planner trusted by distributed ops teams.',
    cta: 'Start free trial',
    accent: 'from-cyan-600 to-blue-700',
    badge: 'Sponsored',
  },
  {
    brand: 'OrbitPay',
    tagline: 'Global payroll, local accuracy',
    body: 'Pay calculators + multi-country tax engines in one workspace.',
    cta: 'Book a demo',
    accent: 'from-emerald-600 to-teal-700',
    badge: 'Sponsored',
  },
  {
    brand: 'NightWatch ID',
    tagline: 'Time-stamped security logs',
    body: 'UTC-aligned audit trails for compliance and SOC teams.',
    cta: 'Learn more',
    accent: 'from-violet-600 to-indigo-800',
    badge: 'Sponsored',
  },
  {
    brand: 'Aurora Analytics',
    tagline: 'See the world in real time',
    body: 'Live dashboards for DST changes, leap seconds & market hours.',
    cta: 'View platform',
    accent: 'from-amber-500 to-orange-700',
    badge: 'Sponsored',
  },
  {
    brand: 'MetroLink Travel',
    tagline: 'Never miss a connection',
    body: 'Flight + rail schedules mapped to local clocks worldwide.',
    cta: 'Plan a trip',
    accent: 'from-rose-600 to-pink-700',
    badge: 'Sponsored',
  },
  {
    brand: 'TimeGovern Media',
    tagline: 'Advertise to planners who mean business',
    body: 'Header, sticky rail & in-feed inventory on timegovern.com.',
    cta: 'Get rate card',
    accent: 'from-indigo-600 to-slate-800',
    badge: 'House',
  },
] as const;

const SLOT_META: Record<
  AdSlotId,
  {
    label: string;
    sizeLabel: string;
    width: number;
    height: number;
    houseCta: string;
    adFormat: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  }
> = {
  tg_header: {
    label: 'Header leaderboard',
    sizeLabel: '970x90 / 728x90',
    width: 970,
    height: 90,
    houseCta: 'Book header',
    adFormat: 'horizontal',
  },
  tg_rail_sticky: {
    label: 'Sticky sidebar (premium)',
    sizeLabel: '300x600',
    width: 300,
    height: 600,
    houseCta: 'Book sticky rail',
    adFormat: 'vertical',
  },
  tg_infeed: {
    label: 'In-feed native',
    sizeLabel: '300x250 / fluid',
    width: 300,
    height: 250,
    houseCta: 'Request rates',
    adFormat: 'rectangle',
  },
  tg_footer: {
    label: 'Footer board',
    sizeLabel: '728x90',
    width: 728,
    height: 90,
    houseCta: 'Advertise here',
    adFormat: 'horizontal',
  },
  tg_mobile_anchor: {
    label: 'Mobile anchor',
    sizeLabel: '320x50 / 320x100',
    width: 320,
    height: 100,
    houseCta: 'Book mobile',
    adFormat: 'horizontal',
  },
  tg_rectangle: {
    label: 'Medium rectangle',
    sizeLabel: '300x250',
    width: 300,
    height: 250,
    houseCta: 'Advertise here',
    adFormat: 'rectangle',
  },
};

function useRotatingDemo(intervalMs = 7000) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % DEMO_ADS.length);
        setFade(true);
      }, 280);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return { ad: DEMO_ADS[index], fade, index };
}

const DemoChrome: React.FC<{ sizeLabel: string; onHide?: () => void }> = ({ sizeLabel, onHide }) => (
  <div className="flex items-center justify-between px-2.5 py-1 border-b border-slate-700/80 bg-slate-950/70">
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Advertisement</span>
      <span className="text-[8px] font-semibold uppercase tracking-wide text-amber-400/90 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded">
        Demo
      </span>
    </div>
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-mono text-slate-500">{sizeLabel}</span>
      {onHide && (
        <button type="button" onClick={onHide} className="text-slate-500 hover:text-slate-300 p-0.5" title="Hide this ad" aria-label="Hide advertisement">
          <EyeOff className="w-3 h-3" />
        </button>
      )}
    </div>
  </div>
);

const DemoHorizontal: React.FC<{
  sizeLabel: string;
  compact?: boolean;
  onCta: () => void;
  onHide?: () => void;
}> = ({ sizeLabel, compact, onCta, onHide }) => {
  const { ad, fade } = useRotatingDemo(6500);
  return (
    <div className="rounded-xl border border-slate-600/50 bg-slate-950 overflow-hidden shadow-md">
      <DemoChrome sizeLabel={sizeLabel} onHide={onHide} />
      <div className={`relative overflow-hidden transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'} bg-gradient-to-r ${ad.accent}`}>
        <div className={`flex items-center gap-3 ${compact ? 'px-3 py-2.5' : 'px-4 py-3'}`}>
          <div className="w-10 h-10 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0 text-white">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
              {ad.badge} · {ad.brand}
            </p>
            <p className={`font-semibold leading-snug truncate ${compact ? 'text-xs' : 'text-sm sm:text-base'}`}>{ad.tagline}</p>
            {!compact && <p className="text-[11px] text-white/75 truncate hidden sm:block">{ad.body}</p>}
          </div>
          <button type="button" onClick={onCta} className="shrink-0 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-[10px] font-bold hover:bg-white/90">
            {ad.cta}
          </button>
        </div>
        <div className="h-0.5 bg-black/20 overflow-hidden">
          <div className="h-full bg-white/50 origin-left animate-[tgAdProgress_6.5s_linear_infinite]" style={{ width: '100%' }} />
        </div>
      </div>
      <style>{`
        @keyframes tgAdProgress {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

const DemoVertical: React.FC<{
  sizeLabel: string;
  tall?: boolean;
  onCta: () => void;
  onHide?: () => void;
}> = ({ sizeLabel, tall, onCta, onHide }) => {
  const { ad, fade, index } = useRotatingDemo(7500);
  return (
    <div
      className="rounded-xl border border-slate-600/50 bg-slate-900 shadow-md overflow-hidden flex flex-col h-full"
      style={tall ? { width: 300, height: 600, minHeight: 600 } : undefined}
    >
      <DemoChrome sizeLabel={sizeLabel} onHide={onHide} />
      <div className={`flex-1 flex flex-col transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b ${ad.accent}`}>
        <div className="flex-1 flex flex-col items-center justify-center p-5 text-center gap-3 text-white">
          <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center">
            <Megaphone className="w-8 h-8 text-white" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-white/80">
            {ad.badge} · {ad.brand}
          </p>
          <p className="text-base font-bold leading-snug px-1">{ad.tagline}</p>
          <p className="text-[12px] text-white/80 leading-relaxed">{ad.body}</p>
          <button type="button" onClick={onCta} className="mt-2 w-full max-w-[220px] px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-white/90 shadow-lg">
            {ad.cta} <ExternalLink className="w-3.5 h-3.5 inline ml-1" />
          </button>
        </div>
        <div className="px-3 py-2 flex items-center justify-between bg-black/25 text-[9px] text-white/60">
          <span>
            Demo {index + 1}/{DEMO_ADS.length} · rotates live
          </span>
          <span>Not a real advertiser</span>
        </div>
      </div>
    </div>
  );
};

export const AdSlot: React.FC<AdSlotProps> = ({ slotId, className = '', persistent = false }) => {
  const [hidden, setHidden] = useState(false);
  const meta = SLOT_META[slotId];
  if (!meta || (hidden && !persistent)) return null;

  const goAdvertise = () => {
    window.dispatchEvent(new CustomEvent('tg-open-advertise'));
  };

  if (canRenderLiveAd(slotId)) {
    if (slotId === 'tg_rail_sticky') {
      return (
        <aside className={`hidden xl:flex w-[300px] shrink-0 flex-col ${className}`} aria-label="Advertisement">
          <div
            className="sticky top-20 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900"
            style={{ width: 300, height: 600, minHeight: 600 }}
          >
            <div className="px-2 py-1 text-[9px] font-bold uppercase text-slate-500 border-b border-slate-200 dark:border-slate-800">Advertising</div>
            <AdSenseUnit slotId={slotId} format={meta.adFormat} minHeight={580} className="p-1" />
          </div>
        </aside>
      );
    }
    if (slotId === 'tg_mobile_anchor') {
      return (
        <div className={`fixed bottom-0 inset-x-0 z-40 md:hidden border-t bg-white/95 dark:bg-slate-950/95 backdrop-blur-md ${className}`}>
          <div className="max-w-lg mx-auto">
            <AdSenseUnit slotId={slotId} format={meta.adFormat} minHeight={50} />
          </div>
        </div>
      );
    }
    return (
      <div className={className}>
        <AdSenseUnit slotId={slotId} format={meta.adFormat} minHeight={meta.height} />
      </div>
    );
  }

  if (slotId === 'tg_rail_sticky') {
    return (
      <aside className={`hidden xl:flex w-[300px] shrink-0 flex-col ${className}`} data-ad-slot={slotId} aria-label={`Advertisement ${meta.sizeLabel}`}>
        <div className="sticky top-20" style={{ width: 300, height: 600, minHeight: 600 }}>
          <DemoVertical sizeLabel={meta.sizeLabel} tall onCta={goAdvertise} onHide={() => setHidden(true)} />
        </div>
      </aside>
    );
  }

  if (slotId === 'tg_header' || slotId === 'tg_footer') {
    return (
      <div className={`w-full ${className}`} data-ad-slot={slotId} aria-label={`Advertisement ${meta.sizeLabel}`}>
        <DemoHorizontal sizeLabel={meta.sizeLabel} onCta={goAdvertise} onHide={() => setHidden(true)} />
      </div>
    );
  }

  if (slotId === 'tg_mobile_anchor') {
    return (
      <div className={`fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-slate-700 bg-slate-950 ${className}`} data-ad-slot={slotId}>
        <div className="max-w-lg mx-auto">
          <DemoHorizontal sizeLabel={meta.sizeLabel} compact onCta={goAdvertise} onHide={() => setHidden(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className={`my-4 ${className}`} data-ad-slot={slotId} aria-label={`Advertisement ${meta.sizeLabel}`}>
      <div className="max-w-[300px] mx-auto" style={{ minHeight: meta.height }}>
        <DemoVertical sizeLabel={meta.sizeLabel} onCta={goAdvertise} onHide={() => setHidden(true)} />
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
