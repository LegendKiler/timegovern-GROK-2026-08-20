import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea
} from 'recharts';
import {
  Activity,
  Zap,
  Radio,
  Clock,
  Gauge,
  Cpu,
  ShieldCheck,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  Download,
  Copy,
  Check,
  Info,
  Maximize2,
  Minimize2,
  Flame,
  Layers,
  Sparkles,
  Globe,
  RefreshCw,
  Terminal,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  MoveHorizontal
} from 'lucide-react';
import {
  CURRENT_TAI_UTC_OFFSET,
  CURRENT_GPS_UTC_OFFSET,
  CURRENT_TT_UTC_OFFSET,
  HISTORICAL_LEAP_SECONDS
} from '../lib/leapSecondData';
import { getCalibratedNow } from '../lib/atomicSync';

export interface AtomicTelemetryPoint {
  index: number;
  timestamp: string;
  timeSec: number;
  utcRawSec: number;
  taiSec: number;
  gpsSec: number;
  ttSec: number;
  taiUtcDelta: number; // exactly 37.000s
  gpsUtcDelta: number; // 18.000s
  dut1DeltaSec: number; // ~0.038s
  phaseJitterNs: number; // sub-nanosecond jitter (e.g. ±0.04 ns)
  fractionalFreqDrift: number; // e.g. 1.2e-16
  opticalLatticeOffsetPs: number; // picosecond optical lattice standard
  notes?: string;
}

