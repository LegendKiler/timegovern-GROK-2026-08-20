import React, { useState } from 'react';
import { Code, Copy, Check, Layout, Sun, Moon, Clock, Globe, Sliders, ExternalLink } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { AdBanner } from './AdBanner';

export const WidgetsPillar: React.FC = () => {
  const [widgetType, setWidgetType] = useState<'clock' | 'countdown' | 'astronomy' | 'weather'>('clock');
  const [selectedCity, setSelectedCity] = useState<string>('London');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [width, setWidth] = useState<number>(340);
  const [height, setHeight] = useState<number>(220);
  const [copied, setCopied] = useState<boolean>(false);

  const cityObj = MAJOR_CITIES.find(c => c.name === selectedCity) || MAJOR_CITIES[0];

  // Construct iframe embed snippet
  const embedUrl = `https://timegovern.com/embed/${widgetType}?city=${encodeURIComponent(selectedCity)}&theme=${theme}`;
  const iframeSnippet = `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" scrolling="no" style="border-radius:12px; overflow:hidden; border:1px solid ${theme === 'dark' ? '#1e293b' : '#e2e8f0'};"></iframe>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(iframeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
              FREE EMBEDDABLE WEB WIDGET BUILDER
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
