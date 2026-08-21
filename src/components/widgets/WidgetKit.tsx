/**
 * LAB: Self-hosted embeddable widget surfaces (1–7).
 * All client-side; no third-party iframe dependencies.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MAJOR_CITIES } from '../../lib/citiesData';
import type { City } from '../../types';

export type WidgetKind =
  | 'digital'
  | 'analog'
  | 'multicity'
  | 'countdown'
  | 'sunmoon'
  | 'weather'
  | 'stopwatch';

export const WIDGET_CATALOG: {
  id: WidgetKind;
  label: string;
  blurb: string;
  defaultW: number;
  defaultH: number;
}[] = [
  { id: 'digital', label: 'Digital clock', blurb: 'City time + date (most common embed)', defaultW: 320, defaultH: 160 },
  { id: 'analog', label: 'Analog clock', blurb: 'Classic face with live hands', defaultW: 280, defaultH: 300 },
  { id: 'multicity', label: 'Multi-city strip', blurb: '3–6 cities side by side', defaultW: 520, defaultH: 140 },
  { id: 'countdown', label: 'Countdown', blurb: 'Event timer to a target date', defaultW: 360, defaultH: 180 },
  { id: 'sunmoon', label: 'Sun & moon', blurb: 'Sunrise, sunset, moon phase', defaultW: 320, defaultH: 200 },
  { id: 'weather', label: 'Weather badge', blurb: 'Current conditions (Open-Meteo)', defaultW: 300, defaultH: 160 },
  { id: 'stopwatch', label: 'Stopwatch', blurb: 'Start / pause / reset', defaultW: 300, defaultH: 180 },
];

function findCity(nameOrId: string): City {
  const q = nameOrId.trim().toLowerCase();
  return (
    MAJOR_CITIES.find((c) => c.name.toLowerCase() === q || c.id === q) ||
    MAJOR_CITIES.find((c) => c.name.toLowerCase().includes(q)) ||
    MAJOR_CITIES[0]
  );
}

function formatInTz(
  date: Date,
  tz: string,
  opts: Intl.DateTimeFormatOptions
): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', opts).format(date);
  }
}

function getHms(date: Date, tz: string): { h: number; m: number; s: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const get = (t: string) => parseInt(parts.find((p) => p.type === t)?.value || '0', 10);
  return { h: get('hour') % 24, m: get('minute'), s: get('second') };
}

/** Approximate solar times (no suncalc dependency) — good enough for widget badge */
function approxSun(lat: number, lng: number, date: Date) {
  const rad = Math.PI / 180;
  const day =
    (Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getUTCFullYear(), 0, 0)) /
    86400000;
  const decl = 23.44 * Math.sin(rad * ((360 / 365) * (day - 81)));
  const latR = lat * rad;
  const cosH =
    (Math.sin(-0.83 * rad) - Math.sin(latR) * Math.sin(decl * rad)) /
    (Math.cos(latR) * Math.cos(decl * rad));
  const clamped = Math.min(1, Math.max(-1, cosH));
  const H = (Math.acos(clamped) * 180) / Math.PI;
  const noon = 12 - lng / 15;
  const rise = noon - H / 15;
  const set = noon + H / 15;
  const fmt = (x: number) => {
    const h = Math.floor(((x % 24) + 24) % 24);
    const m = Math.floor((x - Math.floor(x)) * 60);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  // simple moon illumination proxy by day of synodic month
  const synodic = 29.530588;
  const known = Date.UTC(2000, 0, 6, 18, 14, 0);
  const age = ((date.getTime() - known) / 86400000) % synodic;
  const phase = age < 0 ? age + synodic : age;
  const illum = Math.round((1 - Math.cos((2 * Math.PI * phase) / synodic)) * 50);
  let phaseName = 'Waxing';
  if (phase < 1.8 || phase > 27.7) phaseName = 'New Moon';
  else if (phase < 7.4) phaseName = 'Waxing Crescent';
  else if (phase < 9.2) phaseName = 'First Quarter';
  else if (phase < 14.8) phaseName = 'Waxing Gibbous';
  else if (phase < 16.6) phaseName = 'Full Moon';
  else if (phase < 22.1) phaseName = 'Waning Gibbous';
  else if (phase < 23.9) phaseName = 'Last Quarter';
  else phaseName = 'Waning Crescent';
  return { sunrise: fmt(rise), sunset: fmt(set), phaseName, illum };
}

