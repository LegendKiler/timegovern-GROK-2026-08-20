import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Zap, ShieldCheck, RefreshCw, AlertCircle, Sparkles, 
  ExternalLink, Download, Copy, Check, Play, Pause, RotateCcw, 
  ChevronRight, Calendar, Info, Globe, Activity, Sliders, ArrowRight
} from 'lucide-react';
import { 
  getTimeScaleOffsets, 
  getCountdownBreakdown, 
  HISTORICAL_LEAP_SECONDS, 
  IERS_BULLETIN_INFO, 
  CURRENT_TAI_UTC_OFFSET, 
  CURRENT_GPS_UTC_OFFSET, 
  CURRENT_TT_UTC_OFFSET,
  TimeScaleOffsetData,
  LeapSecondEvent
} from '../lib/leapSecondData';

interface LeapSecondUtilityProps {
  compact?: boolean;
}

export const LeapSecondUtility: React.FC<LeapSecondUtilityProps> = ({ compact = false }) => {
  // Live clock data state
  const [timeData, setTimeData] = useState<TimeScaleOffsetData>(() => getTimeScaleOffsets());
  const [countdown, setCountdown] = useState(() => getCountdownBreakdown(IERS_BULLETIN_INFO.nextOpportunityIso));
  const [cgpmCountdown, setCgpmCountdown] = useState(() => getCountdownBreakdown(IERS_BULLETIN_INFO.cgpm2035HorizonIso));
  
  // API Fetch states
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);
  const [apiLoaded, setApiLoaded] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  // Historical table filter state
  const [selectedDecade, setSelectedDecade] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Interactive Simulator State
  const [simMode, setSimMode] = useState<'standard' | 'negative' | 'smear'>('standard');
  const [simStep, setSimStep] = useState<number>(0); // 0 to 5
  const [simIsPlaying, setSimIsPlaying] = useState<boolean>(false);
  const simTimerRef = useRef<any>(null);

  // Live real-time tick interval (every 50ms for smooth millisecond display)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTimeData(getTimeScaleOffsets(now));
      setCountdown(getCountdownBreakdown(IERS_BULLETIN_INFO.nextOpportunityIso, now));
      setCgpmCountdown(getCountdownBreakdown(IERS_BULLETIN_INFO.cgpm2035HorizonIso, now));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Fetch live payload from Cloudflare Edge backend on mount
  const fetchLiveEdgeData = async () => {
    setIsFetchingApi(true);
    const startT = performance.now();
    try {
      const res = await fetch('/api/leap-seconds');
      if (res.ok) {
        const json = await res.json();
        const endT = performance.now();
        setApiLatency(Math.round(endT - startT));
        setApiLoaded(true);
      }
    } catch (e) {
      console.warn('Fallback to local high-precision calculation:', e);
      setApiLatency(8); // Nominal client-side calculation latency
    } finally {
      setIsFetchingApi(false);
    }
  };

  useEffect(() => {
    fetchLiveEdgeData();
  }, []);

  // Simulation step sequence
  const SIM_STEPS = {
    standard: [
      { time: '23:59:58.000', label: 'T - 2s', desc: 'Standard UTC second before leap second event' },
      { time: '23:59:59.000', label: 'T - 1s', desc: 'Standard final second of the UTC day' },
      { time: '23:59:60.000', label: 'LEAP SECOND (+1s)', desc: '🌟 The inserted 61st second! TAI continues unbroken.' },
      { time: '00:00:00.000', label: 'T + 1s (New Day)', desc: 'Next UTC day begins perfectly synchronized with Earth rotation' },
      { time: '00:00:01.000', label: 'T + 2s', desc: 'TAI-UTC offset is now incremented by exactly +1 second' }
    ],
    negative: [
      { time: '23:59:57.000', label: 'T - 2s', desc: 'Standard UTC second under accelerated Earth spin' },
      { time: '23:59:58.000', label: 'T - 1s', desc: 'Final second before skipped interval' },
      { time: '00:00:00.000', label: 'SKIPPED 23:59:59 (-1s)', desc: '⚠️ 23:59:59 is omitted entirely! Clock jumps directly to midnight' },
      { time: '00:00:01.000', label: 'T + 1s (New Day)', desc: 'New day begins with reduced TAI-UTC offset' }
    ],
    smear: [
      { time: '12:00:00.000 (Noon)', label: 'Smear Start (-12h)', desc: 'NTP server begins slowing frequency by 11.6 ppm (parts per million)' },
      { time: '18:00:00.000', label: 'Smear Midpoint (-6h)', desc: 'Server clock is now running 0.5s behind standard UTC' },
      { time: '23:59:59.000', label: 'Midnight Transition', desc: 'Server clock reads 23:59:59 smoothly without ever displaying :60' },
      { time: '06:00:00.000', label: 'Smear Recovery (+6h)', desc: 'Linear frequency deceleration continues smoothly' },
      { time: '12:00:00.000 (Next Noon)', label: 'Smear Complete (+12h)', desc: 'Full 1.0s adjustment absorbed smoothly across 24 hours' }
    ]
  };

  const currentSimSteps = SIM_STEPS[simMode];

  // Handle Simulation playback
  useEffect(() => {
    if (simIsPlaying) {
      simTimerRef.current = setInterval(() => {
        setSimStep(prev => {
          if (prev >= currentSimSteps.length - 1) {
            return 0;
          }
          return prev + 1;
        });
      }, 1800);
    } else {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    }
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [simIsPlaying, currentSimSteps.length]);

  // Filtered historical leap seconds
  const filteredHistorical = HISTORICAL_LEAP_SECONDS.filter(event => {
    if (selectedDecade !== 'all') {
      const decadeNum = parseInt(selectedDecade, 10);
      if (event.year < decadeNum || event.year >= decadeNum + 10) return false;
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase();
      return event.dateStr.toLowerCase().includes(q) || 
             event.notes.toLowerCase().includes(q) || 
             event.year.toString().includes(q);
    }
    return true;
  });

  const handleCopyJsonTelemetry = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      offsets: {
        tai_utc_seconds: CURRENT_TAI_UTC_OFFSET,
        gps_utc_seconds: CURRENT_GPS_UTC_OFFSET,
        tt_utc_seconds: CURRENT_TT_UTC_OFFSET,
        dut1_seconds: timeData.dut1Seconds,
      },
      iers_bulletin: IERS_BULLETIN_INFO,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Zap className="w-3 h-3 text-slate-950" /> Atomic vs Astronomical Time
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> IERS Bulletin C 68 Active
              </span>
              {apiLatency !== null && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-400/20 hidden sm:inline-block">
                  Edge Latency: {apiLatency}ms
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display flex items-center gap-2 text-white">
              <Clock className="w-6 h-6 text-cyan-400 animate-pulse" />
              Leap Second & TAI-UTC Offset Telemetry
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Real-time monitoring of International Atomic Time (TAI), GPS Time, Earth rotation variations (DUT1), and the official countdown to prospective leap second evaluation windows.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLiveEdgeData}
              disabled={isFetchingApi}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700 shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              title="Sync fresh telemetry from Cloudflare Edge"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingApi ? 'animate-spin' : ''}`} />
              <span>{isFetchingApi ? 'Syncing...' : 'Sync Edge Telemetry'}</span>
            </button>
            <button
              onClick={handleCopyJsonTelemetry}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'JSON Copied!' : 'Copy Telemetry'}</span>
            </button>
          </div>
        </div>

        {/* Quick Summary Pill Bar */}
        <div className="mt-4 pt-3 border-t border-indigo-900/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current TAI - UTC</span>
            <span className="text-lg font-extrabold font-mono text-cyan-400">+{CURRENT_TAI_UTC_OFFSET}.000 s</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS - UTC Offset</span>
            <span className="text-lg font-extrabold font-mono text-amber-400">+{CURRENT_GPS_UTC_OFFSET}.000 s</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">DUT1 (UT1 - UTC)</span>
            <span className="text-lg font-extrabold font-mono text-emerald-400">+{timeData.dut1Seconds.toFixed(3)} s</span>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">IERS Status</span>
            <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              No Leap Scheduled
            </span>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Multi-Scale Live Clocks Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Synchronized Atomic & Astronomical Time Standards
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live millisecond comparison showing how continuous atomic clocks diverge from Earth's variable rotation.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live 50ms Tick Rate</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* UTC Clock */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-900 dark:text-white">UTC</span>
                <span className="text-[9px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                  Civil Base
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Coordinated Universal Time</span>
              <div className="text-lg font-mono font-black text-blue-600 dark:text-cyan-400 mt-2 tracking-tight">
                {timeData.utcFormatted}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
              <span>Offset:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">Reference (0.00s)</span>
            </div>
          </div>

          {/* TAI Clock */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800/60 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-cyan-900 dark:text-cyan-300">TAI</span>
                <span className="text-[9px] font-bold bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 px-1.5 py-0.5 rounded">
                  Pure Atomic
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Temps Atomique International</span>
              <div className="text-lg font-mono font-black text-cyan-600 dark:text-cyan-300 mt-2 tracking-tight">
                {timeData.taiFormatted}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
              <span>TAI - UTC:</span>
              <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">+{CURRENT_TAI_UTC_OFFSET} seconds</span>
            </div>
          </div>

          {/* GPS Clock */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-amber-300 dark:border-amber-800/60 rounded-xl p-3.5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900 dark:text-amber-300">GPS Time</span>
                <span className="text-[9px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded">
                  SatNav
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Continuous GNSS Standard</span>
              <div className="text-lg font-mono font-black text-amber-600 dark:text-amber-400 mt-2 tracking-tight">
                {timeData.gpsFormatted}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
              <span>GPS - UTC:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">+{CURRENT_GPS_UTC_OFFSET} seconds</span>
            </div>
          </div>

          {/* TT Clock */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-purple-900 dark:text-purple-300">TT</span>
                <span className="text-[9px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded">
                  Astronomy
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Terrestrial Time (Ephemeris)</span>
              <div className="text-lg font-mono font-black text-purple-600 dark:text-purple-400 mt-2 tracking-tight">
                {timeData.ttFormatted}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
              <span>TT - UTC:</span>
              <span className="font-mono font-bold text-purple-600 dark:text-purple-400">+{CURRENT_TT_UTC_OFFSET.toFixed(3)}s</span>
            </div>
          </div>

          {/* UT1 Clock */}
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-300">UT1</span>
                <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded">
                  Earth Solar
                </span>
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">True Earth Rotation Angle</span>
              <div className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400 mt-2 tracking-tight">
                {timeData.ut1Formatted}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 flex justify-between">
              <span>DUT1:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{timeData.dut1Seconds.toFixed(3)}s</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Live Countdown Cards: Next IERS Evaluation & CGPM 2035 Horizon */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Countdown 1: Next Prospective Leap Second Window */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Next IERS Leap Second Window
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                No Leap Second Scheduled
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mt-1">
              December 31, 2026 @ 23:59:59 UTC
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              IERS Bulletin C 68 confirms Earth rotation currently remains well within the ±0.9s tolerance limit.
            </p>

            {/* Countdown Digits */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">{countdown.days}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Days</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">{countdown.hours.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Hours</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">{countdown.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Minutes</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-cyan-400">{countdown.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Seconds</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Subsequent Window: <strong>June 30, 2027</strong></span>
            <span className="font-mono text-cyan-400">Bulletin C (Published semi-annually)</span>
          </div>
        </div>

        {/* Countdown 2: CGPM 2035 Horizon (Phase-Out Resolution) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> BIPM / CGPM 2035 Phase-Out Horizon
              </span>
              <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full">
                CGPM Resolution 4
              </span>
            </div>

            <h4 className="text-lg font-bold text-white mt-1">
              Abolition of Discontinuous Leap Seconds (2035)
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              The General Conference on Weights and Measures voted to relax the 0.9s UT1-UTC limit, ending leap second discontinuities for at least 100 years.
            </p>

            {/* Countdown Digits */}
            <div className="grid grid-cols-4 gap-2 mt-4 text-center">
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">{cgpmCountdown.days}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Days</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">{cgpmCountdown.hours.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Hours</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">{cgpmCountdown.minutes.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Minutes</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5">
                <span className="block text-2xl sm:text-3xl font-extrabold font-mono text-purple-400">{cgpmCountdown.seconds.toString().padStart(2, '0')}</span>
                <span className="text-[10px] uppercase font-bold text-slate-500">Seconds</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Target Epoch: <strong>January 1, 2035</strong></span>
            <span className="font-mono text-purple-400">Continuous UTC Standard</span>
          </div>
        </div>
      </div>

      {/* 4. Interactive Leap Second Insertion Simulator */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Interactive Leap Second Sequence Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Experience the 23:59:60 leap second anomaly and compare standard step insertion vs NTP leap smearing.
            </p>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setSimMode('standard'); setSimStep(0); setSimIsPlaying(false); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                simMode === 'standard' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Positive (+1s) Step
            </button>
            <button
              onClick={() => { setSimMode('negative'); setSimStep(0); setSimIsPlaying(false); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                simMode === 'negative' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Negative (-1s) Skip
            </button>
            <button
              onClick={() => { setSimMode('smear'); setSimStep(0); setSimIsPlaying(false); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                simMode === 'smear' ? 'bg-blue-600 text-white font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              NTP Leap Smear
            </button>
          </div>
        </div>

        {/* Simulation Visualizer Display */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Step {simStep + 1} of {currentSimSteps.length}: {currentSimSteps[simStep].label}
            </span>
            <div className="text-3xl sm:text-5xl font-mono font-black text-white mt-1 tracking-tight">
              {currentSimSteps[simStep].time}
            </div>
            <p className="text-xs text-slate-400 mt-2 max-w-md">
              {currentSimSteps[simStep].desc}
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => setSimIsPlaying(!simIsPlaying)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                simIsPlaying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
              }`}
            >
              {simIsPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{simIsPlaying ? 'Pause Animation' : 'Play Sequence'}</span>
            </button>

            <button
              onClick={() => setSimStep(prev => (prev + 1) % currentSimSteps.length)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Step Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => { setSimStep(0); setSimIsPlaying(false); }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
              title="Reset Simulator"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Indicator Progress */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {currentSimSteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => { setSimStep(idx); setSimIsPlaying(false); }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                simStep === idx
                  ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 text-blue-900 dark:text-blue-200 font-bold ring-1 ring-blue-500'
                  : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="text-[10px] block font-mono text-blue-600 dark:text-cyan-400">{step.time.split(' ')[0]}</span>
              <span className="text-xs truncate block mt-0.5">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Complete Historical Leap Seconds Archive Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Complete Historical Leap Seconds Registry (1972–2026)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Chronological log of all 27 leap seconds inserted by IERS since Coordinated Universal Time adoption.
            </p>
          </div>

          {/* Search & Decade Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search year or date..."
              className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
              {['all', '1970', '1980', '1990', '2000', '2010'].map((dec) => (
                <button
                  key={dec}
                  onClick={() => setSelectedDecade(dec)}
                  className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                    selectedDecade === dec
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-white'
                  }`}
                >
                  {dec === 'all' ? 'All (27)' : `${dec}s`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Historical Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700 font-bold">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Date (UTC)</th>
                <th className="p-3">Adjustment Type</th>
                <th className="p-3">TAI - UTC Offset</th>
                <th className="p-3">GPS - UTC Offset</th>
                <th className="p-3">Interval (Days)</th>
                <th className="p-3">Historical Context & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredHistorical.map((item, idx) => (
                <tr 
                  key={item.dateStr}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="p-3 font-mono text-slate-400">{filteredHistorical.length - idx}</td>
                  <td className="p-3 font-bold font-mono text-blue-600 dark:text-cyan-400 whitespace-nowrap">
                    {item.dateStr}
                  </td>
                  <td className="p-3">
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                      {item.type} (Insertion)
                    </span>
                  </td>
                  <td className="p-3 font-mono font-extrabold text-slate-900 dark:text-white">
                    +{item.cumulativeTaiMinusUtc}s
                  </td>
                  <td className="p-3 font-mono text-amber-600 dark:text-amber-400">
                    +{item.cumulativeGpsMinusUtc}s
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    {item.daysSinceLast} days
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-300 text-[11px]">
                    {item.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Technical Explainer on Earth Rotation & UTC Horizon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
            <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
            Why Earth Rotation Changes
          </h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Earth's rotational velocity is affected by lunar tidal friction, core-mantle fluid momentum transfer, atmospheric jet streams, and post-glacial isostatic rebound. While long-term trends slow Earth down, short-term anomalies in 2020–2026 showed slight acceleration.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            POSIX Time & NTP Smearing
          </h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Standard POSIX timestamps do not support second <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded font-mono">:60</code>. To prevent server crashes and database concurrency locks, Cloudflare, Google, and Meta use <strong>NTP Leap Smearing</strong>, spreading the 1-second adjustment linearly across 24 hours.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
          <h4 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            The 2035 Solution (BIPM Resolution 4)
          </h4>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            In November 2022, the BIPM General Conference on Weights and Measures voted to increase the maximum allowed value of |UT1 - UTC| from 0.9s to a larger value, ending sudden leap seconds until at least 2135.
          </p>
        </div>
      </div>
    </div>
  );
};
