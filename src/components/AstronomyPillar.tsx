import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sun,
  Moon,
  Eye,
  Compass,
  Calendar,
  MapPin,
  Sparkles,
  Navigation,
  Clock,
  Zap,
  ArrowRight,
  SunMedium,
  MoonStar,
  Sunrise,
  Sunset,
  CloudSun,
  SlidersHorizontal
} from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City, SunEphemeris, MoonData, CelestialBodyPosition } from '../types';
import { calculateSunEphemeris, calculateMoonData, calculateNightSkyObjects, ECLIPSE_CATALOG } from '../lib/astronomyEngine';
import { LeapSecondUtility } from './LeapSecondUtility';
import { SolarNoonCalculator } from './SolarNoonCalculator';
import { LunarPhaseCalendar } from './LunarPhaseCalendar';

export const AstronomyPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'sun' | 'solar-noon' | 'moon' | 'moon-calendar' | 'eclipse' | 'sky' | 'leap-second'>('sun');
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES[0]); // New York
  const [targetDate, setTargetDate] = useState<Date>(new Date());
  
  // Sky Viewing Mode: 'day' (Daytime Sky), 'night' (Nighttime Sky), or 'auto' (Auto-detected from Solar Altitude)
  const [skyViewingMode, setSkyViewingMode] = useState<'day' | 'night' | 'auto'>('auto');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate Ephemeris
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

  // Determine effective theme brightness & mode
  const isSunAboveHorizon = sunData.solarElevation > -0.833; // True astronomical daytime / civil twilight threshold
  const isDaytime = skyViewingMode === 'day' ? true : skyViewingMode === 'night' ? false : isSunAboveHorizon;

  // Canvas Planetarium Renderer (Supporting both Daytime Sky and Nighttime Sky)
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
      // ---------------- DAYTIME SKY RENDERING ----------------
      // Outer canvas background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Sky Disc (Atmospheric daytime gradient from deep cyan zenith to light horizon)
      const skyGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      skyGrad.addColorStop(0, '#0284c7'); // Zenith rich atmospheric azure
      skyGrad.addColorStop(0.6, '#38bdf8'); // Mid-sky light blue
      skyGrad.addColorStop(0.9, '#bae6fd'); // Horizon diffuse scattering
      skyGrad.addColorStop(1, '#e0f2fe'); // Horizon edge glow

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = skyGrad;
      ctx.fill();
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Atmospheric altitude grid rings
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      [0.33, 0.66].forEach((fraction) => {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * fraction, 0, 2 * Math.PI);
        ctx.stroke();
      });

      // Cardinal Points
      ctx.fillStyle = '#0369a1';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', centerX, centerY - radius + 16);
      ctx.fillText('S', centerX, centerY + radius - 6);
      ctx.fillText('E', centerX + radius - 16, centerY + 5);
      ctx.fillText('W', centerX - radius + 16, centerY + 5);

      // Draw Sun in Daytime Sky with luminous corona
      const sunAzRad = (sunData.solarAzimuth - 90) * (Math.PI / 180);
      const sunAltDist = ((90 - Math.max(0, sunData.solarElevation)) / 90) * radius;
      const sunPx = centerX + sunAltDist * Math.cos(sunAzRad);
      const sunPy = centerY + sunAltDist * Math.sin(sunAzRad);

      // Sun Corona / Rays
      const sunGlow = ctx.createRadialGradient(sunPx, sunPy, 2, sunPx, sunPy, 32);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.3, 'rgba(251, 191, 36, 0.6)');
      sunGlow.addColorStop(0.7, 'rgba(245, 158, 11, 0.25)');
      sunGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');

      ctx.beginPath();
      ctx.arc(sunPx, sunPy, 32, 0, 2 * Math.PI);
      ctx.fillStyle = sunGlow;
      ctx.fill();

      // Core Sun Disc
      ctx.beginPath();
      ctx.arc(sunPx, sunPy, 9, 0, 2 * Math.PI);
      ctx.fillStyle = '#fef08a';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sun Label & Elevation
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`☀️ Sun (+${Math.round(sunData.solarElevation)}°)`, sunPx, sunPy - 14);

      // Daytime visible objects (Venus, Moon, Jupiter if high elevation)
      skyObjects.forEach((obj) => {
        if (obj.altitude > 10 && obj.magnitude < -2.0) {
          const azRad = (obj.azimuth - 90) * (Math.PI / 180);
          const altDist = ((90 - Math.max(0, obj.altitude)) / 90) * radius;
          const px = centerX + altDist * Math.cos(azRad);
          const py = centerY + altDist * Math.sin(azRad);

          ctx.beginPath();
          ctx.arc(px, py, 4, 0, 2 * Math.PI);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText(`${obj.name} (Daylight Visible)`, px, py - 7);
        }
      });
    } else {
      // ---------------- NIGHTTIME SKY RENDERING ----------------
      // Deep Cosmic Obsidian
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Night Sky Disc
      const nightGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
      nightGrad.addColorStop(0, '#0f172a');
      nightGrad.addColorStop(0.7, '#080d1a');
      nightGrad.addColorStop(1, '#020617');

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = nightGrad;
      ctx.fill();
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Cardinal Points
      ctx.fillStyle = '#818cf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('N', centerX, centerY - radius + 16);
      ctx.fillText('S', centerX, centerY + radius - 6);
      ctx.fillText('E', centerX + radius - 16, centerY + 5);
      ctx.fillText('W', centerX - radius + 16, centerY + 5);

      // Stars Background (Random seeds based on astronomical pattern)
      for (let i = 0; i < 140; i++) {
        const starAngle = (i * 137.5) * (Math.PI / 180);
        const starDist = Math.sqrt(i / 140) * (radius - 12);
        const sx = centerX + starDist * Math.cos(starAngle);
        const sy = centerY + starDist * Math.sin(starAngle);
        ctx.fillStyle = i % 7 === 0 ? '#93c5fd' : i % 5 === 0 ? '#fef08a' : '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, (i % 4 === 0 ? 1.6 : 0.9), 0, 2 * Math.PI);
        ctx.fill();
      }

      // Render Celestial Bodies & Constellations
      skyObjects.forEach((obj) => {
        const azRad = (obj.azimuth - 90) * (Math.PI / 180);
        const altDist = ((90 - Math.max(0, obj.altitude)) / 90) * radius;
        const px = centerX + altDist * Math.cos(azRad);
        const py = centerY + altDist * Math.sin(azRad);

        if (obj.altitude >= 0) {
          // Object Dot
          ctx.beginPath();
          ctx.arc(px, py, obj.constellation ? 3 : 5, 0, 2 * Math.PI);
          ctx.fillStyle = obj.constellation ? '#e0e7ff' : '#f59e0b';
          ctx.fill();

          if (!obj.constellation) {
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Object Label
          ctx.fillStyle = obj.constellation ? '#c7d2fe' : '#fde047';
          ctx.font = '10px sans-serif';
          ctx.fillText(obj.name, px, py - 8);
        }
      });
    }
  }, [subTab, selectedCity, targetDate, skyObjects, sunData, isDaytime]);

  const formatTimeStr = (d: Date | null) => {
    if (!d) return '--:--';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div
      className={`space-y-6 transition-colors duration-500 rounded-2xl p-2 sm:p-3 ${
        isDaytime
          ? 'bg-gradient-to-b from-sky-100/50 via-blue-50/30 to-slate-100/40 text-slate-900'
          : 'bg-gradient-to-b from-slate-950 via-indigo-950/20 to-slate-900 text-slate-100'
      }`}
    >
      {/* Header Container with Theme Brightness Adaptation */}
      <div
        className={`border rounded-2xl p-4 sm:p-5 shadow-sm transition-all duration-300 ${
          isDaytime
            ? 'bg-white/90 border-sky-200/80 shadow-sky-100'
            : 'bg-slate-900/90 border-slate-800 shadow-slate-950'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                  isDaytime
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-indigo-600 text-indigo-100 shadow-xs'
                }`}
              >
                {isDaytime ? <SunMedium className="w-3 h-3" /> : <MoonStar className="w-3 h-3" />}
                {isDaytime ? 'Daytime Sky Atmosphere' : 'Nighttime Cosmos Sky'}
              </span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                  isDaytime
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : 'bg-indigo-950/60 text-indigo-300 border-indigo-800/60'
                }`}
              >
                Solar Elevation: <strong className="font-mono">{sunData.solarElevation.toFixed(1)}°</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
              {isDaytime ? <Sun className="w-6 h-6 text-amber-500" /> : <Moon className="w-6 h-6 text-indigo-400" />}
              <span>3. Sun, Moon & Astronomy Engine</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Precision ephemeris calculators, moon illumination, eclipse tracking, and dual-mode daytime/nighttime planetarium.
            </p>
          </div>

          {/* Top Controls: Viewing Mode Switcher (Daytime / Nighttime / Auto) */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <div
              className={`flex items-center p-1 rounded-xl border transition-all ${
                isDaytime
                  ? 'bg-sky-100/70 border-sky-300 text-slate-800'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
              title="Switch Sky Viewing Mode (adjusts theme brightness)"
            >
              <button
                type="button"
                onClick={() => setSkyViewingMode('day')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  skyViewingMode === 'day'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Daytime Sky</span>
              </button>

              <button
                type="button"
                onClick={() => setSkyViewingMode('night')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  skyViewingMode === 'night'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MoonStar className="w-3.5 h-3.5" />
                <span>Nighttime Sky</span>
              </button>

              <button
                type="button"
                onClick={() => setSkyViewingMode('auto')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  skyViewingMode === 'auto'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Automatically detect day or night from solar altitude"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Auto ({isSunAboveHorizon ? 'Day' : 'Night'})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="mt-4 flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setSubTab('sun')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'sun' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Sun Ephemeris
          </button>
          <button
            onClick={() => setSubTab('solar-noon')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'solar-noon' ? 'bg-amber-500 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Exact Solar Noon</span>
          </button>
          <button
            onClick={() => setSubTab('moon-calendar')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'moon-calendar' ? 'bg-indigo-600 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Lunar Phase Calendar</span>
          </button>
          <button
            onClick={() => setSubTab('moon')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'moon' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Today&apos;s Moon Ephemeris
          </button>
          <button
            onClick={() => setSubTab('eclipse')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              subTab === 'eclipse' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Solar & Lunar Eclipses
          </button>
          <button
            onClick={() => setSubTab('sky')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              subTab === 'sky' ? 'bg-blue-600 text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Sky Planetarium ({isDaytime ? 'Day' : 'Night'})</span>
          </button>
          <button
            onClick={() => setSubTab('leap-second')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'leap-second' ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Leap Second & TAI-UTC</span>
          </button>
        </div>

        {/* Global Location & Observer Settings Bar */}
        <div
          className={`mt-4 flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl border transition-colors ${
            isDaytime
              ? 'bg-sky-50/80 border-sky-200 text-slate-800'
              : 'bg-slate-800/60 border-slate-700 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
            <MapPin className="w-4 h-4 text-blue-500" /> Observer Location:
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const c = MAJOR_CITIES.find((x) => x.id === e.target.value);
                if (c) setSelectedCity(c);
              }}
              className={`border rounded-lg text-xs px-2.5 py-1.5 font-medium cursor-pointer ${
                isDaytime
                  ? 'bg-white border-sky-300 text-slate-900'
                  : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} ({c.lat.toFixed(2)}°, {c.lng.toFixed(2)}°)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>Solar Azimuth: <strong className="font-mono text-slate-800 dark:text-slate-200">{Math.round(sunData.solarAzimuth)}°</strong></span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <span>Day Length: <strong className="font-mono text-slate-800 dark:text-slate-200">{Math.floor(sunData.dayLengthMinutes / 60)}h {sunData.dayLengthMinutes % 60}m</strong></span>
            </span>
          </div>
        </div>

        {/* ---------------- SUB TAB 1: SUN EPHEMERIS ---------------- */}
        {subTab === 'sun' && (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`p-4 rounded-xl text-center border transition-all ${
                  isDaytime
                    ? 'bg-amber-50 border-amber-200/90 shadow-xs'
                    : 'bg-amber-950/30 border-amber-800/60'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-400">
                  <Sunrise className="w-3.5 h-3.5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Sunrise</span>
                </div>
                <span className="block text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1 font-mono">
                  {formatTimeStr(sunData.sunrise)}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1">Azimuth: 82° E</span>
              </div>

              <div
                className={`p-4 rounded-xl text-center border transition-all ${
                  isDaytime
                    ? 'bg-blue-50 border-blue-200/90 shadow-xs'
                    : 'bg-blue-950/30 border-blue-800/60'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-blue-700 dark:text-blue-400">
                  <Sun className="w-3.5 h-3.5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Solar Noon</span>
                </div>
                <span className="block text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1 font-mono">
                  {formatTimeStr(sunData.solarNoon)}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-1">Max Elevation: {Math.round(sunData.solarElevation)}°</span>
              </div>

              <div
                className={`p-4 rounded-xl text-center border transition-all ${
                  isDaytime
                    ? 'bg-orange-50 border-orange-200/90 shadow-xs'
                    : 'bg-orange-950/30 border-orange-800/60'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-orange-700 dark:text-orange-400">
                  <Sunset className="w-3.5 h-3.5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Sunset</span>
                </div>
                <span className="block text-2xl font-extrabold text-orange-900 dark:text-orange-200 mt-1 font-mono">
                  {formatTimeStr(sunData.sunset)}
                </span>
                <span className="text-[10px] text-orange-600 dark:text-orange-400 block mt-1">Azimuth: 278° W</span>
              </div>

              <div
                className={`p-4 rounded-xl text-center border transition-all ${
                  isDaytime
                    ? 'bg-slate-100 border-slate-300/80 shadow-xs'
                    : 'bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-1 text-slate-600 dark:text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs uppercase font-bold tracking-wider">Day Length</span>
                </div>
                <span className="block text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                  {Math.floor(sunData.dayLengthMinutes / 60)}h {sunData.dayLengthMinutes % 60}m
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Total Daylight</span>
              </div>
            </div>

            {/* Twilight Phases Table */}
            <div
              className={`border rounded-xl p-4 transition-colors ${
                isDaytime
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Civil, Nautical & Astronomical Twilight Schedule
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Civil Twilight</span>
                  <span className="text-[11px] text-slate-500 block">Dawn: {formatTimeStr(sunData.civilDawn)}</span>
                  <span className="text-[11px] text-slate-500 block">Dusk: {formatTimeStr(sunData.civilDusk)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Nautical Twilight</span>
                  <span className="text-[11px] text-slate-500 block">Dawn: {formatTimeStr(sunData.nauticalDawn)}</span>
                  <span className="text-[11px] text-slate-500 block">Dusk: {formatTimeStr(sunData.nauticalDusk)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white block">Astronomical Twilight</span>
                  <span className="text-[11px] text-slate-500 block">Dawn: {formatTimeStr(sunData.astronomicalDawn)}</span>
                  <span className="text-[11px] text-slate-500 block">Dusk: {formatTimeStr(sunData.astronomicalDusk)}</span>
                </div>
              </div>
            </div>

            {/* Quick Solar Noon Feature Card */}
            <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300 dark:border-amber-700/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Need High-Precision Solar Noon & Meridian Transit Calculations?
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Analyze exact local longitude time shifts, Equation of Time (EoT), maximum altitude, and minimal shadow ratios for {selectedCity.name}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('solar-noon')}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>Launch Solar Noon Engine</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB: EXACT SOLAR NOON CALCULATOR ---------------- */}
        {subTab === 'solar-noon' && (
          <div className="mt-4">
            <SolarNoonCalculator
              selectedCity={selectedCity}
              targetDate={targetDate}
              onCityChange={setSelectedCity}
              onDateChange={setTargetDate}
            />
          </div>
        )}

        {/* ---------------- SUB TAB: MONTHLY LUNAR PHASE CALENDAR ---------------- */}
        {subTab === 'moon-calendar' && (
          <div className="mt-4">
            <LunarPhaseCalendar
              selectedCity={selectedCity}
              targetDate={targetDate}
              onCityChange={setSelectedCity}
              onDateChange={setTargetDate}
            />
          </div>
        )}

        {/* ---------------- SUB TAB 2: MOON PHASE ---------------- */}
        {subTab === 'moon' && (
          <div className="mt-4 space-y-6">
            {/* Quick Lunar Calendar Banner */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-300 dark:border-indigo-700/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Moon className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Explore the Full Monthly Lunar Phase Calendar
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    View high-precision visual moon phase icons for every day of the month, 4 major primary phases, illumination %, and zodiac constellations.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSubTab('moon-calendar')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>Open Monthly Lunar Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Moon SVG Renderer */}
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-slate-800 relative overflow-hidden border-2 border-slate-600 shadow-xl mb-3">
                  <div
                    className="absolute inset-0 bg-amber-100 transition-all duration-500"
                    style={{
                      clipPath: `inset(0 ${100 - moonData.illuminationPercent}% 0 0)`
                    }}
                  ></div>
                </div>
                <span className="font-extrabold text-lg text-white block">{moonData.phaseName}</span>
                <span className="text-xs text-amber-400 font-mono mt-1">{moonData.illuminationPercent}% Illuminated</span>
              </div>

              {/* Lunar Details */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs">
                <div
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isDaytime
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Moon Age</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{moonData.moonAgeDays} days</span>
                </div>
                <div
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isDaytime
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Lunar Distance</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{moonData.distanceKm.toLocaleString()} km</span>
                </div>
                <div
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isDaytime
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Moonrise</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{formatTimeStr(moonData.moonrise)}</span>
                </div>
                <div
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isDaytime
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Moonset</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400 font-mono">{formatTimeStr(moonData.moonset)}</span>
                </div>
              </div>
            </div>

            {/* Embedded Lunar Phase Calendar within Moon tab for effortless discovery */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <LunarPhaseCalendar
                selectedCity={selectedCity}
                targetDate={targetDate}
                onCityChange={setSelectedCity}
                onDateChange={setTargetDate}
              />
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 3: ECLIPSES ---------------- */}
        {subTab === 'eclipse' && (
          <div className="mt-4 space-y-4">
            <div
              className={`p-4 rounded-xl border transition-colors ${
                isDaytime
                  ? 'bg-slate-50/90 border-slate-200'
                  : 'bg-slate-800/50 border-slate-700'
              }`}
            >
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Global Solar & Lunar Eclipse Catalog (2024 - 2030)
              </h3>
              <div className="space-y-3 text-xs">
                {ECLIPSE_CATALOG.map((e) => (
                  <div
                    key={e.id}
                    className={`p-3.5 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                      isDaytime
                        ? 'bg-white border-slate-200'
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{e.title}</span>
                        <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.5 rounded text-[10px]">
                          {e.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">{e.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block">{e.date}</span>
                      <span className="text-[10px] text-slate-400">{e.maxEclipseUtc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 4: PLANETARIUM (DAYTIME / NIGHTTIME) ---------------- */}
        {subTab === 'sky' && (
          <div className="mt-4 space-y-4">
            <div
              className={`p-5 rounded-2xl border text-center transition-all ${
                isDaytime
                  ? 'bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950 border-sky-800/40 text-white'
                  : 'bg-slate-950 border-slate-800 text-white'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 flex-wrap gap-2">
                <div className="text-left">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    {isDaytime ? <SunMedium className="w-4 h-4 text-amber-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                    <span>{isDaytime ? 'Daytime Sky Planetarium' : 'Nighttime Cosmic Planetarium'} ({selectedCity.name})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isDaytime
                      ? 'Simulating solar disc altitude, atmospheric scattering gradient, and visible high-magnitude bodies.'
                      : 'Showing visible planets (Venus, Jupiter, Mars, Saturn, Mercury), constellations, and magnitude points.'}
                  </p>
                </div>

                {/* Quick Toggle in Planetarium View */}
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setSkyViewingMode('day')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      skyViewingMode === 'day' ? 'bg-amber-500 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    ☀️ Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkyViewingMode('night')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      skyViewingMode === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌙 Night
                  </button>
                  <button
                    type="button"
                    onClick={() => setSkyViewingMode('auto')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      skyViewingMode === 'auto' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    🌐 Auto
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={440}
                  className="rounded-full shadow-2xl border-2 border-slate-700/80 max-w-full"
                />
              </div>

              {/* Legend & Stats */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-around gap-2 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                  {isDaytime ? 'Sun Position' : 'Visible Planets'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-300 inline-block" />
                  {isDaytime ? 'Atmospheric Zenith' : 'Constellation Stars'}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
                  {isDaytime ? 'Daylight Horizon' : 'Background Field'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 5: LEAP SECOND & ATOMIC TIME SCALES ---------------- */}
        {subTab === 'leap-second' && (
          <div className="mt-4">
            <LeapSecondUtility />
          </div>
        )}
      </div>
    </div>
  );
};

