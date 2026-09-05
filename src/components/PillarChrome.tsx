/**
 * Section chrome: accent rail + badge + H1 + one-line subtitle (P1-1 moderate template).
 * Visual only — does not change pillar logic.
 */
import React from 'react';
import {
  Clock, Calendar, Sun, CloudRain, Timer, Activity, Code, Layers,
  Newspaper, Calculator, Building2, Phone,
} from 'lucide-react';

export type PillarId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface Accent {
  label: string;
  title: string;
  subtitle: string;
  Icon: React.ElementType;
  rail: string;
  chip: string;
  glow: string;
}

const ACCENTS: Record<PillarId, Accent> = {
  1: {
    label: 'World Clock',
    title: 'World clock',
    subtitle: 'Live local times, pinned cities, and meeting-friendly overlaps.',
    Icon: Clock,
    rail: 'from-indigo-500 via-indigo-400 to-cyan-400',
    chip: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-500/20 dark:text-indigo-100 dark:border-indigo-400/40',
    glow: 'shadow-indigo-500/10',
  },
  2: {
    label: 'Calendar',
    title: 'Date calculators',
    subtitle: 'Days, weeks, and working days between dates — plus calendars and countdowns.',
    Icon: Calendar,
    rail: 'from-violet-500 via-purple-400 to-fuchsia-400',
    chip: 'bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-500/20 dark:text-violet-100 dark:border-violet-400/40',
    glow: 'shadow-violet-500/10',
  },
  3: {
    label: 'Sun & Moon',
    title: 'Sun and moon',
    subtitle: 'Sunrise, sunset, and moon data for your selected city.',
    Icon: Sun,
    rail: 'from-amber-500 via-orange-400 to-yellow-400',
    chip: 'bg-amber-100 text-amber-950 border-amber-300 dark:bg-amber-500/20 dark:text-amber-100 dark:border-amber-400/40',
    glow: 'shadow-amber-500/10',
  },
  4: {
    label: 'Weather',
    title: 'Weather',
    subtitle: 'Conditions and forecast for the city you are viewing.',
    Icon: CloudRain,
    rail: 'from-sky-500 via-blue-400 to-cyan-400',
    chip: 'bg-sky-100 text-sky-950 border-sky-300 dark:bg-sky-500/20 dark:text-sky-100 dark:border-sky-400/40',
    glow: 'shadow-sky-500/10',
  },
  5: {
    label: 'Timers',
    title: 'Timers',
    subtitle: 'Alarms, stopwatch, and countdowns in your browser.',
    Icon: Timer,
    rail: 'from-rose-500 via-pink-400 to-orange-400',
    chip: 'bg-rose-100 text-rose-950 border-rose-300 dark:bg-rose-500/20 dark:text-rose-100 dark:border-rose-400/40',
    glow: 'shadow-rose-500/10',
  },
  6: {
    label: 'Live Data',
    title: 'Live data',
    subtitle: 'World counters and trends — illustrative models, updated continuously.',
    Icon: Activity,
    rail: 'from-emerald-500 via-green-400 to-teal-400',
    chip: 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-100 dark:border-emerald-400/40',
    glow: 'shadow-emerald-500/10',
  },
  7: {
    label: 'Widgets',
    title: 'Widgets',
    subtitle: 'Embeddable clocks and tools for your own site or dashboard.',
    Icon: Code,
    rail: 'from-slate-500 via-slate-400 to-zinc-400',
    chip: 'bg-slate-200 text-slate-900 border-slate-400 dark:bg-slate-500/25 dark:text-slate-100 dark:border-slate-400/40',
    glow: 'shadow-slate-500/10',
  },
  8: {
    label: 'API',
    title: 'API and services',
    subtitle: 'Time data and service options for developers and teams.',
    Icon: Layers,
    rail: 'from-blue-600 via-indigo-500 to-blue-400',
    chip: 'bg-blue-100 text-blue-950 border-blue-300 dark:bg-blue-500/20 dark:text-blue-100 dark:border-blue-400/40',
    glow: 'shadow-blue-500/10',
  },
  9: {
    label: 'News',
    title: 'News',
    subtitle: 'Time zones, daylight saving, astronomy, and world headlines.',
    Icon: Newspaper,
    rail: 'from-orange-500 via-amber-400 to-red-400',
    chip: 'bg-orange-100 text-orange-950 border-orange-300 dark:bg-orange-500/20 dark:text-orange-100 dark:border-orange-400/40',
    glow: 'shadow-orange-500/10',
  },
  10: {
    label: 'Calculators',
    title: 'Calculators',
    subtitle: 'Pay, time, ICT, and science tools — not formal tax or legal advice.',
    Icon: Calculator,
    rail: 'from-teal-500 via-cyan-400 to-emerald-400',
    chip: 'bg-teal-100 text-teal-950 border-teal-300 dark:bg-teal-500/20 dark:text-teal-100 dark:border-teal-400/40',
    glow: 'shadow-teal-500/10',
  },
  11: {
    label: 'Company',
    title: 'Company',
    subtitle: 'About TimeGovern, contact, legal, trust, and careers.',
    Icon: Building2, Phone,
    rail: 'from-indigo-400 via-slate-400 to-indigo-300',
    chip: 'bg-indigo-100 text-indigo-950 border-indigo-300 dark:bg-indigo-500/15 dark:text-slate-100 dark:border-indigo-400/30',
    glow: 'shadow-indigo-500/10',
  },
  12: {
    label: 'Country codes',
    title: 'Country calling codes',
    subtitle: 'International dial codes and ISO country codes — search by name, +code, or ISO.',
    Icon: Phone,
    rail: 'from-emerald-500 via-teal-400 to-cyan-400',
    chip: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-100 dark:border-emerald-400/40',
    glow: 'shadow-emerald-500/10',
  },
};

interface PillarChromeProps {
  pillarId: PillarId;
  children: React.ReactNode;
  hideChip?: boolean;
  hideHeader?: boolean;
}

export const PillarChrome: React.FC<PillarChromeProps> = ({
  pillarId,
  children,
  hideChip = false,
  hideHeader = false,
}) => {
  const a = ACCENTS[pillarId];
  const Icon = a.Icon;

  return (
    <div className={`relative rounded-2xl ${a.glow}`} data-pillar={pillarId}>
      <div
        className={`absolute left-0 top-2 bottom-2 w-1 sm:w-1.5 rounded-full bg-gradient-to-b ${a.rail} opacity-90 z-10`}
        aria-hidden
      />
      <div
        className={`absolute left-3 right-0 top-0 h-px bg-gradient-to-r ${a.rail} opacity-40`}
        aria-hidden
      />

      {!hideHeader && (
        <div className="pl-3 sm:pl-4 mb-3 space-y-1.5">
          {!hideChip && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide border ${a.chip}`}
            >
              <Icon className="w-3 h-3" />
              {a.label}
            </span>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {a.title}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            {a.subtitle}
          </p>
        </div>
      )}

      <div className="pl-2 sm:pl-3">{children}</div>
    </div>
  );
};

export default PillarChrome;

