import React, { useState, useEffect } from 'react';
import {
  Bell,
  Mail,
  AlertTriangle,
  Sliders,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  X,
  Sparkles,
  Send,
  Trash2,
  Power,
  RefreshCw,
  ExternalLink,
  Radio,
  Clock,
  ChevronRight,
  Info,
  Layers,
  Webhook
} from 'lucide-react';
import {
  TIME_SYNC_WARNING_PRESETS,
  TimeSyncWarningPreset,
  formatMicroseconds
} from '../lib/timeSyncTolerance';
import { CURRENT_TAI_UTC_OFFSET, CURRENT_GPS_UTC_OFFSET } from '../lib/leapSecondData';

export interface AlertRule {
  id: number;
  email: string;
  threshold_micros: number;
  threshold_display: string;
  alert_name: string;
  system_context: string;
  notification_frequency: string;
  trigger_condition: string;
  webhook_url?: string;
  is_active: number;
  created_at: string;
  last_tested_at?: string;
}

interface DriftAlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialThresholdMicros?: number;
  defaultEmail?: string;
}

export const DriftAlertConfigModal: React.FC<DriftAlertConfigModalProps> = ({
  isOpen,
  onClose,
  initialThresholdMicros = 100,
  defaultEmail = 'Nadeem101@gmail.com'
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'dispatch_preview'>('create');

  // Form State
  const [email, setEmail] = useState<string>(defaultEmail);
  const [alertName, setAlertName] = useState<string>('Custom TAI-UTC Drift Safety Alert');
  const [thresholdMicros, setThresholdMicros] = useState<number>(initialThresholdMicros);
  const [customInputValue, setCustomInputValue] = useState<string>(initialThresholdMicros.toString());
  const [customUnit, setCustomUnit] = useState<'µs' | 'ms' | 's'>('µs');
  const [systemContext, setSystemContext] = useState<string>('FinTech & Trading Venues (MiFID II)');
  const [frequency, setFrequency] = useState<'immediate' | 'hourly_digest' | 'iers_bulletin'>('immediate');
  const [triggerCondition, setTriggerCondition] = useState<'exceeds_threshold' | 'new_bulletin_c' | 'rate_acceleration'>('exceeds_threshold');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [submitErrorMsg, setSubmitErrorMsg] = useState<string | null>(null);

  // Existing Saved Rules State
  const [savedRules, setSavedRules] = useState<AlertRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState<boolean>(false);

  // Test Dispatch / Preview State
  const [testDispatchData, setTestDispatchData] = useState<any | null>(null);
  const [isTestingAlert, setIsTestingAlert] = useState<boolean>(false);

  // Sync initial threshold
  useEffect(() => {
    if (initialThresholdMicros) {
      setThresholdMicros(initialThresholdMicros);
      setCustomInputValue(initialThresholdMicros.toString());
      const matched = TIME_SYNC_WARNING_PRESETS.find(p => p.thresholdMicros === initialThresholdMicros);
      if (matched) {
        setAlertName(`${matched.name} Safety Alert`);
        setSystemContext(matched.standardBody);
      }
    }
  }, [initialThresholdMicros]);

  // Fetch saved rules when modal opens
  const fetchRules = async () => {
    setIsLoadingRules(true);
    try {
      const res = await fetch(`/api/drift-alerts?email=${encodeURIComponent(email || defaultEmail)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.alerts && Array.isArray(data.alerts)) {
          setSavedRules(data.alerts);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch alert rules:', err);
    } finally {
      setIsLoadingRules(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRules();
    }
  }, [isOpen, email]);

  if (!isOpen) return null;

  // Handle Preset Selection
  const handleSelectPreset = (preset: TimeSyncWarningPreset) => {
    setThresholdMicros(preset.thresholdMicros);
    setCustomInputValue(preset.thresholdMicros.toString());
    setCustomUnit('µs');
    setAlertName(`${preset.name} Drift Alert`);
    setSystemContext(`${preset.standardBody} (${preset.category.toUpperCase()})`);
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
    setThresholdMicros(newMicros);
    setCustomInputValue(newMicros.toString());
    setCustomUnit('µs');
  };

  // Handle Direct Numeric Input Change
  const handleApplyCustomNumber = () => {
    let num = parseFloat(customInputValue);
    if (isNaN(num) || num <= 0) return;
    if (customUnit === 'ms') num *= 1_000;
    if (customUnit === 's') num *= 1_000_000;
    const rounded = Math.round(num);
    setThresholdMicros(rounded);
  };

  // Handle Subscribe / Save Rule
  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccessMsg(null);
    setSubmitErrorMsg(null);

    try {
      const payload = {
        email,
        threshold_micros: thresholdMicros,
        threshold_display: formatMicroseconds(thresholdMicros),
        alert_name: alertName || `TAI-UTC Drift Alert (${formatMicroseconds(thresholdMicros)})`,
        system_context: systemContext,
        notification_frequency: frequency,
        trigger_condition: triggerCondition,
        webhook_url: webhookUrl.trim() || undefined
      };

      const res = await fetch('/api/drift-alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save alert subscription');
      }

      setSubmitSuccessMsg(`Alert successfully configured for ${email}! Active threshold: ${formatMicroseconds(thresholdMicros)}.`);
      fetchRules();
      // Also automatically trigger preview
      handleTestAlert(payload);
    } catch (err: any) {
      setSubmitErrorMsg(err.message || 'Network error occurred while saving alert.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Test Alert Dispatch
  const handleTestAlert = async (customPayload?: any) => {
    setIsTestingAlert(true);
    try {
      const payload = customPayload || {
        email,
        threshold_micros: thresholdMicros,
        threshold_display: formatMicroseconds(thresholdMicros),
        alert_name: alertName,
        system_context: systemContext
      };

      const res = await fetch('/api/drift-alerts/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setTestDispatchData(data.dispatch);
        setActiveTab('dispatch_preview');
      }
    } catch (err) {
      console.warn('Test alert error:', err);
    } finally {
      setIsTestingAlert(false);
    }
  };

  // Handle Toggle Rule Active Status
  const handleToggleRule = async (ruleId: number, currentActive: number) => {
    try {
      const res = await fetch('/api/drift-alerts/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId, is_active: currentActive === 1 ? 0 : 1 })
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (err) {
      console.warn('Failed to toggle rule:', err);
    }
  };

  // Handle Delete Rule
  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this custom alert rule?')) return;
    try {
      const res = await fetch('/api/drift-alerts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ruleId })
      });
      if (res.ok) {
        fetchRules();
      }
    } catch (err) {
      console.warn('Failed to delete rule:', err);
    }
  };

  const currentDriftMicros = CURRENT_TAI_UTC_OFFSET * 1_000_000;
  const isCurrentlyBreached = currentDriftMicros > thresholdMicros;
  const exceedanceRatio = (currentDriftMicros / (thresholdMicros || 1)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div 
        id="drift-alert-config-modal-container"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100 animate-scaleUp"
      >
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-inner">
              <Bell className="w-6 h-6 text-amber-400 animate-bounce" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black font-display text-white">
                  TAI-UTC Drift Safety Alert Dispatcher
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-cyan-400" />
                  Live BIPM Drift: +{CURRENT_TAI_UTC_OFFSET}s (+37,000,000 µs)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Configure real-time automated email alerts triggered whenever atomic drift exceeds your infrastructure safety tolerance.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close Alert Configurator"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Controls */}
        <div className="flex items-center gap-2 px-5 pt-4 border-b border-slate-800/80 bg-slate-950/60 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 border-b-2 font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'create'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Configure New Alert Rule</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2.5 border-b-2 font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'manage'
                ? 'border-amber-400 text-amber-300 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Active Rules ({savedRules.length})</span>
          </button>

          {testDispatchData && (
            <button
              type="button"
              onClick={() => setActiveTab('dispatch_preview')}
              className={`px-4 py-2.5 border-b-2 font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dispatch_preview'
                  ? 'border-rose-400 text-rose-300 bg-rose-500/10 rounded-t-lg'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Dispatched Email Preview</span>
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: CREATE / CONFIGURE NEW ALERT */}
          {activeTab === 'create' && (
            <form onSubmit={handleSaveAlert} className="space-y-6">
              {submitSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="flex-1">
                    <p className="font-bold">{submitSuccessMsg}</p>
                    <p className="text-[11px] text-emerald-300/80 mt-0.5">
                      A simulated sample dispatch email has also been generated in the Preview tab.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dispatch_preview')}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px]"
                  >
                    View Email Preview
                  </button>
                </div>
              )}

              {submitErrorMsg && (
                <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-3 animate-fadeIn">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                  <p className="font-bold">{submitErrorMsg}</p>
                </div>
              )}

              {/* 1. Email Destination Input */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-amber-400" />
                    1. Destination Email Address for Dispatches
                  </label>
                  <span className="text-[10px] text-slate-400">RFC 5905 & BIPM Circular T Alerts</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. ops@company.com or Nadeem101@gmail.com"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setEmail('Nadeem101@gmail.com')}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-colors cursor-pointer border border-slate-700"
                      title="Quick fill with user email"
                    >
                      Fill: Nadeem101@gmail.com
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Safety Threshold Selection with Industry Presets */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-400" />
                      2. Select Safety Threshold (Trigger Boundary)
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Choose an industry compliance preset or calibrate a custom microsecond tolerance.
                    </p>
                  </div>

                  {/* Active Value Badge Hero */}
                  <div className="bg-amber-950/60 border border-amber-500/50 px-3.5 py-1.5 rounded-xl font-mono text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block font-sans">Active Safety Ceiling</span>
                    <span className="text-base font-black text-amber-200">{formatMicroseconds(thresholdMicros)}</span>
                    <span className="text-[10px] text-slate-400 block font-sans">={(thresholdMicros / 1_000_000).toFixed(6)}s</span>
                  </div>
                </div>

                {/* Industry Presets Quick Selector */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Industry Compliance & Protocol Presets:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {TIME_SYNC_WARNING_PRESETS.map((p) => {
                      const isSelected = thresholdMicros === p.thresholdMicros;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectPreset(p)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                            isSelected
                              ? 'bg-amber-950/30 border-amber-400 ring-1 ring-amber-400/60'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span>{p.icon}</span>
                              <span className="font-bold text-xs text-slate-200 truncate">{p.name}</span>
                            </div>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border ${p.badgeClass}`}>
                              {formatMicroseconds(p.thresholdMicros)}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                            {p.description}
                          </p>
                          <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                            <span>{p.standardBody}</span>
                            {isSelected && <span className="text-amber-400 font-bold">Selected</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Slider and Numerical Input */}
                <div className="pt-3 border-t border-slate-800 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={customInputValue}
                        onChange={(e) => setCustomInputValue(e.target.value)}
                        placeholder="100"
                        className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-mono w-32 focus:border-amber-400 focus:outline-none"
                      />
                      <select
                        value={customUnit}
                        onChange={(e) => setCustomUnit(e.target.value as any)}
                        className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-bold rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        <option value="µs">µs (Microseconds)</option>
                        <option value="ms">ms (Milliseconds)</option>
                        <option value="s">s (Seconds)</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleApplyCustomNumber}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-lg border border-slate-700"
                      >
                        Update Value
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                      <span>Logarithmic Tuning:</span>
                      <span className="text-amber-300 font-bold">{sliderPosition}% Scale</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={sliderPosition}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 µs (PTP)</span>
                    <span>100 µs (MiFID II)</span>
                    <span>1 ms (DBs)</span>
                    <span>900 ms (DUT1)</span>
                    <span>1 s (Leap)</span>
                    <span>40 s (Civil)</span>
                  </div>
                </div>
              </div>

              {/* 3. Alert Metadata & Trigger Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rule Name & Context */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    3. Rule Name & Operational Context
                  </label>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Alert Rule Name:</span>
                      <input
                        type="text"
                        required
                        value={alertName}
                        onChange={(e) => setAlertName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">System / Infrastructure Context:</span>
                      <input
                        type="text"
                        value={systemContext}
                        onChange={(e) => setSystemContext(e.target.value)}
                        placeholder="e.g. Tokyo Order Gateway / AWS Spanner Node"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Frequency & Trigger Condition */}
                <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    4. Trigger Dispatch Condition
                  </label>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Trigger Event:</span>
                      <select
                        value={triggerCondition}
                        onChange={(e) => setTriggerCondition(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        <option value="exceeds_threshold">Immediately when TAI-UTC drift exceeds threshold</option>
                        <option value="new_bulletin_c">When IERS Bulletin C introduces a leap second</option>
                        <option value="rate_acceleration">When daily drift velocity accelerates</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Notification Cadence:</span>
                      <select
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                      >
                        <option value="immediate">Real-Time Emergency Alert (Immediate)</option>
                        <option value="hourly_digest">Hourly Aggregated Telemetry Digest</option>
                        <option value="iers_bulletin">Semi-Annual IERS Bulletin Cycle</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Optional Webhook / OpsGenie URL */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-purple-400" />
                    5. Optional Webhook / PagerDuty / Slack Payload URL
                  </label>
                  <span className="text-[10px] text-slate-400">JSON HTTP POST</span>
                </div>
                <input
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.slack.com/services/... or https://events.pagerduty.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-amber-400 focus:outline-none font-mono text-[11px]"
                />
              </div>

              {/* Current Drift Assessment Callout */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className={`w-5 h-5 ${isCurrentlyBreached ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">Current Live Drift Evaluation:</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isCurrentlyBreached ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {isCurrentlyBreached ? `BREACHED (${exceedanceRatio}×)` : 'WITHIN SAFETY BOUND'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Current TAI-UTC divergence is <strong className="text-cyan-300 font-mono">+{CURRENT_TAI_UTC_OFFSET}.000s</strong> (+37,000,000 µs).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleTestAlert()}
                    disabled={isTestingAlert}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isTestingAlert ? 'Simulating...' : 'Test & Preview Email'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs transition-all shadow-lg shadow-amber-950/50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Saving Rule...' : 'Activate Email Alert Rule'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: MANAGE ACTIVE RULES */}
          {activeTab === 'manage' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100">
                    Configured Alert Rules ({savedRules.length})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Active monitoring rules stored in Cloudflare D1 database for <span className="text-amber-300 font-mono">{email || defaultEmail}</span>.
                  </p>
                </div>

                <button
                  onClick={fetchRules}
                  disabled={isLoadingRules}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRules ? 'animate-spin text-amber-400' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingRules ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
                  <p className="text-xs">Querying Cloudflare D1 database...</p>
                </div>
              ) : savedRules.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                  <Bell className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-300 font-bold">No custom alert rules found for this email yet.</p>
                  <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                    Configure your first safety threshold in the "Configure New Alert Rule" tab to receive automated warnings when TAI-UTC drift exceeds limits.
                  </p>
                  <button
                    onClick={() => setActiveTab('create')}
                    className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                  >
                    Configure First Alert Rule
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedRules.map((rule) => {
                    const isExceeded = currentDriftMicros > rule.threshold_micros;
                    return (
                      <div
                        key={rule.id}
                        className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className={`p-2 rounded-xl border ${
                              rule.is_active === 1 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                                : 'bg-slate-800 text-slate-500 border-slate-700'
                            }`}>
                              <Bell className="w-4 h-4" />
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm text-slate-100">{rule.alert_name}</h5>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                                  rule.is_active === 1
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}>
                                  {rule.is_active === 1 ? 'Active Monitoring' : 'Paused'}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 font-mono">
                                Target: {rule.email} • {rule.system_context}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-start sm:self-center">
                            <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-right font-mono">
                              <span className="text-[9px] uppercase text-slate-500 block">Threshold</span>
                              <span className="text-xs font-bold text-amber-300">{rule.threshold_display}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status bar */}
                        <div className="pt-2 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2 text-slate-400">
                            <span>Condition: <strong className="text-slate-200">{rule.trigger_condition}</strong></span>
                            <span>•</span>
                            <span>Status: <strong className={isExceeded ? 'text-rose-400' : 'text-emerald-400'}>{isExceeded ? 'Exceeding Limit' : 'Safe'}</strong></span>
                            {rule.last_tested_at && (
                              <>
                                <span>•</span>
                                <span>Last Tested: {new Date(rule.last_tested_at).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleTestAlert({
                                email: rule.email,
                                threshold_micros: rule.threshold_micros,
                                threshold_display: rule.threshold_display,
                                alert_name: rule.alert_name,
                                system_context: rule.system_context
                              })}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-medium border border-slate-800 transition-colors"
                            >
                              Test Dispatch
                            </button>

                            <button
                              onClick={() => handleToggleRule(rule.id, rule.is_active)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                                rule.is_active === 1
                                  ? 'bg-slate-900 hover:bg-amber-950/40 text-amber-300 border-amber-500/40'
                                  : 'bg-slate-900 hover:bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                              }`}
                            >
                              {rule.is_active === 1 ? 'Pause' : 'Resume'}
                            </button>

                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                              title="Delete Rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DISPATCHED EMAIL LIVE PREVIEW */}
          {activeTab === 'dispatch_preview' && testDispatchData && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-rose-400" />
                    Automated Alert Email Preview (Dispatched via Edge Worker)
                  </h4>
                  <p className="text-xs text-slate-400">
                    Live simulation of the exact HTML alert dispatched when drift exceeds the configured safety ceiling.
                  </p>
                </div>

                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                  ID: {testDispatchData.message_id}
                </span>
              </div>

              {/* Email Envelope Metadata Headers */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2 text-xs font-mono">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500">From: </span>
                    <span className="text-slate-200">{testDispatchData.from}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">To: </span>
                    <span className="text-amber-300 font-bold">{testDispatchData.to}</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500">Subject: </span>
                  <span className="text-rose-400 font-bold">{testDispatchData.subject}</span>
                </div>

                <div className="pt-2 border-t border-slate-900 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block">X-Metrology-Std:</span>
                    <span className="text-cyan-300 truncate block">{testDispatchData.headers['X-Metrology-Standard']}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">X-NTP-Leap-Indicator:</span>
                    <span className="text-slate-300 block">{testDispatchData.headers['X-NTP-Leap-Indicator']}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Threshold:</span>
                    <span className="text-amber-300 block">{testDispatchData.payload_summary.configured_safety_threshold}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Current TAI Drift:</span>
                    <span className="text-rose-400 font-bold block">{testDispatchData.payload_summary.current_tai_minus_utc_seconds}</span>
                  </div>
                </div>
              </div>

              {/* Rendered HTML Email Card */}
              <div 
                className="rounded-2xl overflow-hidden border border-rose-500/40 shadow-xl"
                dangerouslySetInnerHTML={{ __html: testDispatchData.html_body }}
              />

              <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                <span>All alert messages comply with ISO 8601, BIPM TAI standards, and IERS Bulletin C.</span>
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                >
                  Back to Configurator
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Edge Dispatch • BIPM-TAI Monitored • Zero Spam Guarantee</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