const shell = (theme: 'dark' | 'light', className = '') =>
  theme === 'dark'
    ? `bg-slate-900 text-white border-slate-700 ${className}`
    : `bg-white text-slate-900 border-slate-200 ${className}`;

export function DigitalClockWidget({
  cityName,
  theme,
}: {
  cityName: string;
  theme: 'dark' | 'light';
}) {
  const city = findCity(cityName);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = formatInTz(now, city.timezone, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  const date = formatInTz(now, city.timezone, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div className={`w-full h-full rounded-xl border p-4 flex flex-col justify-between ${shell(theme)}`}>
      <div className="flex justify-between items-start gap-2">
        <div>
          <div className="font-bold text-sm">{city.name}</div>
          <div className="text-[10px] opacity-60 font-mono">{city.timezone}</div>
        </div>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">TG</span>
      </div>
      <div className="text-center">
        <div className="text-3xl font-black font-mono tracking-tight">{time}</div>
        <div className="text-xs opacity-70 mt-1">{date}</div>
      </div>
      <div className="text-[9px] opacity-50">TimeGovern · Digital</div>
    </div>
  );
}

export function AnalogClockWidget({
  cityName,
  theme,
}: {
  cityName: string;
  theme: 'dark' | 'light';
}) {
  const city = findCity(cityName);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const { h, m, s } = getHms(now, city.timezone);
  const hA = (h % 12) * 30 + m * 0.5;
  const mA = m * 6;
  const sA = s * 6;
  const face = theme === 'dark' ? 'border-slate-600 bg-slate-950' : 'border-slate-300 bg-slate-50';
  return (
    <div className={`w-full h-full rounded-xl border p-4 flex flex-col items-center gap-3 ${shell(theme)}`}>
      <div className="text-center">
        <div className="font-bold text-sm">{city.name}</div>
        <div className="text-[10px] opacity-60 font-mono">{city.country}</div>
      </div>
      <div className={`relative w-36 h-36 rounded-full border-[3px] ${face}`}>
        <div
          className="absolute left-1/2 bottom-1/2 w-1 h-10 bg-current origin-bottom rounded"
          style={{ transform: `translateX(-50%) rotate(${hA}deg)`, opacity: 0.9 }}
        />
        <div
          className="absolute left-1/2 bottom-1/2 w-0.5 h-14 bg-current origin-bottom rounded"
          style={{ transform: `translateX(-50%) rotate(${mA}deg)`, opacity: 0.7 }}
        />
        <div
          className="absolute left-1/2 bottom-1/2 w-px h-16 bg-rose-500 origin-bottom"
          style={{ transform: `translateX(-50%) rotate(${sA}deg)` }}
        />
        <div className="absolute left-1/2 top-1/2 w-2.5 h-2.5 -ml-1.5 -mt-1.5 rounded-full bg-cyan-400" />
      </div>
      <div className="text-[9px] opacity-50">TimeGovern · Analog</div>
    </div>
  );
}

export function MultiCityWidget({
  cityNames,
  theme,
}: {
  cityNames: string[];
  theme: 'dark' | 'light';
}) {
  const cities = (cityNames.length ? cityNames : ['London', 'New York', 'Tokyo', 'Sydney'])
    .slice(0, 6)
    .map(findCity);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={`w-full h-full rounded-xl border p-3 ${shell(theme)}`}>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cities.length}, minmax(0, 1fr))` }}>
        {cities.map((c) => (
          <div key={c.id} className="text-center min-w-0">
            <div className="text-[10px] font-bold truncate">{c.name}</div>
            <div className="font-mono text-sm font-bold tabular-nums">
              {formatInTz(now, c.timezone, { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div className="text-[9px] opacity-50 truncate">{c.countryCode}</div>
          </div>
        ))}
      </div>
      <div className="text-[9px] opacity-50 mt-2 text-center">TimeGovern · Multi-city</div>
    </div>
  );
}

export function CountdownWidget({
  targetIso,
  label,
  theme,
}: {
  targetIso: string;
  label: string;
  theme: 'dark' | 'light';
}) {
  const target = useMemo(() => new Date(targetIso), [targetIso]);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const ms = Math.max(0, target.getTime() - now.getTime());
  const totalSec = Math.floor(ms / 1000);
  const d = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const box = theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100';
  return (
    <div className={`w-full h-full rounded-xl border p-4 flex flex-col justify-center gap-3 ${shell(theme)}`}>
      <div className="text-center text-[11px] font-bold uppercase tracking-wider text-emerald-500">{label}</div>
      <div className="flex justify-center gap-2 font-mono">
        {[
          [d, 'd'],
          [h, 'h'],
          [m, 'm'],
          [s, 's'],
        ].map(([v, u]) => (
          <div key={String(u)} className={`${box} rounded-lg px-2.5 py-1.5 text-center min-w-[3rem]`}>
            <div className="text-xl font-black">{String(v).padStart(2, '0')}</div>
            <div className="text-[9px] opacity-60">{u}</div>
          </div>
        ))}
      </div>
      <div className="text-[9px] opacity-50 text-center">TimeGovern · Countdown</div>
    </div>
  );
}

export function SunMoonWidget({
  cityName,
  theme,
}: {
  cityName: string;
  theme: 'dark' | 'light';
}) {
  const city = findCity(cityName);
  const sun = approxSun(city.lat || 0, city.lng || 0, new Date());
  return (
    <div className={`w-full h-full rounded-xl border p-4 ${shell(theme)}`}>
      <div className="font-bold text-sm">{city.name}</div>
      <div className="text-[10px] opacity-60 mb-3">Sun & Moon</div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between"><span>Sunrise</span><span className="font-mono font-bold text-amber-500">{sun.sunrise}</span></div>
        <div className="flex justify-between"><span>Sunset</span><span className="font-mono font-bold text-indigo-400">{sun.sunset}</span></div>
        <div className="flex justify-between"><span>Moon</span><span className="font-bold">{sun.phaseName}</span></div>
        <div className="flex justify-between"><span>Illumination</span><span className="font-mono">{sun.illum}%</span></div>
      </div>
      <div className="text-[9px] opacity-50 mt-3">TimeGovern · Astronomy (approx.)</div>
    </div>
  );
}

export function WeatherWidget({
  cityName,
  theme,
}: {
  cityName: string;
  theme: 'dark' | 'light';
}) {
  const city = findCity(cityName);
  const [data, setData] = useState<{ temp: number; code: number } | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    let cancelled = false;
    const lat = city.lat || 0;
    const lng = city.lng || 0;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j?.current) setData({ temp: j.current.temperature_2m, code: j.current.weather_code });
        else setErr('No data');
      })
      .catch(() => !cancelled && setErr('Offline'));
    return () => {
      cancelled = true;
    };
  }, [city.id, city.lat, city.lng]);

  const label = (code: number) => {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 67) return 'Rain / drizzle';
    if (code <= 77) return 'Snow';
    return 'Storm / other';
  };

  return (
    <div className={`w-full h-full rounded-xl border p-4 flex flex-col justify-between ${shell(theme)}`}>
      <div>
        <div className="font-bold text-sm">{city.name}</div>
        <div className="text-[10px] opacity-60">Weather · Open-Meteo</div>
      </div>
      {err && <div className="text-xs text-rose-400">{err}</div>}
      {!err && !data && <div className="text-xs opacity-60">Loading…</div>}
      {data && (
        <div>
          <div className="text-3xl font-black font-mono">{Math.round(data.temp)}°C</div>
          <div className="text-xs opacity-70">{label(data.code)}</div>
        </div>
      )}
      <div className="text-[9px] opacity-50">TimeGovern · Weather</div>
    </div>
  );
}

export function StopwatchWidget({ theme }: { theme: 'dark' | 'light' }) {
  const [running, setRunning] = useState(false);
  const [acc, setAcc] = useState(0);
  const startRef = useRef(0);
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTick((t) => t + 1), 50);
    return () => clearInterval(id);
  }, [running]);
  const elapsed = acc + (running ? Date.now() - startRef.current : 0);
  const cs = Math.floor((elapsed % 1000) / 10);
  const s = Math.floor(elapsed / 1000) % 60;
  const m = Math.floor(elapsed / 60000);
  const display = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  const btn = theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200';
  return (
    <div className={`w-full h-full rounded-xl border p-4 flex flex-col items-center justify-center gap-3 ${shell(theme)}`}>
      <div className="font-mono text-3xl font-black tabular-nums">{display}</div>
      <div className="flex gap-2">
        <button
          type="button"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${btn}`}
          onClick={() => {
            if (running) {
              setAcc((a) => a + (Date.now() - startRef.current));
              setRunning(false);
            } else {
              startRef.current = Date.now();
              setRunning(true);
            }
          }}
        >
          {running ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          className={`px-3 py-1.5 rounded-lg text-xs font-bold ${btn}`}
          onClick={() => {
            setRunning(false);
            setAcc(0);
          }}
        >
          Reset
        </button>
      </div>
      <div className="text-[9px] opacity-50">TimeGovern · Stopwatch</div>
    </div>
  );
}

