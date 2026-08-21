import React, { useEffect, useMemo, useState } from 'react';
import {
  Code, Copy, Check, Sliders, ExternalLink, PieChart as PieChartIcon,
  RefreshCw, Plus, MapPin, Info, Globe,
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { MAJOR_CITIES } from '../lib/citiesData';
import {
  getPinnedCities, isCityPinned, resetPinnedCities,
  subscribeToPinnedCities, pinCity,
} from '../lib/pinnedCitiesStorage';
import { getTimezoneOffsetInfo } from '../lib/timezoneUtils';
import { City } from '../types';
import { AdBanner } from './AdBanner';
import {
  WIDGET_CATALOG,
  WidgetKind,
  buildEmbedHref,
  renderWidget,
} from './widgets/WidgetKit';

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
  '#38bdf8', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#fb923c',
  '#2dd4bf', '#818cf8', '#a3e635', '#f87171', '#c084fc', '#22d3ee',
];

export const WidgetsPillar: React.FC = () => {
  const [widgetType, setWidgetType] = useState<WidgetKind>('digital');
  const [selectedCity, setSelectedCity] = useState('London');
  const [multiCities, setMultiCities] = useState('London,New York,Tokyo,Sydney');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [width, setWidth] = useState(340);
  const [height, setHeight] = useState(200);
  const [targetIso, setTargetIso] = useState('2027-01-01T00:00:00Z');
  const [countdownLabel, setCountdownLabel] = useState('New Year 2027');
  const [copied, setCopied] = useState(false);

  const [pinnedCities, setPinnedCities] = useState<City[]>(() => getPinnedCities());
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => subscribeToPinnedCities(setPinnedCities), []);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Auto size defaults when type changes
  useEffect(() => {
    const meta = WIDGET_CATALOG.find((w) => w.id === widgetType);
    if (meta) {
      setWidth(meta.defaultW);
      setHeight(meta.defaultH);
    }
  }, [widgetType]);

  const embedParams: Record<string, string> = {
    embed: widgetType,
    theme,
  };
  if (widgetType !== 'stopwatch' && widgetType !== 'multicity' && widgetType !== 'countdown') {
    embedParams.city = selectedCity;
  }
  if (widgetType === 'multicity') embedParams.cities = multiCities;
  if (widgetType === 'countdown') {
    embedParams.target = targetIso;
    embedParams.label = countdownLabel;
  }

  const embedHref = typeof window !== 'undefined' ? buildEmbedHref(embedParams) : '';
  const iframeSnippet = `<iframe src="${embedHref}" width="${width}" height="${height}" frameborder="0" scrolling="no" title="TimeGovern ${widgetType}" style="border-radius:12px;overflow:hidden;border:1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'};"></iframe>`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const distributionData: OffsetDistributionItem[] = useMemo(() => {
    const map = new Map<string, { offset: string; offsetMinutes: number; cities: City[] }>();
    pinnedCities.forEach((city) => {
      const info = getTimezoneOffsetInfo(now, city.timezone);
      const key = info.offsetFormatted;
      if (!map.has(key)) map.set(key, { offset: key, offsetMinutes: info.offsetMinutes, cities: [] });
      map.get(key)!.cities.push(city);
    });
    const sorted = Array.from(map.values()).sort((a, b) => a.offsetMinutes - b.offsetMinutes);
    const total = pinnedCities.length || 1;
    return sorted.map((item, index) => ({
      name: item.offset,
      offset: item.offset,
      offsetMinutes: item.offsetMinutes,
      count: item.cities.length,
      cities: item.cities,
      percentage: Math.round((item.cities.length / total) * 100),
      color: PALETTE[index % PALETTE.length],
    }));
  }, [pinnedCities, now]);

  const totalPinned = pinnedCities.length;
  const uniqueOffsets = distributionData.length;
  const maxSpanHours = useMemo(() => {
    if (distributionData.length < 2) return 0;
    return (distributionData[distributionData.length - 1].offsetMinutes - distributionData[0].offsetMinutes) / 60;
  }, [distributionData]);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const data = payload[0].payload as OffsetDistributionItem;
    return (
      <div className="bg-slate-950/95 border border-slate-700 p-3 rounded-xl text-xs text-white min-w-[180px]">
        <div className="font-mono font-bold text-cyan-300 mb-1">{data.offset}</div>
        <div className="text-slate-300">{data.count} cities · {data.percentage}%</div>
        <div className="flex flex-wrap gap-1 mt-2">
          {data.cities.map((c) => (
            <span key={c.id} className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">{c.name}</span>
          ))}
        </div>
      </div>
    );
  };

  const preview = renderWidget(widgetType, {
    city: selectedCity,
    theme,
    cities: multiCities.split(',').map((s) => s.trim()).filter(Boolean),
    targetIso,
    label: countdownLabel,
  });

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
          LAB · 7 public embed widgets
        </span>
        <h2 className="text-2xl font-extrabold tracking-tight mt-2">Widgets builder</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl">
          Digital, analog, multi-city, countdown, sun & moon, weather, stopwatch — all live in preview.
          Embed uses <code className="text-emerald-400">?embed=…</code> on this same origin (works on localhost).
        </p>
      </div>

      {/* Analytics pie — unchanged behaviour */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-extrabold flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-emerald-400" /> Timezone distribution (pinned)
          </h3>
          <button
            type="button"
            onClick={() => setPinnedCities(resetPinnedCities())}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset hubs
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Pinned</div>
            <div className="text-xl font-mono font-black">{totalPinned}</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">UTC offsets</div>
            <div className="text-xl font-mono font-black text-cyan-400">{uniqueOffsets}</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400">Max span</div>
            <div className="text-xl font-mono font-black text-amber-400">{maxSpanHours}h</div>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-1 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5" /> Pin cities on World Clock to fill chart
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-[280px] bg-slate-950 border border-slate-800 rounded-2xl p-2">
            {distributionData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                <Globe className="w-8 h-8" /> No pins yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={distributionData}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    onMouseEnter={(_, i) => setActivePieIndex(i)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {distributionData.map((e, i) => (
                      <Cell key={e.offset} fill={e.color} stroke="#0f172a" strokeWidth={activePieIndex === i ? 3 : 1} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {distributionData.map((item) => (
              <div key={item.offset} className="p-2 rounded-xl border border-slate-800 bg-slate-950/80 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="font-bold" style={{ color: item.color }}>{item.offset}</span>
                  <span>{item.count} · {item.percentage}%</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.cities.map((c) => (
                    <span key={c.id} className="text-[10px] bg-slate-900 border border-slate-800 px-1.5 rounded flex items-center gap-0.5">
                      <MapPin className="w-2.5 h-2.5" />{c.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex flex-wrap gap-1 pt-2">
              {['hnl', 'sfo', 'sao', 'cai', 'del', 'hkg', 'akl'].map((id) => {
                const city = MAJOR_CITIES.find((c) => c.id === id);
                if (!city) return null;
                const pinned = isCityPinned(id);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={pinned}
                    onClick={() => setPinnedCities(pinCity(city))}
                    className={`text-[10px] px-2 py-1 rounded-lg border ${pinned ? 'opacity-40 border-slate-800' : 'border-slate-700 hover:bg-slate-800'}`}
                  >
                    <Plus className="w-2.5 h-2.5 inline" /> {city.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-slate-100">
          <h3 className="text-sm font-bold flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-blue-400" /> Customize
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">Widget type (1–7)</label>
            <div className="grid grid-cols-1 gap-1.5">
              {WIDGET_CATALOG.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWidgetType(w.id)}
                  className={`text-left p-2.5 rounded-xl border text-xs transition-colors ${
                    widgetType === w.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="font-bold block">{w.label}</span>
                  <span className="opacity-70">{w.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          {widgetType !== 'stopwatch' && widgetType !== 'multicity' && widgetType !== 'countdown' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">City</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5"
              >
                {MAJOR_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}, {c.country}
                  </option>
                ))}
              </select>
            </div>
          )}

          {widgetType === 'multicity' && (
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Cities (comma-separated, max 6)</label>
              <input
                value={multiCities}
                onChange={(e) => setMultiCities(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5"
              />
            </div>
          )}

          {widgetType === 'countdown' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">Target (ISO)</label>
              <input
                value={targetIso}
                onChange={(e) => setTargetIso(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 font-mono"
              />
              <label className="text-xs font-bold text-slate-300 block">Label</label>
              <input
                value={countdownLabel}
                onChange={(e) => setCountdownLabel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Theme</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button type="button" onClick={() => setTheme('dark')} className={`flex-1 py-1 rounded-lg ${theme === 'dark' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}>Dark</button>
                <button type="button" onClick={() => setTheme('light')} className={`flex-1 py-1 rounded-lg ${theme === 'light' ? 'bg-slate-200 text-slate-900 font-bold' : 'text-slate-400'}`}>Light</button>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Width px</label>
              <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 300)} className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl p-2 font-mono" />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <Code className="w-4 h-4" /> Embed HTML
              </label>
              <button type="button" onClick={handleCopy} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <textarea readOnly rows={5} value={iframeSnippet} className="w-full bg-slate-950 text-emerald-400 font-mono text-[10px] p-3 rounded-xl border border-slate-800 resize-none" />
            <a href={embedHref} target="_blank" rel="noreferrer" className="text-[11px] text-blue-400 hover:underline mt-2 inline-flex items-center gap-1">
              Open embed in new tab <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">Live preview (working)</h3>
            <span className="text-[10px] font-mono text-slate-400">{width}×{height}</span>
          </div>
          <div className="flex justify-center p-6 bg-slate-950/80 rounded-2xl border border-slate-800 min-h-[300px]">
            <div style={{ width, minHeight: height }} className="w-full max-w-full">
              {preview}
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3">
            Preview runs in-page. Copy the iframe to embed the same widget via <code className="text-emerald-500">?embed=</code> (no fake timegovern.com path).
          </p>
        </div>
      </div>

      <AdBanner type="in-feed" />
    </div>
  );
};
