import React, { useMemo } from 'react';
import { City } from '../types';
import { formatCityDateTime, getHourSuitability } from '../lib/timezoneUtils';
import { getSyncedNow } from '../lib/timeDrift';

interface MeetingHourStripProps {
  cities: City[];
  selectedUtcHour?: number | null;
  onSelectUtcHour?: (hour: number) => void;
}

/** WTB-style horizontal hour strip (WC3). */
export function MeetingHourStrip({ cities, selectedUtcHour, onSelectUtcHour }: MeetingHourStripProps) {
  const now = getSyncedNow();
  const baseUtcHour = now.getUTCHours();
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => (baseUtcHour + i) % 24), [baseUtcHour]);

  if (!cities.length) {
    return (
      <p className="text-xs text-slate-500 p-3 border rounded-xl">Add at least one city to see the hour strip.</p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Meeting hour strip</h3>
        <p className="text-[10px] text-slate-500">Green = work · Amber = shoulder · Red = sleep · Click column</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <table className="text-[10px] font-mono border-collapse min-w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/80">
              <th className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-800 p-2 text-left min-w-[100px]">City</th>
              {hours.map((h) => (
                <th key={h} className="p-1 text-center min-w-[36px] font-semibold text-slate-500">
                  {String(h).padStart(2, '0')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-t border-slate-100 dark:border-slate-800">
                <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 p-2 font-sans font-semibold text-slate-800 dark:text-slate-100">
                  {city.name}
                </td>
                {hours.map((utcH) => {
                  const d = new Date(now);
                  d.setUTCHours(utcH, 0, 0, 0);
                  const { hour24 } = formatCityDateTime(d, city.timezone, false, false);
                  const suit = getHourSuitability(hour24);
                  const bg =
                    suit === 'WORK_HOURS'
                      ? 'bg-emerald-500/80 text-white'
                      : suit === 'SHOULDER_HOURS'
                        ? 'bg-amber-400/80 text-slate-900'
                        : 'bg-rose-500/50 text-white';
                  const selected = selectedUtcHour === utcH;
                  return (
                    <td key={`${city.id}-${utcH}`} className="p-0.5">
                      <button
                        type="button"
                        title={`${city.name} ~${hour24}:00 (${suit})`}
                        onClick={() => onSelectUtcHour?.(utcH)}
                        className={`w-full h-8 rounded ${bg} ${selected ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-90 hover:opacity-100'}`}
                      >
                        {hour24}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MeetingHourStrip;
