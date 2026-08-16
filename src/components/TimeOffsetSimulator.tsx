import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Globe,
  Zap,
  ArrowRight,
  ShieldAlert,
  Server,
  Activity,
  Layers,
  Sparkles,
  ChevronRight,
  Calendar,
  Info,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  RefreshCw,
  FastForward,
  Rewind
} from 'lucide-react';
import {
  CURRENT_TAI_UTC_OFFSET,
  CURRENT_GPS_UTC_OFFSET,
  CURRENT_TT_TAI_OFFSET
} from '../lib/leapSecondData';

export interface WorldClockCity {
  id: string;
  name: string;
  country: string;
  timezone: string;
  baseUtcOffset: number; // in hours, e.g. +9 for Tokyo
  flag: string;
}

export const SIMULATOR_CITIES: WorldClockCity[] = [
  { id: 'utc', name: 'UTC Reference', country: 'Prime Meridian', timezone: 'UTC', baseUtcOffset: 0, flag: '🌐' },
  { id: 'london', name: 'London', country: 'United Kingdom', timezone: 'Europe/London', baseUtcOffset: 0, flag: '🇬🇧' },
  { id: 'newyork', name: 'New York', country: 'United States (EST)', timezone: 'America/New_York', baseUtcOffset: -5, flag: '🇺🇸' },
  { id: 'sanfrancisco', name: 'San Francisco', country: 'United States (PST)', timezone: 'America/Los_Angeles', baseUtcOffset: -8, flag: '🇺🇸' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan (JST)', timezone: 'Asia/Tokyo', baseUtcOffset: 9, flag: '🇯🇵' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore (SGT)', timezone: 'Asia/Singapore', baseUtcOffset: 8, flag: '🇸🇬' },
  { id: 'sydney', name: 'Sydney', country: 'Australia (AEST)', timezone: 'Australia/Sydney', baseUtcOffset: 10, flag: '🇦🇺' },
  { id: 'paris', name: 'Paris / Frankfurt', country: 'European Union (CET)', timezone: 'Europe/Paris', baseUtcOffset: 1, flag: '🇪🇺' },
  { id: 'dubai', name: 'Dubai', country: 'United Arab Emirates (GST)', timezone: 'Asia/Dubai', baseUtcOffset: 4, flag: '🇦🇪' },
];

export interface EpochPreset {
  id: string;
  title: string;
  dateStr: string; // YYYY-MM-DD
  timeUtc: string; // HH:mm:ss
  leapType: 'positive' | 'negative' | 'none';
  leapSeconds: number; // +1, -1, 0
  historicalTaiOffset: number;
  historicalGpsOffset: number | null;
  category: 'historical' | 'future' | 'hypothetical';
  description: string;
  realWorldImpact: string;
}

