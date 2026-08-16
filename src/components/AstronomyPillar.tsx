import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Eye, Compass, Calendar, MapPin, Sparkles, Navigation, Clock, Zap } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City, SunEphemeris, MoonData, CelestialBodyPosition } from '../types';
import { calculateSunEphemeris, calculateMoonData, calculateNightSkyObjects, ECLIPSE_CATALOG } from '../lib/astronomyEngine';
import { LeapSecondUtility } from './LeapSecondUtility';

export const AstronomyPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'sun' | 'moon' | 'eclipse' | 'sky' | 'leap-second'>('sun');
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES[0]); // New York
  const [targetDate, setTargetDate] = useState<Date>(new Date());

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate Ephemeris
  const sunData: SunEphemeris = calculateSunEphemeris(selectedCity.lat, selectedCity.lng, targetDate);
  const moonData: MoonData = calculateMoonData(targetDate, selectedCity.lat, selectedCity.lng);
  const skyObjects: CelestialBodyPosition[] = calculateNightSkyObjects(selectedCity.lat, selectedCity.lng, targetDate);

  // Canvas Planetarium Renderer
  useEffect(() => {
    if (subTab !== 'sky' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    // Background Sky Disc
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#090d16';
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cardinal Points
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('N', centerX, centerY - radius + 15);
    ctx.fillText('S', centerX, centerY + radius - 5);
    ctx.fillText('E', centerX + radius - 15, centerY + 4);
    ctx.fillText('W', centerX - radius + 15, centerY + 4);

    // Stars Background Random
    for (let i = 0; i < 120; i++) {
      const starAngle = (i * 137.5) * (Math.PI / 180);
      const starDist = Math.sqrt(i / 120) * (radius - 10);
      const sx = centerX + starDist * Math.cos(starAngle);
      const sy = centerY + starDist * Math.sin(starAngle);
      ctx.fillStyle = i % 5 === 0 ? '#60a5fa' : '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, Math.random() * 1.5 + 0.5, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Render Celestial Bodies & Constellations
    skyObjects.forEach((obj) => {
      const azRad = (obj.azimuth - 90) * (Math.PI / 180);
      const altDist = ((90 - Math.max(0, obj.altitude)) / 90) * radius;
      const px = centerX + altDist * Math.cos(azRad);
      const py = centerY + altDist * Math.sin(azRad);

      if (obj.altitude >= 0) {
        // Draw Object Dot
        ctx.beginPath();
        ctx.arc(px, py, obj.constellation ? 3 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = obj.constellation ? '#e2e8f0' : '#f59e0b';
        ctx.fill();

        if (!obj.constellation) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Object Label
        ctx.fillStyle = obj.constellation ? '#cbd5e1' : '#facc15';
        ctx.font = '10px sans-serif';
        ctx.fillText(obj.name, px, py - 8);
      }
    });
  }, [subTab, selectedCity, targetDate, skyObjects]);

  const formatTimeStr = (d: Date | null) => {
    if (!d) return '--:--';
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              3. Sun, Moon & Astronomy Engine
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Precision ephemeris calculators, moon illumination, eclipse tracking & night sky planetarium.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSubTab('sun')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'sun' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Sun Ephemeris
            </button>
            <button
              onClick={() => setSubTab('moon')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'moon' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Moon Phase & Lunar Data
            </button>
            <button
              onClick={() => setSubTab('eclipse')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'eclipse' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Solar & Lunar Eclipses
            </button>
            <button
              onClick={() => setSubTab('sky')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'sky' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Night Sky Planetarium
            </button>
            <button
              onClick={() => setSubTab('leap-second')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'leap-second' ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Leap Second & TAI-UTC</span>
            </button>
          </div>
        </div>

        {/* Global Location Selector */}
        <div className="mt-4 flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-blue-500" /> Location:
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const c = MAJOR_CITIES.find((x) => x.id === e.target.value);
                if (c) setSelectedCity(c);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs px-2.5 py-1 text-slate-800 dark:text-slate-100"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} ({c.lat.toFixed(2)}°, {c.lng.toFixed(2)}°)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---------------- SUB TAB 1: SUN EPHEMERIS ---------------- */}
        {subTab === 'sun' && (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl text-center">
                <span className="text-xs uppercase text-amber-700 dark:text-amber-400 font-bold tracking-wider">Sunrise</span>
                <span className="block text-2xl font-extrabold text-amber-900 dark:text-amber-200 mt-1 font-mono">
                  {formatTimeStr(sunData.sunrise)}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-1">Azimuth: 82° E</span>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 p-4 rounded-xl text-center">
                <span className="text-xs uppercase text-blue-700 dark:text-blue-400 font-bold tracking-wider">Solar Noon</span>
                <span className="block text-2xl font-extrabold text-blue-900 dark:text-blue-200 mt-1 font-mono">
                  {formatTimeStr(sunData.solarNoon)}
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-1">Max Elevation: {Math.round(sunData.solarElevation)}°</span>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800/60 p-4 rounded-xl text-center">
                <span className="text-xs uppercase text-orange-700 dark:text-orange-400 font-bold tracking-wider">Sunset</span>
                <span className="block text-2xl font-extrabold text-orange-900 dark:text-orange-200 mt-1 font-mono">
                  {formatTimeStr(sunData.sunset)}
                </span>
                <span className="text-[10px] text-orange-600 dark:text-orange-400 block mt-1">Azimuth: 278° W</span>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-center">
                <span className="text-xs uppercase text-slate-600 dark:text-slate-400 font-bold tracking-wider">Day Length</span>
                <span className="block text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 font-mono">
                  {Math.floor(sunData.dayLengthMinutes / 60)}h {sunData.dayLengthMinutes % 60}m
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Total Daylight</span>
              </div>
            </div>

            {/* Twilight Phases Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
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
          </div>
        )}

        {/* ---------------- SUB TAB 2: MOON PHASE ---------------- */}
        {subTab === 'moon' && (
          <div className="mt-4 space-y-6">
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
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Moon Age</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{moonData.moonAgeDays} days</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Lunar Distance</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-white font-mono">{moonData.distanceKm.toLocaleString()} km</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Moonrise</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">{formatTimeStr(moonData.moonrise)}</span>
                </div>
                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Moonset</span>
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400 font-mono">{formatTimeStr(moonData.moonset)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 3: ECLIPSES ---------------- */}
        {subTab === 'eclipse' && (
          <div className="mt-4 space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Global Solar & Lunar Eclipse Catalog (2024 - 2030)
              </h3>
              <div className="space-y-3 text-xs">
                {ECLIPSE_CATALOG.map((e) => (
                  <div key={e.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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

        {/* ---------------- SUB TAB 4: NIGHT SKY PLANETARIUM ---------------- */}
        {subTab === 'sky' && (
          <div className="mt-4 space-y-4">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
              <h3 className="text-sm font-bold text-amber-400 flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-4 h-4" /> Live Interactive Night Sky Map ({selectedCity.name})
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Showing visible planets (Venus, Jupiter, Mars, Saturn, Mercury) and constellations.
              </p>

              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={420}
                  className="rounded-full shadow-2xl border-2 border-slate-800"
                />
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
