import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Radio,
  Clock,
  Gauge,
  Cpu,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  Play,
  Pause,
  Sliders,
  Download,
  Copy,
  Check,
  Info,
  Layers,
  Sparkles,
  Globe,
  RefreshCw,
  Terminal,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  AtomicSyncReport,
  measureAtomicTimeBias,
  getSavedAtomicBias,
  saveAtomicBias,
  clearSavedAtomicBias,
  getSavedSyncReport
} from '../lib/atomicSync';

interface LocalTimeBiasSyncCardProps {
  onSyncComplete?: (report: AtomicSyncReport) => void;
  onCompensationToggle?: (enabled: boolean, biasMs: number) => void;
}

export const LocalTimeBiasSyncCard: React.FC<LocalTimeBiasSyncCardProps> = ({
  onSyncComplete,
  onCompensationToggle,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [currentProbe, setCurrentProbe] = useState<number>(0);
  const [totalProbes, setTotalProbes] = useState<number>(4);
  const [report, setReport] = useState<AtomicSyncReport | null>(() => getSavedSyncReport());
  const [isCompensating, setIsCompensating] = useState<boolean>(() => getSavedAtomicBias() !== 0);
  const [showProbeDetails, setShowProbeDetails] = useState<boolean>(false);
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);

  // Run atomic time sync measurement
  const handleRunSync = async () => {
    setIsSyncing(true);
    setCurrentProbe(1);
    setTotalProbes(4);

    try {
      const syncReport = await measureAtomicTimeBias(4, (curr, total) => {
        setCurrentProbe(curr);
        setTotalProbes(total);
      });

      setReport(syncReport);
      
      // Auto-save if compensation was already turned on
      if (isCompensating) {
        saveAtomicBias(syncReport.driftMs, syncReport);
        if (onCompensationToggle) onCompensationToggle(true, syncReport.driftMs);
      } else {
        saveAtomicBias(0, syncReport);
      }

      if (onSyncComplete) {
        onSyncComplete(syncReport);
      }
    } catch (err) {
      console.error('Failed to sync atomic time bias:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle bias compensation in app calculations
  const handleToggleCompensation = () => {
    if (!report) return;

    if (isCompensating) {
      clearSavedAtomicBias();
      setIsCompensating(false);
      if (onCompensationToggle) onCompensationToggle(false, 0);
    } else {
      saveAtomicBias(report.driftMs, { ...report, appliedCompensation: true });
      setIsCompensating(true);
      if (onCompensationToggle) onCompensationToggle(true, report.driftMs);
    }
  };

  const handleClear = () => {
    clearSavedAtomicBias();
    setReport(null);
    setIsCompensating(false);
    if (onCompensationToggle) onCompensationToggle(false, 0);
  };

  const handleCopyAuditJson = () => {
    if (!report) return;
    navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2500);
  };

  // Calculate skew gauge position (-100ms to +100ms mapped to 0% to 100%)
  const driftVal = report ? report.driftMs : 0;
  const clampedDrift = Math.max(-100, Math.min(100, driftVal));
  const needlePercent = ((clampedDrift + 100) / 200) * 100;

  const isSignificantSkew = report && (report.status === 'skew_detected' || report.status === 'critical_skew' || Math.abs(report.driftMs) >= 15);
  const isCriticalSkew = report && (report.status === 'critical_skew' || Math.abs(report.driftMs) >= 100);

  return (
    <div id="local-time-bias-sync-card" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 text-white shadow-xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-400 text-slate-950 flex items-center gap-1 shadow-sm">
              <Zap className="w-3 h-3 text-slate-950" /> System Clock Calibration
            </span>
            {report && (
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 transition-all ${
                report.status === 'synced'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                  : isCriticalSkew
                  ? 'bg-rose-500/20 text-rose-300 border-rose-400/50 animate-subtle-pulse shadow-md shadow-rose-500/20'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/50 animate-subtle-pulse shadow-md shadow-amber-500/20'
              }`}>
                {report.status === 'synced' ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ) : (
                  <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isCriticalSkew ? 'bg-rose-400' : 'bg-amber-400'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                      isCriticalSkew ? 'bg-rose-500' : 'bg-amber-500'
                    }`}></span>
                  </span>
                )}
                {report.status === 'synced' 
                  ? 'Stratum-1 Precision Aligned' 
                  : isCriticalSkew 
                  ? 'Critical Clock Deviation Detected' 
                  : 'Clock Skew Deviation Detected'}
              </span>
            )}
            {isCompensating && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-purple-400" /> Active Drift Compensation: ON
              </span>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold font-display text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Local System Time Bias & Atomic Reference Sync
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Measures the physical hardware clock drift between your local operating system and TimeGovern's primary atomic reference ensemble using Cristian's multi-probe NTP protocol.
          </p>
        </div>

        {/* Sync Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <button
            onClick={handleRunSync}
            disabled={isSyncing}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2 ${
              isSyncing
                ? 'bg-slate-800 text-cyan-300 border border-cyan-500/40 animate-pulse'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>
              {isSyncing ? `Probing Reference (${currentProbe}/${totalProbes})...` : 'Sync System Time Bias'}
            </span>
          </button>

          {report && (
            <>
              <button
                onClick={handleCopyAuditJson}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Copy full NTP diagnostic report to clipboard"
              >
                {copiedAudit ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAudit ? 'Copied' : 'Audit JSON'}</span>
              </button>

              <button
                onClick={handleClear}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                title="Reset calibration"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Drift Status HUD */}
      {report ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Box 1: Measured System Bias / Drift */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 transition-all ${
              report.status === 'synced'
                ? 'bg-slate-950/80 border-emerald-500/30'
                : isCriticalSkew
                ? 'bg-slate-950/90 border-rose-500/60 animate-critical-skew-pulse'
                : 'bg-slate-950/90 border-amber-500/50 animate-skew-pulse'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  Measured Clock Bias (Δ)
                  {isSignificantSkew && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isCriticalSkew ? 'bg-rose-400' : 'bg-amber-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                        isCriticalSkew ? 'bg-rose-500' : 'bg-amber-500'
                      }`}></span>
                    </span>
                  )}
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded transition-all ${
                  report.driftMs > 0 
                    ? isSignificantSkew ? 'bg-amber-500/25 text-amber-300 border border-amber-400/40 animate-subtle-pulse' : 'bg-amber-500/20 text-amber-300'
                    : report.driftMs < 0 
                    ? isSignificantSkew ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40 animate-subtle-pulse' : 'bg-blue-500/20 text-blue-300'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}>
                  {report.direction === 'ahead' ? 'Fast / Ahead' : report.direction === 'behind' ? 'Slow / Behind' : 'Exact Sync'}
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-mono font-black tracking-tight text-white flex items-baseline gap-1.5">
                <span className={`transition-all ${
                  report.driftMs > 0 
                    ? isCriticalSkew ? 'text-rose-400 animate-subtle-pulse' : 'text-amber-400' 
                    : report.driftMs < 0 
                    ? isCriticalSkew ? 'text-rose-400 animate-subtle-pulse' : 'text-blue-400' 
                    : 'text-emerald-400'
                }`}>
                  {report.driftMs >= 0 ? `+${report.driftMs.toFixed(2)}` : report.driftMs.toFixed(2)}
                </span>
                <span className="text-sm font-normal text-slate-400">ms</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
                <span>Uncertainty:</span>
                <span className="text-slate-300">±{report.uncertaintyMs.toFixed(2)} ms (RTT/2)</span>
              </div>
            </div>

            {/* Box 2: Network RTT & Stratum Quality */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Edge Network Health</span>
                <span className="text-[10px] font-mono font-bold text-cyan-400">Stratum {report.stratum}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Min Round-Trip (RTT):</span>
                  <span className="text-sm font-mono font-bold text-cyan-300">{report.minRttMs} ms</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-slate-400">Network Jitter (σ):</span>
                  <span className="text-sm font-mono font-bold text-purple-300">±{report.jitterMs} ms</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2 font-mono">
                <span>Algorithm:</span>
                <span className="text-slate-300">Cristian's Filter ({report.probes.length} Probes)</span>
              </div>
            </div>

            {/* Box 3: Compensation Control Switch */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" /> Drift Compensation
                </span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  isCompensating ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {isCompensating ? 'Active' : 'Bypassed'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isCompensating 
                  ? `Compensating for ${report.driftMs >= 0 ? `+${report.driftMs.toFixed(1)}ms` : `${report.driftMs.toFixed(1)}ms`} skew across all in-app clocks.`
                  : 'Enable to mathematically shift application timestamps to true BIPM UTC.'}
              </p>
              <button
                onClick={handleToggleCompensation}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                  isCompensating
                    ? 'bg-purple-600 hover:bg-purple-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isCompensating ? 'Disable Compensation' : 'Apply Atomic Offset Correction'}</span>
              </button>
            </div>
          </div>

          {/* Graphical Clock Skew Gauge */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400" />
                System Clock Drift Skew Meter
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                Range: -100ms (Slow) ↔ 0ms (Atomic Sync) ↔ +100ms (Fast)
              </span>
            </div>

            {/* Skew Slider Bar */}
            <div className="relative pt-4 pb-2">
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-600 via-emerald-500 to-amber-600 relative">
                {/* Center 0ms mark */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white shadow-xs z-10"></div>
              </div>

              {/* Indicator Needle */}
              <div 
                className="absolute top-1 transform -translate-x-1/2 flex flex-col items-center transition-all duration-500 z-20"
                style={{ left: `${needlePercent}%` }}
              >
                <div className="relative flex items-center justify-center">
                  {isSignificantSkew && (
                    <span className={`animate-ping absolute inline-flex h-5 w-5 rounded-full opacity-60 ${
                      isCriticalSkew ? 'bg-rose-400' : 'bg-amber-400'
                    }`}></span>
                  )}
                  <span className={`w-3.5 h-3.5 rounded-full border-2 border-slate-950 shadow-md ${
                    isSignificantSkew 
                      ? isCriticalSkew ? 'bg-rose-400' : 'bg-amber-400'
                      : 'bg-white'
                  }`}></span>
                </div>
                <span className={`text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap border transition-all ${
                  isSignificantSkew
                    ? isCriticalSkew 
                      ? 'bg-rose-950/90 text-rose-300 border-rose-500/50 animate-subtle-pulse' 
                      : 'bg-amber-950/90 text-amber-300 border-amber-500/50 animate-subtle-pulse'
                    : 'text-white bg-slate-800/90 border-slate-700'
                }`}>
                  {report.driftMs >= 0 ? `+${report.driftMs.toFixed(1)}ms` : `${report.driftMs.toFixed(1)}ms`}
                </span>
              </div>

              {/* Axis Labels */}
              <div className="flex justify-between text-[10px] text-slate-400 mt-5 font-mono">
                <span>-100 ms (Slow)</span>
                <span>-50 ms</span>
                <span className="text-emerald-400 font-bold">0.00 ms (Atomic Base)</span>
                <span>+50 ms</span>
                <span>+100 ms (Fast)</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed">
              <strong className="text-slate-200">Time accuracy check:</strong> {report.recommendation}
            </p>
          </div>

          {/* Collapsible Probe Details Table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <button
              onClick={() => setShowProbeDetails(!showProbeDetails)}
              className="w-full px-4 py-3 bg-slate-900/80 hover:bg-slate-900 text-left flex items-center justify-between text-xs font-bold text-slate-300 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Detailed Multi-Probe Round-Trip Diagnostics ({report.probes.length} Samples)
              </span>
              {showProbeDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showProbeDetails && (
              <div className="p-4 overflow-x-auto">
                <table className="w-full text-[11px] text-left text-slate-300">
                  <thead className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900/60 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Probe #</th>
                      <th className="p-2">Round-Trip (RTT)</th>
                      <th className="p-2">Server Atomic Epoch</th>
                      <th className="p-2">Local Arrival Epoch</th>
                      <th className="p-2">Measured Drift</th>
                      <th className="p-2">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {report.probes.map(p => (
                      <tr key={p.probeIndex} className={p.rttMs === report.minRttMs ? 'bg-cyan-950/30 text-cyan-200' : ''}>
                        <td className="p-2 font-bold flex items-center gap-1">
                          Probe {p.probeIndex}
                          {p.rttMs === report.minRttMs && (
                            <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-1 rounded">Optimal</span>
                          )}
                        </td>
                        <td className="p-2">{p.rttMs.toFixed(2)} ms</td>
                        <td className="p-2">{new Date(p.serverTimeMs).toISOString().split('T')[1]}</td>
                        <td className="p-2">{new Date(p.localTimeArrivalMs).toISOString().split('T')[1]}</td>
                        <td className="p-2 font-bold">
                          {p.calculatedDriftMs >= 0 ? `+${p.calculatedDriftMs.toFixed(2)}` : p.calculatedDriftMs.toFixed(2)} ms
                        </td>
                        <td className="p-2 text-[10px] text-slate-400 font-sans">Cristian's RTT/2</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State before first sync */
        <div className="bg-slate-950 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-white">System Time Bias Unmeasured</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click <strong>"Sync System Time Bias"</strong> above to perform a 4-probe atomic handshake against TimeGovern's BIPM reference clock and detect your local operating system drift.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