export const EPOCH_PRESETS: EpochPreset[] = [
  {
    id: 'hist-1972',
    title: '1972-06-30 (UTC Inception First Leap)',
    dateStr: '1972-06-30',
    timeUtc: '23:59:59',
    leapType: 'positive',
    leapSeconds: 1,
    historicalTaiOffset: 10,
    historicalGpsOffset: null,
    category: 'historical',
    description: 'The very first leap second in UTC history, stepping TAI-UTC from +10s to +11s.',
    realWorldImpact: 'Established the ITU-R standard 23:59:60 leap second protocol across global radio broadcasts (WWV, CHU, DCF77).'
  },
  {
    id: 'hist-1980',
    title: '1980-01-06 (GPS Epoch Zero Baseline)',
    dateStr: '1980-01-06',
    timeUtc: '00:00:00',
    leapType: 'none',
    leapSeconds: 0,
    historicalTaiOffset: 19,
    historicalGpsOffset: 0,
    category: 'historical',
    description: 'GPS Time was born with GPS-UTC = 0s and TAI-GPS = 19s. GPS time has never inserted a leap second since.',
    realWorldImpact: 'GPS satellites maintain an uninterrupted atomic timeline; GPS receivers must continuously apply broadcast leap corrections.'
  },
  {
    id: 'hist-2012',
    title: '2012-06-30 (The Great Internet NTP Outage)',
    dateStr: '2012-06-30',
    timeUtc: '23:59:59',
    leapType: 'positive',
    leapSeconds: 1,
    historicalTaiOffset: 34,
    historicalGpsOffset: 15,
    category: 'historical',
    description: 'The historic Linux kernel futex bug crashed major servers worldwide (Reddit, Qantas, LinkedIn, Yelp, Mozilla).',
    realWorldImpact: 'Directly compelled Google, AWS, and Cloudflare to develop 24-hour linear NTP leap smearing engines to prevent simultaneous server crashes.'
  },
  {
    id: 'hist-2016',
    title: '2016-12-31 (Most Recent Real Leap Second)',
    dateStr: '2016-12-31',
    timeUtc: '23:59:59',
    leapType: 'positive',
    leapSeconds: 1,
    historicalTaiOffset: 36,
    historicalGpsOffset: 17,
    category: 'historical',
    description: 'The 27th leap second in UTC history, bringing TAI-UTC to +37s and GPS-UTC to +18s where it remains today.',
    realWorldImpact: 'Successfully handled by cloud providers using synchronized leap smearing; marked the beginning of the longest drought in modern history.'
  },
  {
    id: 'future-2026',
    title: '2026-12-31 (Hypothetical +1s Positive Insertion)',
    dateStr: '2026-12-31',
    timeUtc: '23:59:59',
    leapType: 'positive',
    leapSeconds: 1,
    historicalTaiOffset: 37,
    historicalGpsOffset: 18,
    category: 'future',
    description: 'Simulates what would happen if IERS inserted a surprise positive leap second at the end of 2026.',
    realWorldImpact: 'Would step TAI-UTC to +38s and GPS-UTC to +19s, triggering leap smearing routines across cloud data centers.'
  },
  {
    id: 'hypo-2029',
    title: '2029-06-30 (Hypothetical -1s Negative Leap)',
    dateStr: '2029-06-30',
    timeUtc: '23:59:58',
    leapType: 'negative',
    leapSeconds: -1,
    historicalTaiOffset: 37,
    historicalGpsOffset: 18,
    category: 'hypothetical',
    description: 'Earth rotation acceleration scenario: Skipping second 23:59:59 directly to 00:00:00 (TAI-UTC becomes +36s).',
    realWorldImpact: 'A negative leap has NEVER occurred in human history; software systems lack testing for skipped seconds and could experience index exceptions.'
  },
  {
    id: 'horizon-2035',
    title: '2035-01-01 (CGPM Resolution 4 Continuous Era)',
    dateStr: '2035-01-01',
    timeUtc: '00:00:00',
    leapType: 'none',
    leapSeconds: 0,
    historicalTaiOffset: 37,
    historicalGpsOffset: 18,
    category: 'future',
    description: 'BIPM CGPM Resolution 4 formally takes effect, abolishing discontinuous 1-second shifts indefinitely.',
    realWorldImpact: 'UTC transitions to a continuous timescale, eliminating leap second outages forever while allowing UT1-UTC to drift gracefully.'
  }
];

