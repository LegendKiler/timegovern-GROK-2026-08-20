import React from 'react';
import { Clock, Radio } from 'lucide-react';

const PILLAR_NAMES: Record<number, { name: string; tag: string; description: string }> = {
  1: { name: 'World Clock & Time Zones', tag: 'TEMPORAL ENGINE', description: 'Synchronizing global atomic clocks, interactive globe & cities...' },
  2: { name: 'Interactive Calendars & Holidays', tag: 'CALENDAR EPHEMERIS', description: 'Generating calendars, holidays & templates...' },
  3: { name: 'Sun, Moon & Astronomy', tag: 'ASTRONOMICAL ENGINE', description: 'Celestial coordinates, solar horizons & lunar phases...' },
  4: { name: 'Global Meteorology & Weather', tag: 'RADAR & FORECAST', description: 'Atmospheric feeds & forecast models...' },
  5: { name: 'Timers, Stopwatches & Countdowns', tag: 'CHRONOMETRY', description: 'Precision timers, sounds & lap logs...' },
  6: { name: 'Global Real-Time Worldometers', tag: 'LIVE TELEMETRY', description: 'Demographic & energy style counters...' },
  7: { name: 'Embeddable Widgets & API Hub', tag: 'EDGE INTEGRATIONS', description: 'Widgets & embed runtimes...' },
  8: { name: 'Enterprise Services & Cloudflare Edge', tag: 'ENTERPRISE SUITE', description: 'Edge routes & commercial APIs...' },
  9: { name: 'Temporal Gazette & Global News', tag: 'NEWS FEED', description: 'Time, space & policy dispatches...' },
  10: { name: 'Time, Date & Currency Calculators', tag: 'CALCULATION ENGINE', description: 'Duration, business days & pay tools...' },
  11: { name: 'Company, Infrastructure & Operations', tag: 'SYSTEM ARCHITECTURE', description: 'About, trust & operations...' },
};

interface PillarLoaderProps {
  pillarNumber: number;
  isDarkMode?: boolean;
  pillarName?: string;
}

export const PillarLoader: React.FC<PillarLoaderProps> = ({ pillarNumber, isDarkMode, pillarName }) => {
  const currentPillarInfo =
    PILLAR_NAMES[pillarNumber] ||
    { name: pillarName || 'TimeGovern Module', tag: 'ENGINE', description: 'Loading module...' };

  return (
    <div className={`w-full rounded-2xl border p-6 ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shrink-0 relative">
            <Clock className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                {currentPillarInfo.tag}
              </span>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                Loading
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {currentPillarInfo.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{currentPillarInfo.description}</p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2 text-right shrink-0">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Atomic Standard</div>
          <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            UTC (NIST / BIPM)
          </div>
        </div>
      </div>
      <div className="mt-5 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 animate-pulse" />
      </div>
    </div>
  );
};
