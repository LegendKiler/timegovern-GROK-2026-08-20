/**
 * LIVE helpers for Sun & Moon — countdown, day-length delta, next event.
 * Positions still come from astronomyEngine (Meeus-style); tick with getSyncedNow().
 */
import { SunEphemeris, MoonData } from '../types';
import { calculateSunEphemeris, calculateMoonData } from './astronomyEngine';

export type NextCelestialEvent = {
  kind: 'sunrise' | 'sunset' | 'moonrise' | 'moonset' | 'solar_noon' | 'none';
  at: Date | null;
  label: string;
  msUntil: number;
};

function fmtCountdown(ms: number): string {
  if (ms <= 0) return 'now';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function formatCountdown(ms: number): string {
  return fmtCountdown(ms);
}

/** Next sun-related event after `now` */
export function getNextSunEvent(sun: SunEphemeris, now: Date): NextCelestialEvent {
  const candidates: { kind: NextCelestialEvent['kind']; at: Date | null; label: string }[] = [
    { kind: 'sunrise', at: sun.sunrise, label: 'Sunrise' },
    { kind: 'solar_noon', at: sun.solarNoon, label: 'Solar noon' },
    { kind: 'sunset', at: sun.sunset, label: 'Sunset' },
  ];
  let best: NextCelestialEvent = { kind: 'none', at: null, label: '—', msUntil: 0 };
  let bestMs = Infinity;
  for (const c of candidates) {
    if (!c.at) continue;
    const ms = c.at.getTime() - now.getTime();
    if (ms >= 0 && ms < bestMs) {
      bestMs = ms;
      best = { kind: c.kind, at: c.at, label: c.label, msUntil: ms };
    }
  }
  // If all past, next is tomorrow's sunrise (approx: +1 day from today's sunrise)
  if (best.kind === 'none' && sun.sunrise) {
    const tomorrow = new Date(sun.sunrise.getTime() + 86400000);
    return {
      kind: 'sunrise',
      at: tomorrow,
      label: 'Sunrise (next day)',
      msUntil: tomorrow.getTime() - now.getTime(),
    };
  }
  return best;
}

export function getNextMoonEvent(moon: MoonData, now: Date): NextCelestialEvent {
  const candidates = [
    { kind: 'moonrise' as const, at: moon.moonrise, label: 'Moonrise' },
    { kind: 'moonset' as const, at: moon.moonset, label: 'Moonset' },
  ];
  let best: NextCelestialEvent = { kind: 'none', at: null, label: '—', msUntil: 0 };
  let bestMs = Infinity;
  for (const c of candidates) {
    if (!c.at) continue;
    const ms = c.at.getTime() - now.getTime();
    if (ms >= 0 && ms < bestMs) {
      bestMs = ms;
      best = { kind: c.kind, at: c.at, label: c.label, msUntil: ms };
    }
  }
  return best;
}

export function dayLengthDeltaMinutes(lat: number, lng: number, date: Date): number | null {
  const today = calculateSunEphemeris(lat, lng, date);
  const y = new Date(date);
  y.setDate(y.getDate() - 1);
  const yesterday = calculateSunEphemeris(lat, lng, y);
  if (!today.dayLengthMinutes || !yesterday.dayLengthMinutes) return null;
  return today.dayLengthMinutes - yesterday.dayLengthMinutes;
}

export function formatDayLength(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

/** Compass-ish direction from azimuth degrees */
export function azimuthToCompass(az: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const i = Math.round(((az % 360) / 22.5)) % 16;
  return dirs[i];
}

export function liveSunMoonBundle(lat: number, lng: number, now: Date) {
  const sun = calculateSunEphemeris(lat, lng, now);
  const moon = calculateMoonData(now, lat, lng);
  return {
    sun,
    moon,
    nextSun: getNextSunEvent(sun, now),
    nextMoon: getNextMoonEvent(moon, now),
    dayDeltaMin: dayLengthDeltaMinutes(lat, lng, now),
  };
}
