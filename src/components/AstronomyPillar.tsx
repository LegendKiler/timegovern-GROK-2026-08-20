import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Sunrise, Sunset, Sparkles } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { saveAstroCity } from './AstronomyCitySync';
import { City } from '../types';
import {
  calculateSunEphemeris,
  calculateMoonData,
  ECLIPSE_CATALOG,
} from '../lib/astronomyEngine';
import { LeapSecondUtility } from './LeapSecondUtility';
import { SolarNoonCalculator } from './SolarNoonCalculator';
import { LunarPhaseCalendar } from './LunarPhaseCalendar';

type SubTab =
  | 'sun'
  | 'solar-noon'
  | 'moon'
  | 'moon-calendar'
  | 'eclipse'
  | 'sky'
  | 'leap-second';

const TABS: { id: SubTab; label: string }[] = [
  { id: 'sun', label: 'Sun Ephemeris' },
  { id: 'solar-noon', label: 'Solar Noon' },
  { id: 'moon-calendar', label: 'Lunar Calendar' },
  { id: 'moon', label: "Today's Moon" },
  { id: 'eclipse', label: 'Eclipses' },
  { id: 'sky', label: 'Planetarium' },
  { id: 'leap-second', label: 'Leap Second' },
];

function safeDate(d?: Date | null): Date {
  if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
  return new Date();
}

function fmtLocal(d: Date | null | undefined, tz: string): string {
  if (!d || Number.isNaN(d.getTime())) return '—';
  try {
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: tz,
    });
  } catch {
    return d.toISOString().slice(11, 19);
  }
}

/** Shared expanded panel shell — same height/padding for every tab */
const TabPanel: React.FC<{ isDaytime: boolean; children: React.ReactNode }> = ({
  isDaytime,
  children,
}) => (
  <div
    className={`mt-4 rounded-xl border p-4 sm:p-5 min-h-[320px] ${
      isDaytime
        ? 'bg-white/80 border-sky-100 shadow-sm'
        : 'bg-slate-900/60 border-slate-700/80'
    }`}
  >
    {children}
  </div>
);

