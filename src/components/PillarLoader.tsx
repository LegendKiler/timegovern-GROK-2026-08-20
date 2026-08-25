import React from 'react';

/** Loading copy for each pillar — product language only (no hosting vendor names). */
const PILLAR_LOADERS: Record<
  number,
  { name: string; tag: string; description: string }
> = {
  1: { name: 'World Clock', tag: 'LIVE TIME', description: 'Synchronising cities, offsets and meeting planner…' },
  2: { name: 'Calendar', tag: 'DATES', description: 'Loading calendars, holidays and schedule tools…' },
  3: { name: 'Sun & Moon', tag: 'ASTRONOMY', description: 'Computing sunrise, sunset and lunar data…' },
  4: { name: 'Weather', tag: 'FORECAST', description: 'Fetching regional weather context…' },
  5: { name: 'Timers', tag: 'CLOCKS', description: 'Preparing alarms, stopwatch and countdown…' },
  7: { name: 'Widgets', tag: 'EMBED', description: 'Loading embeddable clock and calendar widgets…' },
  9: { name: 'News', tag: 'HEADLINES', description: 'Refreshing time-related and world headlines…' },
  10: { name: 'Calculators', tag: 'TOOLS', description: 'Loading pay, workday and science calculators…' },
  11: { name: 'Company', tag: 'ABOUT', description: 'Opening company, legal and trust information…' },
  8: { name: 'Enterprise Services', tag: 'ENTERPRISE SUITE', description: 'Commercial APIs & account services…' },
};

type Props = { pillar?: number; label?: string };

export const PillarLoader: React.FC<Props> = ({ pillar = 1, label }) => {
  const meta = PILLAR_LOADERS[pillar] || PILLAR_LOADERS[1];
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin mb-4" />
      <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">{meta.tag}</p>
      <p className="text-sm font-semibold text-slate-100 mt-1">{label || meta.name}</p>
      <p className="text-xs text-slate-400 mt-1 max-w-sm">{meta.description}</p>
    </div>
  );
};

export default PillarLoader;
