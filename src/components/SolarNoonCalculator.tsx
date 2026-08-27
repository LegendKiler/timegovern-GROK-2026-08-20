import React, { useState, useEffect, useMemo } from 'react';
import {
  Sun, Clock, Compass, MapPin, Calendar, ArrowRight, Info, Layers, RotateCcw,
  Sparkles, Sliders, CheckCircle2, TrendingUp, Globe, Share2, Check, Copy
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

const PRESET_BTN =
  'inline-flex items-center justify-center min-h-[32px] px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 transition-colors cursor-pointer whitespace-nowrap';

/** Capitals / majors for comparison table — must match citiesData ids */
const COMPARE_CITY_IDS = ['nyc', 'lon', 'tyo', 'par', 'syd', 'cai', 'bom', 'sin', 'dxb', 'del'] as const;

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
  const [customLng, setCustomLng] = useState<number>(selectedCity.lng);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    setCustomLng(selectedCity.lng);
  }, [selectedCity]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeDate = useMemo(() => {
    if (!customDateStr) return targetDate;
    const [y, m, d] = customDateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [customDateStr, targetDate]);

  const solarNoonData: SolarNoonDetails = useMemo(() => {
    return calculateSolarNoonDetails(selectedCity.lat, customLng, activeDate, selectedCity.timezone);
  }, [selectedCity.lat, customLng, activeDate, selectedCity.timezone]);

  const globalComparisons = useMemo(() => {
    return COMPARE_CITY_IDS.map((id) => MAJOR_CITIES.find((c) => c.id === id))
      .filter((c): c is City => Boolean(c))
      .map((c) => ({
        city: c,
        noon: calculateSolarNoonDetails(c.lat, c.lng, activeDate, c.timezone),
      }));
  }, [activeDate]);

  const setPresetDate = (type: 'today' | 'vernal' | 'summer' | 'winter') => {
    const curYear = new Date().getFullYear();
    const pad = (n: number) => n.toString().padStart(2, '0');
    let dateObj = new Date();
    if (type === 'today') dateObj = new Date();
    else if (type === 'vernal') dateObj = new Date(curYear, 2, 20);
    else if (type === 'summer') dateObj = new Date(curYear, 5, 21);
    else if (type === 'winter') dateObj = new Date(curYear, 11, 21);
    const str = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;
    setCustomDateStr(str);
    onDateChange?.(dateObj);
  };

  const handleCopySummary = () => {
    const summary =
      `Exact Solar Noon for ${selectedCity.name}, ${selectedCity.country}:\n` +
      `• Date: ${activeDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n` +
      `• Solar noon (local): ${solarNoonData.solarNoonLocalStr}\n` +
      `• Peak altitude: ${solarNoonData.maxSolarElevationDeg}°\n` +
      `• Culmination: ${solarNoonData.culminationDirection}`;
    navigator.clipboard?.writeText(summary).then(() => {
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero — always dark-on-light readable (no dark:text-white clash) */}
      <div className="bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-300 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-500 text-white">
                Solar Culmination Engine
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                Meridian Transit & Equation of Time
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Sun className="w-6 h-6 text-amber-500 shrink-0" />
              <span>Exact Solar Noon for {selectedCity.name}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Calculated from local longitude ({customLng.toFixed(2)}°), Earth's axial tilt, orbital
              eccentricity, and Equation of Time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:max-w-sm lg:justify-end">
            <span className="text-[11px] text-slate-600 font-semibold shrink-0 w-full lg:w-auto">Date</span>
            <button type="button" onClick={() => setPresetDate('today')} className={PRESET_BTN}>
              Today
            </button>
            <button type="button" onClick={() => setPresetDate('summer')} className={PRESET_BTN}>
              Summer Solstice
            </button>
            <button type="button" onClick={() => setPresetDate('vernal')} className={PRESET_BTN}>
              Equinox
            </button>
            <button type="button" onClick={() => setPresetDate('winter')} className={PRESET_BTN}>
              Winter Solstice
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1 mb-1">
              <Calendar className="w-3 h-3" /> Target date
            </label>
            <input
              type="date"
              value={customDateStr}
              onChange={(e) => {
                setCustomDateStr(e.target.value);
                const [y, m, d] = e.target.value.split('-').map(Number);
                if (y && m && d) onDateChange?.(new Date(y, m - 1, d));
              }}
              className="w-full text-xs rounded-lg border border-slate-300 bg-white text-slate-900 px-2.5 py-2"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1 mb-1">
              <MapPin className="w-3 h-3" /> Selected city
            </label>
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const c = MAJOR_CITIES.find((x) => x.id === e.target.value);
                if (c) onCityChange?.(c);
              }}
              className="w-full text-xs rounded-lg border border-slate-300 bg-slate-900 text-white px-2.5 py-2"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country} ({c.lat.toFixed(1)}°, {c.lng.toFixed(1)}°)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1 mb-1">
              <Compass className="w-3 h-3" /> Precise longitude (°)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                value={customLng}
                onChange={(e) => setCustomLng(Number(e.target.value))}
                className="flex-1 text-xs rounded-lg border border-slate-300 bg-slate-900 text-white px-2.5 py-2 font-mono"
              />
              <button
                type="button"
                onClick={() => setCustomLng(selectedCity.lng)}
                className="text-[10px] font-bold px-2 rounded-lg border border-slate-300 bg-white text-slate-700 whitespace-nowrap"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics HUD — intentional dark panel */}
      <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" /> Solar noon metrics
          </h3>
          <button
            type="button"
            onClick={handleCopySummary}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 inline-flex items-center gap-1"
          >
            {copiedSummary ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copiedSummary ? 'Copied' : 'Copy summary'}
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
            <p className="text-[10px] uppercase text-slate-400 font-bold">Local solar noon</p>
            <p className="text-lg font-black font-mono text-amber-300">{solarNoonData.solarNoonLocalStr}</p>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
            <p className="text-[10px] uppercase text-slate-400 font-bold">vs 12:00 clock</p>
            <p className="text-lg font-black font-mono">
              {solarNoonData.clockNoonDifferenceMinutes >= 0 ? '+' : ''}
              {solarNoonData.clockNoonDifferenceMinutes}m
            </p>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
            <p className="text-[10px] uppercase text-slate-400 font-bold">Peak altitude</p>
            <p className="text-lg font-black font-mono text-emerald-400">{solarNoonData.maxSolarElevationDeg}°</p>
          </div>
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
            <p className="text-[10px] uppercase text-slate-400 font-bold">Culmination</p>
            <p className="text-sm font-bold">{solarNoonData.culminationDirection}</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400">
          EoT {solarNoonData.equationOfTimeFormatted} · Day {solarNoonData.dayOfYear} of{' '}
          {activeDate.getFullYear()} · UTC {solarNoonData.solarNoonUtcStr}
        </p>
      </div>

      {/* Global capital comparison — populated via real city ids */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-4 sm:p-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
          <Globe className="w-4 h-4 text-emerald-400" />
          Global Capital Comparison on{' '}
          {activeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="py-2 pr-2 font-semibold">City</th>
                <th className="py-2 pr-2 font-semibold">Longitude</th>
                <th className="py-2 pr-2 font-semibold">Solar Noon (Local)</th>
                <th className="py-2 pr-2 font-semibold">Variance from 12:00</th>
                <th className="py-2 pr-2 font-semibold">Peak Altitude</th>
                <th className="py-2 font-semibold">Culmination</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {globalComparisons.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    No comparison cities found in database.
                  </td>
                </tr>
              )}
              {globalComparisons.map(({ city, noon }) => {
                const isCurrent = city.id === selectedCity.id;
                return (
                  <tr
                    key={city.id}
                    onClick={() => onCityChange?.(city)}
                    className={`cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-amber-950/40 text-amber-100'
                        : 'text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <td className="py-2.5 font-sans">
                      <span className="font-semibold">{city.name}</span>
                      <span className="text-[10px] text-slate-500 ml-1">({city.countryCode})</span>
                      {isCurrent && (
                        <span className="ml-1 text-[9px] bg-amber-500 text-white font-bold px-1.5 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-400">
                      {city.lng >= 0 ? `${city.lng.toFixed(1)}°E` : `${Math.abs(city.lng).toFixed(1)}°W`}
                    </td>
                    <td className="py-2.5 font-bold text-blue-400">{noon.solarNoonLocalStr}</td>
                    <td className="py-2.5">
                      <span
                        className={
                          noon.clockNoonDifferenceMinutes >= 0 ? 'text-amber-400' : 'text-cyan-400'
                        }
                      >
                        {noon.clockNoonDifferenceMinutes >= 0 ? '+' : ''}
                        {noon.clockNoonDifferenceMinutes}m
                      </span>
                    </td>
                    <td className="py-2.5 text-emerald-400">{noon.maxSolarElevationDeg}°</td>
                    <td className="py-2.5 text-slate-400 font-sans text-[11px]">{noon.culminationDirection}</td>
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

export default SolarNoonCalculator;
