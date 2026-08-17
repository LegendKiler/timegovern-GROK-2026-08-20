import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun,
  Clock,
  Compass,
  MapPin,
  Calendar,
  ArrowRight,
  Info,
  Layers,
  RotateCcw,
  Sparkles,
  Sliders,
  CheckCircle2,
  TrendingUp,
  Globe,
  Share2,
  Check,
  Copy
} from 'lucide-react';
import { City, SolarNoonDetails } from '../types';
import { calculateSolarNoonDetails } from '../lib/astronomyEngine';
import { MAJOR_CITIES } from '../lib/citiesData';

interface SolarNoonCalculatorProps {
  selectedCity: City;
  targetDate: Date;
  onCityChange?: (city: City) => void;
  onDateChange?: (date: Date) => void;
}

export const SolarNoonCalculator: React.FC<SolarNoonCalculatorProps> = ({
  selectedCity,
  targetDate,
  onCityChange,
  onDateChange
}) => {
  const [customDateStr, setCustomDateStr] = useState<string>(() => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${targetDate.getFullYear()}-${pad(targetDate.getMonth() + 1)}-${pad(targetDate.getDate())}`;
  });

  const [simulatedHour, setSimulatedHour] = useState<number>(12);
  const [isLiveClock, setIsLiveClock] = useState<boolean>(true);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [customLng, setCustomLng] = useState<number>(selectedCity.lng);

  // Sync customLng when selectedCity changes
  useEffect(() => {
    setCustomLng(selectedCity.lng);
  }, [selectedCity]);

  // Current live clock for countdown
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeDate = useMemo(() => {
    if (!customDateStr) return targetDate;
    const [y, m, d] = customDateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [customDateStr, targetDate]);

  // Calculate detailed solar noon metrics
  const solarNoonData: SolarNoonDetails = useMemo(() => {
    return calculateSolarNoonDetails(selectedCity.lat, customLng, activeDate, selectedCity.timezone);
  }, [selectedCity.lat, customLng, activeDate, selectedCity.timezone]);

  // Countdown / Time Difference from Now to Solar Noon
  const liveCountdown = useMemo(() => {
    if (!solarNoonData.solarNoonUtc) return null;

    // Convert solar noon to UTC ms today vs current UTC ms
    const diffMs = solarNoonData.solarNoonUtc.getTime() - currentTime.getTime();
    const isPast = diffMs < 0;
    const absDiffSec = Math.floor(Math.abs(diffMs) / 1000);
    const hours = Math.floor(absDiffSec / 3600);
    const minutes = Math.floor((absDiffSec % 3600) / 60);
    const seconds = absDiffSec % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');

    return {
      isPast,
      formatted: `${hours}h ${pad(minutes)}m ${pad(seconds)}s`,
      label: isPast ? 'occurred earlier today' : 'remaining until solar noon today'
    };
  }, [solarNoonData, currentTime]);

  // Preset Date Helper
  const setPresetDate = (type: 'today' | 'vernal' | 'summer' | 'autumnal' | 'winter') => {
    const curYear = new Date().getFullYear();
    const pad = (n: number) => n.toString().padStart(2, '0');
    let dateObj = new Date();

    if (type === 'today') {
      dateObj = new Date();
    } else if (type === 'vernal') {
      dateObj = new Date(curYear, 2, 20); // Mar 20
    } else if (type === 'summer') {
      dateObj = new Date(curYear, 5, 21); // Jun 21
    } else if (type === 'autumnal') {
      dateObj = new Date(curYear, 8, 22); // Sep 22
    } else if (type === 'winter') {
      dateObj = new Date(curYear, 11, 21); // Dec 21
    }

    const str = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
    setCustomDateStr(str);
    if (onDateChange) onDateChange(dateObj);
  };

  // Copy Summary Handler
  const handleCopySummary = () => {
    const summary = `Exact Solar Noon for ${selectedCity.name}, ${selectedCity.country}:\n` +
      `• Date: ${activeDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n` +
      `• Solar Noon (Local): ${solarNoonData.solarNoonLocalStr}\n` +
      `• Solar Noon (UTC): ${solarNoonData.solarNoonUtcStr}\n` +
      `• Clock Noon Difference: ${solarNoonData.clockNoonDifferenceFormatted}\n` +
      `• Peak Solar Elevation: ${solarNoonData.maxSolarElevationDeg}° (${solarNoonData.culminationDirection})\n` +
      `• Equation of Time (EoT): ${solarNoonData.equationOfTimeFormatted}\n` +
      `• Longitude: ${customLng.toFixed(2)}° (${solarNoonData.longitudeOffsetMinutes} min time offset)\n` +
      `• Min Shadow Ratio: ${solarNoonData.shadowRatio}x object height\n` +
      `Calculated via TimeGovern Temporal Engine`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Multi-City Quick Comparison List
  const globalComparisons = useMemo(() => {
    const sampleCityIds = ['new-york', 'london', 'tokyo', 'paris', 'sydney', 'cairo', 'mumbai', 'singapore'];
    return sampleCityIds
      .map((id) => MAJOR_CITIES.find((c) => c.id === id))
      .filter((c): c is City => Boolean(c))
      .map((c) => {
        const noon = calculateSolarNoonDetails(c.lat, c.lng, activeDate, c.timezone);
        return {
          city: c,
          noon
        };
      });
  }, [activeDate]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero Card */}
      <div className="bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-300 dark:border-amber-700/60 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-500 text-white shadow-xs">
                Solar Culmination Engine
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                Meridian Transit & Equation of Time
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
              <Sun className="w-6 h-6 text-amber-500 animate-pulse" />
              <span>Exact Solar Noon for {selectedCity.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
              Calculated based on local longitude (<span className="font-mono font-bold text-amber-600 dark:text-amber-400">{customLng >= 0 ? `${customLng.toFixed(2)}°E` : `${Math.abs(customLng).toFixed(2)}°W`}</span>), 
              Earth&apos;s axial tilt, orbital eccentricity, and Equation of Time.
            </p>
          </div>

          {/* Quick Date Presets */}
          <div className="flex flex-wrap items-center gap-1.5 self-start lg:self-auto">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mr-1">Date:</span>
            <button
              type="button"
              onClick={() => setPresetDate('today')}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setPresetDate('summer')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Summer Solstice
            </button>
            <button
              type="button"
              onClick={() => setPresetDate('vernal')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Equinox
            </button>
            <button
              type="button"
              onClick={() => setPresetDate('winter')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Winter Solstice
            </button>
          </div>
        </div>

        {/* Date Input & Location Selector Row */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" /> Target Date
            </label>
            <input
              type="date"
              value={customDateStr}
              onChange={(e) => {
                setCustomDateStr(e.target.value);
                if (onDateChange && e.target.value) {
                  const [y, m, d] = e.target.value.split('-').map(Number);
                  onDateChange(new Date(y, m - 1, d));
                }
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-500" /> Selected City
            </label>
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const c = MAJOR_CITIES.find((x) => x.id === e.target.value);
                if (c && onCityChange) onCityChange(c);
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 shadow-xs cursor-pointer"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} ({c.lat >= 0 ? `${c.lat.toFixed(1)}°N` : `${Math.abs(c.lat).toFixed(1)}°S`}, {c.lng >= 0 ? `${c.lng.toFixed(1)}°E` : `${Math.abs(c.lng).toFixed(1)}°W`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-500" /> Precise Longitude (°):
              </span>
              <button
                type="button"
                onClick={() => setCustomLng(selectedCity.lng)}
                className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                Reset to City Longitude
              </button>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                min="-180"
                max="180"
                value={customLng}
                onChange={(e) => setCustomLng(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-100 shadow-xs"
              />
              <span className="text-xs text-slate-500 font-mono shrink-0">
                {customLng >= 0 ? '°E' : '°W'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE SOLAR NOON METRICS DISPLAY (HERO HUD) */}
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-400" /> True Local Apparent Noon (Culmination)
            </span>
            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-5xl font-black font-mono text-white tracking-tight">
                {solarNoonData.solarNoonLocalStr}
              </span>
              <span className="text-sm font-semibold text-amber-400 bg-amber-950/80 border border-amber-800 px-3 py-1 rounded-lg font-mono">
                {selectedCity.timezone.replace('_', ' ')}
              </span>
            </div>
            <span className="text-xs text-slate-400 block mt-1.5 font-mono">
              UTC Equivalent: <strong className="text-slate-200">{solarNoonData.solarNoonUtcStr}</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopySummary}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copiedSummary ? 'Summary Copied!' : 'Copy Data Summary'}</span>
            </button>
          </div>
        </div>

        {/* Live Countdown / Status Pill */}
        {liveCountdown && (
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className={`w-3 h-3 rounded-full ${liveCountdown.isPast ? 'bg-slate-500' : 'bg-emerald-400 animate-ping'}`} />
              <span className="text-xs text-slate-300">
                Today&apos;s Solar Noon: <strong className="font-mono text-amber-300 font-bold">{liveCountdown.formatted}</strong> {liveCountdown.label}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Day {solarNoonData.dayOfYear} of {activeDate.getFullYear()}
            </span>
          </div>
        )}

        {/* 4 Essential Calculation Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Clock Noon Variance */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" /> Variance from 12:00 Clock
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono ${solarNoonData.clockNoonDifferenceMinutes >= 0 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {solarNoonData.clockNoonDifferenceMinutes >= 0 ? '+' : ''}{solarNoonData.clockNoonDifferenceMinutes}
              </span>
              <span className="text-xs text-slate-400 font-semibold">min</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              {solarNoonData.clockNoonDifferenceFormatted}
            </span>
          </div>

          {/* 2. Peak Solar Elevation */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> Max Altitude at Culmination
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-emerald-300">
                {solarNoonData.maxSolarElevationDeg}°
              </span>
              <span className="text-xs text-slate-400 font-semibold">above horizon</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Direction: <strong className="text-slate-200">{solarNoonData.culminationDirection}</strong>
            </span>
          </div>

          {/* 3. Equation of Time (EoT) */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Equation of Time (EoT)
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-indigo-300">
                {solarNoonData.equationOfTimeFormatted}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Earth orbit eccentricity & axial tilt
            </span>
          </div>

          {/* 4. Minimal Shadow Factor */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" /> Min Shadow Multiplier
            </span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black font-mono text-cyan-300">
                {solarNoonData.shadowRatio === 999 ? 'Polar Night' : `${solarNoonData.shadowRatio}×`}
              </span>
              <span className="text-xs text-slate-400 font-semibold">of height</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              A 1.0m pole casts a {solarNoonData.shadowRatio === 999 ? 'N/A' : `${(solarNoonData.shadowRatio * 100).toFixed(0)}cm`} shadow
            </span>
          </div>
        </div>
      </div>

      {/* MERIDIAN TRANSIT CELESTIAL DIAL (VISUAL SKY ARCH) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-500" />
              <span>Solar Meridian Crossing Dial</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Visualizing the Sun reaching the highest celestial altitude when crossing the observer&apos;s local meridian.
            </p>
          </div>

          {/* Time Scrubber */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">Simulated Hour:</span>
            <input
              type="range"
              min="6"
              max="18"
              step="0.25"
              value={simulatedHour}
              onChange={(e) => setSimulatedHour(Number(e.target.value))}
              className="w-28 accent-amber-500 cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 w-12 text-right">
              {Math.floor(simulatedHour)}:{((simulatedHour % 1) * 60).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        {/* SVG Sky Arch Visualization */}
        <div className="w-full bg-slate-950 rounded-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col items-center justify-center">
          <svg viewBox="0 0 600 240" className="w-full max-w-2xl h-auto select-none">
            <defs>
              <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
              </linearGradient>
              <linearGradient id="sunGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>

            {/* Background Sky Arch */}
            <rect x="0" y="0" width="600" height="240" rx="16" fill="url(#skyGradient)" />

            {/* Horizon Line */}
            <line x1="40" y1="200" x2="560" y2="200" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />
            <text x="40" y="220" fill="#94a3b8" fontSize="11" fontWeight="bold">East (06:00)</text>
            <text x="500" y="220" fill="#94a3b8" fontSize="11" fontWeight="bold">West (18:00)</text>
            <text x="255" y="220" fill="#f59e0b" fontSize="11" fontWeight="bold">Local Meridian</text>

            {/* Celestial Ecliptic Trajectory Arc */}
            <path
              d="M 60 200 Q 300 40 540 200"
              fill="none"
              stroke="#475569"
              strokeWidth="2"
              strokeDasharray="6 6"
            />

            {/* Zenith & Meridian Line */}
            <line x1="300" y1="30" x2="300" y2="200" stroke="#f59e0b" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 3" />
            <circle cx="300" cy="50" r="4" fill="#f59e0b" />
            <text x="308" y="45" fill="#fef08a" fontSize="10" fontWeight="bold">Peak Culmination: {solarNoonData.maxSolarElevationDeg}°</text>

            {/* Simulated Sun on Arc */}
            {(() => {
              // Normalized progress along 6:00 to 18:00
              const t = Math.max(0, Math.min(1, (simulatedHour - 6) / 12));
              // Quadratic bezier point: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
              const p0 = { x: 60, y: 200 };
              const p1 = { x: 300, y: 40 };
              const p2 = { x: 540, y: 200 };

              const sx = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
              const sy = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

              const isAtNoon = Math.abs(t - 0.5) < 0.04;

              return (
                <g>
                  {/* Sun Rays Halo */}
                  <circle cx={sx} cy={sy} r="18" fill="#fef08a" fillOpacity="0.2" className="animate-pulse" />
                  <circle cx={sx} cy={sy} r="10" fill="url(#sunGlow)" />

                  {/* Sun Marker Label */}
                  <text
                    x={sx}
                    y={sy - 15}
                    textAnchor="middle"
                    fill={isAtNoon ? '#fde047' : '#ffffff'}
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {isAtNoon ? '⭐ Exact Solar Noon' : `Sun at ${Math.floor(simulatedHour)}:${((simulatedHour % 1) * 60).toString().padStart(2, '0')}`}
                  </text>
                </g>
              );
            })()}
          </svg>

          <p className="text-[11px] text-slate-400 mt-3 text-center">
            At solar noon, the Sun is on the celestial meridian passing directly overhead from North to South, casting the shortest shadow of the day.
          </p>
        </div>
      </div>

      {/* MATHEMATICAL DECONSTRUCTION & LONGITUDE ANALYSIS */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Why Does Solar Noon Differ from 12:00 Clock Noon?</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Factor 1: Longitude Shift */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              <strong className="text-slate-900 dark:text-white">Longitude Time Shift</strong>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Earth rotates 360° in 24 hours, meaning exactly <strong>4 minutes per 1° of longitude</strong>.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Offset: {customLng.toFixed(2)}° × 4m = <strong className="text-blue-600 dark:text-blue-400">{solarNoonData.longitudeOffsetMinutes} min</strong> from Prime Meridian.
            </div>
          </div>

          {/* Factor 2: Timezone Central Meridian */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-[10px]">
                2
              </span>
              <strong className="text-slate-900 dark:text-white">Timezone Reference Meridian</strong>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Civil clocks follow a standard zone meridian ({solarNoonData.standardMeridianDeg}°), but the city is at {customLng.toFixed(2)}°.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Meridian Delta: <strong className="text-indigo-600 dark:text-indigo-400">{solarNoonData.meridianOffsetMinutes >= 0 ? `+${solarNoonData.meridianOffsetMinutes}` : solarNoonData.meridianOffsetMinutes} min</strong>
            </div>
          </div>

          {/* Factor 3: Equation of Time */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold flex items-center justify-center text-[10px]">
                3
              </span>
              <strong className="text-slate-900 dark:text-white">Equation of Time (EoT)</strong>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Earth&apos;s elliptical orbit and 23.44° axial tilt cause solar days to fluctuate throughout the year by up to ±16 minutes.
            </p>
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg font-mono text-[11px] text-slate-700 dark:text-slate-300">
              Today&apos;s EoT: <strong className="text-amber-600 dark:text-amber-400">{solarNoonData.equationOfTimeFormatted}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* GLOBAL MULTI-CITY COMPARISON TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Global Capital Comparison on {activeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="pb-2.5">City</th>
                <th className="pb-2.5">Longitude</th>
                <th className="pb-2.5">Solar Noon (Local Time)</th>
                <th className="pb-2.5">Variance from 12:00</th>
                <th className="pb-2.5">Peak Altitude</th>
                <th className="pb-2.5">Culmination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {globalComparisons.map(({ city, noon }) => {
                const isCurrent = city.id === selectedCity.id;
                return (
                  <tr
                    key={city.id}
                    onClick={() => {
                      if (onCityChange) onCityChange(city);
                    }}
                    className={`transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-50/70 dark:bg-amber-950/30 font-bold text-amber-900 dark:text-amber-200'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <td className="py-2.5 font-sans flex items-center gap-1.5">
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-[10px] text-slate-500">({city.countryCode})</span>
                      {isCurrent && (
                        <span className="text-[9px] bg-amber-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-500">
                      {city.lng >= 0 ? `${city.lng.toFixed(1)}°E` : `${Math.abs(city.lng).toFixed(1)}°W`}
                    </td>
                    <td className="py-2.5 font-bold text-blue-600 dark:text-blue-400">
                      {noon.solarNoonLocalStr}
                    </td>
                    <td className="py-2.5">
                      <span className={noon.clockNoonDifferenceMinutes >= 0 ? 'text-amber-600 dark:text-amber-400' : 'text-cyan-600 dark:text-cyan-400'}>
                        {noon.clockNoonDifferenceMinutes >= 0 ? '+' : ''}{noon.clockNoonDifferenceMinutes}m
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-600 dark:text-emerald-400">
                      {noon.maxSolarElevationDeg}°
                    </td>
                    <td className="py-2.5 text-slate-500 font-sans text-[11px]">
                      {noon.culminationDirection}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
