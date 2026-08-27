/**
 * LIVE strip — altitude/azimuth, countdown, polar badge (AS4), follows city (AS5).
 * C — sun day-arc graphic.
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
import { getMemberEntitlements, formatMemberTime } from '../../lib/memberEntitlements';
import { SunDayArc } from './SunDayArc';

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
  const precise = getMemberEntitlements().preciseAstro;
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
          {precise ? (
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">to the second</span>
          ) : (
            <span className="text-[9px] text-slate-400">HH:mm · Supporter unlocks seconds</span>
          )}
        </div>
        <span className="text-[10px] font-mono text-slate-400">{formatMemberTime(now, true)}</span>
      </div>

      {polarNote && (
        <p className="text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
          {polarNote}
        </p>
      )}

      <SunDayArc
        now={now}
        sunrise={sun.sunrise}
        sunset={sun.sunset}
        solarElevation={elev}
        className="max-w-md mx-auto text-slate-400"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-800/40 bg-white/70 dark:bg-slate-950/50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-200 mb-1">
            <Sun className="w-4 h-4" />
            Sun {isUp ? 'above horizon' : 'below horizon'}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Elev {elev.toFixed(1)}° · Az {sun.solarAzimuth.toFixed(0)}° ({azimuthToCompass(sun.solarAzimuth)})
          </p>
          <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 mt-1">
            Next: {nextSun.label}{' '}
            {nextSun.kind !== 'none' ? formatCountdown(nextSun.msUntil) : '—'}
            {nextSun.at && (
              <span className="text-slate-500 font-normal text-xs">
                {' '}({formatMemberTime(nextSun.at, precise)})
              </span>
            )}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Day length {formatDayLength(sun.dayLengthMinutes || 0)}
            {dayDeltaMin != null && (
              <span>
                {' '}
                · Δ {dayDeltaMin >= 0 ? '+' : ''}
                {dayDeltaMin.toFixed(1)}m vs yesterday
              </span>
            )}
          </p>
        </div>

        <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-800/40 bg-white/70 dark:bg-slate-950/50 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-200 mb-1">
            <Moon className="w-4 h-4" />
            Moon · {moon.phaseName}
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Illum {moon.illuminationPercent.toFixed(0)}% · Alt ~{moonPos.altitude.toFixed(1)}° · Az{' '}
            {moonPos.azimuth.toFixed(0)}°
          </p>
          <p className="text-sm font-mono font-semibold text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
            Next: {nextMoon.label}{' '}
            {nextMoon.kind !== 'none' ? formatCountdown(nextMoon.msUntil) : '—'}
            {nextMoon.at && (
              <span className="text-slate-500 font-normal text-xs">
                ({formatMemberTime(nextMoon.at, precise)})
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
