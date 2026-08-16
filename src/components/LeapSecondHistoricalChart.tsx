import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Zap,
  Info,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
  Maximize2
} from 'lucide-react';
import {
  HistoricalTimelinePoint,
  getHistoricalTimelineProgression,
  DECADE_LEAP_STATS,
  HISTORICAL_LEAP_SECONDS,
  CURRENT_TAI_UTC_OFFSET,
  CURRENT_GPS_UTC_OFFSET
} from '../lib/leapSecondData';

export const LeapSecondHistoricalChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'cumulative' | 'frequency' | 'intervals'>('cumulative');
  const [timeRange, setTimeRange] = useState<'all' | 'early' | 'modern' | 'horizon'>('all');
  
  // Series visibility toggles for cumulative view
  const [showTai, setShowTai] = useState(true);
  const [showGps, setShowGps] = useState(true);
  const [showTt, setShowTt] = useState(false);
  const [showMilestones, setShowMilestones] = useState(true);

  // Raw dataset
  const fullTimeline = useMemo(() => getHistoricalTimelineProgression(), []);

  // Filtered dataset based on selected time range
  const filteredTimeline = useMemo(() => {
    switch (timeRange) {
      case 'early':
        return fullTimeline.filter(p => p.year <= 1999);
      case 'modern':
        return fullTimeline.filter(p => p.year >= 2000 && !p.projected);
      case 'horizon':
        return fullTimeline.filter(p => p.year >= 2016);
      case 'all':
      default:
        return fullTimeline;
    }
  }, [fullTimeline, timeRange]);

  // Interval chart data (days between each leap second)
  const intervalData = useMemo(() => {
    return HISTORICAL_LEAP_SECONDS.map(item => ({
      date: item.dateStr,
      year: item.year,
      label: `${item.month.slice(0, 3)} ${item.year}`,
      days: item.daysSinceLast,
      taiOffset: item.cumulativeTaiMinusUtc,
      notes: item.notes
    }));
  }, []);

  return (
    <div id="historical-progression-chart" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-5">
      {/* 1. Header & Navigation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              50-Year Historical TAI-UTC Offset Progression (1972–2026+)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> 27 Leap Events Cataloged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Visualizing the step-function divergence between pure atomic time (<strong className="text-cyan-300">TAI</strong>), satellite navigation time (<strong className="text-amber-300">GPS</strong>), and civil astronomical time (<strong className="text-slate-200">UTC</strong>) from 1972 through the 2035 abolition horizon.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold self-start lg:self-center">
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cumulative'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative Offsets</span>
          </button>

          <button
            onClick={() => setViewMode('frequency')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'frequency'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Decade Rates</span>
          </button>

          <button
            onClick={() => setViewMode('intervals')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'intervals'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Interval Gaps (Days)</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-Toolbar: Filters, Series Toggles, Range Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Time Range Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Range:</span>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All (1972–2035)
          </button>
          <button
            onClick={() => setTimeRange('early')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'early' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            1972–1999 (High Frequency)
          </button>
          <button
            onClick={() => setTimeRange('modern')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'modern' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2000–2026 (Stabilization)
          </button>
          <button
            onClick={() => setTimeRange('horizon')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'horizon' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2016–2035 (Abolition)
          </button>
        </div>

        {/* Series Visibility Toggles (when in Cumulative Mode) */}
        {viewMode === 'cumulative' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowTai(!showTai)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showTai
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
              <span>TAI - UTC (+{CURRENT_TAI_UTC_OFFSET}s)</span>
            </button>

            <button
              onClick={() => setShowGps(!showGps)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showGps
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
              <span>GPS - UTC (+{CURRENT_GPS_UTC_OFFSET}s)</span>
            </button>

            <button
              onClick={() => setShowTt(!showTt)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showTt
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block"></span>
              <span>TT - UTC (+69.184s)</span>
            </button>

            <button
              onClick={() => setShowMilestones(!showMilestones)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                showMilestones
                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
            >
              {showMilestones ? 'Milestones: Visible' : 'Milestones: Hidden'}
            </button>
          </div>
        )}
      </div>

      {/* 3. Primary Interactive Chart Viewport */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 relative overflow-hidden">
        {viewMode === 'cumulative' && (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredTimeline}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="taiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ttGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#334155' }}
                  label={{
                    value: 'Year (Epoch Calendar)',
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#64748b',
                    fontSize: 11
                  }}
                />

                <YAxis
                  domain={showTt ? [0, 75] : [0, 42]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#334155' }}
                  label={{
                    value: 'Offset from UTC (Seconds)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 5
                  }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalTimelinePoint;
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl text-xs text-white max-w-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-bold font-mono text-cyan-300">{data.displayDate}</span>
                            {data.projected ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                CGPM Phase-Out
                              </span>
                            ) : data.leapInserted > 0 ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                Leap Second (+1s)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                                Epoch Status
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 font-mono text-[11px]">
                            <div className="flex justify-between items-center text-cyan-300">
                              <span className="text-slate-400">TAI - UTC:</span>
                              <span className="font-extrabold text-sm">+{data.taiMinusUtc}s</span>
                            </div>
                            {data.gpsMinusUtc !== null && (
                              <div className="flex justify-between items-center text-amber-300">
                                <span className="text-slate-400">GPS - UTC:</span>
                                <span className="font-bold">+{data.gpsMinusUtc}s</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-purple-300">
                              <span className="text-slate-400">TT - UTC:</span>
                              <span className="font-bold">+{data.ttMinusUtc}s</span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-300 pt-1.5 border-t border-slate-800 leading-relaxed font-sans">
                            {data.notes}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Milestone Reference Lines & Annotations */}
                {showMilestones && (
                  <>
                    <ReferenceLine
                      x={1972}
                      stroke="#06b6d4"
                      strokeDasharray="4 4"
                      label={{
                        value: '1972: UTC Inception (+10s)',
                        position: 'insideTopLeft',
                        fill: '#06b6d4',
                        fontSize: 10
                      }}
                    />
                    <ReferenceLine
                      x={1980}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        value: '1980: GPS Epoch',
                        position: 'insideTopLeft',
                        fill: '#f59e0b',
                        fontSize: 10
                      }}
                    />
                    <ReferenceLine
                      x={2016}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{
                        value: '2016: Last Leap (+37s)',
                        position: 'insideTopLeft',
                        fill: '#10b981',
                        fontSize: 10
                      }}
                    />
                    <ReferenceLine
                      x={2035}
                      stroke="#a855f7"
                      strokeDasharray="4 4"
                      label={{
                        value: '2035: CGPM Abolition',
                        position: 'insideTopLeft',
                        fill: '#a855f7',
                        fontSize: 10
                      }}
                    />
                    {/* Projected Phase Area */}
                    <ReferenceArea
                      x1={2026}
                      x2={2035}
                      fill="#8b5cf6"
                      fillOpacity={0.06}
                    />
                  </>
                )}

                {/* TAI - UTC Curve (Step function) */}
                {showTai && (
                  <Area
                    type="stepAfter"
                    dataKey="taiMinusUtc"
                    name="TAI - UTC"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#taiGradient)"
                    dot={{ stroke: '#06b6d4', strokeWidth: 1.5, r: 2, fill: '#0891b2' }}
                    activeDot={{ r: 5, stroke: '#67e8f9', strokeWidth: 2, fill: '#06b6d4' }}
                  />
                )}

                {/* GPS - UTC Curve (Step function) */}
                {showGps && (
                  <Area
                    type="stepAfter"
                    dataKey="gpsMinusUtc"
                    name="GPS - UTC"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#gpsGradient)"
                    dot={{ stroke: '#f59e0b', strokeWidth: 1.5, r: 2, fill: '#d97706' }}
                    activeDot={{ r: 5, stroke: '#fcd34d', strokeWidth: 2, fill: '#f59e0b' }}
                  />
                )}

                {/* TT - UTC Curve (Step function) */}
                {showTt && (
                  <Area
                    type="stepAfter"
                    dataKey="ttMinusUtc"
                    name="TT - UTC"
                    stroke="#a855f7"
                    strokeWidth={1.8}
                    fill="url(#ttGradient)"
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'frequency' && (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={DECADE_LEAP_STATS}
                margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="decade"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{
                    value: 'Leap Seconds Inserted',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 10
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as (typeof DECADE_LEAP_STATS)[0];
                      return (
                        <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl text-xs text-white max-w-xs space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                            <span className="font-bold text-cyan-300">{data.decade}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300">
                              {data.insertions} Insertions
                            </span>
                          </div>
                          <div className="space-y-1 text-[11px] font-mono">
                            <div className="flex justify-between text-slate-300">
                              <span>Annual Rate:</span>
                              <span className="text-cyan-400 font-bold">{data.annualRate} / year</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Mean Interval:</span>
                              <span className="text-amber-400 font-bold">{data.avgIntervalDays} days</span>
                            </div>
                            <div className="flex justify-between text-slate-300">
                              <span>Offset Range:</span>
                              <span className="text-white font-bold">+{data.startOffset}s → +{data.endOffset}s</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 pt-1.5 border-t border-slate-800">
                            {data.rotationTrend}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="insertions"
                  name="Leap Seconds"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'intervals' && (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={intervalData}
                margin={{ top: 20, right: 30, left: 15, bottom: 35 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={1}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{
                    value: 'Days Since Previous Leap Second',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 5
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as (typeof intervalData)[0];
                      return (
                        <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3 shadow-2xl text-xs text-white max-w-xs space-y-1.5">
                          <div className="flex justify-between font-bold border-b border-slate-800 pb-1">
                            <span className="text-emerald-400">{data.date}</span>
                            <span className="font-mono text-cyan-300">TAI: +{data.taiOffset}s</span>
                          </div>
                          <div className="font-mono text-sm font-extrabold text-white">
                            {data.days} days ({((data.days || 1) / 365.25).toFixed(1)} yrs)
                          </div>
                          <p className="text-[11px] text-slate-300">{data.notes}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={2557}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Max Gap: 2,557 Days (7.0 Years, 1998-2005)',
                    position: 'insideTopRight',
                    fill: '#f43f5e',
                    fontSize: 10
                  }}
                />
                <Bar
                  dataKey="days"
                  name="Days Gap"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 4. Statistical Summary Badges & Decadal Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Leap Seconds</span>
          <span className="text-xl font-extrabold font-mono text-cyan-400 mt-1 block">27</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">1972–Present</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">50-Yr Accumulated Drift</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">+27.0s</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">TAI-UTC: +10s → +37s</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS Offset Growth</span>
          <span className="text-xl font-extrabold font-mono text-amber-400 mt-1 block">+18.0s</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">0s in 1980 → +18s in 2026</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Longest Leap Drought</span>
          <span className="text-xl font-extrabold font-mono text-rose-400 mt-1 block">7.0 Years</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">2,557 days (1998–2005)</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Plateau</span>
          <span className="text-xl font-extrabold font-mono text-blue-400 mt-1 block">9.6+ Years</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Since Dec 31, 2016</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">CGPM Phase-Out</span>
          <span className="text-xl font-extrabold font-mono text-purple-400 mt-1 block">2035</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Resolution 4 Effective</span>
        </div>
      </div>

      {/* 5. Key Historical Takeaways & Physical Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>The 1970s–1990s Acceleration vs. Modern 2000s Slowdown</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Between 1972 and 1999, leap seconds were inserted almost annually (<strong>22 leap seconds in 27 years</strong>) due to steady core-mantle tidal deceleration. In contrast, since 2000, only <strong>5 leap seconds</strong> have been needed because Earth's rotational speed intermittently accelerated from core turbulence and glacial mass redistribution.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>Why the Plateau Reaches the 2035 Horizon</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Because UT1 - UTC has remained near <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">+0.038s</code>, no leap seconds are anticipated in the near term. When BIPM CGPM Resolution 4 activates in <strong>2035</strong>, the requirement to keep UT1 - UTC within ±0.9s will be lifted, rendering the TAI - UTC offset continuous and permanent for the century ahead.
          </p>
        </div>
      </div>
    </div>
  );
};
