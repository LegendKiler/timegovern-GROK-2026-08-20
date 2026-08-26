import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Clock, Calendar, Sun, Moon, CloudRain, Timer, Search, Globe, Database,
  ShieldCheck, QrCode, User, Activity, Code, Layers, Newspaper,
  Calculator, Building2, Star, Check, X, Keyboard
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
  onOpenShortcutsModal?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
}

const NAV = [
  { id: 1, label: 'World Clock', icon: Clock },
  { id: 2, label: 'Calendar', icon: Calendar },
  { id: 3, label: 'Sun & Moon', icon: Sun },
  { id: 4, label: 'Weather', icon: CloudRain },
  { id: 5, label: 'Timers', icon: Timer },
  { id: 6, label: 'Live Data', icon: Activity },
  { id: 7, label: 'Widgets', icon: Code },
  { id: 8, label: 'API', icon: Layers },
  { id: 9, label: 'News', icon: Newspaper },
  { id: 10, label: 'Calculators', icon: Calculator },
  { id: 11, label: 'Company', icon: Building2 },
];

export const Header: React.FC<HeaderProps> = ({
  activePillar,
  setActivePillar,
  onSelectCity,
  primaryCity,
  onOpenArchModal,
  onOpenQrModal,
  onOpenAccountModal,
  onOpenSecurityModal,
  onOpenShortcutsModal,
  isDarkMode,
  setIsDarkMode,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<CityRegion | 'pinned'>('all');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [pinnedVersion, setPinnedVersion] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setNow(d);
      setUtcTime(
        d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' }) + ' UTC'
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return subscribeToPinnedCities(() => setPinnedVersion((v) => v + 1));
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const filteredCities = useMemo(() => {
    void pinnedVersion;
    if (selectedRegion === 'pinned') {
      const pins = getPinnedCities();
      const q = searchQuery.trim().toLowerCase();
      return pins.filter(
        (c) =>
          !q ||
          c.name.toLowerCase().includes(q) ||
          (c.country || '').toLowerCase().includes(q) ||
          (c.timezone || '').toLowerCase().includes(q)
      );
    }
    return filterCitiesByRegionAndQuery(selectedRegion, searchQuery);
  }, [searchQuery, selectedRegion, pinnedVersion]);

  const handleSelectCityClick = (city: City) => {
    onSelectCity(city);
    setSearchQuery('');
    setShowSearchDropdown(false);
    setFocusedIndex(-1);
  };

  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSearchDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((p) => (p + 1) % (filteredCities.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((p) => (p <= 0 ? filteredCities.length - 1 : p - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const city = focusedIndex >= 0 ? filteredCities[focusedIndex] : filteredCities[0];
      if (city) handleSelectCityClick(city);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearchDropdown(false);
    }
  };

  const activePrimaryCity = primaryCity || MAJOR_CITIES.find((c) => c.id === 'lon') || MAJOR_CITIES[0];
  const primaryCityTime = formatCityDateTime(now, activePrimaryCity.timezone);
  const primaryCityOffset = getTimezoneOffsetInfo(now, activePrimaryCity.timezone);

  const iconBtn =
    'inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-600/80 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer';

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="border-b border-slate-800/80 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-9 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/30 shrink-0">
              <Clock className="w-3 h-3" />
              <span className="font-semibold tabular-nums">{utcTime || '--:--:-- UTC'}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSearchDropdown(true);
                searchInputRef.current?.focus();
              }}
              className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 bg-slate-900 max-w-[220px] cursor-pointer"
            >
              <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
              <span className="truncate font-medium">{activePrimaryCity.name}</span>
              <span className="font-mono text-cyan-400 shrink-0">{primaryCityOffset.abbreviation}</span>
              <span className="font-mono text-slate-400 shrink-0 hidden md:inline">{primaryCityTime.timeStr}</span>
            </button>
          </div>

          <div className="flex items-center gap-1 shrink-0" role="toolbar" aria-label="Site tools">
            <button
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={iconBtn}
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-slate-200" />}
            </button>
            {onOpenSecurityModal && (
              <button
                type="button"
                onClick={onOpenSecurityModal}
                className={iconBtn + ' hidden sm:inline-flex'}
                title="Security & trust"
                aria-label="Security and trust"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenQrModal}
              className={iconBtn + ' hidden md:inline-flex'}
              title="Share page QR code"
              aria-label="Share page QR code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenAccountModal}
              className={iconBtn}
              title="Account & Supporter"
              aria-label="Open account"
            >
              <User className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onOpenArchModal}
              className={iconBtn + ' hidden lg:inline-flex'}
              title="How time data stays current"
              aria-label="How time data stays current"
            >
              <Database className="w-3.5 h-3.5" />
            </button>
            {onOpenShortcutsModal && (
              <button
                type="button"
                onClick={onOpenShortcutsModal}
                className={iconBtn + ' hidden sm:inline-flex'}
                title="Keyboard shortcuts"
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActivePillar(11);
                window.location.hash = 'about';
                window.dispatchEvent(new HashChangeEvent('hashchange'));
              }}
              className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/25 cursor-pointer"
              title="Company hub"
              aria-label="Company hub"
            >
              <Building2 className="w-3.5 h-3.5" />
              Company
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-3">
        <button
          type="button"
          onClick={() => setActivePillar(1)}
          className="flex items-center gap-3 shrink-0 text-left cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-display font-bold text-lg leading-tight tracking-tight">
              TimeGovern<span className="text-cyan-400">.com</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight truncate">World clock, calendars & astronomy</p>
          </div>
        </button>

        <div ref={searchContainerRef} className="relative flex-1 w-full min-w-0 max-w-2xl lg:mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search global city, country or timezone…"
              className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              aria-label="Search cities"
            />
          </div>
          {showSearchDropdown && (
            <div className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
              <div className="flex flex-wrap gap-1 p-2 border-b border-slate-800">
                {(['all', 'pinned', ...REGION_CATEGORIES.map((r) => r.id)] as const).slice(0, 12).map((id) => (
                  <button
                    key={String(id)}
                    type="button"
                    onClick={() => setSelectedRegion(id as CityRegion | 'pinned')}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      selectedRegion === id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {id === 'all' ? 'All' : id === 'pinned' ? 'Pinned' : String(id)}
                  </button>
                ))}
              </div>
              {filteredCities.length === 0 ? (
                <p className="p-3 text-xs text-slate-500">No cities match.</p>
              ) : (
                filteredCities.slice(0, 40).map((city, idx) => {
                  const pinned = isCityPinned(city.id);
                  return (
                    <div
                      key={city.id}
                      className={`flex items-center gap-2 px-3 py-2 text-left text-sm border-b border-slate-800/80 ${
                        idx === focusedIndex ? 'bg-slate-800' : 'hover:bg-slate-800/80'
                      }`}
                    >
                      <button type="button" className="flex-1 min-w-0 text-left" onClick={() => handleSelectCityClick(city)}>
                        <span className="font-semibold text-white">{city.name}</span>
                        <span className="text-slate-400 text-xs ml-2">{city.country}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">{city.timezone}</span>
                      </button>
                      <button
                        type="button"
                        title={pinned ? 'Unpin' : 'Pin'}
                        onClick={() => togglePinCity(city)}
                        className="p-1 rounded hover:bg-slate-700"
                      >
                        <Star className={`w-3.5 h-3.5 ${pinned ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-3 sm:px-4 pb-2 flex flex-wrap gap-1" aria-label="Main sections">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activePillar === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePillar(item.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                active
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;
