import React, { useState, useMemo } from 'react';
import {
  Moon,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Compass,
  ArrowUpRight,
  Info,
  Check,
  Copy,
  Layers,
  Eye,
  RotateCcw,
  Zap,
  Globe
} from 'lucide-react';
import { City, LunarDayInfo, MonthlyLunarCalendarData } from '../types';
import { calculateMonthlyLunarCalendar, TRADITIONAL_FULL_MOON_NAMES } from '../lib/astronomyEngine';
import { MAJOR_CITIES } from '../lib/citiesData';

interface LunarPhaseCalendarProps {
  selectedCity: City;
  targetDate: Date;
  onCityChange?: (city: City) => void;
  onDateChange?: (date: Date) => void;
}

/**
 * Custom High-Precision SVG Moon Phase Icon Renderer
 */
export const MoonPhaseIcon: React.FC<{
  phaseFraction: number; // 0.0 to 1.0 (0=New, 0.25=First Qtr, 0.5=Full, 0.75=Third Qtr)
  illuminationPercent: number; // 0 to 100
  size?: number;
  className?: string;
}> = ({ phaseFraction, illuminationPercent, size = 28, className = '' }) => {
  const isWaxing = phaseFraction < 0.5;
  const radius = 12;
  const cx = 16;
  const cy = 16;

  // Render high-contrast SVG representation of the lunar disk
  // Base dark disk (unlit portion)
  // Masked white/gold illuminated portion
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        {/* Dark unlit base */}
        <radialGradient id="unlitMoon" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
        {/* Glowing Lit Surface */}
        <radialGradient id="litMoon" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fffbeb" />
          <stop offset="40%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fcd34d" />
        </radialGradient>
        {/* Crater Overlay */}
        <filter id="moonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#fef08a" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Unlit Dark Moon Body */}
      <circle cx={cx} cy={cy} r={radius} fill="url(#unlitMoon)" stroke="#475569" strokeWidth="0.75" />

      {/* Lit Moon Fraction Rendering */}
      {illuminationPercent > 1 && (
        <g filter={illuminationPercent > 85 ? 'url(#moonGlow)' : undefined}>
          {illuminationPercent >= 98 ? (
            // Full Moon
            <circle cx={cx} cy={cy} r={radius} fill="url(#litMoon)" />
          ) : (
            // Custom Phase Arc using SVG Path
            <path
              d={(() => {
                // Approximate crescent/gibbous terminator curve
                // R is radius = 12
                // When waxing: lit on the right side
                // When waning: lit on the left side
                const k = (illuminationPercent / 100) * 2 - 1; // -1 to +1 scale
                const rxTerm = Math.abs(k) * radius;
                const sweepTerm = isWaxing ? (k >= 0 ? 0 : 1) : (k >= 0 ? 1 : 0);

                if (isWaxing) {
                  // Lit on right side: Top (16, 4) -> Arc right to Bottom (16, 28) -> Terminator arc back to (16, 4)
                  return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 1 ${cx} ${cy + radius} A ${rxTerm} ${radius} 0 0 ${sweepTerm} ${cx} ${cy - radius} Z`;
                } else {
                  // Lit on left side: Top (16, 4) -> Arc left to Bottom (16, 28) -> Terminator arc back to (16, 4)
                  return `M ${cx} ${cy - radius} A ${radius} ${radius} 0 0 0 ${cx} ${cy + radius} A ${rxTerm} ${radius} 0 0 ${sweepTerm} ${cx} ${cy - radius} Z`;
                }
              })()}
              fill="url(#litMoon)"
            />
          )}
        </g>
      )}

      {/* Subtle Moon Crater details for realistic texture */}
      {illuminationPercent > 40 && (
        <g fill="#ca8a04" fillOpacity="0.15">
          <circle cx={isWaxing ? cx + 4 : cx - 4} cy={cy - 3} r="2.2" />
          <circle cx={isWaxing ? cx + 2 : cx - 2} cy={cy + 4} r="1.8" />
          <circle cx={isWaxing ? cx + 5 : cx - 5} cy={cy + 2} r="1.2" />
        </g>
      )}
    </svg>
  );
};

export const LunarPhaseCalendar: React.FC<LunarPhaseCalendarProps> = ({
  selectedCity,
  targetDate,
  onCityChange,
  onDateChange
}) => {
  // Calendar Month and Year State
  const [currentYear, setCurrentYear] = useState<number>(() => targetDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => targetDate.getMonth()); // 0-11
  const [selectedDayInfo, setSelectedDayInfo] = useState<LunarDayInfo | null>(null);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    if (onDateChange) onDateChange(now);
  };

  // Generate complete lunar calendar data for the active month
  const monthlyData: MonthlyLunarCalendarData = useMemo(() => {
    return calculateMonthlyLunarCalendar(
      currentYear,
      currentMonth,
      selectedCity.lat,
      selectedCity.lng,
      selectedCity.timezone
    );
  }, [currentYear, currentMonth, selectedCity.lat, selectedCity.lng, selectedCity.timezone]);

  // Set default selected day to today (if in month) or first day of month
  const activeSelectedDay = useMemo(() => {
    if (selectedDayInfo && selectedDayInfo.date.getMonth() === currentMonth && selectedDayInfo.date.getFullYear() === currentYear) {
      // Find matching day in new monthly data
      const matched = monthlyData.days.find((d) => d.isCurrentMonth && d.day === selectedDayInfo.day);
      if (matched) return matched;
    }
    const today = monthlyData.days.find((d) => d.isToday);
    if (today) return today;
    return monthlyData.days.find((d) => d.isCurrentMonth && d.day === 1) || monthlyData.days[0];
  }, [selectedDayInfo, currentMonth, currentYear, monthlyData]);

  // Copy monthly summary handler
  const handleCopyMonthSummary = () => {
    const lines = [
      `🌙 Lunar Phase Calendar - ${monthlyData.monthName} ${currentYear}`,
      `Location: ${selectedCity.name}, ${selectedCity.country} (${selectedCity.timezone})`,
      `Traditional Full Moon: ${monthlyData.traditionalFullMoonName}`,
      '',
      '⭐ Major Lunar Phases:',
      ...monthlyData.majorPhases.map(
        (p) => `• ${p.phaseName}${p.traditionalName ? ` ("${p.traditionalName}")` : ''}: ${p.dateStr} at ${p.exactTimeLocalStr} (Dist: ${p.distanceKm.toLocaleString()} km)`
      ),
      '',
      `Calculated via TimeGovern Astronomy Engine`
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* ---------------- TOP HEADER & MONTH NAVIGATOR ---------------- */}
      <div className="bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-800/40 p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500 text-white shadow-xs flex items-center gap-1">
                <Moon className="w-3 h-3 fill-current" /> Monthly Lunar Ephemeris
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                🌕 Traditional: {monthlyData.traditionalFullMoonName}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{monthlyData.monthName} {currentYear} Moon Phases</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Visualizing daily lunar phases, illumination curves, moonrise/moonset, and major quarter transitions for <strong className="text-indigo-300">{selectedCity.name}, {selectedCity.country}</strong>.
            </p>
          </div>

          {/* Month Navigator Controls */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-2 cursor-pointer"
            >
              {monthNames.map((m, i) => (
                <option key={m} value={i}>
                  {m}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1970"
              max="2050"
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="w-20 bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold rounded-xl px-2.5 py-2 text-center"
            />

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleJumpToToday}
              className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Today
            </button>

            <button
              type="button"
              onClick={handleCopyMonthSummary}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedSummary ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* ---------------- 4 MAJOR PHASES SPOTLIGHT BANNER ---------------- */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Major Primary Phases in {monthlyData.monthName}
            </span>
            <span className="text-[11px] text-slate-400">
              Observer Timezone: <strong className="text-indigo-300 font-mono">{selectedCity.timezone.replace('_', ' ')}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. New Moon */}
            {(() => {
              const p = monthlyData.majorPhases.find((x) => x.phaseType === 'NEW_MOON');
              return (
                <div
                  onClick={() => {
                    if (p) {
                      const d = monthlyData.days.find((x) => x.dateStr === p.dateStr);
                      if (d) setSelectedDayInfo(d);
                    }
                  }}
                  className="bg-slate-900/90 hover:bg-slate-850 p-3.5 rounded-xl border border-slate-800/80 cursor-pointer transition-all hover:border-indigo-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-300">🌑 New Moon</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                      0% Lit
                    </span>
                  </div>
                  {p ? (
                    <div className="mt-2.5">
                      <span className="text-sm font-bold text-white block">
                        {new Date(p.dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-indigo-300 font-mono block mt-0.5">
                        {p.exactTimeLocalStr}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Dist: {p.distanceKm.toLocaleString()} km
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic block mt-2">Next cycle</span>
                  )}
                </div>
              );
            })()}

            {/* 2. First Quarter */}
            {(() => {
              const p = monthlyData.majorPhases.find((x) => x.phaseType === 'FIRST_QUARTER');
              return (
                <div
                  onClick={() => {
                    if (p) {
                      const d = monthlyData.days.find((x) => x.dateStr === p.dateStr);
                      if (d) setSelectedDayInfo(d);
                    }
                  }}
                  className="bg-slate-900/90 hover:bg-slate-850 p-3.5 rounded-xl border border-slate-800/80 cursor-pointer transition-all hover:border-blue-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-300">🌓 First Quarter</span>
                    <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded">
                      50% Lit
                    </span>
                  </div>
                  {p ? (
                    <div className="mt-2.5">
                      <span className="text-sm font-bold text-white block">
                        {new Date(p.dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-blue-300 font-mono block mt-0.5">
                        {p.exactTimeLocalStr}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Waxing in {selectedCity.timezone.split('/')[1] || selectedCity.timezone}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic block mt-2">Intermediate phase</span>
                  )}
                </div>
              );
            })()}

            {/* 3. Full Moon */}
            {(() => {
              const p = monthlyData.majorPhases.find((x) => x.phaseType === 'FULL_MOON');
              return (
                <div
                  onClick={() => {
                    if (p) {
                      const d = monthlyData.days.find((x) => x.dateStr === p.dateStr);
                      if (d) setSelectedDayInfo(d);
                    }
                  }}
                  className="bg-slate-900/90 hover:bg-slate-850 p-3.5 rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-transparent cursor-pointer transition-all hover:border-amber-400 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-300">🌕 Full Moon</span>
                    <span className="text-[10px] font-mono bg-amber-500 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                      100% Lit
                    </span>
                  </div>
                  {p ? (
                    <div className="mt-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-white">
                          {new Date(p.dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        {p.isSupermoon && (
                          <span className="text-[9px] font-extrabold uppercase bg-amber-400 text-slate-950 px-1 rounded">
                            Supermoon
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-amber-300 font-mono block mt-0.5">
                        {p.exactTimeLocalStr}
                      </span>
                      <span className="text-[10px] text-slate-300 block mt-1 font-semibold">
                        &quot;{monthlyData.traditionalFullMoonName}&quot;
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic block mt-2">Next cycle</span>
                  )}
                </div>
              );
            })()}

            {/* 4. Third / Last Quarter */}
            {(() => {
              const p = monthlyData.majorPhases.find((x) => x.phaseType === 'THIRD_QUARTER');
              return (
                <div
                  onClick={() => {
                    if (p) {
                      const d = monthlyData.days.find((x) => x.dateStr === p.dateStr);
                      if (d) setSelectedDayInfo(d);
                    }
                  }}
                  className="bg-slate-900/90 hover:bg-slate-850 p-3.5 rounded-xl border border-slate-800/80 cursor-pointer transition-all hover:border-purple-500/50 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-300">🌗 Third Quarter</span>
                    <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">
                      50% Lit
                    </span>
                  </div>
                  {p ? (
                    <div className="mt-2.5">
                      <span className="text-sm font-bold text-white block">
                        {new Date(p.dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-[11px] text-purple-300 font-mono block mt-0.5">
                        {p.exactTimeLocalStr}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Waning to New Moon
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic block mt-2">Intermediate phase</span>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ---------------- MAIN SPLIT: MONTHLY GRID & DAILY INSPECTOR ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MONTHLY CALENDAR GRID (7 COLUMNS) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Daily Lunar Phase Grid</span>
            </h3>
            <span className="text-xs text-slate-500">
              Click any date to inspect full lunar telemetry
            </span>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[11px] text-slate-500 dark:text-slate-400 py-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grid of Days */}
          <div className="grid grid-cols-7 gap-1.5">
            {monthlyData.days.map((item, idx) => {
              const isSelected = activeSelectedDay.dateStr === item.dateStr;
              const isMajor = item.isMajorPhase;

              return (
                <button
                  key={`${item.dateStr}-${idx}`}
                  type="button"
                  onClick={() => {
                    setSelectedDayInfo(item);
                    if (onDateChange && item.isCurrentMonth) {
                      onDateChange(item.date);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all text-left min-h-[86px] sm:min-h-[96px] cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-400/40 shadow-md z-10'
                      : item.isCurrentMonth
                      ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      : 'bg-slate-100/40 dark:bg-slate-900/30 border-transparent opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Top Day Number & Badges */}
                  <div className="w-full flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono ${
                        item.isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]'
                          : isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 font-black'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.day}
                    </span>

                    {/* Major Phase Pill */}
                    {isMajor && item.isCurrentMonth && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-xs" title={item.phaseName} />
                    )}
                  </div>

                  {/* Visual Moon Phase Icon */}
                  <div className="my-1 py-0.5">
                    <MoonPhaseIcon
                      phaseFraction={item.phaseFraction}
                      illuminationPercent={item.illuminationPercent}
                      size={28}
                    />
                  </div>

                  {/* Illumination % and Zodiac */}
                  <div className="w-full text-center">
                    <span className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-300 block leading-tight">
                      {item.illuminationPercent}%
                    </span>
                    <span className="text-[9px] text-slate-500 truncate block mt-0.5">
                      {item.isMajorPhase && item.majorPhaseType ? (
                        <strong className="text-amber-600 dark:text-amber-400">
                          {item.majorPhaseType === 'FULL_MOON' ? 'Full' : item.majorPhaseType === 'NEW_MOON' ? 'New' : 'Quarter'}
                        </strong>
                      ) : (
                        item.zodiacSymbol
                      )}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Grid Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Major Quarter
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-4 rounded-full bg-indigo-600 text-white inline-flex items-center justify-center text-[9px] font-bold">17</span> Today
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Synodic Cycle: ~29.53 Days
            </span>
          </div>
        </div>

        {/* DAILY LUNAR TELEMETRY INSPECTOR (SIDE PANEL) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-950 text-white rounded-2xl border border-slate-800 p-5 shadow-lg space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 flex items-center gap-1">
                  <Eye className="w-3 h-3" /> Selected Date Telemetry
                </span>
                <h4 className="text-lg font-black text-white mt-0.5">
                  {activeSelectedDay.date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  {activeSelectedDay.illuminationPercent}% Lit
                </span>
              </div>
            </div>

            {/* Big Interactive Lunar Sphere Visual */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 flex flex-col items-center justify-center text-center">
              <MoonPhaseIcon
                phaseFraction={activeSelectedDay.phaseFraction}
                illuminationPercent={activeSelectedDay.illuminationPercent}
                size={84}
                className="mb-3"
              />
              <span className="text-base font-extrabold text-white">
                {activeSelectedDay.phaseName}
              </span>
              <span className="text-xs text-slate-400 mt-0.5">
                {activeSelectedDay.phaseFraction < 0.5 ? 'Waxing (Growing)' : 'Waning (Shrinking)'}
              </span>

              {activeSelectedDay.traditionalMoonName && (
                <span className="mt-2 text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-700/60 px-3 py-1 rounded-full">
                  🌕 {activeSelectedDay.traditionalMoonName}
                </span>
              )}
            </div>

            {/* Detailed Metric Tiles */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Moon Age */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Moon Age</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">
                  {activeSelectedDay.moonAgeDays} days
                </span>
                <span className="text-[10px] text-slate-500">of 29.53 day cycle</span>
              </div>

              {/* Distance from Earth */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Distance</span>
                <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 block">
                  {activeSelectedDay.distanceKm.toLocaleString()} km
                </span>
                <span className="text-[10px] text-slate-500">
                  {activeSelectedDay.distanceKm < 365000 ? 'Near Perigee' : activeSelectedDay.distanceKm > 400000 ? 'Near Apogee' : 'Average orbit'}
                </span>
              </div>

              {/* Moonrise */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Moonrise</span>
                <span className="text-sm font-bold text-blue-400 font-mono mt-0.5 block">
                  {activeSelectedDay.moonrise
                    ? activeSelectedDay.moonrise.toLocaleTimeString('en-US', {
                        timeZone: selectedCity.timezone,
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : '--:--'}
                </span>
                <span className="text-[10px] text-slate-500">{selectedCity.name} Local</span>
              </div>

              {/* Moonset */}
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Moonset</span>
                <span className="text-sm font-bold text-orange-400 font-mono mt-0.5 block">
                  {activeSelectedDay.moonset
                    ? activeSelectedDay.moonset.toLocaleTimeString('en-US', {
                        timeZone: selectedCity.timezone,
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      })
                    : '--:--'}
                </span>
                <span className="text-[10px] text-slate-500">{selectedCity.name} Local</span>
              </div>
            </div>

            {/* Zodiac & Constellation */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeSelectedDay.zodiacSymbol}</span>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Zodiac Position</span>
                  <span className="font-bold text-slate-200">{activeSelectedDay.zodiacSign}</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-indigo-300">
                Constellation
              </span>
            </div>

            {/* Set as Target Date Action */}
            {onDateChange && (
              <button
                type="button"
                onClick={() => onDateChange(activeSelectedDay.date)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Set Astronomical Ephemeris to this Date</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Traditional Almanac Note */}
          <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 text-xs space-y-1.5">
            <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>About the {monthlyData.traditionalFullMoonName}</span>
            </span>
            <p className="text-amber-800 dark:text-amber-200/80 text-[11px]">
              {TRADITIONAL_FULL_MOON_NAMES[currentMonth]?.description || 'Traditional full moon names originate from indigenous folklore, early colonial almanacs, and seasonal agricultural markers.'}
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- 8 LUNAR PHASES EDUCATIONAL REFERENCE GUIDE ---------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>The 8 Astronomical Lunar Cycle Phases</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-center text-xs">
          {[
            { name: 'New Moon', fraction: 0, lit: 0, symbol: '🌑' },
            { name: 'Waxing Crescent', fraction: 0.125, lit: 25, symbol: '🌒' },
            { name: 'First Quarter', fraction: 0.25, lit: 50, symbol: '🌓' },
            { name: 'Waxing Gibbous', fraction: 0.375, lit: 75, symbol: '🌔' },
            { name: 'Full Moon', fraction: 0.5, lit: 100, symbol: '🌕' },
            { name: 'Waning Gibbous', fraction: 0.625, lit: 75, symbol: '🌖' },
            { name: 'Third Quarter', fraction: 0.75, lit: 50, symbol: '🌗' },
            { name: 'Waning Crescent', fraction: 0.875, lit: 25, symbol: '🌘' }
          ].map((ph) => (
            <div
              key={ph.name}
              className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-between space-y-1.5"
            >
              <MoonPhaseIcon phaseFraction={ph.fraction} illuminationPercent={ph.lit} size={32} />
              <strong className="text-[11px] text-slate-800 dark:text-slate-200 leading-tight">
                {ph.name}
              </strong>
              <span className="text-[10px] text-slate-500 font-mono">
                {ph.lit}% Lit
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
