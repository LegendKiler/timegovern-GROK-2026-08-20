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
  onOpenTemplateGallery?: () => void;
  onOpenShortcutsModal?: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  templateTheme: 'swiss-quartz' | 'stripe-corporate' | 'emerald-precision' | 'editorial-classic';
  setTemplateTheme: (theme: 'swiss-quartz' | 'stripe-corporate' | 'emerald-precision' | 'editorial-classic') => void;
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
  onOpenTemplateGallery,
  onOpenShortcutsModal,
  isDarkMode,
  setIsDarkMode,
  templateTheme,
  setTemplateTheme,
}) => {
  const [now, setNow] = useState<Date>(new Date());
  const [utcTime, setUtcTime] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<CityRegion | 'pinned'>('all');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [pinnedCities, setPinnedCities] = useState<City[]>(() => getPinnedCities());

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPinnedCities(getPinnedCities());
    return subscribeToPinnedCities(setPinnedCities);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    const tick = () => {
      const current = new Date();
      setNow(current);
      const h = current.getUTCHours().toString().padStart(2, '0');
      const m = current.getUTCMinutes().toString().padStart(2, '0');
      const s = current.getUTCSeconds().toString().padStart(2, '0');
      setUtcTime(`${h}:${m}:${s} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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

  useEffect(() => setFocusedIndex(-1), [filteredCities.length, selectedRegion]);

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const el = listRef.current.children[focusedIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  const handleSelectCityClick = (city: City) => {
    onSelectCity(city);
    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleTogglePin = (e: React.MouseEvent, city: City) => {
    e.stopPropagation();
    setPinnedCities(togglePinCity(city).cities);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearchDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setShowSearchDropdown(true);
      return;
    }
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

          <div className="flex items-center gap-1 shrink-0">
            <select
              value={templateTheme}
              onChange={(e) => setTemplateTheme(e.target.value as any)}
              className="hidden md:block h-7 text-[10px] bg-slate-800 border border-slate-600 rounded-md px-1.5 text-slate-200 cursor-pointer max-w-[110px]"
              title="Theme"
            >
              <option value="swiss-quartz">Classic</option>
              <option value="stripe-corporate">Corporate</option>
              <option value="emerald-precision">Emerald</option>
              <option value="editorial-classic">Editorial</option>
            </select>
            {onOpenTemplateGallery && (
              <button type="button" onClick={onOpenTemplateGallery} className={iconBtn + ' hidden md:inline-flex'} title="Templates">
                <Layers className="w-3.5 h-3.5" />
              </button>
            )}
            <button type="button" onClick={() => setIsDarkMode(!isDarkMode)} className={iconBtn} title="Light / dark">
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            {onOpenSecurityModal && (
              <button type="button" onClick={onOpenSecurityModal} className={iconBtn + ' hidden sm:inline-flex'} title="Security">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}
            <button type="button" onClick={onOpenQrModal} className={iconBtn + ' hidden md:inline-flex'} title="QR">
              <QrCode className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onOpenAccountModal} className={iconBtn} title="Account">
              <User className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={onOpenArchModal} className={iconBtn + ' hidden lg:inline-flex'} title="Architecture">
              <Database className="w-3.5 h-3.5" />
            </button>
            {onOpenShortcutsModal && (
              <button type="button" onClick={onOpenShortcutsModal} className={iconBtn} title="Shortcuts">
                <Keyboard className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setActivePillar(11);
                window.location.hash = '';
              }}
              className="hidden sm:inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 text-[11px] font-bold hover:bg-cyan-500/25 cursor-pointer"
              title="Company hub"
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
              onKeyDown={handleKeyDown}
              placeholder="Search city or timezone…"
              className="w-full h-10 bg-slate-950 text-sm text-white placeholder-slate-500 rounded-xl pl-10 pr-24 border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => {
                if (filteredCities[0]) handleSelectCityClick(focusedIndex >= 0 ? filteredCities[focusedIndex] : filteredCities[0]);
                else if (searchQuery.trim()) {
                  const m = searchCities(searchQuery, 1);
                  if (m[0]) handleSelectCityClick(m[0]);
                } else setShowSearchDropdown((v) => !v);
              }}
              className="absolute right-1 top-1 bottom-1 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Set</span>
            </button>
          </div>

          {pinnedCities.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] text-amber-400/90 font-semibold shrink-0">Pinned</span>
              {pinnedCities.slice(0, 6).map((city) => {
                const offset = getTimezoneOffsetInfo(now, city.timezone);
                const isCurrent = activePrimaryCity.id === city.id;
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectCityClick(city)}
                    className={`px-2 py-0.5 rounded-md text-[11px] shrink-0 border cursor-pointer ${
                      isCurrent
                        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                    }`}
                  >
                    {city.name}{' '}
                    <span className="font-mono text-cyan-400">{offset.abbreviation}</span>
                  </button>
                );
              })}
            </div>
          )}

          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-[420px] flex flex-col">
              <div className="px-2 py-2 border-b border-slate-800 flex gap-1 overflow-x-auto no-scrollbar">
                {REGION_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedRegion(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0 ${
                      selectedRegion === cat.id ? 'bg-cyan-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedRegion('pinned')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap cursor-pointer shrink-0 ${
                    selectedRegion === 'pinned' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-amber-300'
                  }`}
                >
                  Pinned ({pinnedCities.length})
                </button>
              </div>
              <div ref={listRef} className="overflow-y-auto flex-1">
                {filteredCities.length === 0 ? (
                  <div className="p-6 text-center text-sm text-slate-400">No cities found</div>
                ) : (
                  filteredCities.map((city, idx) => {
                    const isPrimary = activePrimaryCity.id === city.id;
                    const isFocused = idx === focusedIndex;
                    const isPinned = isCityPinned(city.id);
                    const offset = getTimezoneOffsetInfo(now, city.timezone);
                    const time = formatCityDateTime(now, city.timezone);
                    return (
                      <div
                        key={city.id}
                        onClick={() => handleSelectCityClick(city)}
                        className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-b border-slate-800/60 ${
                          isFocused ? 'bg-slate-800' : 'hover:bg-slate-900'
                        } ${isPrimary ? 'bg-amber-950/20' : ''}`}
                      >
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(e, city)}
                          className="p-1 shrink-0 cursor-pointer"
                          title={isPinned ? 'Unpin' : 'Pin'}
                        >
                          <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-white truncate">{city.name}</span>
                            <span className="text-xs text-slate-400 truncate">
                              {city.state ? `${city.state}, ` : ''}
                              {city.country}
                            </span>
                            {isPrimary && <span className="text-[10px] font-bold text-emerald-400">PRIMARY</span>}
                          </div>
                          <div className="text-[11px] font-mono text-slate-500 truncate">{city.timezone}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-mono text-sm font-semibold text-white">{time.timeStr}</div>
                          <div className="text-[10px] font-mono text-cyan-400">
                            {offset.abbreviation} {offset.offsetFormatted}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="border-t border-slate-800 bg-slate-900/95">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 flex items-stretch overflow-x-auto no-scrollbar">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = activePillar === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => {
                  setActivePillar(item.id);
                  e.currentTarget.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
                  if (item.id === 11) window.location.hash = '';
                }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer shrink-0 ${
                  active
                    ? 'border-cyan-400 text-cyan-300 bg-slate-800/50'
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