export const AstronomyPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<SubTab>('sun');
  const [selectedCity, setSelectedCity] = useState<City>(
    () => MAJOR_CITIES.find((c) => c.id === 'nyc') || MAJOR_CITIES[0]
  );
  const [targetDate, setTargetDate] = useState<Date>(() => new Date());
  const [skyViewingMode, setSkyViewingMode] = useState<'day' | 'night' | 'auto'>('auto');
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(t);
  }, []);

  const city = selectedCity || MAJOR_CITIES[0];
  const dateNow = safeDate(now);
  const tz = city.timezone || 'UTC';

  const sun = useMemo(() => {
    try {
      return calculateSunEphemeris(city.lat, city.lng, dateNow);
    } catch {
      return null;
    }
  }, [city.lat, city.lng, dateNow]);

  const moon = useMemo(() => {
    try {
      return calculateMoonData(dateNow, city.lat, city.lng);
    } catch {
      return null;
    }
  }, [city.lat, city.lng, dateNow]);

  const isSunAboveHorizon = (sun?.solarElevation ?? 0) > -0.833;
  const isDaytime =
    skyViewingMode === 'day' || (skyViewingMode === 'auto' && isSunAboveHorizon);

  const onCityChange = (c: City) => {
    setSelectedCity(c);
    saveAstroCity(c);
  };

  const onCityId = (id: string) => {
    const c = MAJOR_CITIES.find((x) => x.id === id);
    if (c) onCityChange(c);
  };

  const onDateChange = (d: Date) => setTargetDate(safeDate(d));

  const labelCls = isDaytime ? 'text-slate-600' : 'text-slate-400';
  const titleCls = isDaytime ? 'text-slate-900' : 'text-white';
  const valueCls = isDaytime ? 'text-slate-800' : 'text-slate-100';

  return (
    <div
      className={`space-y-4 rounded-2xl p-2 sm:p-3 ${
        isDaytime
          ? 'bg-gradient-to-b from-sky-100/50 to-slate-100/40'
          : 'bg-gradient-to-b from-slate-950 to-slate-900'
      }`}
    >
      <div
        className={`border rounded-2xl p-4 sm:p-5 shadow-sm ${
          isDaytime ? 'bg-white/90 border-sky-200' : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <h1 className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${titleCls}`}>
              {isDaytime ? (
                <Sun className="w-6 h-6 text-amber-500" />
              ) : (
                <Moon className="w-6 h-6 text-indigo-400" />
              )}
              Sun, Moon & Astronomy
            </h1>
            <p className={`text-xs mt-0.5 ${labelCls}`}>
              Ephemeris, lunar calendar, eclipses, planetarium. Changing city updates the LIVE bar above.
            </p>
          </div>
          <div
            className={`inline-flex flex-wrap gap-1 p-1 rounded-xl border text-xs font-bold ${
              isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900'
            }`}
          >
            {(['day', 'night', 'auto'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSkyViewingMode(m)}
                className={`px-2.5 py-1.5 rounded-lg min-h-[32px] ${
                  skyViewingMode === m
                    ? 'bg-blue-600 text-white'
                    : isDaytime
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {m === 'day'
                  ? 'Day'
                  : m === 'night'
                    ? 'Night'
                    : `Auto (${isSunAboveHorizon ? 'Day' : 'Night'})`}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-tabs — equal height, wrap aligned */}
        <div
          className={`mt-4 flex flex-wrap gap-1.5 p-1.5 rounded-xl ${
            isDaytime ? 'bg-slate-100' : 'bg-slate-800/80'
          }`}
          role="tablist"
          aria-label="Astronomy sections"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={subTab === t.id}
              onClick={() => setSubTab(t.id)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold min-h-[36px] transition-colors ${
                subTab === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : isDaytime
                    ? 'text-slate-700 hover:bg-white/80'
                    : 'text-slate-300 hover:bg-slate-700/80'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* City row */}
        <div
          className={`mt-4 flex flex-wrap items-center gap-3 p-3 rounded-xl border ${
            isDaytime ? 'bg-sky-50/80 border-sky-200' : 'bg-slate-800/60 border-slate-700'
          }`}
        >
          <select
            value={city.id}
            onChange={(e) => onCityId(e.target.value)}
            className="text-xs rounded-lg border px-2.5 py-2 max-w-[240px] bg-slate-900 text-white border-slate-700"
          >
            {MAJOR_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
          <span className={`text-xs font-mono ${labelCls}`}>
            Az {(sun?.solarAzimuth ?? 0).toFixed(0)}° · Elev {(sun?.solarElevation ?? 0).toFixed(1)}°
          </span>
        </div>

        {/* Tab panels — same shell for every tab */}
        {subTab === 'sun' && (
          <TabPanel isDaytime={isDaytime}>
            <h2 className={`text-sm font-bold flex items-center gap-2 mb-4 ${titleCls}`}>
              <Sunrise className="w-4 h-4 text-amber-500" />
              Sun ephemeris — {city.name} (today)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
              {[
                ['Sunrise', fmtLocal(sun?.sunrise, tz)],
                ['Solar noon', fmtLocal(sun?.solarNoon, tz)],
                ['Sunset', fmtLocal(sun?.sunset, tz)],
                ['Civil dawn', fmtLocal(sun?.civilDawn, tz)],
                ['Civil dusk', fmtLocal(sun?.civilDusk, tz)],
                ['Nautical dawn', fmtLocal(sun?.nauticalDawn, tz)],
                ['Nautical dusk', fmtLocal(sun?.nauticalDusk, tz)],
                ['Astronomical dawn', fmtLocal(sun?.astronomicalDawn, tz)],
                ['Astronomical dusk', fmtLocal(sun?.astronomicalDusk, tz)],
                ['Golden hour start', fmtLocal(sun?.goldenHourStart, tz)],
                ['Golden hour end', fmtLocal(sun?.goldenHourEnd, tz)],
                [
                  'Day length',
                  sun?.dayLengthMinutes != null
                    ? `${Math.floor(sun.dayLengthMinutes / 60)}h ${Math.round(sun.dayLengthMinutes % 60)}m`
                    : '—',
                ],
                ['Elevation', `${(sun?.solarElevation ?? 0).toFixed(2)}°`],
                ['Azimuth', `${(sun?.solarAzimuth ?? 0).toFixed(2)}°`],
              ].map(([k, v]) => (
                <div
                  key={String(k)}
                  className={`rounded-lg border p-3 ${
                    isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/80'
                  }`}
                >
                  <p className={`text-[10px] font-bold uppercase tracking-wide ${labelCls}`}>{k}</p>
                  <p className={`mt-1 font-mono font-semibold ${valueCls}`}>{v}</p>
                </div>
              ))}
            </div>
          </TabPanel>
        )}

        {subTab === 'solar-noon' && (
          <TabPanel isDaytime={isDaytime}>
            <SolarNoonCalculator
              selectedCity={city}
              targetDate={safeDate(targetDate)}
              onCityChange={onCityChange}
              onDateChange={onDateChange}
            />
          </TabPanel>
        )}

        {subTab === 'moon-calendar' && (
          <TabPanel isDaytime={isDaytime}>
            <LunarPhaseCalendar
              selectedCity={city}
              targetDate={safeDate(targetDate)}
              onCityChange={onCityChange}
              onDateChange={onDateChange}
            />
          </TabPanel>
        )}

        {subTab === 'moon' && (
          <TabPanel isDaytime={isDaytime}>
            <h2 className={`text-sm font-bold flex items-center gap-2 mb-4 ${titleCls}`}>
              <Moon className="w-4 h-4 text-indigo-400" />
              Today's moon — {city.name}
            </h2>
            {moon ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  ['Phase', (moon as { phaseName?: string }).phaseName || '—'],
                  [
                    'Illumination',
                    `${((moon as { illuminationPercent?: number }).illuminationPercent ?? 0).toFixed(0)}%`,
                  ],
                  [
                    'Age',
                    `${((moon as { moonAgeDays?: number }).moonAgeDays ?? 0).toFixed(1)} d`,
                  ],
                  [
                    'Altitude',
                    `${((moon as { altitudeDeg?: number }).altitudeDeg ?? 0).toFixed(1)}°`,
                  ],
                  [
                    'Azimuth',
                    `${((moon as { azimuthDeg?: number }).azimuthDeg ?? 0).toFixed(1)}°`,
                  ],
                ].map(([k, v]) => (
                  <div
                    key={String(k)}
                    className={`rounded-lg border p-3 ${
                      isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/80'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase ${labelCls}`}>{k}</p>
                    <p className={`mt-1 font-semibold ${valueCls}`}>{v}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={labelCls}>Moon data unavailable for this location.</p>
            )}
            <p className={`mt-4 text-xs ${labelCls}`}>
              LIVE altitude & disc graphic are in the bar above this section.
            </p>
          </TabPanel>
        )}

        {subTab === 'eclipse' && (
          <TabPanel isDaytime={isDaytime}>
            <h2 className={`text-sm font-bold mb-4 ${titleCls}`}>Eclipse catalog</h2>
            <ul className="space-y-3">
              {(Array.isArray(ECLIPSE_CATALOG) ? ECLIPSE_CATALOG : []).slice(0, 12).map(
                (
                  e: {
                    id?: string;
                    title?: string;
                    name?: string;
                    date?: string;
                    type?: string;
                    maxEclipseUtc?: string;
                    description?: string;
                  },
                  i: number
                ) => (
                  <li
                    key={e.id || i}
                    className={`rounded-lg border p-3 text-xs ${
                      isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/80'
                    }`}
                  >
                    <p className={`font-bold ${titleCls}`}>{e.title || e.name || 'Eclipse'}</p>
                    <p className={labelCls}>
                      {e.date || '—'} · {e.type || ''} · {e.maxEclipseUtc || ''}
                    </p>
                    {e.description && <p className={`mt-1 ${valueCls}`}>{e.description}</p>}
                  </li>
                )
              )}
            </ul>
          </TabPanel>
        )}

        {subTab === 'sky' && (
          <TabPanel isDaytime={isDaytime}>
            <h2 className={`text-sm font-bold flex items-center gap-2 mb-3 ${titleCls}`}>
              <Sparkles className="w-4 h-4 text-violet-400" />
              Planetarium — {city.name}
            </h2>
            <p className={`text-sm ${labelCls} mb-4`}>
              Interactive sky map is planned. For now use elevation/azimuth from the LIVE bar and moon
              disc above, plus sun ephemeris times in local timezone ({tz}).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div
                className={`rounded-lg border p-3 ${
                  isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase ${labelCls}`}>Sun elev / az</p>
                <p className={`mt-1 font-mono ${valueCls}`}>
                  {(sun?.solarElevation ?? 0).toFixed(1)}° / {(sun?.solarAzimuth ?? 0).toFixed(1)}°
                </p>
              </div>
              <div
                className={`rounded-lg border p-3 ${
                  isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase ${labelCls}`}>Coords</p>
                <p className={`mt-1 font-mono ${valueCls}`}>
                  {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                </p>
              </div>
              <div
                className={`rounded-lg border p-3 ${
                  isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900/80'
                }`}
              >
                <p className={`text-[10px] font-bold uppercase ${labelCls}`}>Timezone</p>
                <p className={`mt-1 font-mono ${valueCls}`}>{tz}</p>
              </div>
            </div>
          </TabPanel>
        )}

        {subTab === 'leap-second' && (
          <TabPanel isDaytime={isDaytime}>
            <LeapSecondUtility />
          </TabPanel>
        )}
      </div>
    </div>
  );
};

export default AstronomyPillar;
