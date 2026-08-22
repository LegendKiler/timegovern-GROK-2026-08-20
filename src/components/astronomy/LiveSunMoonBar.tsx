/**
 * LIVE strip — altitude/azimuth, countdown, polar badge (AS4), follows city (AS5).
 */
import React from 'react';
import { Sun, Moon, Radio, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { City } from '../../types';
import {
  liveSunMoonBundle,
  formatCountdown,
  formatDayLength,
  azimuthToCompass,
  polarBadgeLabel,
} from '../../lib/liveAstronomy';

interface LiveSunMoonBarProps {
  city: City;
  now: Date;
  synced?: boolean;
}

export const LiveSunMoonBar: React.FC<LiveSunMoonBarProps> = ({ city, now, synced = false }) => {
  const { sun, moon, nextSun, nextMoon, dayDeltaMin, polar, polarNote, moonPos } = liveSunMoonBundle(
    city.lat,
    city.lng,
    now
  );
  const elev = sun.solarElevation;
  const isUp = elev > -0.833;
  const polarLabel = polarBadgeLabel(polar);

  return (
    <div className="rounded-2xl border border-amber-500/30 dark:border-amber-500/20 bg-gradient-to-r from-amber-50/90 via-white to-indigo-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 p-4 shadow-sm space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <Radio className="w-3 h-3 animate-pulse" />
            LIVE · 1s
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {city.name} · {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
            {synced ? ' · clock synced' : ''}
          </span>
          {polarLabel && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                polar === 'polar_day'
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100'
                  : 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/50 dark:text-indigo-100'
              }`}
              title={polarNote || ''}
            >
              <AlertTriangle className="w-3 h-3" />
              {polarLabel}
            </span>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-400">
          {now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {polarNote && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/50 rounded-lg px-3 py-2">
          {polarNote}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-white/70 dark:bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300 mb-1">
            <Sun className="w-4 h-4" /> Sun now
          </div>
          <p className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">{elev.toFixed(1)}° alt</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Az {sun.solarAzimuth.toFixed(0)}° ({azimuthToCompass(sun.solarAzimuth)}) ·{' '}
            {isUp ? 'Above horizon' : 'Below horizon'}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 mb-1">
            <ArrowUpRight className="w-4 h-4 text-blue-500" /> Next sun event
          </div>
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{nextSun.label}</p>
          <p className="text-[11px] font-mono text-blue-600 dark:text-cyan-400">
            {formatCountdown(nextSun.msUntil)}
            {nextSun.at && (
              <span className="text-slate-400 ml-1">
                ({nextSun.at.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })})
              </span>
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/50 p-3">
          <div className="font-bold text-slate-700 dark:text-slate-200 mb-1">Day length</div>
          <p className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">
            {formatDayLength(sun.dayLengthMinutes || 0)}
          </p>
          <p className="text-[11px] text-slate-500">
            {dayDeltaMin == null
              ? 'vs yesterday: —'
              : dayDeltaMin >= 0
                ? `+${dayDeltaMin.toFixed(1)} min vs yesterday`
                : `${dayDeltaMin.toFixed(1)} min vs yesterday`}
          </p>
        </div>

        <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-800/40 bg-white/70 dark:bg-slate-950/50 p-3">
          <div className="flex items-center gap-1.5 font-bold text-indigo-700 dark:text-indigo-300 mb-1">
            <Moon className="w-4 h-4" /> Moon
          </div>
          <p className="text-sm font-extrabold text-slate-900 dark:text-white">{moon.phaseName}</p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            {moon.illuminationPercent.toFixed(0)}% lit · alt {moonPos.altitude.toFixed(1)}°
          </p>
          <p className="text-[11px] font-mono text-indigo-600 dark:text-indigo-300 mt-0.5">
            Next: {nextMoon.label} {nextMoon.kind !== 'none' ? formatCountdown(nextMoon.msUntil) : '—'}
          </p>
        </div>
      </div>
    </div>
  );
};
