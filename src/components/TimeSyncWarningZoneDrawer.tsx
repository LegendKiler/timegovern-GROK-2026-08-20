import React, { useState } from 'react';
import {
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Cpu,
  Zap,
  Info,
  Radio,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Bell,
  Mail,
  Send
} from 'lucide-react';
import {
  TIME_SYNC_WARNING_PRESETS,
  TimeSyncWarningPreset,
  formatMicroseconds,
  evaluateDriftExceedance
} from '../lib/timeSyncTolerance';
import { HistoricalTimelinePoint, CURRENT_TAI_UTC_OFFSET } from '../lib/leapSecondData';
import { DriftAlertConfigModal } from './DriftAlertConfigModal';

interface TimeSyncWarningZoneDrawerProps {
  showWarningZone: boolean;
  onToggleWarningZone: (enabled: boolean) => void;
  thresholdMicros: number;
  onChangeThresholdMicros: (micros: number) => void;
  timeline: HistoricalTimelinePoint[];
  onClose?: () => void;
}

export const TimeSyncWarningZoneDrawer: React.FC<TimeSyncWarningZoneDrawerProps> = ({
  showWarningZone,
  onToggleWarningZone,
  thresholdMicros,
  onChangeThresholdMicros,
  timeline,
  onClose
}) => {
  const [customInputValue, setCustomInputValue] = useState<string>(() => thresholdMicros.toString());
  const [customUnit, setCustomUnit] = useState<'µs' | 'ms' | 's'>('µs');
  const [activeTab, setActiveTab] = useState<'presets' | 'custom' | 'impact' | 'alerts'>('presets');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [quickAlertEmail, setQuickAlertEmail] = useState<string>('Nadeem101@gmail.com');
  const [isSavingQuickAlert, setIsSavingQuickAlert] = useState<boolean>(false);
  const [quickAlertSuccess, setQuickAlertSuccess] = useState<string | null>(null);

  // Find active preset if matches exactly
  const activePreset = TIME_SYNC_WARNING_PRESETS.find(p => p.thresholdMicros === thresholdMicros);

  const handleQuickSubscribeAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAlertEmail || !quickAlertEmail.includes('@')) return;
    setIsSavingQuickAlert(true);
    setQuickAlertSuccess(null);
    try {
      const res = await fetch('/api/drift-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: quickAlertEmail,
          threshold_micros: thresholdMicros,
          threshold_display: formatMicroseconds(thresholdMicros),
          alert_name: `${activePreset ? activePreset.name : 'Custom'} Drift Alert (${formatMicroseconds(thresholdMicros)})`,
          system_context: activePreset ? activePreset.standardBody : 'General Infrastructure'
        })
      });
      if (res.ok) {
        setQuickAlertSuccess(`Alert activated for ${quickAlertEmail} at ${formatMicroseconds(thresholdMicros)} threshold.`);
      }
    } catch (err) {
      console.warn('Quick alert subscribe failed:', err);
    } finally {
      setIsSavingQuickAlert(false);
    }
  };

  // Exceedance statistics across timeline
  const pointsExceeding = timeline.filter(p => (p.taiMinusUtc * 1_000_000) > thresholdMicros);
  const percentExceeding = Math.round((pointsExceeding.length / (timeline.length || 1)) * 100);
  const firstBreachedPoint = pointsExceeding[0];
  const maxRecordedDriftMicros = CURRENT_TAI_UTC_OFFSET * 1_000_000;
  const currentExceedanceRatio = thresholdMicros > 0 ? (maxRecordedDriftMicros / thresholdMicros) : 1;

  // Handle custom numerical input change
  const handleApplyCustomInput = () => {
    let num = parseFloat(customInputValue);
    if (isNaN(num) || num <= 0) return;

    if (customUnit === 'ms') {
      num = num * 1_000;
    } else if (customUnit === 's') {
      num = num * 1_000_000;
    }

    onChangeThresholdMicros(Math.round(num));
    if (!showWarningZone) {
      onToggleWarningZone(true);
    }
  };

  // Convert linear slider 0-100 to log scale 1 µs to 40,000,000 µs
  const logMin = Math.log10(1);
  const logMax = Math.log10(40000000);
  const sliderPosition = Math.round(
    ((Math.log10(Math.max(1, thresholdMicros)) - logMin) / (logMax - logMin)) * 100
  );

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const logVal = logMin + (val / 100) * (logMax - logMin);
    const newMicros = Math.round(Math.pow(10, logVal));
    onChangeThresholdMicros(newMicros);
    setCustomInputValue(newMicros.toString());
    setCustomUnit('µs');
    if (!showWarningZone) {
      onToggleWarningZone(true);
    }
  };

  return (
    <div id="time-sync-warning-zone-panel" className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 sm:p-5 text-white text-xs space-y-4 shadow-2xl animate-fadeIn">
      {/* Header with Title & Master Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                Time-Synchronization Drift Warning Zone Configurator
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                showWarningZone
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {showWarningZone ? 'Zone: Active' : 'Zone: Disabled'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Highlight drift thresholds (µs) on the TAI-UTC chart to visualize critical boundaries for Telecom (5G), PTP, MiFID II FinTech, and Distributed DBs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            type="button"
            onClick={() => onToggleWarningZone(!showWarningZone)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              showWarningZone
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{showWarningZone ? 'Disable Shading' : 'Enable Warning Shading'}</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close Configurator"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs for Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'presets'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Industry Standard Presets ({TIME_SYNC_WARNING_PRESETS.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('custom')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'custom'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Custom Microsecond Slider & Input</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('impact')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'impact'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Impact Analysis</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'bg-rose-600 text-white font-bold shadow-xs'
              : 'text-rose-300 hover:text-white bg-rose-950/40 border border-rose-500/30'
          }`}
        >
          <Bell className="w-3.5 h-3.5 text-rose-400" />
          <span>Email Drift Alerts</span>
        </button>
      </div>

      {/* 1. INDUSTRY STANDARD PRESETS TAB */}
      {activeTab === 'presets' && (
        <div className="space-y-3 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {TIME_SYNC_WARNING_PRESETS.map((preset) => {
              const isSelected = thresholdMicros === preset.thresholdMicros;
              return (
                <div
                  key={preset.id}
                  onClick={() => {
                    onChangeThresholdMicros(preset.thresholdMicros);
                    setCustomInputValue(preset.thresholdMicros.toString());
                    setCustomUnit('µs');
                    if (!showWarningZone) onToggleWarningZone(true);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer relative space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-900 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{preset.icon}</span>
                      <span className="font-bold text-slate-100 text-xs truncate max-w-[170px]">
                        {preset.name}
                      </span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${preset.badgeClass}`}>
                      {formatMicroseconds(preset.thresholdMicros)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>{preset.standardBody}</span>
                    {isSelected && (
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. CUSTOM MICROSECOND SLIDER & INPUT TAB */}
      {activeTab === 'custom' && (
        <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Direct Number Input */}
            <div className="space-y-1 flex-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                Direct Numeric Threshold Entry:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  value={customInputValue}
                  onChange={(e) => setCustomInputValue(e.target.value)}
                  placeholder="e.g. 100"
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-40 focus:border-amber-400 focus:outline-none"
                />
                <select
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer"
                >
                  <option value="µs">µs (Microseconds)</option>
                  <option value="ms">ms (Milliseconds)</option>
                  <option value="s">s (Seconds)</option>
                </select>
                <button
                  type="button"
                  onClick={handleApplyCustomInput}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Apply Threshold
                </button>
              </div>
            </div>

            {/* Current Active Threshold Display Hero */}
            <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-xl min-w-[220px] text-right font-mono">
              <span className="text-[10px] uppercase font-bold text-amber-400 block font-sans">
                Active Threshold Value
              </span>
              <span className="text-lg font-extrabold text-amber-200 block">
                {formatMicroseconds(thresholdMicros)}
              </span>
              <span className="text-[10px] text-slate-400 block font-sans">
                = {(thresholdMicros / 1_000_000).toFixed(6)} seconds offset
              </span>
            </div>
          </div>

          {/* Logarithmic Slider */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Ultra-Tight (1 µs PTP)</span>
              <span className="text-amber-300 font-bold">Slide to tune threshold ({sliderPosition}%)</span>
              <span>Macro Divergence (40s / 40M µs)</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={sliderPosition}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>1 µs</span>
              <span>10 µs</span>
              <span>100 µs</span>
              <span>1 ms</span>
              <span>100 ms</span>
              <span>1 s</span>
              <span>10 s</span>
              <span>40 s</span>
            </div>
          </div>
        </div>
      )}

      {/* 3. IMPACT & REAL-TIME EXCEEDANCE ANALYZER */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <h5 className="font-bold text-slate-200 text-xs">
              Live Threshold Exceedance & Failure Assessment
            </h5>
          </div>
          <span className="text-xs font-mono text-amber-300 font-bold">
            {pointsExceeding.length} of {timeline.length} Timeline Points Exceed ({percentExceeding}%)
          </span>
        </div>

        {/* Progress Bar of Exceedance */}
        <div className="space-y-1">
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
            <div
              className={`h-full transition-all ${
                percentExceeding >= 80 ? 'bg-rose-500' : percentExceeding >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentExceeding}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>First Epoch Exceeded: <strong className="text-slate-200">{firstBreachedPoint ? `${firstBreachedPoint.displayDate} (+${firstBreachedPoint.taiMinusUtc}s)` : 'None'}</strong></span>
            <span>Current Max Excess: <strong className="text-rose-400">{currentExceedanceRatio.toFixed(1)}×</strong></span>
          </div>
        </div>

        {/* Dynamic Detailed Failure Mode Description */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold flex items-center gap-1.5 text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              {activePreset ? activePreset.name : 'Configured Custom Drift Level'}:
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
              Threshold: {formatMicroseconds(thresholdMicros)}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
            {activePreset ? activePreset.consequencesOfExceedance : (
              thresholdMicros <= 5
                ? 'Ultra-critical PTP/Telecom synchronization breach. Base station phase alignment collapses, causing destructive packet cancellations.'
                : thresholdMicros <= 1000
                ? 'Sub-millisecond financial / distributed DB boundary breached. Algorithmic trade orders violate ESMA MiFID II timestamps.'
                : thresholdMicros <= 1000000
                ? 'Sub-second astronomical DUT1 drift exceeds physical Earth rotation boundaries, requiring IERS leap second intervention.'
                : 'Macro civil timescale divergence. Civil UTC is permanently lagging behind International Atomic Time.'
            )}
          </p>
          {activePreset && (
            <div className="pt-1.5 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400">
              <span><strong className="text-slate-300">Mitigation:</strong> {activePreset.recommendedMitigation}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. CUSTOM EMAIL ALERTS TAB */}
      {activeTab === 'alerts' && (
        <div className="bg-slate-900/90 border border-rose-500/40 rounded-2xl p-4 sm:p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40">
                <Bell className="w-5 h-5 text-rose-400 animate-pulse" />
              </span>
              <div>
                <h5 className="font-extrabold text-sm text-white flex items-center gap-2">
                  TAI-UTC Drift Exceedance Email Alert Configurator
                </h5>
                <p className="text-[11px] text-slate-400">
                  Receive instant automated emergency dispatches whenever drift exceeds <strong className="text-amber-300 font-mono">{formatMicroseconds(thresholdMicros)}</strong>.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 self-start sm:self-center shrink-0"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Advanced Alert Dispatcher</span>
            </button>
          </div>

          {quickAlertSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="font-bold">{quickAlertSuccess}</p>
            </div>
          )}

          <form onSubmit={handleQuickSubscribeAlert} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div className="space-y-1 md:col-span-2">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>Destination Email for Drift Breach Notifications:</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={quickAlertEmail}
                  onChange={(e) => setQuickAlertEmail(e.target.value)}
                  placeholder="e.g. Nadeem101@gmail.com"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-rose-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSavingQuickAlert}
                className="w-full py-2 px-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSavingQuickAlert ? 'Activating...' : `Subscribe at ${formatMicroseconds(thresholdMicros)}`}</span>
              </button>
            </div>
          </form>

          {/* Real-time Status Card */}
          <div className="p-3 bg-slate-950/90 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Current atomic drift is <strong>+{CURRENT_TAI_UTC_OFFSET}s (+37,000,000 µs)</strong> vs safety ceiling <strong>{formatMicroseconds(thresholdMicros)}</strong>.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsAlertModalOpen(true)}
              className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer shrink-0"
            >
              Manage / Test All Rules &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Global Drift Alert Configuration Modal */}
      <DriftAlertConfigModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        initialThresholdMicros={thresholdMicros}
        defaultEmail={quickAlertEmail}
      />
    </div>
  );
};
