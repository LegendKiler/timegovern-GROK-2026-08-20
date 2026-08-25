/**
 * LIVE helpers for Sun & Moon — countdown, multi-day table, moon position, polar flags.
 */
import { SunEphemeris, MoonData } from '../types';
import { calculateSunEphemeris, calculateMoonData } from './astronomyEngine';

export type NextCelestialEvent = {
  kind: 'sunrise' | 'sunset' | 'moonrise' | 'moonset' | 'solar_noon' | 'none';
  at: Date | null;
  label: string;
  msUntil: number;
};

export type PolarCondition = 'normal' | 'polar_day' | 'polar_night' | 'unknown';

export type DaySunRow = {
  date: Date;
  dateLabel: string;
  weekday: string;
  isToday: boolean;
  sunrise: Date | null;
  sunset: Date | null;
  solarNoon: Date | null;
  dayLengthMinutes: number;
  dayDeltaMin: number | null;
  polar: PolarCondition;
  polarNote: string | null;
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

export function formatDayLength(minutes: number): string {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

export function azimuthToCompass(az: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const i = Math.round(((az % 360) / 45)) % 8;
  return dirs[i];
}

export function detectPolarCondition(sun: SunEphemeris): { polar: PolarCondition; note: string | null } {
  if (!sun.sunrise && !sun.sunset) {
    if (sun.solarElevation > 0) {
      return { polar: 'polar_day', note: 'Sun does not set (polar day)' };
    }
    if (sun.solarElevation < -0.833) {
      return { polar: 'polar_night', note: 'Sun does not rise (polar night)' };
    }
    return { polar: 'unknown', note: 'Extreme latitude — limited ephemeris' };
  }
  return { polar: 'normal', note: null };
}

export function polarBadgeLabel(polar: PolarCondition): string | null {
  if (polar === 'polar_day') return 'Polar day';
  if (polar === 'polar_night') return 'Polar night';
  return null;
}

export function dayLengthDeltaMinutes(lat: number, lng: number, day: Date): number | null {
  const d0 = new Date(day);
  d0.setHours(12, 0, 0, 0);
  const d1 = new Date(d0);
  d1.setDate(d1.getDate() - 1);
  const a = calculateSunEphemeris(lat, lng, d0);
  const b = calculateSunEphemeris(lat, lng, d1);
  if (!a.dayLengthMinutes || !b.dayLengthMinutes) return null;
  return a.dayLengthMinutes - b.dayLengthMinutes;
}

export function buildSunForecastTable(
  lat: number,
  lng: number,
  fromDate: Date,
  days: number
): DaySunRow[] {
  const rows: DaySunRow[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(fromDate);
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + i);
    const sun = calculateSunEphemeris(lat, lng, d);
    const { polar, note } = detectPolarCondition(sun);
    let dayDeltaMin: number | null = null;
    if (i === 0) {
      dayDeltaMin = dayLengthDeltaMinutes(lat, lng, d);
    } else if (rows[i - 1] && sun.dayLengthMinutes && rows[i - 1].dayLengthMinutes) {
      dayDeltaMin = sun.dayLengthMinutes - rows[i - 1].dayLengthMinutes;
    }
    const isToday =
      d.getFullYear() === fromDate.getFullYear() &&
      d.getMonth() === fromDate.getMonth() &&
      d.getDate() === fromDate.getDate();
    rows.push({
      date: d,
      dateLabel: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
      isToday,
      sunrise: sun.sunrise,
      sunset: sun.sunset,
      solarNoon: sun.solarNoon,
      dayLengthMinutes: sun.dayLengthMinutes || 0,
      dayDeltaMin,
      polar,
      polarNote: note,
    });
  }
  return rows;
}

export function formatLocalTime(d: Date | null, preciseSeconds?: boolean): string {
  if (!d) return '—';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    ...(preciseSeconds ? { second: '2-digit' as const } : {}),
  });
}

export function approximateMoonPosition(
  lat: number,
  lng: number,
  now: Date
): { altitude: number; azimuth: number; illumination: number; phaseName: string; phaseFraction: number } {
  const sun = calculateSunEphemeris(lat, lng, now);
  const moon = calculateMoonData(now, lat, lng);
  const elong = (moon.moonAgeDays / 29.53) * 360;
  const alt = sun.solarElevation + Math.sin((elong * Math.PI) / 180) * 28 - 6;
  const az = (sun.solarAzimuth + elong * 0.85 + 180) % 360;
  return {
    altitude: Math.max(-90, Math.min(90, alt)),
    azimuth: az,
    illumination: moon.illuminationPercent,
    phaseName: moon.phaseName,
    phaseFraction: moon.phaseFraction,
  };
}

export function liveSunMoonBundle(lat: number, lng: number, now: Date) {
  const sun = calculateSunEphemeris(lat, lng, now);
  const moon = calculateMoonData(now, lat, lng);
  const polar = detectPolarCondition(sun);
  const moonPos = approximateMoonPosition(lat, lng, now);
  return {
    sun,
    moon,
    nextSun: getNextSunEvent(sun, now),
    nextMoon: getNextMoonEvent(moon, now),
    dayDeltaMin: dayLengthDeltaMinutes(lat, lng, now),
    polar: polar.polar,
    polarNote: polar.note,
    moonPos,
  };
}