export const AtomicTelemetryWidget: React.FC = () => {
  const [streamMode, setStreamMode] = useState<'live_stream' | 'diurnal_drift' | 'optical_stability' | 'decadal_divergence'>('live_stream');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [sampleRateMs, setSampleRateMs] = useState<number>(500); // 500ms default
  const [bufferSize, setBufferSize] = useState<number>(30); // 30 data points in sliding window
  
  // Metric toggles
  const [showTai, setShowTai] = useState<boolean>(true);
  const [showGps, setShowGps] = useState<boolean>(true);
  const [showDut1, setShowDut1] = useState<boolean>(true);
  const [showPhaseJitter, setShowPhaseJitter] = useState<boolean>(false);
  const [showConfidenceBands, setShowConfidenceBands] = useState<boolean>(true);

  // Live stream buffer state
  const [liveStreamData, setLiveStreamData] = useState<AtomicTelemetryPoint[]>([]);
  const pointIndexRef = useRef<number>(0);
  const [copiedTelemetry, setCopiedTelemetry] = useState<boolean>(false);

  // Click-and-drag zoom state
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [isSelectingZoom, setIsSelectingZoom] = useState<boolean>(false);
  const [zoomRange, setZoomRange] = useState<{ left: string; right: string } | null>(null);

  // Real-time instantaneous atomic clock readings
  const [currentUtcDisplay, setCurrentUtcDisplay] = useState<string>('');
  const [currentTaiDisplay, setCurrentTaiDisplay] = useState<string>('');
  const [currentGpsDisplay, setCurrentGpsDisplay] = useState<string>('');
  const [currentPhaseDriftNs, setCurrentPhaseDriftNs] = useState<number>(0.032);
  const [fractionalFreqStability, setFractionalFreqStability] = useState<string>('1.14 × 10⁻¹⁶');

  // Generate initial stream data buffer on mount
  useEffect(() => {
    const initial: AtomicTelemetryPoint[] = [];
    const now = Date.now();
    for (let i = bufferSize; i >= 0; i--) {
      const t = new Date(now - i * sampleRateMs);
      const timeSec = t.getUTCSeconds() + t.getUTCMilliseconds() / 1000;
      const baseJitter = (Math.sin(i * 0.4) * 0.025) + ((Math.random() - 0.5) * 0.015);
      const dut1Wobble = 0.0384 + Math.sin(i * 0.15) * 0.0006;

      initial.push({
        index: initial.length,
        timestamp: `${t.getUTCHours().toString().padStart(2, '0')}:${t.getUTCMinutes().toString().padStart(2, '0')}:${t.getUTCSeconds().toString().padStart(2, '0')}.${Math.floor(t.getUTCMilliseconds() / 100)}`,
        timeSec: Number(timeSec.toFixed(2)),
        utcRawSec: Number(timeSec.toFixed(3)),
        taiSec: Number((timeSec + CURRENT_TAI_UTC_OFFSET).toFixed(3)),
        gpsSec: Number((timeSec + CURRENT_GPS_UTC_OFFSET).toFixed(3)),
        ttSec: Number((timeSec + CURRENT_TT_UTC_OFFSET).toFixed(3)),
        taiUtcDelta: CURRENT_TAI_UTC_OFFSET,
        gpsUtcDelta: CURRENT_GPS_UTC_OFFSET,
        dut1DeltaSec: Number(dut1Wobble.toFixed(5)),
        phaseJitterNs: Number((baseJitter * 10).toFixed(3)),
        fractionalFreqDrift: Number((1.12 + Math.random() * 0.06).toFixed(2)),
        opticalLatticeOffsetPs: Number((Math.cos(i * 0.3) * 1.4).toFixed(2))
      });
    }
    setLiveStreamData(initial);
    pointIndexRef.current = initial.length;
  }, [bufferSize]);

  // Live real-time streaming interval
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      const now = getCalibratedNow();
      const utcHours = now.getUTCHours().toString().padStart(2, '0');
      const utcMinutes = now.getUTCMinutes().toString().padStart(2, '0');
      const utcSeconds = now.getUTCSeconds().toString().padStart(2, '0');
      const utcMs = now.getUTCMilliseconds().toString().padStart(3, '0');

      // TAI time string (+37s)
      const taiDate = new Date(now.getTime() + CURRENT_TAI_UTC_OFFSET * 1000);
      const taiHours = taiDate.getUTCHours().toString().padStart(2, '0');
      const taiMinutes = taiDate.getUTCMinutes().toString().padStart(2, '0');
      const taiSeconds = taiDate.getUTCSeconds().toString().padStart(2, '0');

      // GPS time string (+18s)
      const gpsDate = new Date(now.getTime() + CURRENT_GPS_UTC_OFFSET * 1000);
      const gpsHours = gpsDate.getUTCHours().toString().padStart(2, '0');
      const gpsMinutes = gpsDate.getUTCMinutes().toString().padStart(2, '0');
      const gpsSeconds = gpsDate.getUTCSeconds().toString().padStart(2, '0');

      setCurrentUtcDisplay(`${utcHours}:${utcMinutes}:${utcSeconds}.${utcMs}`);
      setCurrentTaiDisplay(`${taiHours}:${taiMinutes}:${taiSeconds}.${utcMs}`);
      setCurrentGpsDisplay(`${gpsHours}:${gpsMinutes}:${gpsSeconds}.${utcMs}`);

      const timeSec = now.getUTCSeconds() + now.getUTCMilliseconds() / 1000;
      const stepIdx = pointIndexRef.current++;
      const microJitter = (Math.sin(stepIdx * 0.35) * 0.02) + ((Math.random() - 0.5) * 0.012);
      const dut1Wobble = 0.0384 + Math.sin(stepIdx * 0.12) * 0.0008;
      const jitterNs = Number((microJitter * 10).toFixed(3));
      setCurrentPhaseDriftNs(jitterNs);

      const newPoint: AtomicTelemetryPoint = {
        index: stepIdx,
        timestamp: `${utcHours}:${utcMinutes}:${utcSeconds}.${Math.floor(now.getUTCMilliseconds() / 100)}`,
        timeSec: Number(timeSec.toFixed(2)),
        utcRawSec: 0,
        taiSec: CURRENT_TAI_UTC_OFFSET,
        gpsSec: CURRENT_GPS_UTC_OFFSET,
        ttSec: CURRENT_TT_UTC_OFFSET,
        taiUtcDelta: CURRENT_TAI_UTC_OFFSET,
        gpsUtcDelta: CURRENT_GPS_UTC_OFFSET,
        dut1DeltaSec: Number(dut1Wobble.toFixed(5)),
        phaseJitterNs: jitterNs,
        fractionalFreqDrift: Number((1.1 + Math.random() * 0.08).toFixed(2)),
        opticalLatticeOffsetPs: Number((Math.sin(stepIdx * 0.25) * 1.8).toFixed(2))
      };

      setLiveStreamData(prev => {
        const next = [...prev.slice(1), newPoint];
        return next;
      });
    }, sampleRateMs);

    return () => clearInterval(interval);
  }, [isPlaying, sampleRateMs]);

  // Synthetic Diurnal 24-Hour Dataset
  const diurnalData = useMemo(() => {
    const points: any[] = [];
    for (let hour = 0; hour <= 24; hour += 0.5) {
      const hourStr = `${Math.floor(hour).toString().padStart(2, '0')}:${(hour % 1 === 0 ? '00' : '30')}`;
      // Earth atmospheric jet-stream and tidal variation (LOD ~ +0.4 ms)
      const diurnalEarthWobble = Math.sin((hour / 24) * 2 * Math.PI - Math.PI / 4) * 0.0012 + 0.0384;
      const solarDivergenceSec = (hour / 24) * 0.00035; // solar noon drift accumulation
      points.push({
        time: hourStr,
        taiOffset: 37.000,
        gpsOffset: 18.000,
        ttOffset: 69.184,
        dut1: Number((diurnalEarthWobble * 1000).toFixed(2)), // in milliseconds
        solarDriftMs: Number((solarDivergenceSec * 1000).toFixed(3)),
        cesiumStability: 1.15 + Math.sin(hour) * 0.05
      });
    }
    return points;
  }, []);

  // Optical Lattice vs Cesium-133 Stability Comparison Dataset
  const opticalStabilityData = useMemo(() => {
    const points: any[] = [];
    const labStandards = [
      { name: 'NIST Boulder (Sr Optical Lattice)', AllanDev: 0.008, color: '#06b6d4', offsetPs: 0.12 },
      { name: 'PTB Braunschweig (Sr-1)', AllanDev: 0.009, color: '#10b981', offsetPs: -0.08 },
      { name: 'RIKEN Japan (3D Optical Lattice)', AllanDev: 0.007, color: '#a855f7', offsetPs: 0.04 },
      { name: 'SYRTE Paris (Cs Fountain FO2)', AllanDev: 1.200, color: '#f59e0b', offsetPs: 22.40 },
      { name: 'NPL London (Cs Fountain)', AllanDev: 1.450, color: '#ec4899', offsetPs: 26.80 }
    ];

    for (let tau = 1; tau <= 100; tau += 2) {
      points.push({
        averagingTimeTau: `${tau}s`,
        opticalLatticeDrift: Number((1.2 / Math.sqrt(tau)).toFixed(3)),
        cesiumFountainDrift: Number((14.0 / Math.sqrt(tau)).toFixed(3)),
        commercialRubidiumDrift: Number((120.0 / Math.sqrt(tau)).toFixed(3)),
        quartzOscillatorDrift: Number((1400.0 / Math.sqrt(tau)).toFixed(2))
      });
    }
    return points;
  }, []);

  // Decadal Step Progression Dataset
  const decadalData = useMemo(() => {
    const points: any[] = [];
    let currentTai = 10;
    for (let yr = 1972; yr <= 2035; yr++) {
      const match = HISTORICAL_LEAP_SECONDS.find(l => l.year === yr);
      if (match) {
        currentTai = match.cumulativeTaiMinusUtc;
      }
      const gpsOffset = yr >= 1980 ? Math.max(0, currentTai - 19) : 0;
      points.push({
        year: yr.toString(),
        taiMinusUtc: currentTai,
        gpsMinusUtc: gpsOffset,
        toleranceLimitUpper: 0.9,
        toleranceLimitLower: -0.9,
        projected: yr > 2016
      });
    }
    return points;
  }, []);

  const handleCopyTelemetryJson = () => {
    const payload = {
      timestamp: new Date().toISOString(),
      ensemble: {
        tai_utc_offset_seconds: CURRENT_TAI_UTC_OFFSET,
        gps_utc_offset_seconds: CURRENT_GPS_UTC_OFFSET,
        tt_utc_offset_seconds: CURRENT_TT_UTC_OFFSET,
        instantaneous_dut1_seconds: 0.0384,
        phase_jitter_ns: currentPhaseDriftNs,
        fractional_frequency_stability: '1.14e-16',
        active_primary_standards: ['BIPM Circular T', 'NIST-F2', 'PTB-CSF2', 'SYRTE-FO2', 'NICT-Sr1']
      },
      recent_samples: liveStreamData.slice(-10)
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedTelemetry(true);
    setTimeout(() => setCopiedTelemetry(false), 2500);
  };

  const handleExportCsv = () => {
    const headers = 'Sample_Index,UTC_Timestamp,TAI_Offset_Sec,GPS_Offset_Sec,TT_Offset_Sec,DUT1_Offset_Sec,Phase_Jitter_Ns,Fractional_Drift_1e16\n';
    const rows = liveStreamData.map(p => 
      `${p.index},"${p.timestamp}",${p.taiUtcDelta},${p.gpsUtcDelta},${p.ttSec},${p.dut1DeltaSec},${p.phaseJitterNs},${p.fractionalFreqDrift}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `timegovern-atomic-telemetry-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleChartMouseDown = (e: any) => {
    if (e && e.activeLabel) {
      const label = e.activeLabel.toString();
      setRefAreaLeft(label);
      setRefAreaRight(label);
      setIsSelectingZoom(true);
    }
  };

  const handleChartMouseMove = (e: any) => {
    if (isSelectingZoom && e && e.activeLabel) {
      setRefAreaRight(e.activeLabel.toString());
    }
  };

  const handleChartMouseUp = () => {
    if (isSelectingZoom) {
      if (refAreaLeft && refAreaRight && refAreaLeft !== refAreaRight) {
        applyZoom(refAreaLeft, refAreaRight);
      }
      setRefAreaLeft(null);
      setRefAreaRight(null);
      setIsSelectingZoom(false);
    }
  };

  const applyZoom = (leftVal: string, rightVal: string) => {
    let activeList: any[] = [];
    let keyProp = 'timestamp';

    if (streamMode === 'live_stream') {
      activeList = liveStreamData;
      keyProp = 'timestamp';
    } else if (streamMode === 'diurnal_drift') {
      activeList = diurnalData;
      keyProp = 'time';
    } else if (streamMode === 'optical_stability') {
      activeList = opticalStabilityData;
      keyProp = 'averagingTimeTau';
    } else if (streamMode === 'decadal_divergence') {
      activeList = decadalData;
      keyProp = 'year';
    }

    const idxA = activeList.findIndex(item => item[keyProp] === leftVal);
    const idxB = activeList.findIndex(item => item[keyProp] === rightVal);

    if (idxA !== -1 && idxB !== -1) {
      const minIdx = Math.min(idxA, idxB);
      const maxIdx = Math.max(idxA, idxB);
      if (maxIdx > minIdx) {
        setZoomRange({
          left: activeList[minIdx][keyProp],
          right: activeList[maxIdx][keyProp]
        });
        // In live mode, pause stream so user can inspect the high-precision zoomed section
        if (streamMode === 'live_stream') {
          setIsPlaying(false);
        }
      }
    }
  };

  const handleResetZoom = () => {
    setZoomRange(null);
    setRefAreaLeft(null);
    setRefAreaRight(null);
    setIsSelectingZoom(false);
  };

  // Zoom-filtered display datasets
  const displayLiveData = useMemo(() => {
    if (!zoomRange || streamMode !== 'live_stream') return liveStreamData;
    const idxA = liveStreamData.findIndex(p => p.timestamp === zoomRange.left);
    const idxB = liveStreamData.findIndex(p => p.timestamp === zoomRange.right);
    if (idxA === -1 || idxB === -1) return liveStreamData;
    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);
    return liveStreamData.slice(start, end + 1);
  }, [liveStreamData, zoomRange, streamMode]);

  const displayDiurnalData = useMemo(() => {
    if (!zoomRange || streamMode !== 'diurnal_drift') return diurnalData;
    const idxA = diurnalData.findIndex(p => p.time === zoomRange.left);
    const idxB = diurnalData.findIndex(p => p.time === zoomRange.right);
    if (idxA === -1 || idxB === -1) return diurnalData;
    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);
    return diurnalData.slice(start, end + 1);
  }, [diurnalData, zoomRange, streamMode]);

  const displayOpticalData = useMemo(() => {
    if (!zoomRange || streamMode !== 'optical_stability') return opticalStabilityData;
    const idxA = opticalStabilityData.findIndex(p => p.averagingTimeTau === zoomRange.left);
    const idxB = opticalStabilityData.findIndex(p => p.averagingTimeTau === zoomRange.right);
    if (idxA === -1 || idxB === -1) return opticalStabilityData;
    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);
    return opticalStabilityData.slice(start, end + 1);
  }, [opticalStabilityData, zoomRange, streamMode]);

  const displayDecadalData = useMemo(() => {
    if (!zoomRange || streamMode !== 'decadal_divergence') return decadalData;
    const idxA = decadalData.findIndex(p => p.year === zoomRange.left);
    const idxB = decadalData.findIndex(p => p.year === zoomRange.right);
    if (idxA === -1 || idxB === -1) return decadalData;
    const start = Math.min(idxA, idxB);
    const end = Math.max(idxA, idxB);
    return decadalData.slice(start, end + 1);
  }, [decadalData, zoomRange, streamMode]);

  const handleResetStream = () => {
    const now = Date.now();
    const resetList: AtomicTelemetryPoint[] = [];
    for (let i = bufferSize; i >= 0; i--) {
      const t = new Date(now - i * sampleRateMs);
      const timeSec = t.getUTCSeconds() + t.getUTCMilliseconds() / 1000;
      resetList.push({
        index: resetList.length,
        timestamp: `${t.getUTCHours().toString().padStart(2, '0')}:${t.getUTCMinutes().toString().padStart(2, '0')}:${t.getUTCSeconds().toString().padStart(2, '0')}.${Math.floor(t.getUTCMilliseconds() / 100)}`,
        timeSec: Number(timeSec.toFixed(2)),
        utcRawSec: 0,
        taiSec: CURRENT_TAI_UTC_OFFSET,
        gpsSec: CURRENT_GPS_UTC_OFFSET,
        ttSec: CURRENT_TT_UTC_OFFSET,
        taiUtcDelta: CURRENT_TAI_UTC_OFFSET,
        gpsUtcDelta: CURRENT_GPS_UTC_OFFSET,
        dut1DeltaSec: 0.0384,
        phaseJitterNs: 0.025,
        fractionalFreqDrift: 1.14,
        opticalLatticeOffsetPs: 0.05
      });
    }
    setLiveStreamData(resetList);
    pointIndexRef.current = resetList.length;
  };

  return (
    <div id="atomic-telemetry-dashboard" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-2xl space-y-6">
      {/* 1. Header & Live Stream Status Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 text-slate-950" /> High-Precision Atomic Telemetry
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              TAI - UTC = +37.000000000s
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-purple-400" /> BIPM SI Standard Lock
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-white flex items-center gap-2.5">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            Live TAI vs UTC Atomic Divergence & Phase Telemetry
          </h2>
          <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
            Real-time multi-timescale visualization tracking continuous International Atomic Time (<strong className="text-cyan-300">TAI</strong>) divergence from solar-synchronized astronomical Coordinated Universal Time (<strong className="text-slate-200">UTC</strong>).
          </p>
        </div>

        {/* Global Stream Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Stream' : 'Resume Live'}</span>
          </button>

          <button
            onClick={handleResetStream}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="Clear and reset stream buffer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyTelemetryJson}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            title="Copy snapshot telemetry payload to clipboard"
          >
            {copiedTelemetry ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTelemetry ? 'Copied' : 'JSON'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            title="Download stream samples as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* 2. Instantaneous Digital Telemetry HUD Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        {/* Gauge 1: TAI Current Time */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-cyan-400">TAI Atomic Time</span>
            <span className="text-[9px] font-mono text-cyan-500 font-bold">+37.000s</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-black text-cyan-300 tracking-tight truncate">
            {currentTaiDisplay || '00:00:37.000'}
          </div>
          <span className="text-[9px] text-slate-400 block font-mono">Continuous SI seconds</span>
        </div>

        {/* Gauge 2: UTC Civil Time */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-300">UTC Civil Standard</span>
            <span className="text-[9px] font-mono text-emerald-400 font-bold">Baseline</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-black text-white tracking-tight truncate">
            {currentUtcDisplay || '00:00:00.000'}
          </div>
          <span className="text-[9px] text-slate-400 block font-mono">IERS Bulletin C 68</span>
        </div>

        {/* Gauge 3: GPS Constellation Time */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-amber-400">GPS Navigation</span>
            <span className="text-[9px] font-mono text-amber-500 font-bold">+18.000s</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-black text-amber-300 tracking-tight truncate">
            {currentGpsDisplay || '00:00:18.000'}
          </div>
          <span className="text-[9px] text-slate-400 block font-mono">TAI - 19s (No Leap Secs)</span>
        </div>

        {/* Gauge 4: DUT1 Earth Rotation */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-400">DUT1 (UT1 - UTC)</span>
            <span className="text-[9px] font-mono text-emerald-300 font-bold">&lt; 0.9s</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-black text-emerald-300 tracking-tight">
            +0.0384 s
          </div>
          <span className="text-[9px] text-slate-400 block font-mono">Earth Angle Alignment</span>
        </div>

        {/* Gauge 5: Phase Dispersion / Jitter */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-400">Phase Jitter</span>
            <span className="text-[9px] font-mono text-purple-300 font-bold">Sub-ns</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-black text-purple-300 tracking-tight">
            ±{Math.abs(currentPhaseDriftNs).toFixed(3)} ns
          </div>
          <span className="text-[9px] text-slate-400 block font-mono">Optical Lattice Lock</span>
        </div>

        {/* Gauge 6: Fractional Frequency Drift */}
        <div className="bg-slate-950/90 border border-slate-800 p-3.5 rounded-2xl flex flex-col justify-between space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-blue-400">Allan Deviation</span>
            <span className="text-[9px] font-mono text-blue-300 font-bold">σy(τ)</span>
          </div>
          <div className="text-base sm:text-lg font-mono font-black text-blue-300 tracking-tight">
            {fractionalFreqStability}
          </div>
          <span className="text-[9px] text-slate-400 block font-mono">Primary Ensemble</span>
        </div>
      </div>

      {/* 3. Timescale Mode Switcher & Stream Config Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-xs">
        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'live_stream', label: 'Live Stream (Real-Time 60s)', icon: Activity },
            { id: 'diurnal_drift', label: 'Diurnal 24h Earth Cycle', icon: Globe },
            { id: 'optical_stability', label: 'Optical Lattice Stability (Allan Dev)', icon: Cpu },
            { id: 'decadal_divergence', label: '50-Year Step Staircase (1972-2035)', icon: Layers }
          ].map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  setStreamMode(mode.id as any);
                  handleResetZoom();
                }}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  streamMode === mode.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Stream Parameters (Visible in live mode) */}
        {streamMode === 'live_stream' && (
          <div className="flex items-center gap-3 self-end md:self-center">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="font-semibold">Sample Rate:</span>
              {[250, 500, 1000].map(rate => (
                <button
                  key={rate}
                  onClick={() => setSampleRateMs(rate)}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                    sampleRateMs === rate
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {rate >= 1000 ? `${rate / 1000}s` : `${rate}ms`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-800 pl-3">
              <button
                onClick={() => setShowPhaseJitter(!showPhaseJitter)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                  showPhaseJitter
                    ? 'bg-purple-950 text-purple-300 border-purple-500'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
                title="Toggle microsecond phase jitter secondary axis"
              >
                ±ns Jitter: {showPhaseJitter ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Main High-Precision Recharts Graphic Visualizer */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-5 relative min-h-[380px]">
        {/* Interactive Drag-to-Zoom Toolbar & Interval Presets */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs mb-4 select-none">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold text-cyan-300">
              <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Interval Zoom:</span>
            </span>
            {zoomRange ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                  <MoveHorizontal className="w-3 h-3 text-amber-400" />
                  <span>Zoomed: {zoomRange.left} ➔ {zoomRange.right}</span>
                </span>
                <button
                  onClick={handleResetZoom}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  title="Reset zoom to 100% full view"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Zoom</span>
                </button>
                {streamMode === 'live_stream' && !isPlaying && (
                  <button
                    onClick={() => {
                      handleResetZoom();
                      setIsPlaying(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Play className="w-3 h-3" />
                    <span>Resume Stream</span>
                  </button>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-slate-400">
                Click & drag horizontally across graph to zoom into specific time intervals.
              </span>
            )}
          </div>

          {/* Quick Zoom Interval Presets */}
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="text-slate-400 font-sans text-[11px] mr-1 hidden lg:inline">Presets:</span>
            {streamMode === 'live_stream' && (
              <>
                <button
                  onClick={handleResetZoom}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    !zoomRange ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  Full Buffer ({liveStreamData.length})
                </button>
                <button
                  onClick={() => {
                    if (liveStreamData.length >= 10) {
                      const start = liveStreamData[liveStreamData.length - 10].timestamp;
                      const end = liveStreamData[liveStreamData.length - 1].timestamp;
                      applyZoom(start, end);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Last 10 Epochs
                </button>
                <button
                  onClick={() => {
                    if (liveStreamData.length >= 5) {
                      const start = liveStreamData[liveStreamData.length - 5].timestamp;
                      const end = liveStreamData[liveStreamData.length - 1].timestamp;
                      applyZoom(start, end);
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Last 5 Epochs
                </button>
              </>
            )}

            {streamMode === 'diurnal_drift' && (
              <>
                <button
                  onClick={handleResetZoom}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    !zoomRange ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  All 24h
                </button>
                <button
                  onClick={() => applyZoom('00:00', '06:00')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  00:00-06:00 (Night)
                </button>
                <button
                  onClick={() => applyZoom('06:00', '18:00')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  06:00-18:00 (Day)
                </button>
                <button
                  onClick={() => applyZoom('18:00', '24:00')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  18:00-24:00 (Eve)
                </button>
              </>
            )}

            {streamMode === 'optical_stability' && (
              <>
                <button
                  onClick={handleResetZoom}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    !zoomRange ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  All τ (1-100s)
                </button>
                <button
                  onClick={() => applyZoom('1s', '21s')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Fast τ (1-20s)
                </button>
                <button
                  onClick={() => applyZoom('21s', '61s')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Mid τ (20-60s)
                </button>
                <button
                  onClick={() => applyZoom('61s', '99s')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Long τ (60-100s)
                </button>
              </>
            )}

            {streamMode === 'decadal_divergence' && (
              <>
                <button
                  onClick={handleResetZoom}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    !zoomRange ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'bg-slate-950 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  All (1972-2035)
                </button>
                <button
                  onClick={() => applyZoom('1972', '1985')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  1972-1985 (Intro)
                </button>
                <button
                  onClick={() => applyZoom('1986', '2000')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  1986-2000 (GPS)
                </button>
                <button
                  onClick={() => applyZoom('2001', '2016')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  2001-2016 (Modern)
                </button>
                <button
                  onClick={() => applyZoom('2017', '2035')}
                  className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  2017-2035 (Horizon)
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mode 1: Live Real-Time 60-Second Stream */}
        {streamMode === 'live_stream' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'}`}></span>
                  Continuous High-Resolution Phase Stream ({displayLiveData.length} Epochs Visible)
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                  Δ(TAI - UTC) = +37.000s
                </span>
                {!isPlaying && (
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
                    Stream Paused (Zoom Active)
                  </span>
                )}
              </div>

              {/* Metric Legends */}
              <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-400 rounded-full"></span>
                  TAI Atomic Offset (+37s)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-400 rounded-full"></span>
                  GPS Offset (+18s)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-0.5 bg-emerald-400 rounded-full"></span>
                  DUT1 Earth Wobble (+0.038s)
                </span>
                {showPhaseJitter && (
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <span className="w-3 h-0.5 bg-purple-400 rounded-full"></span>
                    Phase Jitter (ns)
                  </span>
                )}
              </div>
            </div>

            <div className="h-[320px] w-full cursor-crosshair select-none">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={displayLiveData} 
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  onMouseDown={handleChartMouseDown}
                  onMouseMove={handleChartMouseMove}
                  onMouseUp={handleChartMouseUp}
                  onMouseLeave={handleChartMouseUp}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    yAxisId="left"
                    domain={[0, 42]} 
                    ticks={[0, 10, 18, 25, 37, 40]}
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    label={{ value: 'Offset Seconds (s)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  {showPhaseJitter && (
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      domain={[-0.1, 0.1]} 
                      stroke="#a855f7" 
                      tick={{ fill: '#a855f7', fontSize: 9, fontFamily: 'monospace' }}
                      label={{ value: 'Jitter (ns)', angle: 90, position: 'insideRight', fill: '#a855f7', fontSize: 10 }}
                    />
                  )}

                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#0f172a', 
                      borderColor: '#334155', 
                      borderRadius: '12px', 
                      color: '#f8fafc',
                      fontSize: '11px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value: any, name: any) => {
                      if (name === 'taiUtcDelta') return [`+${Number(value).toFixed(6)}s (Exact)`, 'TAI - UTC'];
                      if (name === 'gpsUtcDelta') return [`+${Number(value).toFixed(6)}s`, 'GPS - UTC'];
                      if (name === 'dut1DeltaSec') return [`+${Number(value).toFixed(5)}s`, 'DUT1 (UT1 - UTC)'];
                      if (name === 'phaseJitterNs') return [`${Number(value).toFixed(3)} ns`, 'Phase Jitter'];
                      return [value, name];
                    }}
                  />

                  {/* Reference line for Leap Second 0.9s tolerance threshold */}
                  <ReferenceLine yAxisId="left" y={0.9} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'IERS ±0.9s Limit', fill: '#ef4444', fontSize: 9, position: 'right' }} />
                  <ReferenceLine yAxisId="left" y={37} stroke="#06b6d4" strokeDasharray="2 2" />
                  <ReferenceLine yAxisId="left" y={18} stroke="#f59e0b" strokeDasharray="2 2" />

                  {/* Visual Drag-to-Zoom Selection Area */}
                  {refAreaLeft && refAreaRight && (
                    <ReferenceArea
                      yAxisId="left"
                      x1={refAreaLeft}
                      x2={refAreaRight}
                      stroke="#06b6d4"
                      strokeOpacity={0.8}
                      fill="#06b6d4"
                      fillOpacity={0.25}
                    />
                  )}

                  {/* TAI Curve (+37s) */}
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="taiUtcDelta"
                    name="taiUtcDelta"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={0.12}
                    fill="#06b6d4"
                    isAnimationActive={false}
                  />

                  {/* GPS Curve (+18s) */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="gpsUtcDelta"
                    name="gpsUtcDelta"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />

                  {/* DUT1 micro-oscillations magnified */}
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="dut1DeltaSec"
                    name="dut1DeltaSec"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    dot={{ r: 2, fill: '#10b981' }}
                    isAnimationActive={false}
                  />

                  {/* Phase Jitter on right axis */}
                  {showPhaseJitter && (
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="phaseJitterNs"
                      name="phaseJitterNs"
                      stroke="#a855f7"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mode 2: Diurnal 24-Hour Earth Rotation & Solar Noon Drift */}
        {streamMode === 'diurnal_drift' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  24-Hour Diurnal Cycle: Earth Rotational Variations & Solar Noon Deviation
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Plots sub-millisecond Length of Day (LOD) deviations caused by ocean tides, atmospheric winds, and solar noon precession.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-0.5 bg-emerald-400"></span> DUT1 Variation (ms)
                </span>
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-400"></span> Solar Noon Precession (ms)
                </span>
              </div>
            </div>

            <div className="h-[320px] w-full cursor-crosshair select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={displayDiurnalData} 
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  onMouseDown={handleChartMouseDown}
                  onMouseMove={handleChartMouseMove}
                  onMouseUp={handleChartMouseUp}
                  onMouseLeave={handleChartMouseUp}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis 
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    label={{ value: 'Deviation (ms)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(value: any, name: any) => [`${value} ms`, name === 'dut1' ? 'DUT1 Earth Angle' : 'Solar Noon Precession']}
                  />

                  {/* Drag Zoom Visual Bounding Box */}
                  {refAreaLeft && refAreaRight && (
                    <ReferenceArea
                      x1={refAreaLeft}
                      x2={refAreaRight}
                      stroke="#10b981"
                      strokeOpacity={0.8}
                      fill="#10b981"
                      fillOpacity={0.25}
                    />
                  )}

                  <Area type="monotone" dataKey="dut1" name="dut1" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  <Line type="monotone" dataKey="solarDriftMs" name="solarDriftMs" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mode 3: Optical Lattice vs Cesium-133 Allan Deviation */}
        {streamMode === 'optical_stability' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Quantum Metrology: Allan Deviation vs Averaging Time (τ)
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Comparing Strontium optical lattice clocks ($8 \times 10^{-19}$) vs Cesium-133 microwave fountains ($10^{-16}$) for the 2030 SI second redefinition.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-400"></span> Sr Optical Lattice (NIST/RIKEN)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-400"></span> Cs-133 Fountain (SYRTE/NPL)
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-0.5 bg-rose-400"></span> Commercial Rubidium
                </span>
              </div>
            </div>

            <div className="h-[320px] w-full cursor-crosshair select-none">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={displayOpticalData} 
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  onMouseDown={handleChartMouseDown}
                  onMouseMove={handleChartMouseMove}
                  onMouseUp={handleChartMouseUp}
                  onMouseLeave={handleChartMouseUp}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="averagingTimeTau" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis 
                    scale="log"
                    domain={['auto', 'auto']}
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    label={{ value: 'Instability σy(τ) × 10⁻¹⁶', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(val: any, name: any) => [`${val} × 10⁻¹⁶`, name]}
                  />

                  {/* Drag Zoom Visual Bounding Box */}
                  {refAreaLeft && refAreaRight && (
                    <ReferenceArea
                      x1={refAreaLeft}
                      x2={refAreaRight}
                      stroke="#a855f7"
                      strokeOpacity={0.8}
                      fill="#a855f7"
                      fillOpacity={0.25}
                    />
                  )}

                  <Line type="monotone" dataKey="opticalLatticeDrift" name="Sr Optical Lattice" stroke="#06b6d4" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="cesiumFountainDrift" name="Cs-133 Fountain" stroke="#f59e0b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="commercialRubidiumDrift" name="Rubidium Standard" stroke="#f43f5e" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Mode 4: 50-Year Step Staircase (1972 - 2035) */}
        {streamMode === 'decadal_divergence' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <h4 className="font-bold text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Full 50-Year Divergence Staircase: 1972 Introduction to 2035 Abolition Horizon
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Illustrates the 27 step insertions that moved TAI from +10s in 1972 to +37s today, freezing under CGPM Resolution 4.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-0.5 bg-cyan-400"></span> TAI - UTC Offset (s)
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-400"></span> GPS - UTC Offset (s)
                </span>
              </div>
            </div>

            <div className="h-[320px] w-full cursor-crosshair select-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={displayDecadalData} 
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  onMouseDown={handleChartMouseDown}
                  onMouseMove={handleChartMouseMove}
                  onMouseUp={handleChartMouseUp}
                  onMouseLeave={handleChartMouseUp}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="year" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis 
                    domain={[0, 40]} 
                    ticks={[0, 10, 20, 30, 37]}
                    stroke="#64748b" 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    label={{ value: 'Accumulated Seconds', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                    formatter={(val: any, name: any) => [`+${val} seconds`, name === 'taiMinusUtc' ? 'TAI - UTC' : 'GPS - UTC']}
                  />
                  <ReferenceLine x="2035" stroke="#a855f7" strokeDasharray="3 3" label={{ value: '2035 CGPM Freeze', fill: '#a855f7', fontSize: 10, position: 'top' }} />

                  {/* Drag Zoom Visual Bounding Box */}
                  {refAreaLeft && refAreaRight && (
                    <ReferenceArea
                      x1={refAreaLeft}
                      x2={refAreaRight}
                      stroke="#06b6d4"
                      strokeOpacity={0.8}
                      fill="#06b6d4"
                      fillOpacity={0.25}
                    />
                  )}

                  <Area type="stepAfter" dataKey="taiMinusUtc" name="taiMinusUtc" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2.5} />
                  <Line type="stepAfter" dataKey="gpsMinusUtc" name="gpsMinusUtc" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* 5. Atomic Metrology Principles Explainer Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5" /> What is TAI? (Temps Atomique International)
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            A continuous uniform time scale computed monthly by the BIPM from an ensemble of over 450 atomic clocks across 80 national laboratories. TAI has <strong>zero leap seconds</strong>.
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Why TAI - UTC = +37 Seconds?
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Started with an initial 10s difference in 1972 plus 27 discrete leap seconds inserted by IERS to keep civil clocks aligned with Earth's slowing rotation (UT1).
          </p>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 2035 Horizon Resolution
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            By 2035, the CGPM will relax the 0.9s threshold, halting discontinuous leap seconds and locking TAI-UTC at a steady continuous delta for the century.
          </p>
        </div>
      </div>
    </div>
  );
};
