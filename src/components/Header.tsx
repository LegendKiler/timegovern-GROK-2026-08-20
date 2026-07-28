import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sun, Moon, CloudRain, Timer, Search, Globe, Database, ShieldCheck, Zap, QrCode, User, Activity, Code, Layers } from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import { City } from '../types';

interface HeaderProps {
  activePillar: number;
  setActivePillar: (pillar: number) => void;
  onSelectCity: (city: City) => void;
  onOpenArchModal: () => void;
  onOpenQrModal: () => void;
  onOpenAccountModal: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePillar,
  setActivePillar,
  onSelectCity,
  onOpenArchModal,
  onOpenQrModal,
  onOpenAccountModal,
  isDarkMode,
  setIsDarkMode
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

        {/* Global City Search Input */}
        <div className="relative max-w-xl w-full">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
              placeholder="Search 5,000+ global cities, ISO countries or IANA timezones..."
              className="w-full bg-[#0d1424] text-white placeholder-slate-400 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-700 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner font-medium"
            />
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

      {/* Navigation Bar across 8 Pillars */}
      <nav className={isDarkMode ? 'bg-[#0b101f]/95 border-t border-slate-800' : 'bg-white border-t border-slate-200 text-slate-800 shadow-sm'}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActivePillar(1)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 1
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Clock className={`w-4 h-4 ${isDarkMode ? 'text-cyan-400' : 'text-blue-600'}`} />
            <span>World Clock & Time Zones</span>
          </button>

          <button
            onClick={() => setActivePillar(2)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 2
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <span>Calendars & Date Math</span>
          </button>

          <button
            onClick={() => setActivePillar(3)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 3
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sun className={`w-4 h-4 ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            <span>Sun, Moon & Astronomy</span>
          </button>

          <button
            onClick={() => setActivePillar(4)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 4
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CloudRain className={`w-4 h-4 ${isDarkMode ? 'text-sky-400' : 'text-sky-600'}`} />
            <span>Weather & Environment</span>
          </button>

          <button
            onClick={() => setActivePillar(5)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 5
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Timer className={`w-4 h-4 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span>Timers, Alarms & Stopwatch</span>
          </button>

          <button
            onClick={() => setActivePillar(6)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 6
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className={`w-4 h-4 ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`} />
            <span>Live Tickers (Worldometers)</span>
          </button>

          <button
            onClick={() => setActivePillar(7)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 7
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code className={`w-4 h-4 ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`} />
            <span>Embed Web Widgets</span>
          </button>

          <button
            onClick={() => setActivePillar(8)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 8
                ? isDarkMode
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                  : 'border-blue-600 text-blue-700 bg-blue-50/80 font-bold'
                : isDarkMode
                ? 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layers className={`w-4 h-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <span>Enterprise Services & API</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
