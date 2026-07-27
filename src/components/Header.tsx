import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Sun, CloudRain, Timer, Search, Globe, Database, ShieldCheck, Zap, QrCode, User, Activity, Code, Layers } from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import { City } from '../types';

interface HeaderProps {
  activePillar: number;
  setActivePillar: (pillar: number) => void;
  onSelectCity: (city: City) => void;
  onOpenArchModal: () => void;
  onOpenQrModal: () => void;
  onOpenAccountModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activePillar,
  setActivePillar,
  onSelectCity,
  onOpenArchModal,
  onOpenQrModal,
  onOpenAccountModal
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
    <header className="bg-[#070b14] text-slate-100 border-b border-slate-800/80 sticky top-0 z-40 shadow-2xl backdrop-blur-xl">
      {/* Top Utility Bar */}
      <div className="max-w-[1550px] mx-auto px-4 py-1.5 flex flex-wrap items-center justify-between text-xs border-b border-slate-800/60 bg-[#0b101f]/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-mono text-emerald-400 bg-slate-900/90 px-3 py-1 rounded-lg border border-emerald-500/30 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">{utcTime || '00:00:00 UTC'}</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-950/50 px-2.5 py-0.5 rounded-full border border-cyan-800/50">
              <Zap className="w-3 h-3 text-cyan-400" /> Cloudflare Edge DNS Active
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">IANA tzdata 2026a</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQrModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg border border-blue-500/40 transition-all cursor-pointer text-[11px] font-semibold hover:shadow-lg hover:shadow-blue-500/20"
            title="Scan or share QR Code for Mobile"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Mobile App & QR</span>
          </button>

          <button
            onClick={onOpenAccountModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg border border-emerald-500/40 transition-all cursor-pointer text-[11px] font-semibold hover:shadow-lg hover:shadow-emerald-500/20"
            title="User Account & Cloud Sync"
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Account Sync</span>
          </button>

          <button
            onClick={onOpenArchModal}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-lg border border-indigo-500/40 transition-all cursor-pointer text-[11px] font-semibold hover:shadow-lg hover:shadow-indigo-500/20"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Architecture Specs</span>
          </button>
        </div>
      </div>

      {/* Main Header & Branding */}
      <div className="max-w-[1550px] mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <p className="text-xs text-slate-400 font-medium">Temporal Governance, Global Timezones, Astronomy & World Statistics</p>
          </div>
        </div>

        {/* Global City Search Input */}
        <div className="relative max-w-lg w-full">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
              placeholder="Search 5,000+ global cities, ISO countries or IANA timezones..."
              className="w-full bg-[#0d1424] text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner font-medium"
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
                  className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-800/80 flex items-center justify-between border-b border-slate-800/60 last:border-0 transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-100">{city.name}</span>
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
      <nav className="bg-[#0b101f]/90 border-t border-slate-800/80">
        <div className="max-w-[1550px] mx-auto px-4 flex items-center overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActivePillar(1)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 1
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>World Clock & Time Zones</span>
          </button>

          <button
            onClick={() => setActivePillar(2)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 2
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span>Calendars & Date Math</span>
          </button>

          <button
            onClick={() => setActivePillar(3)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 3
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Sun className="w-4 h-4 text-amber-400" />
            <span>Sun, Moon & Astronomy</span>
          </button>

          <button
            onClick={() => setActivePillar(4)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 4
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <CloudRain className="w-4 h-4 text-sky-400" />
            <span>Weather & Environment</span>
          </button>

          <button
            onClick={() => setActivePillar(5)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 5
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Timer className="w-4 h-4 text-emerald-400" />
            <span>Timers, Alarms & Stopwatch</span>
          </button>

          <button
            onClick={() => setActivePillar(6)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 6
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-400" />
            <span>Live Tickers (Worldometers)</span>
          </button>

          <button
            onClick={() => setActivePillar(7)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 7
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Code className="w-4 h-4 text-teal-400" />
            <span>Embed Web Widgets</span>
          </button>

          <button
            onClick={() => setActivePillar(8)}
            className={`flex items-center gap-2 px-4 py-3.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activePillar === 8
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 font-bold'
                : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Enterprise Services & API</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
