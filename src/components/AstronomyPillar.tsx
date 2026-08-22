import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sun,
  Moon,
  MapPin,
  Sparkles,
  Clock,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { saveAstroCity } from './AstronomyCitySync';
import { City, SunEphemeris, MoonData, CelestialBodyPosition } from '../types';
import {
  calculateSunEphemeris,
  calculateMoonData,
  calculateNightSkyObjects,
  ECLIPSE_CATALOG,
} from '../lib/astronomyEngine';
import { LeapSecondUtility } from './LeapSecondUtility';
import { SolarNoonCalculator } from './SolarNoonCalculator';
import { LunarPhaseCalendar } from './LunarPhaseCalendar';

export const AstronomyPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<
    'sun' | 'solar-noon' | 'moon' | 'moon-calendar' | 'eclipse' | 'sky' | 'leap-second'
  >('sun');
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES[0]);
  const [targetDate, setTargetDate] = useState<Date>(() => new Date());
  const [skyViewingMode, setSkyViewingMode] = useState<'day' | 'night' | 'auto'>('auto');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    saveAstroCity(selectedCity);
  }, [selectedCity]);

  const sunData: SunEphemeris = useMemo(
    () => calculateSunEphemeris(selectedCity.lat, selectedCity.lng, targetDate),
    [selectedCity.lat, selectedCity.lng, targetDate]
  );
  const moonData: MoonData = useMemo(
    () => calculateMoonData(targetDate, selectedCity.lat, selectedCity.lng),
    [targetDate, selectedCity.lat, selectedCity.lng]
  );
  const skyObjects: CelestialBodyPosition[] = useMemo(
    () => calculateNightSkyObjects(selectedCity.lat, selectedCity.lng, targetDate),
    [selectedCity.lat, selectedCity.lng, targetDate]
  );

  const isSunAboveHorizon = sunData.solarElevation > -0.833;
  const isDaytime =
    skyViewingMode === 'day' ? true : skyViewingMode === 'night' ? false : isSunAboveHorizon;

  useEffect(() => {
    if (subTab !== 'sky' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 24;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isDaytime ? '#0f172a' : '#020617';
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = isDaytime ? '#38bdf8' : '#0f172a';
    ctx.fill();
    if (isDaytime) {
      const az = ((sunData.solarAzimuth - 90) * Math.PI) / 180;
      const dist = ((90 - Math.max(0, sunData.solarElevation)) / 90) * radius;
      ctx.beginPath();
      ctx.arc(cx + dist * Math.cos(az), cy + dist * Math.sin(az), 10, 0, Math.PI * 2);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    } else {
      skyObjects.forEach((obj) => {
        if (obj.altitude < 0) return;
        const az = ((obj.azimuth - 90) * Math.PI) / 180;
        const dist = ((90 - Math.max(0, obj.altitude)) / 90) * radius;
        ctx.beginPath();
        ctx.arc(cx + dist * Math.cos(az), cy + dist * Math.sin(az), 4, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      });
    }
  }, [subTab, isDaytime, sunData, skyObjects]);

  const formatTimeStr = (d: Date | null) => {
    if (!d) return '--:--';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const onCityChange = (c: City) => {
    setSelectedCity(c);
    saveAstroCity(c);
  };

  const pickCityId = (id: string) => {
    const c = MAJOR_CITIES.find((x) => x.id === id);
    if (c) onCityChange(c);
  };

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
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
              {isDaytime ? (
                <Sun className="w-6 h-6 text-amber-500" />
              ) : (
                <Moon className="w-6 h-6 text-indigo-400" />
              )}
              Sun, Moon & Astronomy
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ephemeris, lunar calendar, eclipses, planetarium. Changing city updates the LIVE bar above.
            </p>
          </div>
          <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {(['day', 'night', 'auto'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSkyViewingMode(m)}
                className={`px-2.5 py-1.5 rounded-lg ${
                  skyViewingMode === m ? 'bg-blue-600 text-white' : 'text-slate-600'
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

        <div className="mt-4 flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-xs font-semibold">
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
                subTab === id ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300'
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
          <div className="flex items-center gap-2 text-xs font-semibold">
            <MapPin className="w-4 h-4 text-blue-500" />
            <select
              value={selectedCity.id}
              onChange={(e) => pickCityId(e.target.value)}
              className="border rounded-lg text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-700"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500">
            Az {Math.round(sunData.solarAzimuth)}° · Elev {sunData.solarElevation.toFixed(1)}°
          </span>
        </div>

        {subTab === 'sun' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase text-slate-500">
                  <Sunrise className="w-3.5 h-3.5" /> Sunrise
                </div>
                <span className="block text-2xl font-extrabold font-mono mt-1">
                  {formatTimeStr(sunData.sunrise)}
                </span>
              </div>
              <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase text-slate-500">
                  <Sun className="w-3.5 h-3.5" /> Solar Noon
                </div>
                <span className="block text-2xl font-extrabold font-mono mt-1">
                  {formatTimeStr(sunData.solarNoon)}
                </span>
              </div>
              <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase text-slate-500">
                  <Sunset className="w-3.5 h-3.5" /> Sunset
                </div>
                <span className="block text-2xl font-extrabold font-mono mt-1">
                  {formatTimeStr(sunData.sunset)}
                </span>
              </div>
              <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-center">
                <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase text-slate-500">
                  <Clock className="w-3.5 h-3.5" /> Day Length
                </div>
                <span className="block text-2xl font-extrabold font-mono mt-1">
                  {Math.floor(sunData.dayLengthMinutes / 60)}h {sunData.dayLengthMinutes % 60}m
                </span>
              </div>
            </div>
            <div className="border rounded-xl p-4 bg-white dark:bg-slate-900">
              <h3 className="text-xs font-bold uppercase mb-3">Twilight</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="font-bold block">Civil</span>
                  Dawn {formatTimeStr(sunData.civilDawn)} · Dusk {formatTimeStr(sunData.civilDusk)}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="font-bold block">Nautical</span>
                  Dawn {formatTimeStr(sunData.nauticalDawn)} · Dusk{' '}
                  {formatTimeStr(sunData.nauticalDusk)}
                </div>
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <span className="font-bold block">Astronomical</span>
                  Dawn {formatTimeStr(sunData.astronomicalDawn)} · Dusk{' '}
                  {formatTimeStr(sunData.astronomicalDusk)}
                </div>
              </div>
            </div>
          </div>
        )}

        {subTab === 'solar-noon' && (
          <div className="mt-4">
            <SolarNoonCalculator
              selectedCity={selectedCity}
              targetDate={targetDate}
              onCityChange={onCityChange}
              onDateChange={setTargetDate}
            />
          </div>
        )}

        {subTab === 'moon-calendar' && (
          <div className="mt-4">
            <LunarPhaseCalendar
              selectedCity={selectedCity}
              targetDate={targetDate}
              onCityChange={onCityChange}
              onDateChange={setTargetDate}
            />
          </div>
        )}

        {subTab === 'moon' && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">
              <div className="w-32 h-32 rounded-full bg-slate-800 relative overflow-hidden border-2 border-slate-600 mx-auto mb-3">
                <div
                  className="absolute inset-0 bg-amber-100"
                  style={{ clipPath: `inset(0 ${100 - moonData.illuminationPercent}% 0 0)` }}
                />
              </div>
              <span className="font-extrabold text-lg text-white">{moonData.phaseName}</span>
              <span className="text-xs text-amber-400 font-mono block">
                {moonData.illuminationPercent}% lit
              </span>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Moon age</span>
                <span className="text-lg font-bold font-mono">{moonData.moonAgeDays}d</span>
              </div>
              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Distance</span>
                <span className="text-lg font-bold font-mono">
                  {moonData.distanceKm.toLocaleString()} km
                </span>
              </div>
              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Moonrise</span>
                <span className="text-lg font-bold font-mono text-blue-600">
                  {formatTimeStr(moonData.moonrise)}
                </span>
              </div>
              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900">
                <span className="text-slate-500 text-[10px] uppercase font-bold block">Moonset</span>
                <span className="text-lg font-bold font-mono text-orange-600">
                  {formatTimeStr(moonData.moonset)}
                </span>
              </div>
            </div>
          </div>
        )}

        {subTab === 'eclipse' && (
          <div className="mt-4 space-y-3">
            {ECLIPSE_CATALOG.map((e) => (
              <div
                key={e.id}
                className="p-3.5 rounded-lg border bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-sm">{e.title}</span>
                  <p className="text-slate-500 mt-1">{e.description}</p>
                </div>
                <div className="text-right shrink-0 font-mono text-xs">
                  {e.date}
                  <br />
                  <span className="text-slate-400">{e.maxEclipseUtc}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {subTab === 'sky' && (
          <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center text-white">
            <h3 className="text-sm font-bold mb-3 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> Planetarium ({selectedCity.name})
            </h3>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="rounded-full max-w-full mx-auto border border-slate-700"
            />
          </div>
        )}

        {subTab === 'leap-second' && (
          <div className="mt-4">
            <LeapSecondUtility />
          </div>
        )}
      </div>
    </div>
  );
};
