import React, { useState, useEffect, useMemo } from 'react';
import { 
  Code, Copy, Check, Layout, Sun, Moon, Clock, Globe, Sliders, ExternalLink, 
  PieChart as PieChartIcon, Star, Pin, RefreshCw, Plus, Sparkles, MapPin, Zap, Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer 
} from 'recharts';
import { MAJOR_CITIES } from '../lib/citiesData';
import { 
  getPinnedCities, isCityPinned, togglePinCity, resetPinnedCities, 
  subscribeToPinnedCities, pinCity 
} from '../lib/pinnedCitiesStorage';
import { getTimezoneOffsetInfo, formatCityDateTime } from '../lib/timezoneUtils';
import { City } from '../types';
import { AdBanner } from './AdBanner';

interface OffsetDistributionItem {
  name: string;
  offset: string;
  offsetMinutes: number;
  count: number;
  cities: City[];
  percentage: number;
  color: string;
}

const PALETTE = [
  '#38bdf8', // sky-400
  '#34d399', // emerald-400
  '#fbbf24', // amber-400
  '#a78bfa', // violet-400
  '#f472b6', // pink-400
  '#fb923c', // orange-400
  '#2dd4bf', // teal-400
  '#818cf8', // indigo-400
  '#a3e635', // lime-400
  '#f87171', // red-400
  '#c084fc', // purple-400
  '#22d3ee', // cyan-400
];