export const TimeOffsetSimulator: React.FC = () => {
  // Selected Epoch Configuration
  const [selectedPresetId, setSelectedPresetId] = useState<string>('hist-2016');
  const [customDate, setCustomDate] = useState<string>('2026-12-31');
  const [customTime, setCustomTime] = useState<string>('23:59:55');
  const [customLeapType, setCustomLeapType] = useState<'positive' | 'negative' | 'none'>('positive');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Simulation playback state (-5 seconds to +5 seconds relative to leap moment)
  const [simOffsetSeconds, setSimOffsetSeconds] = useState<number>(0); // -5 to +5 seconds around the leap event
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x
  const [smearMode, setSmearMode] = useState<'standard' | 'google-smear' | 'aws-smear' | 'posix-repeat'>('standard');

  // Selected city focus
  const [selectedCityId, setSelectedCityId] = useState<string>('tokyo');

  // Active Preset Data
  const activePreset = useMemo(() => {
    if (isCustomMode) {
      return {
        id: 'custom',
        title: `Custom (${customDate} ${customTime})`,
        dateStr: customDate,
        timeUtc: customTime,
        leapType: customLeapType,
        leapSeconds: customLeapType === 'positive' ? 1 : customLeapType === 'negative' ? -1 : 0,
        historicalTaiOffset: CURRENT_TAI_UTC_OFFSET,
        historicalGpsOffset: CURRENT_GPS_UTC_OFFSET,
        category: 'hypothetical' as const,
        description: 'User-configured custom timestamp and leap second shift parameters.',
        realWorldImpact: 'Custom simulation testing user-defined time synchronization parameters.'
      };
    }
    return EPOCH_PRESETS.find(p => p.id === selectedPresetId) || EPOCH_PRESETS[3];
  }, [isCustomMode, selectedPresetId, customDate, customTime, customLeapType]);

  // Timer animation loop for scrub playback
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      return;
    }

    const loop = (time: number) => {
      if (lastTimeRef.current !== null) {
        const delta = (time - lastTimeRef.current) / 1000;
        setSimOffsetSeconds(prev => {
          const next = prev + delta * playbackSpeed;
          if (next >= 5) {
            setIsPlaying(false);
            return 5;
          }
          return next;
        });
      }
      lastTimeRef.current = time;
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Compute exact time strings across different cities and timescales at current simOffsetSeconds
  const simulationResults = useMemo(() => {
    // Base target date/time: e.g. 2016-12-31 23:59:55
    const [year, month, day] = activePreset.dateStr.split('-').map(Number);
    const [hours, minutes, seconds] = activePreset.timeUtc.split(':').map(Number);

    // Baseline epoch in integer seconds + current fractional offset
    const baselineDate = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds));
    const currentSimUtcMs = baselineDate.getTime() + Math.round(simOffsetSeconds * 1000);
    const currentSimUtcDate = new Date(currentSimUtcMs);

    const isLeapSecondMoment = simOffsetSeconds >= 0 && simOffsetSeconds < 1 && activePreset.leapType !== 'none';
    const isPostLeap = simOffsetSeconds >= 1;

    // Standard ITU-R Step Display
    let utcSecondDisplay: string;
    let specialLeapFlag = false;

    if (activePreset.leapType === 'positive') {
      if (simOffsetSeconds >= 0 && simOffsetSeconds < 1) {
        // EXACT LEAP SECOND: 23:59:60!
        utcSecondDisplay = '23:59:60';
        specialLeapFlag = true;
      } else if (simOffsetSeconds < 0) {
        const s = 59 + Math.floor(simOffsetSeconds);
        utcSecondDisplay = `23:59:${s.toString().padStart(2, '0')}`;
      } else {
        const s = Math.floor(simOffsetSeconds - 1);
        utcSecondDisplay = `00:00:${s.toString().padStart(2, '0')}`;
      }
    } else if (activePreset.leapType === 'negative') {
      if (simOffsetSeconds >= 0 && simOffsetSeconds < 1) {
        // SKIPPED SECOND (23:59:58 -> 00:00:00)
        utcSecondDisplay = '00:00:00 (Skipped 23:59:59)';
        specialLeapFlag = true;
      } else if (simOffsetSeconds < 0) {
        const s = 58 + Math.floor(simOffsetSeconds);
        utcSecondDisplay = `23:59:${s.toString().padStart(2, '0')}`;
      } else {
        const s = Math.floor(simOffsetSeconds);
        utcSecondDisplay = `00:00:${s.toString().padStart(2, '0')}`;
      }
    } else {
      // Standard continuous transition
      const s = Math.floor(simOffsetSeconds);
      if (s < 0) {
        utcSecondDisplay = `23:59:${(60 + s).toString().padStart(2, '0')}`;
      } else {
        utcSecondDisplay = `00:00:${s.toString().padStart(2, '0')}`;
      }
    }

    // Google / AWS Smear Calculations
    // 24-hour linear smear spreads 1000ms over 86,400s -> ~11.57 microseconds per second
    const smearOffsetMs = activePreset.leapType === 'positive' 
      ? Math.min(1000, Math.max(0, (simOffsetSeconds + 5) * 100)) 
      : -Math.min(1000, Math.max(0, (simOffsetSeconds + 5) * 100));

    // Calculate per-city formatted local clocks
    const cityClocks = SIMULATOR_CITIES.map(city => {
      // Local offset hours
      const localHourOffset = city.baseUtcOffset;
      let localHours = (hours + localHourOffset + 24) % 24;
      let localDayShift = 0;
      if (hours + localHourOffset >= 24) localDayShift = 1;
      if (hours + localHourOffset < 0) localDayShift = -1;

      let localClockTime = '';
      let isLocalLeapMoment = false;

      if (activePreset.leapType === 'positive') {
        if (simOffsetSeconds >= 0 && simOffsetSeconds < 1) {
          // The local clock also displays :60 seconds at that exact physical moment!
          const hStr = localHours.toString().padStart(2, '0');
          localClockTime = `${hStr}:59:60`;
          isLocalLeapMoment = true;
        } else if (simOffsetSeconds < 0) {
          const s = 59 + Math.floor(simOffsetSeconds);
          const hStr = localHours.toString().padStart(2, '0');
          localClockTime = `${hStr}:59:${s.toString().padStart(2, '0')}`;
        } else {
          const nextHour = (localHours + 1) % 24;
          const s = Math.floor(simOffsetSeconds - 1);
          const hStr = nextHour.toString().padStart(2, '0');
          localClockTime = `${hStr}:00:${s.toString().padStart(2, '0')}`;
        }
      } else if (activePreset.leapType === 'negative') {
        if (simOffsetSeconds >= 0 && simOffsetSeconds < 1) {
          const nextHour = (localHours + 1) % 24;
          localClockTime = `${nextHour.toString().padStart(2, '0')}:00:00 (Skip)`;
          isLocalLeapMoment = true;
        } else if (simOffsetSeconds < 0) {
          const s = 58 + Math.floor(simOffsetSeconds);
          localClockTime = `${localHours.toString().padStart(2, '0')}:59:${s.toString().padStart(2, '0')}`;
        } else {
          const nextHour = (localHours + 1) % 24;
          const s = Math.floor(simOffsetSeconds);
          localClockTime = `${nextHour.toString().padStart(2, '0')}:00:${s.toString().padStart(2, '0')}`;
        }
      } else {
        const s = Math.floor(simOffsetSeconds);
        if (s < 0) {
          localClockTime = `${localHours.toString().padStart(2, '0')}:59:${(60 + s).toString().padStart(2, '0')}`;
        } else {
          const nextHour = (localHours + 1) % 24;
          localClockTime = `${nextHour.toString().padStart(2, '0')}:00:${s.toString().padStart(2, '0')}`;
        }
      }

      // Smear clock value
      const smearTimeMs = currentSimUtcMs - (smearMode !== 'standard' ? smearOffsetMs : 0);
      const smearDate = new Date(smearTimeMs + localHourOffset * 3600000);
      const smearHours = smearDate.getUTCHours().toString().padStart(2, '0');
      const smearMins = smearDate.getUTCMinutes().toString().padStart(2, '0');
      const smearSecs = smearDate.getUTCSeconds().toString().padStart(2, '0');
      const smearMillis = Math.floor(smearDate.getUTCMilliseconds() / 100).toString();
      const smearedClockTime = `${smearHours}:${smearMins}:${smearSecs}.${smearMillis}`;

      return {
        ...city,
        localClockTime,
        smearedClockTime,
        isLocalLeapMoment,
        dayShiftText: localDayShift === 1 ? 'Next Day (+1d)' : localDayShift === -1 ? 'Previous Day (-1d)' : 'Same Day'
      };
    });

    // Atomic Scales (TAI & GPS are strictly continuous, they never stutter or leap)
    const taiOffset = activePreset.historicalTaiOffset + (isPostLeap && activePreset.leapType === 'positive' ? 1 : isPostLeap && activePreset.leapType === 'negative' ? -1 : 0);
    const gpsOffset = activePreset.historicalGpsOffset !== null 
      ? activePreset.historicalGpsOffset + (isPostLeap && activePreset.leapType === 'positive' ? 1 : isPostLeap && activePreset.leapType === 'negative' ? -1 : 0)
      : null;

    const atomicSeconds = Math.floor(simOffsetSeconds + (activePreset.leapType === 'positive' ? 37 : 0));
    const taiClockTime = `Atomic TAI: Continuous (+${taiOffset}s Ahead of UTC)`;
    const gpsClockTime = gpsOffset !== null 
      ? `GPS Time: Continuous (+${gpsOffset}s Ahead of UTC)`
      : 'GPS System: Unborn (Pre-1980 Epoch)';

    return {
      utcSecondDisplay,
      specialLeapFlag,
      cityClocks,
      taiOffset,
      gpsOffset,
      taiClockTime,
      gpsClockTime,
      currentSimUtcDate
    };
  }, [activePreset, simOffsetSeconds, smearMode]);

  const focusedCity = useMemo(() => {
    return simulationResults.cityClocks.find(c => c.id === selectedCityId) || simulationResults.cityClocks[4];
  }, [simulationResults, selectedCityId]);

  return (
    <div id="time-offset-simulator" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-6">
      {/* 1. Header & Concept Introduction */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
                Interactive Global Time Offset Simulator
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                <Globe className="w-3 h-3 text-cyan-400" /> Multi-City World Clock Matrix
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Explore how local world clocks, atomic time scales (<strong className="text-cyan-300">TAI</strong>), and cloud servers react when a positive or negative leap second is inserted across historical epochs or hypothetical future scenarios.
            </p>
          </div>
        </div>

        {/* Custom vs Preset Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold self-start lg:self-center">
          <button
            onClick={() => setIsCustomMode(false)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              !isCustomMode
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Epoch Presets</span>
          </button>
          <button
            onClick={() => setIsCustomMode(true)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              isCustomMode
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Custom Timestamp</span>
          </button>
        </div>
      </div>

      {/* 2. Epoch Presets & Custom Configuration Selector */}
      {!isCustomMode ? (
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Historical Event or Future Projection:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {EPOCH_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setSelectedPresetId(preset.id);
                    setSimOffsetSeconds(0);
                    setIsPlaying(false);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-blue-950/80 border-cyan-500 text-white ring-1 ring-cyan-500 shadow-md'
                      : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-slate-100">{preset.title.split(' ')[0]}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        preset.leapType === 'positive'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : preset.leapType === 'negative'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        {preset.leapType === 'positive' ? '+1s Step' : preset.leapType === 'negative' ? '-1s Skip' : 'Continuous'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {preset.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>TAI: +{preset.historicalTaiOffset}s</span>
                    <span className="text-cyan-400 font-semibold">{preset.category}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
            Custom Hypothetical Leap Second Parameters:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Target Epoch Date (UTC):</label>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Base Transition Time (UTC):</label>
              <input
                type="time"
                step="1"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">Leap Insertion Type:</label>
              <select
                value={customLeapType}
                onChange={(e) => setCustomLeapType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="positive">Positive (+1s) - Standard Step (23:59:60)</option>
                <option value="negative">Negative (-1s) - Skip Second (23:59:58 &rarr; 00:00:00)</option>
                <option value="none">Continuous (0s) - No Leap Insertion</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. Master Interactive Scrubber & Timeline Controller */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
              Active Simulation Target Epoch:
            </span>
            <h4 className="text-lg font-bold text-white mt-0.5 flex items-center gap-2">
              <span>{activePreset.dateStr} @ {activePreset.timeUtc} UTC</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                activePreset.leapType === 'positive' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }`}>
                {activePreset.leapType === 'positive' ? 'Positive Leap (+1s)' : activePreset.leapType === 'negative' ? 'Negative Leap (-1s)' : 'No Shift'}
              </span>
            </h4>
          </div>

          {/* Player controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSimOffsetSeconds(prev => Math.max(-5, prev - 1))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Step -1.0s"
            >
              <Rewind className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isPlaying
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg hover:bg-amber-400'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Play Simulation'}</span>
            </button>

            <button
              onClick={() => setSimOffsetSeconds(prev => Math.min(5, prev + 1))}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Step +1.0s"
            >
              <FastForward className="w-4 h-4" />
            </button>

            <button
              onClick={() => { setSimOffsetSeconds(0); setIsPlaying(false); }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Reset to Leap Moment (T=0)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-bold">
              {[0.5, 1, 2].map(speed => (
                <button
                  key={speed}
                  onClick={() => setPlaybackSpeed(speed)}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    playbackSpeed === speed ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrub Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">T - 5.0s (Pre-Transition)</span>
            <span className={`font-extrabold px-2.5 py-0.5 rounded-full ${
              simulationResults.specialLeapFlag
                ? 'bg-cyan-500 text-slate-950 animate-pulse'
                : simOffsetSeconds < 0
                ? 'bg-slate-800 text-slate-300'
                : 'bg-emerald-900/60 text-emerald-300'
            }`}>
              {simOffsetSeconds === 0 ? 'T = 0.0s (LEAP SECOND MOMENT)' : `T ${simOffsetSeconds > 0 ? '+' : ''}${simOffsetSeconds.toFixed(2)}s`}
            </span>
            <span className="text-slate-400">T + 5.0s (Post-Transition)</span>
          </div>

          <div className="relative py-1">
            <input
              type="range"
              min="-5"
              max="5"
              step="0.05"
              value={simOffsetSeconds}
              onChange={(e) => {
                setSimOffsetSeconds(parseFloat(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
            />
            {/* Center zero marker */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-6 bg-cyan-400/80 rounded pointer-events-none"></div>
          </div>
        </div>

        {/* Smearing Strategy Filter Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-bold uppercase">Time Handling Mode:</span>
            <button
              onClick={() => setSmearMode('standard')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                smearMode === 'standard' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Standard Step (23:59:60)
            </button>
            <button
              onClick={() => setSmearMode('google-smear')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                smearMode === 'google-smear' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Google Linear Smear (24h)
            </button>
            <button
              onClick={() => setSmearMode('aws-smear')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                smearMode === 'aws-smear' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              AWS 12h Slew
            </button>
            <button
              onClick={() => setSmearMode('posix-repeat')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                smearMode === 'posix-repeat' ? 'bg-cyan-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              POSIX Repeat Second
            </button>
          </div>

          <div className="text-[11px] font-mono text-cyan-300">
            {smearMode === 'standard' && 'Discrete step: 23:59:60 generated'}
            {smearMode === 'google-smear' && 'Slewed by 11.57 ppm over 86,400s'}
            {smearMode === 'aws-smear' && 'Slewed by 23.14 ppm over 43,200s'}
            {smearMode === 'posix-repeat' && 'Second 86400 repeated twice'}
          </div>
        </div>
      </div>

      {/* 4. Live Multi-City World Clock Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Global Local Timezone Reactions Across World Cities ({SIMULATOR_CITIES.length})
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Click any city to view deep system diagnostics
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {simulationResults.cityClocks.map((city) => {
            const isSelected = selectedCityId === city.id;
            return (
              <div
                key={city.id}
                onClick={() => setSelectedCityId(city.id)}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                  isSelected
                    ? 'bg-slate-950 border-cyan-400 shadow-xl ring-1 ring-cyan-400'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{city.flag}</span>
                      <div>
                        <span className="font-bold text-sm text-slate-100">{city.name}</span>
                        <span className="text-[10px] text-slate-400 block">{city.country}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900 text-slate-300 border border-slate-800">
                      {city.baseUtcOffset >= 0 ? `UTC+${city.baseUtcOffset}` : `UTC${city.baseUtcOffset}`}
                    </span>
                  </div>

                  {/* Big Live Digital Clock Display */}
                  <div className="mt-3 bg-slate-900/90 border border-slate-800/80 rounded-xl p-3 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{smearMode === 'standard' ? 'Local Civil Time' : 'Smeared Continuous Time'}</span>
                    </div>

                    <div className={`text-2xl sm:text-3xl font-mono font-black tracking-tight ${
                      city.isLocalLeapMoment && smearMode === 'standard'
                        ? 'text-cyan-300 animate-pulse'
                        : 'text-white'
                    }`}>
                      {smearMode === 'standard' ? city.localClockTime : city.smearedClockTime}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                      {city.dayShiftText} • {activePreset.dateStr}
                    </span>
                  </div>
                </div>

                {/* Sub-telemetry: Local Leap Moment Notice */}
                <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Local Leap Epoch:</span>
                  <span className="font-mono font-bold text-cyan-400">
                    {activePreset.leapType === 'positive'
                      ? `${(activePreset.timeUtc.split(':')[0] === '23' ? (23 + city.baseUtcOffset + 24) % 24 : 0).toString().padStart(2, '0')}:59:60`
                      : '00:00:00 (Skip)'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Deep Focused System Diagnostics Panel */}
      <div className="bg-slate-950 border border-cyan-500/30 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">
              Deep Clock Infrastructure Analysis: <span className="text-cyan-300">{focusedCity.name}</span> ({focusedCity.timezone})
            </h4>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            TAI Offset: +{simulationResults.taiOffset}s • GPS: {simulationResults.gpsOffset !== null ? `+${simulationResults.gpsOffset}s` : 'N/A'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Tile 1: Physical Local Anomaly */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Physical Local Impact
            </span>
            <div className="text-xs text-slate-300 leading-relaxed">
              When UTC strikes <code className="text-cyan-300 font-mono">23:59:60</code>, the clock in <strong className="text-white">{focusedCity.name}</strong> will read <code className="text-cyan-300 font-mono">{focusedCity.localClockTime}</code>. For civil inhabitants, the 61-second minute occurs at {focusedCity.baseUtcOffset >= 0 ? `morning/afternoon (${focusedCity.baseUtcOffset}:59 AM/PM)` : `evening (${(24 + focusedCity.baseUtcOffset)}:59 PM)`}.
            </div>
          </div>

          {/* Tile 2: Financial & Trading Exchange Effect */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" /> Financial Order Books (HFT)
            </span>
            <div className="text-xs text-slate-300 leading-relaxed">
              If operating under standard POSIX timestamps, matching engines receive two identical timestamps at <code className="text-amber-300 font-mono">1483228800</code>. Financial exchanges (NYSE, TSE, LSE) halt trading or mandate monotonic 24h leap smearing to prevent order replay race conditions.
            </div>
          </div>

          {/* Tile 3: Satellite & Cloud Distributed Databases */}
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-purple-400" /> Cloud Databases & GPS Nodes
            </span>
            <div className="text-xs text-slate-300 leading-relaxed">
              Cloud Spanner and CockroachDB utilize atomic TrueTime & GPS hardware. Because GPS Time is continuous and does not jump, atomic nodes maintain TrueTime bounds (`[earliest, latest]`) without downtime.
            </div>
          </div>
        </div>

        {/* Real World Impact Summary */}
        <div className="p-3 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs text-blue-200 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-white block">Historical Real-World Context:</span>
            <p className="text-slate-300 leading-relaxed">
              {activePreset.realWorldImpact}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
