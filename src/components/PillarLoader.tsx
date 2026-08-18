import React from 'react';
import { Clock, Radio, Activity, Sparkles, Cpu } from 'lucide-react';

interface PillarLoaderProps {
  pillarName?: string;
  pillarNumber?: number;
  isDarkMode?: boolean;
}

const PILLAR_NAMES: Record<number, { name: string; tag: string; description: string }> = {
  1: { name: 'World Clock & Time Zones', tag: 'TEMPORAL ENGINE', description: 'Synchronizing global atomic clocks, interactive globe & 142,000+ cities...' },
  2: { name: 'Interactive Calendars & Holidays', tag: 'CALENDAR EPHEMERIS', description: 'Generating astronomical leap-year models, multi-faith holidays & PDF templates...' },
  3: { name: 'Sun, Moon & Astronomy', tag: 'ASTRONOMICAL ENGINE', description: 'Computing real-time celestial coordinates, solar horizons & lunar phases...' },
  4: { name: 'Global Meteorology & Weather', tag: 'RADAR & FORECAST', description: 'Connecting high-resolution atmospheric sensor feeds & satellite models...' },
  5: { name: 'Timers, Stopwatches & Countdowns', tag: 'CHRONOMETRY', description: 'Calibrating microsecond precision timers, sound synthesizers & lap logs...' },
  6: { name: 'Global Real-Time Worldometers', tag: 'LIVE TELEMETRY', description: 'Stream-calculating real-time demographic, carbon & energy algorithms...' },
  7: { name: 'Embeddable Widgets & API Hub', tag: 'EDGE INTEGRATIONS', description: 'Compiling responsive iframe widgets & JavaScript embed runtimes...' },
  8: { name: 'Enterprise Services & Cloudflare Edge', tag: 'ENTERPRISE SUITE', description: 'Establishing sub-millisecond edge routes & commercial API endpoints...' },
  9: { name: 'Temporal Gazette & Global News', tag: 'NEWS FEED', description: 'Curating authoritative international time zone & leap-second dispatches...' },
  10: { name: 'Time, Date & Currency Calculators', tag: 'CALCULATION ENGINE', description: 'Loading exact duration algorithms, business day arithmetic & currency matrices...' },
  11: { name: 'Company, Infrastructure & Operations', tag: 'SYSTEM ARCHITECTURE', description: 'Loading infrastructure topology, edge CDN status & compliance logs...' },
};

export const PillarLoader: React.FC<PillarLoaderProps> = ({ pillarNumber = 1, pillarName, isDarkMode = false }) => {
  const currentPillarInfo = pillarNumber && PILLAR_NAMES[pillarNumber] 
    ? PILLAR_NAMES[pillarNumber] 
    : { name: pillarName || 'TimeGovern Module', tag: 'SWISS QUARTZ ENGINE', description: 'Loading high-precision module and telemetry feeds...' };

  return (
    <div 
      className="w-full animate-fadeIn transition-all duration-300 py-4"
      role="status" 
      aria-label={`Loading ${currentPillarInfo.name}`}
    >
      {/* Swiss-Quartz High-Precision Skeleton Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs mb-6 relative overflow-hidden">
        {/* Shimmer Sweep Animation Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/[0.04] dark:via-blue-400/[0.05] to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Quartz Oscillation Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 relative">
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
                  Pillar {pillarNumber}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>{currentPillarInfo.name}</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <span>{currentPillarInfo.description}</span>
              </p>
            </div>
          </div>

          {/* Swiss-Quartz Telemetry Badge */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl px-4 py-2 text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500">Atomic Standard</div>
              <div className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-end gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                UTC (NIST / BIPM)
              </div>
            </div>
          </div>
        </div>

        {/* Micro-Progress Loading Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-2">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden relative">
            <div className="h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 rounded-full w-2/5 animate-[indeterminate_1.5s_infinite_linear]" />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-500 animate-pulse" />
              Compiling Edge Chunk & Telemetry Nodes...
            </span>
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Sub-Millisecond Edge Resolution</span>
          </div>
        </div>
      </div>

      {/* Primary Content Skeleton Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {[1, 2, 3].map((idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/30 dark:via-slate-700/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <div className="flex items-center justify-between">
              <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
              <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800/80 rounded-full animate-pulse" />
            </div>
            <div className="h-10 w-3/4 bg-slate-200/80 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
              <div className="h-3 w-2/3 bg-slate-100 dark:bg-slate-800/60 rounded-md animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Table / Layout Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-4">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-200/20 dark:via-slate-700/10 to-transparent -translate-x-full animate-[shimmer_2.2s_infinite]" />
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-between gap-4 py-2 border-b border-slate-50 dark:border-slate-800/40">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 w-1/3 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  <div className="h-2.5 w-1/4 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse" />
                </div>
              </div>
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              <div className="h-6 w-16 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