export function renderWidget(
  kind: WidgetKind,
  opts: {
    city: string;
    theme: 'dark' | 'light';
    cities?: string[];
    targetIso?: string;
    label?: string;
  }
) {
  switch (kind) {
    case 'digital':
      return <DigitalClockWidget cityName={opts.city} theme={opts.theme} />;
    case 'analog':
      return <AnalogClockWidget cityName={opts.city} theme={opts.theme} />;
    case 'multicity':
      return <MultiCityWidget cityNames={opts.cities || []} theme={opts.theme} />;
    case 'countdown':
      return (
        <CountdownWidget
          targetIso={opts.targetIso || '2027-01-01T00:00:00Z'}
          label={opts.label || 'Event countdown'}
          theme={opts.theme}
        />
      );
    case 'sunmoon':
      return <SunMoonWidget cityName={opts.city} theme={opts.theme} />;
    case 'weather':
      return <WeatherWidget cityName={opts.city} theme={opts.theme} />;
    case 'stopwatch':
      return <StopwatchWidget theme={opts.theme} />;
    default:
      return <DigitalClockWidget cityName={opts.city} theme={opts.theme} />;
  }
}

/** Build relative embed URL that works on localhost and production */
export function buildEmbedHref(params: Record<string, string>): string {
  const q = new URLSearchParams(params);
  return `${window.location.origin}/?${q.toString()}`;
}

export function parseEmbedParams(search: string): {
  embed: WidgetKind | null;
  city: string;
  theme: 'dark' | 'light';
  cities: string[];
  target: string;
  label: string;
} {
  const p = new URLSearchParams(search);
  const raw = (p.get('embed') || '').toLowerCase();
  const valid: WidgetKind[] = ['digital', 'analog', 'multicity', 'countdown', 'sunmoon', 'weather', 'stopwatch'];
  const embed = (valid.includes(raw as WidgetKind) ? raw : null) as WidgetKind | null;
  return {
    embed,
    city: p.get('city') || 'London',
    theme: p.get('theme') === 'light' ? 'light' : 'dark',
    cities: (p.get('cities') || 'London,New York,Tokyo,Sydney').split(',').map((s) => s.trim()).filter(Boolean),
    target: p.get('target') || '2027-01-01T00:00:00Z',
    label: p.get('label') || 'Event countdown',
  };
}
