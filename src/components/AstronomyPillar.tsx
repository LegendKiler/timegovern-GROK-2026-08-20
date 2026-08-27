import React, { useState, useEffect, useMemo } from 'react';
import { Sun, Moon, Sunrise } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { saveAstroCity } from './AstronomyCitySync';
import { City } from '../types';
import { calculateSunEphemeris, ECLIPSE_CATALOG } from '../lib/astronomyEngine';
import { LeapSecondUtility } from './LeapSecondUtility';
import { SolarNoonCalculator } from './SolarNoonCalculator';
import { LunarPhaseCalendar } from './LunarPhaseCalendar';

function safeDate(d?: Date | null): Date {
  if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
  return new Date();
}

export const AstronomyPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<
    'sun' | 'solar-noon' | 'moon' | 'moon-calendar' | 'eclipse' | 'sky' | 'leap-second'
  >('solar-noon');
  const [selectedCity, setSelectedCity] = useState<City>(
    () => MAJOR_CITIES.find((c) => c.id === 'nyc') || MAJOR_CITIES[0]
  );
  const [targetDate, setTargetDate] = useState<Date>(() => new Date());
  const [skyViewingMode, setSkyViewingMode] = useState<'day' | 'night' | 'auto'>('auto');
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  const city = selectedCity || MAJOR_CITIES[0];
  const dateNow = safeDate(now);

  const sun = useMemo(() => {
    try {
      return calculateSunEphemeris(city.lat, city.lng, dateNow);
    } catch {
      return { solarElevation: 0, solarAzimuth: 0, dayLengthMinutes: 0 } as ReturnType<
        typeof calculateSunEphemeris
      >;
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

  return (
    <div
      className={`space-y-6 rounded-2xl p-2 sm:p-3 ${
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1
              className={`text-xl sm:text-2xl font-black flex items-center gap-2 ${
                isDaytime ? 'text-slate-900' : 'text-white'
              }`}
            >
              {isDaytime ? (
                <Sun className="w-6 h-6 text-amber-500" />
              ) : (
                <Moon className="w-6 h-6 text-indigo-400" />
              )}
              Sun, Moon & Astronomy
            </h1>
            <p className={`text-xs mt-0.5 ${isDaytime ? 'text-slate-600' : 'text-slate-400'}`}>
              Ephemeris, lunar calendar, eclipses, planetarium. Changing city updates the LIVE bar above.
            </p>
          </div>
          <div
            className={`flex flex-wrap gap-1 p-1 rounded-xl border text-xs font-bold ${
              isDaytime ? 'border-slate-200 bg-slate-50' : 'border-slate-700 bg-slate-900'
            }`}
          >
            {(['day', 'night', 'auto'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSkyViewingMode(m)}
                className={`px-2.5 py-1.5 rounded-lg ${
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

        <div
          className={`mt-4 flex flex-wrap gap-1 p-1.5 rounded-xl text-xs font-semibold ${
            isDaytime ? 'bg-slate-100' : 'bg-slate-800/80'
          }`}
        >
          {(
            [
              ['sun', 'Sun Ephemeris'],
              ['solar-noon', 'Solar Noon'],
              ['moon-calendar', 'Lunar Calendar'],
              ['moon', "Today's Moon"],
              ['eclipse', 'Eclipses'],
              ['sky', 'Planetarium'],
              ['leap-second', 'Leap Second'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSubTab(id)}
              className={`px-3 py-1.5 rounded-lg ${
                subTab === id
                  ? 'bg-blue-600 text-white font-bold'
                  : isDaytime
                    ? 'text-slate-700'
                    : 'text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div
          className={`mt-4 flex flex-wrap items-center gap-4 p-3 rounded-xl border ${
            isDaytime ? 'bg-sky-50/80 border-sky-200' : 'bg-slate-800/60 border-slate-700'
          }`}
        >
          <select
            value={city.id}
            onChange={(e) => onCityId(e.target.value)}
            className="text-xs rounded-lg border px-2 py-1.5 max-w-[220px] bg-slate-900 text-white border-slate-700"
          >
            {MAJOR_CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}, {c.country}
              </option>
            ))}
          </select>
          <span className={`text-xs font-mono ${isDaytime ? 'text-slate-600' : 'text-slate-400'}`}>
            Az {(sun?.solarAzimuth ?? 0).toFixed(0)}° · Elev {(sun?.solarElevation ?? 0).toFixed(1)}°
          </span>
        </div>

        <div className="mt-5">
          {subTab === 'solar-noon' && (
            <SolarNoonCalculator
              selectedCity={city}
              targetDate={safeDate(targetDate)}
              onCityChange={onCityChange}
              onDateChange={onDateChange}
            />
          )}
          {subTab === 'moon-calendar' && (
            <LunarPhaseCalendar targetDate={safeDate(targetDate)} />
          )}
          {subTab === 'leap-second' && <LeapSecondUtility />}
          {subTab === 'sun' && (
            <div className={`text-sm ${isDaytime ? 'text-slate-700' : 'text-slate-300'}`}>
              <p className="font-bold mb-2 flex items-center gap-2">
                <Sunrise className="w-4 h-4" /> Sun ephemeris (today)
              </p>
              <ul className="space-y-1 font-mono text-xs">
                <li>Elevation: {(sun?.solarElevation ?? 0).toFixed(2)}°</li>
                <li>Azimuth: {(sun?.solarAzimuth ?? 0).toFixed(2)}°</li>
                <li>Day length: {sun?.dayLengthMinutes ?? '—'} min</li>
              </ul>
            </div>
          )}
          {subTab === 'moon' && (
            <div className={`text-sm ${isDaytime ? 'text-slate-700' : 'text-slate-300'}`}>
              Moon details for {city.name} — use the LIVE bar above for altitude & phase disc.
            </div>
          )}
          {subTab === 'eclipse' && (
            <div className={`text-sm ${isDaytime ? 'text-slate-700' : 'text-slate-300'}`}>
              <p className="font-bold mb-2">Eclipse catalog</p>
              <ul className="text-xs space-y-1">
                {(Array.isArray(ECLIPSE_CATALOG) ? ECLIPSE_CATALOG : []).slice(0, 8).map(
                  (e: { id?: string; name?: string; date?: string }, i: number) => (
                    <li key={e.id || i}>
                      {e.date || ''} — {e.name || 'Eclipse'}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
          {subTab === 'sky' && (
            <div className={`text-sm ${isDaytime ? 'text-slate-700' : 'text-slate-300'}`}>
              Planetarium panel — LIVE moon disc remains above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AstronomyPillar;
