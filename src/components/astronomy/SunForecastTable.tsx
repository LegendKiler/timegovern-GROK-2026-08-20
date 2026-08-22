/** AS2 — 7 / 14 day sunrise & sunset table */
import React, { useMemo, useState } from 'react';
import { CalendarRange, Sunrise, Sunset } from 'lucide-react';
import { City } from '../../types';
import {
  buildSunForecastTable,
  formatDayLength,
  formatLocalTime,
  polarBadgeLabel,
} from '../../lib/liveAstronomy';

interface SunForecastTableProps {
  city: City;
  fromDate: Date;
}

export const SunForecastTable: React.FC<SunForecastTableProps> = ({ city, fromDate }) => {
  const [days, setDays] = useState<7 | 14>(14);
  const rows = useMemo(
    () => buildSunForecastTable(city.lat, city.lng, fromDate, days),
    [city.lat, city.lng, fromDate, days]
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
          <CalendarRange className="w-4 h-4 text-amber-500" />
          Sunrise & sunset — next {days} days
          <span className="text-[10px] font-normal text-slate-500">({city.name})</span>
        </div>
        <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setDays(7)}
            className={`px-3 py-1.5 ${days === 7 ? 'bg-amber-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
          >
            7 days
          </button>
          <button
            type="button"
            onClick={() => setDays(14)}
            className={`px-3 py-1.5 ${days === 14 ? 'bg-amber-500 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-600'}`}
          >
            14 days
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-3 py-2">Date</th>
              <th className="px-3 py-2">
                <span className="inline-flex items-center gap-1">
                  <Sunrise className="w-3 h-3" /> Rise
                </span>
              </th>
              <th className="px-3 py-2">Noon</th>
              <th className="px-3 py-2">
                <span className="inline-flex items-center gap-1">
                  <Sunset className="w-3 h-3" /> Set
                </span>
              </th>
              <th className="px-3 py-2">Length</th>
              <th className="px-3 py-2">Δ day</th>
              <th className="px-3 py-2">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((r) => (
              <tr
                key={r.date.toISOString()}
                className={r.isToday ? 'bg-amber-50/80 dark:bg-amber-950/20' : 'bg-white dark:bg-slate-900'}
              >
                <td className="px-3 py-2 font-semibold whitespace-nowrap">
                  {r.weekday} {r.dateLabel}
                  {r.isToday && (
                    <span className="ml-1 text-[9px] uppercase text-amber-600 font-bold">Today</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono">{formatLocalTime(r.sunrise)}</td>
                <td className="px-3 py-2 font-mono text-slate-500">{formatLocalTime(r.solarNoon)}</td>
                <td className="px-3 py-2 font-mono">{formatLocalTime(r.sunset)}</td>
                <td className="px-3 py-2 font-mono">{formatDayLength(r.dayLengthMinutes)}</td>
                <td className="px-3 py-2 font-mono text-slate-500">
                  {r.dayDeltaMin == null
                    ? '—'
                    : r.dayDeltaMin >= 0
                      ? `+${r.dayDeltaMin.toFixed(1)}m`
                      : `${r.dayDeltaMin.toFixed(1)}m`}
                </td>
                <td className="px-3 py-2">
                  {polarBadgeLabel(r.polar) ? (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        r.polar === 'polar_day'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                          : r.polar === 'polar_night'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                      }`}
                      title={r.polarNote || ''}
                    >
                      {polarBadgeLabel(r.polar)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-4 py-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
        Computed client-side (Meeus/NOAA-style). Times in your browser local zone for the selected coordinates.
      </p>
    </div>
  );
};
