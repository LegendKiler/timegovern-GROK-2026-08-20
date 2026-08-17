import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, Calendar, Sun, Moon, CloudRain, Timer, Search, Globe, Database, 
  ShieldCheck, Zap, QrCode, User, Activity, Code, Layers, Newspaper, 
  Calculator, Building2, Star, Pin, Check, X, Filter, MapPin, ChevronDown, 
  SlidersHorizontal, ArrowRight, Sparkles 
} from 'lucide-react';
import { MAJOR_CITIES, searchCities, filterCitiesByRegionAndQuery, REGION_CATEGORIES, CityRegion } from '../lib/citiesData';
import { getPinnedCities, isCityPinned, togglePinCity, subscribeToPinnedCities } from '../lib/pinnedCitiesStorage';
import { City } from '../types';
import { getTimezoneOffsetInfo, formatCityDateTime } from '../lib/timezoneUtils';

interface HeaderProps {
  activePillar: number;
  setActivePillar: (pillar: number) => void;
  onSelectCity: (city: City) => void;
  primaryCity?: City;
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
  primaryCity,
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
  const [now, setNow] = useState<Date>(new Date());
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<CityRegion | 'pinned'>('all');
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [pinnedCities, setPinnedCities] = useState<City[]>(() => getPinnedCities());

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time localStorage pinned cities changes
  useEffect(() => {
    setPinnedCities(getPinnedCities());
    const unsubscribe = subscribeToPinnedCities((updated) => {
      setPinnedCities(updated);
    });
    return () => unsubscribe();
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global hotkey: "/" or "Ctrl+K" / "Cmd+K" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowSearchDropdown(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ticking time update
  useEffect(() => {
    const updateClock = () => {
      const current = new Date();
      setNow(current);
      const hours = current.getUTCHours().toString().padStart(2, '0');
      const minutes = current.getUTCMinutes().toString().padStart(2, '0');
      const seconds = current.getUTCSeconds().toString().padStart(2, '0');
      setUtcTime(`${hours}:${minutes}:${seconds} UTC`);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute filtered cities list
  const filteredCities = useMemo(() => {
    if (selectedRegion === 'pinned') {
      if (!searchQuery.trim()) return pinnedCities;
      const q = searchQuery.toLowerCase().trim();
      return pinnedCities.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.timezone.toLowerCase().includes(q)
      );
    }
    return filterCitiesByRegionAndQuery(selectedRegion as CityRegion, searchQuery, 60);
  }, [selectedRegion, searchQuery, pinnedCities]);

  // Reset keyboard focus index when results change
  useEffect(() => {
    setFocusedIndex(-1);
  }, [filteredCities.length, selectedRegion]);

  // Scroll focused element into view
  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const activeEl = listRef.current.children[focusedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchDropdown(true);
  };

  const handleSelectCityClick = (city: City) => {
    onSelectCity(city);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleTogglePin = (e: React.MouseEvent, city: City) => {
    e.stopPropagation();
    const { cities } = togglePinCity(city);
    setPinnedCities(cities);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowSearchDropdown(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % (filteredCities.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev <= 0 ? (filteredCities.length - 1) : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredCities[focusedIndex]) {
        handleSelectCityClick(filteredCities[focusedIndex]);
      } else if (filteredCities.length > 0) {
        handleSelectCityClick(filteredCities[0]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchDropdown(false);
    }
  };

  // Compute active primary city info
  const activePrimaryCity = primaryCity || MAJOR_CITIES.find((c) => c.id === 'lon') || MAJOR_CITIES[0];
  const primaryCityTime = formatCityDateTime(now, activePrimaryCity.timezone);
  const primaryCityOffset = getTimezoneOffsetInfo(now, activePrimaryCity.timezone);

  return (
    <header className={`${isDarkMode ? 'bg-[#0f172a] text-slate-100 border-slate-800' : 'bg-[#0f172a] text-white border-slate-700'} border-b sticky top-0 z-40 shadow-2xl backdrop-blur-xl`}>
      {/* Top Utility Bar */}
      <div className={`max-w-[1920px] mx-auto px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between text-xs border-b ${isDarkMode ? 'border-slate-800/80 bg-[#0b101f]/90' : 'border-slate-800 bg-[#1e293b]/90'} backdrop-blur-md`}>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap">
          {/* UTC Clock */}
          <div className="flex items-center gap-2 font-mono text-emerald-400 bg-slate-950/90 px-3 py-1 rounded-lg border border-emerald-500/30 shadow-inner">
            <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold tracking-wider">{utcTime || '00:00:00 UTC'}</span>
          </div>

          {/* Active Primary Timezone Indicator Pill */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Primary:
            </span>
            <button
              type="button"
              onClick={() => {
                setShowSearchDropdown(true);
                searchInputRef.current?.focus();
              }}
              className="font-bold text-white hover:text-cyan-300 text-xs flex items-center gap-1.5 bg-slate-800/90 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-600/80 transition-colors cursor-pointer"
              title="Click to search and change primary time zone in WorldClockPillar"
            >
              <span>{activePrimaryCity.name}</span>
              <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/80 px-1 py-0.2 rounded border border-slate-800">
                {primaryCityOffset.abbreviation} • {primaryCityTime.timeStr}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
          </div>

          <div className="hidden xl:flex items-center gap-2 text-slate-300 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-950/70 px-2.5 py-0.5 rounded-full border border-cyan-700/60">
              <Zap className="w-3 h-3 text-cyan-400" /> Cloudflare Edge Active
            </span>
            <span className="text-slate-500">•</span>
            <span className="font-mono text-slate-300">IANA tzdata 2026a</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded-lg border border-emerald-500/60 transition-all cursor-pointer text-[11px] font-bold shadow-sm"
            title="SSL Certificate, Domain Security & Trust Specs"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SSL & Security 🔒</span>
          </button>

          <button
            onClick={onOpenQrModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-blue-600/30 hover:bg-blue-600/40 text-blue-200 rounded-lg border border-blue-500/50 transition-all cursor-pointer text-[11px] font-semibold"
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
            className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 rounded-lg border border-indigo-500/50 transition-all cursor-pointer text-[11px] font-semibold"
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

        {/* Global City Search Input & Dropdown - Searchable dropdown list that filters global cities and sets primary time zone */}
        <div ref={searchContainerRef} className="relative max-w-2xl w-full">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search global city or timezone (e.g. London, Tokyo, EST, Paris)..."
              className="w-full bg-[#0d1424] text-white placeholder-slate-400 text-xs rounded-xl pl-10 pr-32 py-2.5 border border-slate-700 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-inner font-medium"
            />

            {/* Clear Query Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-24 p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Search / Set Primary Button */}
            <button
              type="button"
              onClick={() => {
                if (filteredCities.length > 0) {
                  const targetCity = focusedIndex >= 0 ? filteredCities[focusedIndex] : filteredCities[0];
                  handleSelectCityClick(targetCity);
                } else if (searchQuery.trim().length > 0) {
                  const matches = searchCities(searchQuery, 1);
                  if (matches.length > 0) handleSelectCityClick(matches[0]);
                } else {
                  setShowSearchDropdown((prev) => !prev);
                }
              }}
              className="absolute right-1 top-1 bottom-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs px-3.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-500 shadow-sm"
              title="Filter and set primary time zone in World Clock"
            >
              <Check className="w-3.5 h-3.5 text-slate-950" />
              <span>Set Primary</span>
            </button>
          </div>

          {/* Quick Pinned Cities Strip below Search */}
          {pinnedCities.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1 shrink-0 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> Pinned:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {pinnedCities.slice(0, 6).map((city) => {
                  const offset = getTimezoneOffsetInfo(now, city.timezone);
                  const isCurrent = activePrimaryCity.id === city.id || activePrimaryCity.timezone === city.timezone;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCityClick(city)}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border ${
                        isCurrent
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-xs'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700'
                      }`}
                      title={`Set ${city.name} (${city.timezone}) as primary timezone`}
                    >
                      <span className="font-bold">{city.name}</span>
                      <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/70 px-1 rounded">
                        {offset.abbreviation}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Searchable Dropdown List filtering pre-defined global cities */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#0c1222] border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-2xl ring-1 ring-black/50 flex flex-col max-h-[500px]">
              {/* Region & Category Filter Tabs */}
              <div className="px-3 py-2 bg-[#070b14]/95 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1 pr-1.5 border-r border-slate-800 mr-1">
                  <Filter className="w-3 h-3 text-cyan-400" /> Filter:
                </span>
                {REGION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedRegion(cat.id);
                      setFocusedIndex(-1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      selectedRegion === cat.id
                        ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-400/40'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}

                {/* Pinned Tab */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRegion('pinned');
                    setFocusedIndex(-1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                    selectedRegion === 'pinned'
                      ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold ring-1 ring-amber-300'
                      : 'bg-amber-950/40 hover:bg-amber-950/70 text-amber-300 border border-amber-600/30'
                  }`}
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>Pinned ({pinnedCities.length})</span>
                </button>
              </div>

              {/* Status Header Bar */}
              <div className="px-3.5 py-1.5 bg-[#080e1c] border-b border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300">
                    {filteredCities.length} {filteredCities.length === 1 ? 'city' : 'cities'} matching
                  </span>
                  {searchQuery && (
                    <span className="text-cyan-400 bg-cyan-950/80 px-1.5 py-0.2 rounded border border-cyan-800/60">
                      "{searchQuery}"
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Click any city to set as <strong className="text-amber-300">Primary Time Zone</strong></span>
                </div>
              </div>

              {/* Filtered Cities List */}
              <div
                ref={listRef}
                className="overflow-y-auto divide-y divide-slate-800/60 flex-1 max-h-80 scrollbar-thin scrollbar-thumb-slate-700"
              >
                {filteredCities.length === 0 ? (
                  <div className="p-8 text-center">
                    <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-300">No matching global cities found</p>
                    <p className="text-xs text-slate-500 mt-1">Try searching for a different city name, country, or timezone identifier.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRegion('all');
                      }}
                      className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Reset Filter & View All Cities
                    </button>
                  </div>
                ) : (
                  filteredCities.map((city, idx) => {
                    const isCurrentPrimary = activePrimaryCity.id === city.id || activePrimaryCity.timezone === city.timezone;
                    const isFocused = idx === focusedIndex;
                    const isPinned = isCityPinned(city.id);
                    const offset = getTimezoneOffsetInfo(now, city.timezone);
                    const time = formatCityDateTime(now, city.timezone);

                    return (
                      <div
                        key={city.id}
                        onClick={() => handleSelectCityClick(city)}
                        className={`w-full px-4 py-2.5 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isFocused ? 'bg-blue-900/40 ring-1 ring-inset ring-blue-500/50' : 'hover:bg-slate-800/80'
                        } ${isCurrentPrimary ? 'bg-amber-950/20' : ''}`}
                      >
                        {/* Left: Star, City Name, Country, Badges */}
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePin(e, city)}
                            className="p-1 text-slate-400 hover:text-amber-400 transition-colors shrink-0 cursor-pointer"
                            title={isPinned ? 'Unpin city' : 'Pin city to storage'}
                          >
                            <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-500 hover:text-amber-400'}`} />
                          </button>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{city.name}</span>
                              <span className="text-slate-400 text-xs font-medium">
                                {city.state ? `${city.state}, ` : ''}{city.country}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1 py-0.2 rounded border border-slate-800">
                                {city.countryCode}
                              </span>

                              {city.isCapital && (
                                <span className="text-[9px] font-extrabold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                                  CAPITAL
                                </span>
                              )}

                              {isCurrentPrimary && (
                                <span className="text-[9px] font-extrabold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                  ACTIVE PRIMARY
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                              <span>{city.timezone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Live Time & Offset & Set Primary button */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="font-mono text-sm font-extrabold text-white flex items-center justify-end gap-1.5">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              <span>{time.timeStr}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <span className="font-mono text-[10px] text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-1.5 py-0.2 rounded">
                                {offset.abbreviation}
                              </span>
                              <span className="font-mono text-[10px] text-slate-400">
                                {offset.offsetFormatted}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCityClick(city);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-sm shrink-0 ${
                              isCurrentPrimary
                                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 hover:scale-102'
                            }`}
                            title={`Set ${city.name} as Primary Time Zone in World Clock`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isCurrentPrimary ? 'Selected' : 'Set Primary'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Dropdown Footer with Key shortcuts */}
              <div className="px-4 py-2 bg-[#060a14] border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[9px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[9px]">↓</kbd>
                    <span>to navigate</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[9px]">↵ Enter</kbd>
                    <span>to set primary</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono text-[9px]">Esc</kbd>
                    <span>to close</span>
                  </span>
                </div>
                <span className="text-cyan-400 font-bold">World Clock Focal Sync Active</span>
              </div>
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
