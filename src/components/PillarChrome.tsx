/**
 * B — Section accent chrome: left rail + identity chip per pillar.
 * Visual only; does not change pillar logic.
 */
import React from 'react';
import {
  Clock, Calendar, Sun, CloudRain, Timer, Activity, Code, Layers,
  Newspaper, Calculator, Building2,
} from 'lucide-react';

export type PillarId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

interface Accent {
  label: string;
  Icon: React.ElementType;
  /** Tailwind gradient for left rail */
  rail: string;
  /** Chip classes */
  chip: string;
  /** Soft top edge glow */
  glow: string;
}

const ACCENTS: Record<PillarId, Accent> = {
  1: {
    label: 'World Clock',
    Icon: Clock,
    rail: 'from-indigo-500 via-indigo-400 to-cyan-400',
    chip: 'bg-indigo-500/15 text-indigo-200 border-indigo-400/35',
    glow: 'shadow-indigo-500/10',
  },
  2: {
    label: 'Calendar',
    Icon: Calendar,
    rail: 'from-violet-500 via-purple-400 to-fuchsia-400',
    chip: 'bg-violet-500/15 text-violet-200 border-violet-400/35',
    glow: 'shadow-violet-500/10',
  },
  3: {
    label: 'Sun & Moon',
    Icon: Sun,
    rail: 'from-amber-500 via-orange-400 to-yellow-400',
    chip: 'bg-amber-500/15 text-amber-200 border-amber-400/35',
    glow: 'shadow-amber-500/10',
  },
  4: {
    label: 'Weather',
    Icon: CloudRain,
    rail: 'from-sky-500 via-blue-400 to-cyan-400',
    chip: 'bg-sky-500/15 text-sky-200 border-sky-400/35',
    glow: 'shadow-sky-500/10',
  },
  5: {
    label: 'Timers',
    Icon: Timer,
    rail: 'from-rose-500 via-pink-400 to-orange-400',
    chip: 'bg-rose-500/15 text-rose-200 border-rose-400/35',
    glow: 'shadow-rose-500/10',
  },
  6: {
    label: 'Live Data',
    Icon: Activity,
    rail: 'from-emerald-500 via-green-400 to-teal-400',
    chip: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/35',
    glow: 'shadow-emerald-500/10',
  },
  7: {
    label: 'Widgets',
    Icon: Code,
    rail: 'from-slate-400 via-slate-300 to-zinc-400',
    chip: 'bg-slate-500/20 text-slate-200 border-slate-400/35',
    glow: 'shadow-slate-500/10',
  },
  8: {
    label: 'API',
    Icon: Layers,
    rail: 'from-blue-600 via-indigo-500 to-blue-400',
    chip: 'bg-blue-500/15 text-blue-200 border-blue-400/35',
    glow: 'shadow-blue-500/10',
  },
  9: {
    label: 'News',
    Icon: Newspaper,
    rail: 'from-orange-500 via-amber-400 to-red-400',
    chip: 'bg-orange-500/15 text-orange-200 border-orange-400/35',
    glow: 'shadow-orange-500/10',
  },
  10: {
    label: 'Calculators',
    Icon: Calculator,
    rail: 'from-teal-500 via-cyan-400 to-emerald-400',
    chip: 'bg-teal-500/15 text-teal-200 border-teal-400/35',
    glow: 'shadow-teal-500/10',
  },
  11: {
    label: 'Company',
    Icon: Building2,
    rail: 'from-indigo-400 via-slate-400 to-indigo-300',
    chip: 'bg-indigo-500/10 text-slate-200 border-indigo-400/25',
    glow: 'shadow-indigo-500/10',
  },
};

interface PillarChromeProps {
  pillarId: PillarId;
  children: React.ReactNode;
  /** Hide the small identity chip (optional) */
  hideChip?: boolean;
}

export const PillarChrome: React.FC<PillarChromeProps> = ({
  pillarId,
  children,
  hideChip = false,
}) => {
  const a = ACCENTS[pillarId];
  const Icon = a.Icon;

  return (
    <div className={`relative rounded-2xl ${a.glow}`} data-pillar={pillarId}>
      {/* Left accent rail */}
      <div
        className={`absolute left-0 top-2 bottom-2 w-1 sm:w-1.5 rounded-full bg-gradient-to-b ${a.rail} opacity-90 z-10`}
        aria-hidden
      />
      {/* Soft top accent line */}
      <div
        className={`absolute left-3 right-0 top-0 h-px bg-gradient-to-r ${a.rail} opacity-40`}
        aria-hidden
      />

      {!hideChip && (
        <div className="pl-3 sm:pl-4 mb-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${a.chip}`}
          >
            <Icon className="w-3 h-3" />
            {a.label}
          </span>
        </div>
      )}

      <div className="pl-2 sm:pl-3">{children}</div>
    </div>
  );
};

export default PillarChrome;
