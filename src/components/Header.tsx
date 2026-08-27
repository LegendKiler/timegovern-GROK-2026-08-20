import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search, Star, Moon, Sun, Keyboard, QrCode, User, Shield, Layers,
  Clock, Calendar, CloudSun, Timer, Activity, Code2, Newspaper, Calculator, Building2, Globe2,
} from 'lucide-react';
import { City } from '../types';
import { searchCities } from '../lib/citiesData';
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
    'inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:text-white hover:border-indigo-400/50';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActivePillar(1)}
          className="flex items-center gap-2 mr-1 shrink-0"
          aria-label="TimeGovern home"
        >
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Globe2 className="w-4 h-4 text-white" />
          </span>
          <span className="font-black tracking-tight text-white hidden xs:inline sm:inline">TimeGovern</span>
        </button>

        <div className="relative flex-1 min-w-[160px] max-w-md" ref={boxRef}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query && setOpen(true)}
            placeholder="Search city or timezone…"
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500"
            aria-label="Search cities"
          />
          {open && results.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border border-slate-700 bg-slate-900 shadow-xl max-h-64 overflow-auto">
              {results.map((c) => {
                const isPinned = isCityPinned(c.id);
                return (
                  <div key={c.id} className="flex items-center gap-1 border-b border-slate-800 last:border-0">
                    <button
                      type="button"
                      className="flex-1 text-left px-3 py-2 text-xs hover:bg-slate-800"
                      onClick={() => {
                        onSelectCity?.(c);
                        setQuery('');
                        setOpen(false);
                        setActivePillar(1);
                      }}
                    >
                      <span className="font-semibold text-white">{c.name}</span>
                      <span className="text-slate-500"> · {c.country}</span>
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-slate-700 mr-1"
                      onClick={() => {
                        togglePinCity(c);
                        setPinned(getPinnedCities());
                      }}
                      aria-label={isPinned ? 'Unpin' : 'Pin'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isPinned ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-auto">
          {setIsDarkMode && (
            <button
              type="button"
              className={iconBtn}
              onClick={() => setIsDarkMode((p) => !p)}
              title={isDarkMode ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          )}
          {onOpenShortcutsModal && (
            <button type="button" className={iconBtn} onClick={onOpenShortcutsModal} title="Shortcuts">
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenQrModal && (
            <button type="button" className={iconBtn} onClick={onOpenQrModal} title="QR">
              <QrCode className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenSecurityModal && (
            <button type="button" className={iconBtn} onClick={onOpenSecurityModal} title="Trust">
              <Shield className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenArchModal && (
            <button type="button" className={iconBtn} onClick={onOpenArchModal} title="How time stays current">
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}
          {onOpenAccountModal && (
            <button type="button" className={iconBtn} onClick={onOpenAccountModal} title="Account">
              <User className="w-3.5 h-3.5" />
            </button>
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
              className={`tg-tab inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border ${
                active
                  ? 'bg-indigo-500 text-white border-indigo-400 shadow-sm shadow-indigo-500/25'
                  : 'bg-slate-800/50 text-slate-300 border-slate-700/80 hover:border-indigo-400/40 hover:text-white hover:bg-slate-800'
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