export const WidgetsPillar: React.FC = () => {
  const [widgetType, setWidgetType] = useState<'clock' | 'countdown' | 'astronomy' | 'weather'>('clock');
  const [selectedCity, setSelectedCity] = useState<string>('London');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [width, setWidth] = useState<number>(340);
  const [height, setHeight] = useState<number>(220);
  const [copied, setCopied] = useState<boolean>(false);

  // Pinned cities state for Timezone Distribution Chart
  const [pinnedCities, setPinnedCities] = useState<City[]>(() => getPinnedCities());
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Subscribe to real-time pinned cities updates across the app
  useEffect(() => {
    const unsubscribe = subscribeToPinnedCities((updatedList) => {
      setPinnedCities(updatedList);
    });
    return () => unsubscribe();
  }, []);

  // Periodic clock update for offset evaluations
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const cityObj = MAJOR_CITIES.find(c => c.name === selectedCity) || MAJOR_CITIES[0];

  // Construct iframe embed snippet
  const embedUrl = `https://timegovern.com/embed/${widgetType}?city=${encodeURIComponent(selectedCity)}&theme=${theme}`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" scrolling="no" style="border-radius:12px; overflow:hidden; border:1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'};"></iframe>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute timezone distribution dataset for Recharts PieChart
  const distributionData: OffsetDistributionItem[] = useMemo(() => {
    const map = new Map<string, { offset: string; offsetMinutes: number; cities: City[] }>();

    pinnedCities.forEach((city) => {
      const info = getTimezoneOffsetInfo(now, city.timezone);
      const key = info.offsetFormatted; // e.g. "UTC+00:00", "UTC+09:00"
      if (!map.has(key)) {
        map.set(key, { offset: key, offsetMinutes: info.offsetMinutes, cities: [] });
      }
      map.get(key)!.cities.push(city);
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.offsetMinutes - b.offsetMinutes);
    const total = pinnedCities.length;

    return sorted.map((item, index) => ({
      name: item.offset,
      offset: item.offset,
      offsetMinutes: item.offsetMinutes,
      count: item.cities.length,
      cities: item.cities,
      percentage: total > 0 ? Math.round((item.cities.length / total) * 100) : 0,
      color: PALETTE[index % PALETTE.length],
    }));
  }, [pinnedCities, now]);

  // Key metrics calculation
  const totalPinned = pinnedCities.length;
  const uniqueOffsets = distributionData.length;
  const maxSpanHours = useMemo(() => {
    if (distributionData.length < 2) return 0;
    const minMin = distributionData[0].offsetMinutes;
    const maxMin = distributionData[distributionData.length - 1].offsetMinutes;
    return (maxMin - minMin) / 60;
  }, [distributionData]);

  const topOffsetItem = useMemo(() => {
    if (distributionData.length === 0) return null;
    return [...distributionData].sort((a, b) => b.count - a.count)[0];
  }, [distributionData]);

  // Quick pin suggestion handler
  const handleQuickPin = (city: City) => {
    const updated = pinCity(city);
    setPinnedCities(updated);
  };

  const handleResetDefaults = () => {
    const reset = resetPinnedCities();
    setPinnedCities(reset);
  };

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as OffsetDistributionItem;
      return (
        <div className="bg-slate-950/95 border border-slate-700/80 p-3.5 rounded-xl shadow-2xl backdrop-blur-xl text-xs text-white z-50 min-w-[200px] ring-1 ring-black/40">
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: data.color }} />
              <span className="font-mono font-bold text-cyan-300 text-sm">{data.offset}</span>
            </div>
            <span className="text-[11px] font-extrabold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
              {data.percentage}%
            </span>
          </div>

          <div className="text-slate-300 text-[11px] mb-2 flex items-center justify-between">
            <span className="text-slate-400">Pinned Cities:</span>
            <span className="font-bold text-white font-mono">{data.count} of {totalPinned}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Locations:</span>
            <div className="flex flex-wrap gap-1">
              {data.cities.map((c) => (
                <span
                  key={c.id}
                  className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium border border-slate-700/80"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              FREE EMBEDDABLE WEB WIDGET BUILDER & ANALYTICS
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Embed TimeGovern Clocks, Countdowns & Ephemeris on Your Website
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Customizable HTML/JS responsive widgets for bloggers, news sites, event landing pages, and enterprise dashboards.
          </p>
        </div>
      </div>

      {/* Recharts Pie Chart: Global Timezone Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                RECHARTS ANALYTICS
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Real-Time Storage Sync</span>
            </div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-emerald-400" /> Global Timezone Distribution
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Visualizing the geographic spread and UTC offset clustering of your {totalPinned} pinned cities across worldwide time zones.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Reset pinned cities to global standard hub baseline"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset Hub Defaults</span>
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 shadow-inner">
            <span className="text-[11px] text-slate-400 font-medium block">Total Pinned Cities</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-white">{totalPinned}</span>
              <span className="text-[10px] text-emerald-400 font-bold">Active</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 shadow-inner">
            <span className="text-[11px] text-slate-400 font-medium block">Unique UTC Offsets</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-cyan-400">{uniqueOffsets}</span>
              <span className="text-[10px] text-slate-400">Zones</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 shadow-inner">
            <span className="text-[11px] text-slate-400 font-medium block">Max Time Span</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black font-mono text-amber-400">{maxSpanHours}h</span>
              <span className="text-[10px] text-slate-400">Span</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 shadow-inner">
            <span className="text-[11px] text-slate-400 font-medium block">Dominant UTC Zone</span>
            <div className="flex items-baseline gap-1.5 mt-1 truncate">
              <span className="text-lg font-black font-mono text-purple-400 truncate">
                {topOffsetItem ? topOffsetItem.offset : 'N/A'}
              </span>
              {topOffsetItem && (
                <span className="text-[10px] text-slate-400 shrink-0">({topOffsetItem.count})</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Chart and Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Area: Responsive Pie Chart */}
          <div className="lg:col-span-6 bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[360px] relative">
            {distributionData.length === 0 ? (
              <div className="text-center p-8 space-y-3">
                <Globe className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">No pinned cities found in storage</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Pin cities from the World Clock, Header search, or click the button below to load global reference hubs.
                </p>
                <button
                  onClick={handleResetDefaults}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                >
                  Load Default Global Hubs
                </button>
              </div>
            ) : (
              <>
                <div className="w-full h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={105}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="name"
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                      >
                        {distributionData.map((entry, index) => {
                          const isHovered = activePieIndex === index;
                          return (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              stroke={isHovered ? '#ffffff' : '#0f172a'} 
                              strokeWidth={isHovered ? 3 : 2}
                              opacity={activePieIndex === null || isHovered ? 1 : 0.65}
                              style={{
                                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                                transformOrigin: 'center center',
                                transition: 'all 0.2s ease-in-out',
                                cursor: 'pointer',
                              }}
                            />
                          );
                        })}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Center Badge inside Donut */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-center">
                  <span className="text-2xl font-black font-mono text-white block leading-none">
                    {activePieIndex !== null && distributionData[activePieIndex]
                      ? distributionData[activePieIndex].count
                      : totalPinned}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-1">
                    {activePieIndex !== null && distributionData[activePieIndex]
                      ? distributionData[activePieIndex].offset
                      : 'Cities'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-2">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hover over any slice to inspect timezone cluster and cities</span>
                </div>
              </>
            )}
          </div>

          {/* Right Area: Detailed Offset Clusters List & Quick Add */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                UTC Offset Clusters Breakdown
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                {distributionData.length} active segments
              </span>
            </div>

            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {distributionData.map((item, idx) => {
                const isActive = activePieIndex === idx;
                return (
                  <div
                    key={item.offset}
                    onMouseEnter={() => setActivePieIndex(idx)}
                    onMouseLeave={() => setActivePieIndex(null)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-800 border-slate-600 shadow-md translate-x-1'
                        : 'bg-slate-950/70 hover:bg-slate-800/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-mono font-bold text-sm text-white">{item.offset}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">
                          {item.count} {item.count === 1 ? 'city' : 'cities'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Percentage Bar */}
                    <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>

                    {/* City Chips */}
                    <div className="flex flex-wrap gap-1">
                      {item.cities.map((city) => (
                        <span
                          key={city.id}
                          className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800 flex items-center gap-1"
                        >
                          <MapPin className="w-2.5 h-2.5 text-slate-400" />
                          <span>{city.name}</span>
                          <span className="text-slate-500 text-[9px]">({city.countryCode})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick-Add Recommended Hubs */}
            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Plus className="w-3 h-3 text-cyan-400" /> Quick Add Diverse Regional Hubs:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'hnl', name: 'Honolulu', tz: 'Pacific/Honolulu', offset: 'UTC-10' },
                  { id: 'sfo', name: 'San Francisco', tz: 'America/Los_Angeles', offset: 'UTC-7' },
                  { id: 'sao', name: 'São Paulo', tz: 'America/Sao_Paulo', offset: 'UTC-3' },
                  { id: 'cai', name: 'Cairo', tz: 'Africa/Cairo', offset: 'UTC+3' },
                  { id: 'del', name: 'New Delhi', tz: 'Asia/Kolkata', offset: 'UTC+5:30' },
                  { id: 'hkg', name: 'Hong Kong', tz: 'Asia/Hong_Kong', offset: 'UTC+8' },
                  { id: 'akl', name: 'Auckland', tz: 'Pacific/Auckland', offset: 'UTC+12' },
                ].map((sample) => {
                  const alreadyPinned = isCityPinned(sample.id);
                  const cityRecord = MAJOR_CITIES.find((c) => c.id === sample.id);
                  return (
                    <button
                      key={sample.id}
                      disabled={alreadyPinned || !cityRecord}
                      onClick={() => cityRecord && handleQuickPin(cityRecord)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all ${
                        alreadyPinned
                          ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-default'
                          : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 cursor-pointer shadow-xs'
                      }`}
                    >
                      <span>{sample.name}</span>
                      <span className="font-mono text-[9px] opacity-75">{sample.offset}</span>
                      {alreadyPinned ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Plus className="w-2.5 h-2.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configurator Controls */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-slate-100 shadow-md">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-blue-400" /> Widget Customization Panel
          </h3>

          {/* Widget Type Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">1. Select Widget Type</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setWidgetType('clock')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
                  widgetType === 'clock'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4 text-blue-400" /> World Clock
              </button>

              <button
                onClick={() => setWidgetType('countdown')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
                  widgetType === 'countdown'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layout className="w-4 h-4 text-emerald-400" /> Event Countdown
              </button>

              <button
                onClick={() => setWidgetType('astronomy')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
                  widgetType === 'astronomy'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400" /> Moon & Sunset
              </button>

              <button
                onClick={() => setWidgetType('weather')}
                className={`p-2.5 rounded-xl border flex items-center gap-2 font-medium transition-colors ${
                  widgetType === 'weather'
                    ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sun className="w-4 h-4 text-cyan-400" /> Weather Badge
              </button>
            </div>
          </div>

          {/* City Selection */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">2. Target Location / City</label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}, {c.country} ({c.timezone})
                </option>
              ))}
            </select>
          </div>

          {/* Theme & Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Theme Palette</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-1 rounded-lg font-medium ${theme === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Dark Slate
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-1 rounded-lg font-medium ${theme === 'light' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400'}`}
                >
                  Pure Light
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Widget Width (px)</label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2 font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* HTML Code Output */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Embed HTML Code Snippet
              </label>
              <button
                onClick={handleCopyCode}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={4}
              value={iframeSnippet}
              className="w-full bg-slate-950 text-emerald-400 font-mono text-[11px] p-3 rounded-xl border border-slate-800 focus:outline-none leading-relaxed select-all resize-none"
            />
          </div>
        </div>

        {/* Right Column: Live Interactive Widget Preview */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" /> Live Interactive Preview Card
              </h3>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {width}px × {height}px
              </span>
            </div>

            {/* Rendered Widget Box Simulation */}
            <div className="flex items-center justify-center p-8 bg-slate-950/80 rounded-2xl border border-slate-800 min-h-[280px]">
              <div
                style={{ width: `${width}px`, minHeight: `${height}px` }}
                className={`p-5 rounded-2xl border transition-all shadow-xl flex flex-col justify-between ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-700 text-white'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm">{cityObj.name}</h4>
                    <span className="text-[10px] font-mono opacity-70 block">{cityObj.timezone}</span>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    TIMEGOVERN
                  </span>
                </div>

                {/* Widget specific content preview */}
                {widgetType === 'clock' && (
                  <div className="my-4 text-center">
                    <span className="text-3xl font-black font-mono tracking-tight block">
                      {new Date().toLocaleTimeString('en-US', { timeZone: cityObj.timezone })}
                    </span>
                    <span className="text-xs opacity-75 font-medium block mt-1">
                      {new Date().toLocaleDateString('en-US', { timeZone: cityObj.timezone, weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )}

                {widgetType === 'countdown' && (
                  <div className="my-4 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      New Year 2027 Countdown
                    </span>
                    <div className="flex justify-center gap-2 font-mono text-xl font-bold">
                      <span className="bg-slate-800/80 px-2 py-1 rounded">158d</span>
                      <span className="bg-slate-800/80 px-2 py-1 rounded">12h</span>
                      <span className="bg-slate-800/80 px-2 py-1 rounded">44m</span>
                    </div>
                  </div>
                )}

                {widgetType === 'astronomy' && (
                  <div className="my-3 text-xs space-y-1">
                    <div className="flex justify-between border-b border-slate-800/40 pb-1">
                      <span>Sunrise:</span>
                      <span className="font-bold text-amber-400">05:52 AM</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/40 pb-1">
                      <span>Sunset:</span>
                      <span className="font-bold text-indigo-400">08:24 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Moon Phase:</span>
                      <span className="font-bold text-blue-400">Waxing Gibbous (82%)</span>
                    </div>
                  </div>
                )}

                {widgetType === 'weather' && (
                  <div className="my-3 flex items-center justify-around">
                    <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />
                    <div>
                      <span className="text-2xl font-black font-mono block">24°C</span>
                      <span className="text-[11px] opacity-80 block">Mostly Clear</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800/40 flex justify-between items-center text-[9px] opacity-60">
                  <span>Powered by Timegovern.com</span>
                  <span>Free API Tier</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>No CORS restrictions • SSL Encrypted Embeds</span>
            <a
              href="https://timegovern.com/docs/widgets"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline flex items-center gap-1"
            >
              Developer Integration Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      <AdBanner type="in-feed" />
    </div>
  );
};

