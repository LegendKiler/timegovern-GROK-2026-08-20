import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sun, Moon, Eye, Compass, MapPin, Sparkles, Clock, ArrowRight,
  SunMedium, MoonStar, Sunrise, Sunset, SlidersHorizontal
} from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { saveAstroCity } from './AstronomyCitySync';
import { City, SunEphemeris, MoonData, CelestialBodyPosition } from '../types';
import { calculateSunEphemeris, calculateMoonData, calculateNightSkyObjects, ECLIPSE_CATALOG } from '../lib/astronomyEngine';
import { LeapSecondUtility } from './LeapSecondUtility';
import { SolarNoonCalculator } from './SolarNoonCalculator';
import { LunarPhaseCalendar } from './LunarPhaseCalendar';

export const AstronomyPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'sun' | 'solar-noon' | 'moon' | 'moon-calendar' | 'eclipse' | 'sky' | 'leap-second'>('sun');
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES[0]);
  useEffect(() => { saveAstroCity(selectedCity); }, [selectedCity]);
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  const [skyViewingMode, setSkyViewingMode] = useState<'day' | 'night' | 'auto'>('auto');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
  const isDaytime = skyViewingMode === 'day' ? true : skyViewingMode === 'night' ? false : isSunAboveHorizon;

  useEffect(() => {
    if (subTab !== 'sky' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 24;
    ctx.clearRect(0, 0, width, height);
    if (isDaytime) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
      const skyGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      skyGrad.addColorStop(0, '#0284c7');
      skyGrad.addColorStop(0.6, '#38bdf8');
      skyGrad.addColorStop(1, '#e0f2fe');
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = skyGrad;
      ctx.fill();
      const sunAzRad = (sunData.solarAzimuth - 90) * (Math.PI / 180);
      const sunAltDist = ((90 - Math.max(0, sunData.solarElevation)) / 90) * radius;
      const sunPx = centerX + sunAltDist * Math.cos(sunAzRad);
      const sunPy = centerY + sunAltDist * Math.sin(sunAzRad);
      ctx.beginPath();
      ctx.arc(sunPx, sunPy, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
    } else {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      skyObjects.forEach((obj) => {
        if (obj.altitude < 0) return;
        const azRad = (obj.azimuth - 90) * (Math.PI / 180);
        const altDist = ((90 - Math.max(0, obj.altitude)) / 90) * radius;
        const px = centerX + altDist * Math.cos(azRad);
        const py = centerY + altDist * Math.sin(azRad);
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#f59e0b';
        ctx.fill();
      });
    }
  }, [subTab, selectedCity, targetDate, skyObjects, sunData, isDaytime]);

  const formatTimeStr = (d: Date | null) => {
    if (!d) return '--:--';
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const pickCity = (id: string) => {
    const c = MAJOR_CITIES.find((x) => x.id === id);
    if (c) {
      setSelectedCity(c);
      saveAstroCity(c);
    }
  };

  return (
    <div className={`space-y-6 rounded-2xl p-2 sm:p-3 ${isDaytime ? 'bg-gradient-to-b from-sky-100/50 to-slate-100/40' : 'bg-gradient-to-b from-slate-950 to-slate-900'}`}>
      <div className={`border rounded-2xl p-4 sm:p-5 shadow-sm ${isDaytime ? 'bg-white/90 border-sky-200' : 'bg-slate-900/90 border-slate-800'}`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black flex items-center gap-2 text-slate-900 dark:text-white">
              {isDaytime ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-400" />}
              Sun, Moon & Astronomy
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Ephemeris, lunar calendar, eclipses, planetarium · LIVE bar above follows this city</p>
          </div>
          <div className="flex flex-wrap gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {(['day', 'night', 'auto'] as const).map((m) => (
              <button key={m} type="button" onClick={() => setSkyViewingMode(m)} className={`px-2.5 py-1.5 rounded-lg ${skyViewingMode === m ? 'bg-blue-600 text-white' : 'text-slate-600'}`}>
                {m === 'day' ? 'Day' : m === 'night' ? 'Night' : `Auto (${isSunAboveHorizon ? 'Day' : 'Night'})`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-xs font-semibold">
          {([
            ['sun', 'Sun Ephemeris'],
            ['solar-noon', 'Solar Noon'],
            ['moon-calendar', 'Lunar Calendar'],
            ['moon', "Today's Moon"],
            ['eclipse', 'Eclipses'],
            ['sky', 'Planetarium'],
            ['leap-second', 'Leap Second'],
          ] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setSubTab(id)} className={`px-3 py-1.5 rounded-lg ${subTab === id ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className={`mt-4 flex flex-wrap items-center gap-4 p-3 rounded-xl border ${isDaytime ? 'bg-sky-50/80 border-sky-200' : 'bg-slate-800/60 border-slate-700'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <MapPin className="w-4 h-4 text-blue-500" />
            <select value={selectedCity.id} onChange={(e) => pickCity(e.target.value)} className="border rounded-lg text-xs px-2.5 py-1.5 bg-white dark:bg-slate-900 dark:border-slate-700">
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-500">Az {Math.round(sunData.solarAzimuth)}° · Elev {sunData.solarElevation.toFixed(1)}°</span>
        </div>

        {subTab === 'sun' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[\n                { t: 'Sunrise', v: formatTimeStr(sunData.sunrise), icon: Sunrise },\n                { t: 'Solar Noon', v: formatTimeStr(sunData.solarNoon), icon: Sun },\n                { t: 'Sunset', v: formatTimeStr(sunData.sunset), icon: Sunset },\n                { t: 'Day Length', v: `${Math.floor(sunData.dayLengthMinutes / 60)}h ${sunData.dayLengthMinutes % 60}m`, icon: Clock },\n              ].map((x) => (\n                <div key={x.t} className="p-4 rounded-xl border bg-white dark:bg-slate-900 text-center">\n                  <div className="flex items-center justify-center gap-1 text-xs font-bold uppercase text-slate-500"><x.icon className="w-3.5 h-3.5" />{x.t}</div>\n                  <span className="block text-2xl font-extrabold font-mono mt-1">{x.v}</span>\n                </div>\n              ))}\n            </div>\n            <div className="border rounded-xl p-4 bg-white dark:bg-slate-900">\n              <h3 className="text-xs font-bold uppercase mb-3">Twilight</h3>\n              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">\n                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800"><span className="font-bold block">Civil</span>Dawn {formatTimeStr(sunData.civilDawn)} · Dusk {formatTimeStr(sunData.civilDusk)}</div>\n                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800"><span className="font-bold block">Nautical</span>Dawn {formatTimeStr(sunData.nauticalDawn)} · Dusk {formatTimeStr(sunData.nauticalDusk)}</div>\n                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800"><span className="font-bold block">Astronomical</span>Dawn {formatTimeStr(sunData.astronomicalDawn)} · Dusk {formatTimeStr(sunData.astronomicalDusk)}</div>\n              </div>\n            </div>\n          </div>\n        )}\n\n        {subTab === 'solar-noon' && (\n          <div className="mt-4"><SolarNoonCalculator selectedCity={selectedCity} targetDate={targetDate} onCityChange={pickCity as unknown as (c: City) => void} onDateChange={setTargetDate} /></div>\n        )}\n\n        {subTab === 'moon-calendar' && (\n          <div className="mt-4"><LunarPhaseCalendar selectedCity={selectedCity} targetDate={targetDate} onCityChange={(c) => { setSelectedCity(c); saveAstroCity(c); }} onDateChange={setTargetDate} /></div>\n        )}\n\n        {subTab === 'moon' && (\n          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">\n            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center">\n              <div className="w-32 h-32 rounded-full bg-slate-800 relative overflow-hidden border-2 border-slate-600 mx-auto mb-3">\n                <div className="absolute inset-0 bg-amber-100" style={{ clipPath: `inset(0 ${100 - moonData.illuminationPercent}% 0 0)` }} />\n              </div>\n              <span className="font-extrabold text-lg text-white">{moonData.phaseName}</span>\n              <span className="text-xs text-amber-400 font-mono block">{moonData.illuminationPercent}% lit</span>\n            </div>\n            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">\n              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900"><span className="text-slate-500 text-[10px] uppercase font-bold block">Moon age</span><span className="text-lg font-bold font-mono">{moonData.moonAgeDays}d</span></div>\n              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900"><span className="text-slate-500 text-[10px] uppercase font-bold block">Distance</span><span className="text-lg font-bold font-mono">{moonData.distanceKm.toLocaleString()} km</span></div>\n              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900"><span className="text-slate-500 text-[10px] uppercase font-bold block">Moonrise</span><span className="text-lg font-bold font-mono text-blue-600">{formatTimeStr(moonData.moonrise)}</span></div>\n              <div className="p-3.5 rounded-lg border bg-white dark:bg-slate-900"><span className="text-slate-500 text-[10px] uppercase font-bold block">Moonset</span><span className="text-lg font-bold font-mono text-orange-600">{formatTimeStr(moonData.moonset)}</span></div>\n            </div>\n          </div>\n        )}\n\n        {subTab === 'eclipse' && (\n          <div className="mt-4 space-y-3">\n            {ECLIPSE_CATALOG.map((e) => (\n              <div key={e.id} className="p-3.5 rounded-lg border bg-white dark:bg-slate-900 flex flex-col sm:flex-row justify-between gap-2 text-xs">\n                <div>\n                  <span className="font-bold text-sm">{e.title}</span>\n                  <p className="text-slate-500 mt-1">{e.description}</p>\n                </div>\n                <div className="text-right shrink-0 font-mono text-xs">{e.date}<br /><span className="text-slate-400">{e.maxEclipseUtc}</span></div>\n              </div>\n            ))}\n          </div>\n        )}\n\n        {subTab === 'sky' && (\n          <div className="mt-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 text-center text-white">\n            <h3 className="text-sm font-bold mb-3 flex items-center justify-center gap-2"><Sparkles className="w-4 h-4 text-amber-400" /> Planetarium ({selectedCity.name})</h3>\n            <canvas ref={canvasRef} width={400} height={400} className="rounded-full max-w-full mx-auto border border-slate-700" />\n          </div>\n        )}\n\n        {subTab === 'leap-second' && (\n          <div className="mt-4"><LeapSecondUtility /></div>\n        )}\n      </div>\n    </div>\n  );\n};\n