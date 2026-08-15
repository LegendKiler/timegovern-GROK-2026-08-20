import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sun, Moon, CloudRain, Timer, Search, Globe, Database, ShieldCheck, Zap, QrCode, User, Activity, Code, Layers, Newspaper, Calculator, Building2 } from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import { City } from '../types';

interface HeaderProps {
  activePillar: number;
  setActivePillar: (pillar: number) => void;
  onSelectCity: (city: City) => void;
  onOpenArchModal: () => void;
  onOpenQrModal: () => void;
  onOpenAccountModal: () => void;
  onOpenSecurityModal?: () => void;
  onOpenTemplateGallery?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  templateTheme: 'swiss-quartz' | 'stripe-corporate' | 'emerald-precision' | 'editorial-classic';
  setTemplateTheme: (theme: 'swiss-quartz' | 'stripe-corporate' | 'emerald-precision' | 'editorial-classic') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePillar,
  setActivePillar,
  onSelectCity,
  onOpenArchModal,
  onOpenQrModal,
  onOpenAccountModal,
  onOpenSecurityModal,
  onOpenTemplateGallery,
  isDarkMode,
  setIsDarkMode,
  templateTheme,
  setTemplateTheme
}) => {
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getUTCHours().toString().padStart(2, '0');
      const minutes = now.getUTCMinutes().toString().padStart(2, '0');
      const seconds = now.getUTCSeconds().toString().padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 0) {
      setSearchResults(searchCities(q, 8));
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSelectCityClick = (city: City) => {
    onSelectCity(city);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  return (
    <header className={`${isDarkMode ? 'bg-[#0f172a] text-slate-100 border-slate-800' : 'bg-[#0f172a] text-white border-slate-700'} border-b sticky top-0 z-40 shadow-2xl backdrop-blur-xl`}>
      {/* Top Utility Bar */}
      <div className={`max-w-[1920px] mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs border-b ${isDarkMode ? 'border-slate-800/80 bg-[#0b101f]/90' : 'border-slate-800 bg-[#1e293b]/90'} backdrop-blur-md`}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-emerald-400 bg-slate-950/90 px-3 py-1 rounded-lg border border-emerald-500/30 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">{utcTime || '00:00:00 UTC'}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-700/60">
              <Zap className="w-3 h-3 text-cyan-400" /> Cloudflare Edge DNS Active
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-300">IANA tzdata 2026a</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Template Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 rounded-lg p-0.5">
            <span className="text-[10px] text-slate-400 font-bold px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" /> Template:
            </span>
            <select
              value={templateTheme}
              onChange={(e) => setTemplateTheme(e.target.value as any)}
              className="bg-slate-800 text-cyan-300 font-semibold text-[11px] rounded px-2 py-0.5 border border-slate-600 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="swiss-quartz">timeanddate.com Classic Official</option>
              <option value="stripe-corporate">Stripe Corporate Tech</option>
              <option value="emerald-precision">Emerald Mint Tech</option>
              <option value="editorial-classic">Financial Times Crisp</option>
            </select>
            {onOpenTemplateGallery && (
              <button
                onClick={onOpenTemplateGallery}
                className="px-2 py-0.5 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[10px] font-bold rounded border border-cyan-700/60 transition-all cursor-pointer flex items-center gap-1 ml-0.5"
                title="Open Template Gallery with Visual Previews"
              >
                🎨 Gallery
              </button>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg border border-amber-500/40 transition-all cursor-pointer text-[11px] font-bold shadow-sm"
            title={isDarkMode ? 'Switch to Light Mode (TimeAndDate style)' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-300" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSecurityModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg border border-emerald-500/60 transition-all cursor-pointer text-[11px] font-bold shadow-sm"
            title="SSL Certificate, Domain Security & Trust Specs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSL & Security 🔒</span>
          </button>

          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 rounded-lg border border-blue-500/50 transition-all cursor-pointer text-[11px] font-semibold"
            title="Scan or share QR Code for Mobile"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Mobile App & QR</span>
          </button>

          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 rounded-lg border border-emerald-500/50 transition-all cursor-pointer text-[11px] font-semibold"
            title="User Account & Cloud Sync"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Account Sync</span>
          </button>

          <button
            onClick={onOpenArchModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 rounded-lg border border-indigo-500/50 transition-all cursor-pointer text-[11px] font-semibold"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture Specs</span>
          </button>
        </div>
      </div>

      {/* Main Header & Branding */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setActivePillar(1)}>
          <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-600/25 font-bold text-xl border border-blue-300/30 group-hover:scale-105 transition-transform">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-2xl tracking-tight text-white">
                Timegovern<span className="text-cyan-400">.com</span>
              </span>
              <span className="text-[10px] bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold px-2.5 py-0.5 rounded-full tracking-wider uppercase border border-cyan-400/40 shadow-sm">
                GLOBAL PLATFORM
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">Temporal Governance, Global Timezones, Astronomy & World Statistics</p>
          </div>
        </div>

        {/* Global City Search Input - TimeAndDate style with signature yellow button */}
        <div className="relative max-w-xl w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 z-10" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
              placeholder="Search city, timezone, country (e.g. London, Tokyo, EST)..."
              className="w-full bg-[#0d1424] text-white placeholder-slate-400 text-xs rounded-xl pl-10 pr-24 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner font-medium"
            />
            <button
              onClick={() => {
                if (searchQuery.trim().length > 0) {
                  const matches = searchCities(searchQuery, 1);
                  if (matches.length > 0) handleSelectCityClick(matches[0]);
                }
              }}
              className="absolute right-1 top-1 bottom-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-4 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500 shadow-sm"
              title="Search TimeAndDate City Database"
            >
              <Search className="w-3.5 h-3.5 text-slate-950" />
              <span>Search</span>
            </button>
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#0d1424] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-80 overflow-y-auto">
              <div className="px-3.5 py-2 text-[10px] uppercase font-bold text-slate-400 bg-[#070b14] border-b border-slate-800 flex justify-between items-center tracking-wider">
                <span>Matching Cities & Timezones</span>
                <span className="text-cyan-400 font-mono">{searchResults.length} Results</span>
              </div>
              {searchResults.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSelectCityClick(city)}
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-800 flex items-center justify-between border-b border-slate-800/60 last:border-0 transition-colors"
                >
                  <div>
                    <span className="font-bold text-white">{city.name}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">({city.country})</span>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded">
                    {city.timezone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Bar across 10 Pillars */}
      <nav className={isDarkMode ? 'bg-[#0b101f]/95 border-t border-slate-800' : 'bg-slate-800 text-white shadow-md'}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActivePillar(9)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 9
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Newspaper className="w-4 h-4 text-cyan-400" />
            <span>News & Articles</span>
          </button>

          <button
            onClick={() => setActivePillar(1)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 1
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>World Clock & Regions</span>
          </button>

          <button
            onClick={() => setActivePillar(2)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 2
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Calendar</span>
          </button>

          <button
            onClick={() => setActivePillar(4)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 4
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <CloudRain className="w-4 h-4 text-sky-400" />
            <span>Weather</span>
          </button>

          <button
            onClick={() => setActivePillar(3)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 3
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Sun, Moon & Space</span>
          </button>

          <button
            onClick={() => setActivePillar(5)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 5
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Timers</span>
          </button>

          <button
            onClick={() => setActivePillar(10)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 10
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Calculator className="w-4 h-4 text-rose-400" />
            <span>Calculators</span>
          </button>

          <button
            onClick={() => setActivePillar(6)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 6
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Live Tickers</span>
          </button>

          <button
            onClick={() => setActivePillar(7)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 7
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Code className="w-4 h-4 text-teal-400" />
            <span>Embed Widgets</span>
          </button>

          <button
            onClick={() => setActivePillar(8)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 8
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>API & Dev Portal</span>
          </button>

          <button
            onClick={() => setActivePillar(11)}
            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 11
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-cyan-400 text-cyan-300 bg-slate-700 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Company & Contact (Melb HQ)</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
