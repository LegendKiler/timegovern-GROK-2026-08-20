import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Star, Moon, Sun, Keyboard, QrCode, User, Shield, Layers,
  Clock, Calendar, CloudSun, Timer, Activity, Code2, Newspaper, Calculator, Building2, Phone,
} from 'lucide-react';
import { City } from '../types';
import { searchCities } from '../lib/citiesData';
import { BrandLogo, LogoVariantSwitcher } from './BrandLogo';
import { getPinnedCities, isCityPinned, togglePinCity } from '../lib/pinnedCitiesStorage';

interface HeaderProps {
  activePillar: number;
  setActivePillar: (n: number) => void;
  onSelectCity?: (c: City) => void;
  primaryCity?: City;
  onOpenArchModal?: () => void;
  onOpenQrModal?: () => void;
  onOpenAccountModal?: () => void;
  onOpenSecurityModal?: () => void;
  onOpenShortcutsModal?: () => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (v: boolean | ((p: boolean) => boolean)) => void;
}

const NAV: { id: number; label: string; icon: React.ElementType }[] = [
  { id: 1, label: 'World Clock', icon: Clock },
  { id: 2, label: 'Calendar', icon: Calendar },
  { id: 3, label: 'Sun & Moon', icon: CloudSun },
  { id: 4, label: 'Weather', icon: CloudSun },
  { id: 5, label: 'Timers', icon: Timer },
  { id: 6, label: 'Live Data', icon: Activity },
  { id: 7, label: 'Widgets', icon: Code2 },
  { id: 8, label: 'API', icon: Layers },
  { id: 9, label: 'News', icon: Newspaper },
  { id: 10, label: 'Calculators', icon: Calculator },
  { id: 11, label: 'Company', icon: Building2 },
  { id: 12, label: 'Country codes', icon: Phone },
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
  isDarkMode = true,
  setIsDarkMode,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState<City[]>(() => getPinnedCities());
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setResults(searchCities(query, 8));
    setOpen(true);
  }, [query]);

  const iconBtn =
    'inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-slate-200/90 dark:border-slate-600/80 bg-white/90 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 shadow-sm hover:text-indigo-600 dark:hover:text-white hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-150';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md bg-white/80 dark:bg-slate-950/80">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 py-2.5 flex items-center gap-3 sm:gap-4">
        <button type="button" onClick={() => setActivePillar(1)} className="shrink-0 flex items-center gap-2">
          <BrandLogo
            className="h-14 w-14 sm:h-16 sm:w-16"
            wordmarkClassName="flex flex-col justify-center leading-none"
          />
        </button>
        <LogoVariantSwitcher />

        <div ref={boxRef} className="relative flex-1 min-w-[160px] max-w-sm">
          <div
            className={`flex items-center gap-2 h-10 sm:h-11 px-2.5 rounded-xl border transition-colors ${
              open || query
                ? 'bg-indigo-500/15 border-indigo-400 shadow-sm shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400/50'
            }`}
          >
            <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 shrink-0">
              <Search className="w-3.5 h-3.5" />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length && setOpen(true)}
              placeholder="Search cityâ€¦"
              className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
          {open && results.length > 0 && (
            <ul className="absolute z-50 mt-1.5 w-full max-h-64 overflow-auto rounded-xl border border-indigo-200/80 dark:border-indigo-500/30 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                    onClick={() => {
                      onSelectCity?.(c);
                      setQuery('');
                      setOpen(false);
                    }}
                  >
                    <span className="font-semibold">{c.name}</span>{' '}
                    <span className="text-slate-500">{c.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {primaryCity && (
            <button
              type="button"
              className={iconBtn}
              title={isCityPinned(primaryCity.id) ? 'Unpin city' : 'Pin city'}
              aria-label="Pin city"
              onClick={() => {
                togglePinCity(primaryCity);
                setPinned(getPinnedCities());
              }}
            >
              <Star
                className={`w-4 h-4 ${isCityPinned(primaryCity.id) ? 'fill-amber-400 text-amber-400' : ''}`}
              />
            </button>
          )}
          {setIsDarkMode && (
            <button
              type="button"
              className={iconBtn}
              onClick={() => setIsDarkMode((p) => !p)}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          {onOpenShortcutsModal && (
            <button
              type="button"
              className={iconBtn}
              onClick={onOpenShortcutsModal}
              title="Keyboard shortcuts"
              aria-label="Keyboard shortcuts"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          )}
          {onOpenQrModal && (
            <button
              type="button"
              className={iconBtn}
              onClick={onOpenQrModal}
              title="Share / QR code"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}
          {onOpenSecurityModal && (
            <button type="button" className={iconBtn} onClick={onOpenSecurityModal} title="Trust & security">
              <Shield className="w-4 h-4" />
            </button>
          )}
          {onOpenArchModal && (
            <button type="button" className={iconBtn} onClick={onOpenArchModal} title="How time stays current">
              <Layers className="w-4 h-4" />
            </button>
          )}
          {onOpenAccountModal && (
            <button type="button" className={iconBtn} onClick={onOpenAccountModal} title="Account & Supporter">
              <User className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <nav className="max-w-[1600px] mx-auto px-3 sm:px-4 pb-2.5 flex flex-wrap gap-1.5 w-full" aria-label="Main sections">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = activePillar === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivePillar(item.id)}
              className={`tg-tab flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 px-2 py-2 rounded-xl text-[11px] sm:text-xs font-semibold border transition-colors ${
                active
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm shadow-indigo-500/25'
                  : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:border-indigo-400/50 hover:text-indigo-700 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};

export default Header;


