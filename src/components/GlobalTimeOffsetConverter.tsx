import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowRightLeft,
  Clock,
  Globe,
  Zap,
  Radio,
  Sliders,
  Calendar,
  Layers,
  Copy,
  Check,
  Info,
  Sun,
  Moon,
  Sparkles,
  Search,
  ChevronDown,
  Activity,
  Compass,
  ArrowRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import { City } from '../types';
import { getTimezoneOffsetInfo, getTimeInTimezone } from '../lib/timezoneUtils';
import {
  CURRENT_TAI_UTC_OFFSET,
  CURRENT_GPS_UTC_OFFSET,
  CURRENT_TT_TAI_OFFSET,
  CURRENT_TT_UTC_OFFSET,
  IERS_BULLETIN_INFO
} from '../lib/leapSecondData';

export interface GlobalTimeOffsetConverterProps {
  initialCityAId?: string;
  initialCityBId?: string;
}

export const GlobalTimeOffsetConverter: React.FC<GlobalTimeOffsetConverterProps> = ({
  initialCityAId = 'nyc',
  initialCityBId = 'lon'
}) => {
  // Cities Selection
  const [cityA, setCityA] = useState<City>(() => MAJOR_CITIES.find(c => c.id === initialCityAId) || MAJOR_CITIES[0]);
  const [cityB, setCityB] = useState<City>(() => MAJOR_CITIES.find(c => c.id === initialCityBId) || MAJOR_CITIES[1]);

  // Search & Dropdown State
  const [searchQueryA, setSearchQueryA] = useState('');
  const [searchQueryB, setSearchQueryB] = useState('');
  const [isSearchingA, setIsSearchingA] = useState(false);
  const [isSearchingB, setIsSearchingB] = useState(false);

  // Time Mode: Live Ticking vs Custom Picked
  const [isLiveTicking, setIsLiveTicking] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [customDateTime, setCustomDateTime] = useState<string>(() => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  // Hypothetical Leap Adjustment override for testing impact
  const [leapOverrideSec, setLeapOverrideSec] = useState<number>(0); // -1, 0, +1, +2
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Active date used for computations
  const effectiveDate = useMemo(() => {
    if (isLiveTicking) return currentTime;
    const parsed = new Date(customDateTime);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [isLiveTicking, currentTime, customDateTime]);

  // Ticking effect for live mode
  useEffect(() => {
    if (!isLiveTicking) return;
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isLiveTicking]);

  // Filtered Cities for Search
  const filteredCitiesA = useMemo(() => {
    if (!searchQueryA.trim()) return MAJOR_CITIES.slice(0, 12);
    return searchCities(searchQueryA).slice(0, 12);
  }, [searchQueryA]);

  const filteredCitiesB = useMemo(() => {
    if (!searchQueryB.trim()) return MAJOR_CITIES.slice(0, 12);
    return searchCities(searchQueryB).slice(0, 12);
  }, [searchQueryB]);

  // Swap Cities A <-> B
  const handleSwapCities = () => {
    const temp = cityA;
    setCityA(cityB);
    setCityB(temp);
  };

  // Preset Pair Quick Selector
  const handleApplyPreset = (idA: string, idB: string) => {
    const foundA = MAJOR_CITIES.find(c => c.id === idA);
    const foundB = MAJOR_CITIES.find(c => c.id === idB);
    if (foundA) setCityA(foundA);
    if (foundB) setCityB(foundB);
  };

  // Precise Time Calculations for City A and City B
  const calculations = useMemo(() => {
    const infoA = getTimezoneOffsetInfo(effectiveDate, cityA.timezone);
    const infoB = getTimezoneOffsetInfo(effectiveDate, cityB.timezone);

    // Civil Offset Delta in minutes
    const offsetDiffMinutes = infoB.offsetMinutes - infoA.offsetMinutes;
    const offsetDiffHours = offsetDiffMinutes / 60;
    const absDiffMinutes = Math.abs(offsetDiffMinutes);
    const diffHoursPart = Math.floor(absDiffMinutes / 60);
    const diffMinsPart = absDiffMinutes % 60;

    const signText = offsetDiffMinutes > 0 ? 'ahead of' : offsetDiffMinutes < 0 ? 'behind' : 'same time as';
    const formattedDiffText = offsetDiffMinutes === 0
      ? 'Identical civil timezone offset'
      : `${diffHoursPart}h ${diffMinsPart > 0 ? `${diffMinsPart}m ` : ''}${signText} ${cityA.name}`;

    // Solar Solar Noon & Natural Astronomical Drift by Longitude
    // 360 deg = 24 hours -> 1 degree longitude = 4 minutes of solar time
    const lngDiffDeg = cityB.lng - cityA.lng;
    const solarTimeDiffMinutes = lngDiffDeg * 4;
    const solarDiffHours = Math.floor(Math.abs(solarTimeDiffMinutes) / 60);
    const solarDiffMins = Math.round(Math.abs(solarTimeDiffMinutes) % 60);
    const solarSignText = solarTimeDiffMinutes >= 0 ? 'eastward solar lead' : 'westward solar lag';

    // Atomic Standards (TAI, GPS, TT)
    const baseTaiOffset = CURRENT_TAI_UTC_OFFSET + leapOverrideSec;
    const baseGpsOffset = CURRENT_GPS_UTC_OFFSET + leapOverrideSec;
    const baseTtOffset = CURRENT_TT_UTC_OFFSET + leapOverrideSec;

    // Epoch Timestamps in milliseconds
    const utcMs = effectiveDate.getTime();
    const taiMs = utcMs + baseTaiOffset * 1000;
    const gpsMs = utcMs + baseGpsOffset * 1000;
    const ttMs = utcMs + baseTtOffset * 1000;
    const dut1Ms = utcMs + 38.4; // DUT1 = +0.0384s

    const formatTime = (d: Date, tz: string) => {
      return d.toLocaleTimeString('en-US', {
        timeZone: tz,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    const formatDate = (d: Date, tz: string) => {
      return d.toLocaleDateString('en-US', {
        timeZone: tz,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const timeA = formatTime(effectiveDate, cityA.timezone);
    const dateA = formatDate(effectiveDate, cityA.timezone);
    const timeB = formatTime(effectiveDate, cityB.timezone);
    const dateB = formatDate(effectiveDate, cityB.timezone);

    // Atomic representations
    const formatAtomicUtc = (ms: number) => {
      const d = new Date(ms);
      const h = d.getUTCHours().toString().padStart(2, '0');
      const m = d.getUTCMinutes().toString().padStart(2, '0');
      const s = d.getUTCSeconds().toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    return {
      infoA,
      infoB,
      timeA,
      dateA,
      timeB,
      dateB,
      offsetDiffMinutes,
      offsetDiffHours,
      formattedDiffText,
      lngDiffDeg: lngDiffDeg.toFixed(2),
      solarTimeDiffMinutes: solarTimeDiffMinutes.toFixed(1),
      solarDiffText: `${solarDiffHours}h ${solarDiffMins}m (${solarSignText})`,
      baseTaiOffset,
      baseGpsOffset,
      baseTtOffset,
      taiTime: formatAtomicUtc(taiMs),
      gpsTime: formatAtomicUtc(gpsMs),
      ttTime: formatAtomicUtc(ttMs),
      ut1Time: formatAtomicUtc(dut1Ms),
      effectiveDate
    };
  }, [cityA, cityB, effectiveDate, leapOverrideSec]);

  // Hourly Matrix Generation for Visual 24-Hour Comparison
  const hourlyComparison = useMemo(() => {
    const hours = [];
    const baseYear = effectiveDate.getFullYear();
    const baseMonth = effectiveDate.getMonth();
    const baseDay = effectiveDate.getDate();

    for (let h = 0; h < 24; h += 2) {
      const sampleDate = new Date(Date.UTC(baseYear, baseMonth, baseDay, h, 0, 0));
      
      const timeInA = sampleDate.toLocaleTimeString('en-US', {
        timeZone: cityA.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
      const timeInB = sampleDate.toLocaleTimeString('en-US', {
        timeZone: cityB.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });

      const hourA = parseInt(timeInA.split(':')[0], 10);
      const isBizA = hourA >= 9 && hourA <= 18;
      const isNightA = hourA < 6 || hourA >= 22;

      const hourB = parseInt(timeInB.split(':')[0], 10);
      const isBizB = hourB >= 9 && hourB <= 18;
      const isNightB = hourB < 6 || hourB >= 22;

      const isMutualOverlap = isBizA && isBizB;

      hours.push({
        utcHour: h,
        timeInA,
        timeInB,
        hourA,
        hourB,
        isBizA,
        isNightA,
        isBizB,
        isNightB,
        isMutualOverlap
      });
    }
    return hours;
  }, [effectiveDate, cityA, cityB]);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const summary = `=== TIMEGOVERN GLOBAL TIME & ATOMIC OFFSET CONVERTER ===
Origin City: ${cityA.name} (${cityA.timezone}, ${calculations.infoA.offsetFormatted})
Destination City: ${cityB.name} (${cityB.timezone}, ${calculations.infoB.offsetFormatted})
Effective Civil Delta: ${calculations.formattedDiffText} (${calculations.offsetDiffHours > 0 ? '+' : ''}${calculations.offsetDiffHours}h)
Local Time A: ${calculations.dateA} ${calculations.timeA} (${calculations.infoA.abbreviation})
Local Time B: ${calculations.dateB} ${calculations.timeB} (${calculations.infoB.abbreviation})

--- ATOMIC TIME SCALES & LEAP ADJUSTMENTS ---
Active Leap Seconds Inserted: ${calculations.baseTaiOffset - 10} (+${calculations.baseTaiOffset}s TAI-UTC total)
TAI Atomic Time: ${calculations.taiTime} UTC (+${calculations.baseTaiOffset}s ahead of UTC)
GPS Navigation Time: ${calculations.gpsTime} UTC (+${calculations.baseGpsOffset}s ahead of UTC)
Solar Longitude Delta: ${calculations.lngDiffDeg}° (${calculations.solarDiffText})
IERS Protocol: Bulletin C 68 Active (TAI-UTC = +37s)
Calculated by TimeGovern Precision Engine: ${new Date().toISOString()}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div id="global-time-offset-converter" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-6">
      {/* 1. Header with Mode Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              Global Atomic Time Offset Converter
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
              <Radio className="w-3 h-3 text-cyan-400" /> Sub-Second Atomic Resolution
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Select two world cities to compute the exact civil time difference, solar longitude lag, and atomic scale offsets (<strong className="text-cyan-300">TAI</strong>, <strong className="text-amber-300">GPS</strong>, <strong className="text-purple-300">TT</strong>), incorporating the active <strong className="text-cyan-400">+37s</strong> leap second discrepancy.
          </p>
        </div>

        {/* Live vs Custom Picker Toggle */}
        <div className="flex items-center gap-2 self-start lg:self-center">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setIsLiveTicking(true)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                isLiveTicking
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
              <span>Live Clock</span>
            </button>
            <button
              onClick={() => setIsLiveTicking(false)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                !isLiveTicking
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Custom Epoch</span>
            </button>
          </div>

          <button
            onClick={handleCopySummary}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Copy full atomic offset conversion report"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{copiedSummary ? 'Copied' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* 2. Custom Date-Time Picker (when not in Live Mode) */}
      {!isLiveTicking && (
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">Set Reference Target Timestamp:</span>
          </div>
          <input
            type="datetime-local"
            value={customDateTime}
            onChange={(e) => setCustomDateTime(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
          />
        </div>
      )}

      {/* 3. Popular City Pair Presets */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Quick Preset City Pairs:
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { a: 'nyc', b: 'lon', label: 'New York ⇄ London' },
            { a: 'sfo', b: 'tyo', label: 'San Francisco ⇄ Tokyo' },
            { a: 'lon', b: 'syd', label: 'London ⇄ Sydney' },
            { a: 'par', b: 'sin', label: 'Paris ⇄ Singapore' },
            { a: 'fra', b: 'dxb', label: 'Frankfurt ⇄ Dubai' },
            { a: 'nyc', b: 'lax', label: 'New York ⇄ Los Angeles' },
          ].map(p => (
            <button
              key={`${p.a}-${p.b}`}
              onClick={() => handleApplyPreset(p.a, p.b)}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer font-medium"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Interactive Dual City Selector Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
        {/* City A Card */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Origin City (A)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {calculations.infoA.offsetFormatted} ({calculations.infoA.abbreviation})
            </span>
          </div>

          {/* City Selection Header with Dropdown Search */}
          <div className="relative">
            <button
              onClick={() => { setIsSearchingA(!isSearchingA); setIsSearchingB(false); }}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{cityA.countryCode === 'US' ? '🇺🇸' : cityA.countryCode === 'GB' ? '🇬🇧' : cityA.countryCode === 'JP' ? '🇯🇵' : '📍'}</span>
                <div>
                  <div className="font-bold text-sm text-white">{cityA.name}, {cityA.country}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{cityA.timezone}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isSearchingA && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search world cities..."
                    value={searchQueryA}
                    onChange={(e) => setSearchQueryA(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredCitiesA.map(city => (
                    <button
                      key={city.id}
                      onClick={() => { setCityA(city); setIsSearchingA(false); setSearchQueryA(''); }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-cyan-600 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-medium">{city.name}, {city.country}</span>
                      <span className="font-mono text-[10px] opacity-75">{city.timezone.split('/')[1] || city.timezone}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time & Coordinates Display */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">{calculations.dateA}</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-cyan-300">{calculations.timeA}</span>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-400">
              <div>Lat: {cityA.lat.toFixed(2)}°</div>
              <div>Lng: {cityA.lng.toFixed(2)}°</div>
            </div>
          </div>
        </div>

        {/* Center Swap Button & Delta Metric */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center gap-2">
          <button
            onClick={handleSwapCities}
            className="p-3 rounded-full bg-slate-800 hover:bg-cyan-600 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-white transition-all transform hover:rotate-180 duration-300 shadow-lg cursor-pointer"
            title="Swap Origin and Destination Cities"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-400 text-center">
            {calculations.offsetDiffHours > 0 ? `+${calculations.offsetDiffHours}h` : `${calculations.offsetDiffHours}h`}
          </span>
        </div>

        {/* City B Card */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" /> Destination City (B)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              {calculations.infoB.offsetFormatted} ({calculations.infoB.abbreviation})
            </span>
          </div>

          {/* City Selection Header with Dropdown Search */}
          <div className="relative">
            <button
              onClick={() => { setIsSearchingB(!isSearchingB); setIsSearchingA(false); }}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-2.5 flex items-center justify-between text-left transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{cityB.countryCode === 'US' ? '🇺🇸' : cityB.countryCode === 'GB' ? '🇬🇧' : cityB.countryCode === 'JP' ? '🇯🇵' : '📍'}</span>
                <div>
                  <div className="font-bold text-sm text-white">{cityB.name}, {cityB.country}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{cityB.timezone}</div>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isSearchingB && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-30 space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search world cities..."
                    value={searchQueryB}
                    onChange={(e) => setSearchQueryB(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredCitiesB.map(city => (
                    <button
                      key={city.id}
                      onClick={() => { setCityB(city); setIsSearchingB(false); setSearchQueryB(''); }}
                      className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:bg-amber-600 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="font-medium">{city.name}, {city.country}</span>
                      <span className="font-mono text-[10px] opacity-75">{city.timezone.split('/')[1] || city.timezone}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time & Coordinates Display */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block">{calculations.dateB}</span>
              <span className="text-2xl sm:text-3xl font-mono font-black text-amber-300">{calculations.timeB}</span>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-400">
              <div>Lat: {cityB.lat.toFixed(2)}°</div>
              <div>Lng: {cityB.lng.toFixed(2)}°</div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Comprehensive Time Scale & Leap Second Differential Breakdown */}
      <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">
              Multi-Scale Atomic & Astronomical Differential Engine
            </h4>
          </div>

          {/* Leap Second Adjustment Override Selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Leap Adjustment:</span>
            {[-1, 0, 1].map(sec => (
              <button
                key={sec}
                onClick={() => setLeapOverrideSec(sec)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                  leapOverrideSec === sec
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {sec === 0 ? 'Active (+37s)' : sec > 0 ? `+${sec}s Step` : `${sec}s Skip`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Tile 1: Civil Offset Difference */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Civil Time Difference
            </span>
            <div className="text-lg font-black font-mono text-cyan-300">
              {calculations.offsetDiffHours > 0 ? `+${calculations.offsetDiffHours} hrs` : `${calculations.offsetDiffHours} hrs`}
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              {calculations.formattedDiffText}
            </p>
          </div>

          {/* Tile 2: International Atomic Time (TAI) */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> TAI Atomic Offset
            </span>
            <div className="text-lg font-black font-mono text-emerald-300">
              +{calculations.baseTaiOffset}s TAI-UTC
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Pure atomic Cesium reference: <span className="text-emerald-400 font-mono">{calculations.taiTime}</span> UTC
            </p>
          </div>

          {/* Tile 3: Satellite Navigation Time (GPS) */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Radio className="w-3 h-3 text-amber-400" /> GPS Satellite Scale
            </span>
            <div className="text-lg font-black font-mono text-amber-300">
              +{calculations.baseGpsOffset}s GPS-UTC
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Constellation timeline: <span className="text-amber-400 font-mono">{calculations.gpsTime}</span> UTC (TAI - 19s)
            </p>
          </div>

          {/* Tile 4: Solar Longitude Drift */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Sun className="w-3 h-3 text-yellow-400" /> True Solar Solar Noon
            </span>
            <div className="text-lg font-black font-mono text-yellow-300">
              {calculations.lngDiffDeg}° Longitude
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Natural solar differential: <span className="text-yellow-400">{calculations.solarDiffText}</span>
            </p>
          </div>
        </div>

        {/* Deep Synchronization Explainer Box */}
        <div className="p-3.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-200 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1 leading-relaxed">
            <span className="font-bold text-white">How Leap Seconds Affect This Calculation:</span>
            <p className="text-slate-300 text-[11px]">
              Civil clocks in both <strong className="text-white">{cityA.name}</strong> and <strong className="text-white">{cityB.name}</strong> maintain an integer hour offset derived from UTC. However, high-precision atomic time (<strong className="text-cyan-300">TAI</strong>) never leaps—it runs continuously at 86,400 SI seconds per day. Over the last 54 years, <strong>27 leap seconds</strong> have created a <strong className="text-emerald-300">37.000s</strong> delta between pure atomic clocks and civil world clocks.
            </p>
          </div>
        </div>
      </div>

      {/* 6. 24-Hour Visual Hourly Overlap Matrix */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            24-Hour Cross-Timezone Synchronization Ruler
          </h4>
          <div className="flex items-center gap-3 text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-emerald-500 inline-block"></span> Working Hours (9 AM - 6 PM)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded bg-slate-700 inline-block"></span> Night / Sleep
            </span>
          </div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px] grid grid-cols-12 gap-1.5 text-center text-xs">
            {hourlyComparison.map((slot) => (
              <div
                key={slot.utcHour}
                className={`p-2 rounded-xl border transition-all ${
                  slot.isMutualOverlap
                    ? 'bg-emerald-950/60 border-emerald-500/80 ring-1 ring-emerald-500/50 shadow-md'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="text-[10px] font-mono text-slate-400 border-b border-slate-800/80 pb-1 mb-1.5">
                  {slot.utcHour.toString().padStart(2, '0')}:00 UTC
                </div>

                {/* City A Time */}
                <div className="mb-1.5">
                  <span className="text-[9px] text-slate-400 block truncate">{cityA.name.slice(0, 7)}</span>
                  <span className={`font-mono font-bold text-xs ${
                    slot.isBizA ? 'text-cyan-300 font-extrabold' : 'text-slate-400'
                  }`}>
                    {slot.timeInA}
                  </span>
                </div>

                {/* City B Time */}
                <div>
                  <span className="text-[9px] text-slate-400 block truncate">{cityB.name.slice(0, 7)}</span>
                  <span className={`font-mono font-bold text-xs ${
                    slot.isBizB ? 'text-amber-300 font-extrabold' : 'text-slate-400'
                  }`}>
                    {slot.timeInB}
                  </span>
                </div>

                {/* Indicator Badge */}
                <div className="mt-2 pt-1 border-t border-slate-900 flex justify-center">
                  {slot.isMutualOverlap ? (
                    <span className="px-1 py-0.5 rounded text-[8px] font-extrabold bg-emerald-500/30 text-emerald-300 uppercase">
                      Overlap
                    </span>
                  ) : slot.isNightA || slot.isNightB ? (
                    <Moon className="w-2.5 h-2.5 text-slate-500" />
                  ) : (
                    <Sun className="w-2.5 h-2.5 text-slate-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
