import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock, Globe, Plus, Trash2, Sun, Moon, LayoutGrid, List, Users, Star, RotateCcw, MapPin,
} from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import type { City } from '../types';
import { LiveDigitalClock } from './LiveDigitalClock';
import { LiveAnalogClock } from './LiveAnalogClock';
import { MeetingPlanner } from './MeetingPlanner';
import { WorldClock3DGlobe } from './WorldClock3DGlobe';
import { WorldClockMap } from './WorldClockMap';
import { WorldClockRegions } from './WorldClockRegions';

/** Fallback if props missing */
const DEFAULT_CITY: City = MAJOR_CITIES.find((c) => c.name === 'London') || MAJOR_CITIES[0];

type TabId = 'clock' | 'meeting' | 'globe' | 'map' | 'regions';

interface WorldClockPillarProps {
  selectedCityFromSearch?: City;
  onPrimaryCityChange?: (city: City) => void;
}

function getOffsetLabel(timeZone: string, date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value || timeZone;
  } catch {
    return timeZone;
  }
}

function isDaytime(timeZone: string, date: Date): boolean {
  try {
    const hour = Number(
      new Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', hour12: false }).format(date)
    );
    return hour >= 6 && hour < 20;
  } catch {
    return true;
  }
}

export function WorldClockPillar({
  selectedCityFromSearch,
  onPrimaryCityChange,
}: WorldClockPillarProps) {
  const [now, setNow] = useState(() => new Date());
  const [tab, setTab] = useState<TabId>('clock');
  const [primary, setPrimary] = useState<City>(selectedCityFromSearch || DEFAULT_CITY);
  const [pinned, setPinned] = useState<City[]>(() => {
    const seeds = ['London', 'New York', 'Paris', 'Tokyo', 'Sydney', 'Dubai', 'Singapore', 'São Paulo'];
    return seeds
      .map((n) => MAJOR_CITIES.find((c) => c.name === n))
      .filter(Boolean) as City[];
  });
  const [hour12, setHour12] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'offset'>('name');
  const [query, setQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const searchHits = useMemo(() => (query.trim() ? searchCities(query).slice(0, 8) : []), [query]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (selectedCityFromSearch) {
      setPrimary(selectedCityFromSearch);
      setPinned((prev) => {
        if (prev.some((c) => c.id === selectedCityFromSearch.id || c.name === selectedCityFromSearch.name)) return prev;
        return [selectedCityFromSearch, ...prev].slice(0, 12);
      });
    }
  }, [selectedCityFromSearch]);

  useEffect(() => {
    onPrimaryCityChange?.(primary);
  }, [primary, onPrimaryCityChange]);

  const sortedPinned = useMemo(() => {
    const list = [...pinned];
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else {
      list.sort((a, b) => {
        const oa = getOffsetLabel(a.timezone, now);
        const ob = getOffsetLabel(b.timezone, now);
        return oa.localeCompare(ob);
      });
    }
    return list;
  }, [pinned, sortBy, now]);

  const selectCity = (city: City) => {
    setPrimary(city);
    setPinned((prev) => {
      if (prev.some((c) => c.id === city.id || c.name === city.name)) return prev;
      return [city, ...prev].slice(0, 12);
    });
    setQuery('');
    setToastMessage(`${city.name} set as focal city`);
  };

  const removePin = (city: City) => {
    setPinned((prev) => prev.filter((c) => c.name !== city.name));
  };

  const resetPins = () => {
    const seeds = ['London', 'New York', 'Paris', 'Tokyo', 'Sydney', 'Dubai'];
    setPinned(seeds.map((n) => MAJOR_CITIES.find((c) => c.name === n)!).filter(Boolean));
    setToastMessage('Pins reset');
  };

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 2200);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'clock', label: 'World Clock' },
    { id: 'meeting', label: 'Meeting Planner' },
    { id: 'globe', label: '3D Globe' },
    { id: 'map', label: 'Map' },
    { id: 'regions', label: 'Regions' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-sky-50 dark:bg-[#0b101f] border border-sky-300 dark:border-slate-700 rounded-2xl p-5 shadow-md ring-1 ring-sky-200/80 dark:ring-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="w-6 h-6 text-cyan-500" /> World Clock & Global Time
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              LIVE · 1s tick · server drift sync · 12/24h · sort
            </p>
          </div>
          <div className="flex flex-wrap gap-1 bg-sky-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  tab === t.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {tab === 'clock' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Display</span>
              <button
                type="button"
                onClick={() => setHour12(true)}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  hour12 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200'
                }`}
              >
                12h
              </button>
              <button
                type="button"
                onClick={() => setHour12(false)}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  !hour12 ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200'
                }`}
              >
                24h
              </button>
              <button
                type="button"
                onClick={() => setShowSeconds((s) => !s)}
                className={`px-2.5 py-1 rounded-lg font-bold ${
                  showSeconds ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200'
                }`}
              >
                Seconds {showSeconds ? 'on' : 'off'}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'offset')}
                className="border rounded-lg px-2 py-1 bg-white dark:bg-slate-900 text-xs"
              >
                <option value="name">Sort: name</option>
                <option value="offset">Sort: offset</option>
              </select>
              <span className="text-emerald-600 font-mono text-[10px]">LIVE · drift ~1s</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {sortedPinned.map((c) => {
                const active = c.name === primary.name;
                return (
                  <button
                    key={c.name + c.timezone}
                    type="button"
                    onClick={() => selectCity(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {active && <Star className="w-3 h-3 inline mr-1 fill-amber-300 text-amber-300" />}
                    {c.name}{' '}
                    <span className="font-mono opacity-90">
                      <LiveDigitalClock timeZone={c.timezone} hour12={hour12} showSeconds={showSeconds} className="inline" />
                    </span>
                  </button>
                );
              })}
              <button type="button" onClick={resetPins} className="text-xs text-slate-500 flex items-center gap-1 px-2">
                <RotateCcw className="w-3 h-3" /> Reset pins
              </button>
            </div>

            {/* Focal city */}
            <div
              className={`rounded-2xl border p-5 ${
                isDaytime(primary.timezone, now)
                  ? 'bg-gradient-to-br from-blue-50 to-amber-50/40 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-blue-800'
                  : 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-800 text-white'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wide mb-2">
                    <span className="px-2 py-0.5 rounded bg-blue-600/15 text-blue-700 dark:text-cyan-300">FOCAL</span>
                    {isDaytime(primary.timezone, now) ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Sun className="w-3 h-3" /> Day
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Moon className="w-3 h-3" /> Night
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">DST</span>
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">
                    {primary.name}{' '}
                    <span className="text-base font-semibold text-slate-500 dark:text-slate-400">
                      {primary.country} · {primary.timezone}
                    </span>
                  </h2>
                  <div className="mt-2 text-5xl font-black tabular-nums text-blue-600 dark:text-cyan-400">
                    <LiveDigitalClock timeZone={primary.timezone} hour12={hour12} showSeconds={showSeconds} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-mono">
                    {now.toLocaleDateString('en-US', {
                      timeZone: primary.timezone,
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    · {getOffsetLabel(primary.timezone, now)}
                  </p>
                </div>
                <div className="flex justify-center">
                  <LiveAnalogClock timeZone={primary.timezone} size={160} label={primary.name.toUpperCase()} />
                </div>
              </div>

              <div className="mt-4 relative max-w-md">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search city to set focal…"
                  className="w-full border rounded-xl px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border-sky-200"
                />
                {searchHits.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 border rounded-xl bg-white dark:bg-slate-900 shadow-lg max-h-48 overflow-auto">
                    {searchHits.map((c) => (
                      <button
                        key={c.name + c.timezone}
                        type="button"
                        onClick={() => selectCity(c)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {c.name}, {c.country} <span className="font-mono text-cyan-600">{c.timezone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Grid of pinned cities */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {sortedPinned.map((c) => (
                <div
                  key={c.name + c.timezone}
                  className={`border rounded-xl p-3 cursor-pointer bg-white/90 dark:bg-slate-900/80 border-sky-100 dark:border-slate-700 hover:border-sky-300 ${
                    c.name === primary.name ? 'ring-2 ring-blue-400' : ''
                  }`}
                  onClick={() => selectCity(c)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm flex items-center gap-1">
                        {c.name}
                        {isDaytime(c.timezone, now) ? (
                          <Sun className="w-3 h-3 text-amber-500" />
                        ) : (
                          <Moon className="w-3 h-3 text-indigo-400" />
                        )}
                      </p>
                      <p className="text-[10px] font-mono text-cyan-600">{getOffsetLabel(c.timezone, now)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        /* toggle pin emphasis */
                      }}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <LiveAnalogClock timeZone={c.timezone} size={72} />
                    <div className="text-right">
                      <LiveDigitalClock
                        timeZone={c.timezone}
                        hour12={hour12}
                        showSeconds={showSeconds}
                        className="text-xl font-extrabold font-mono"
                      />
                      <p className="text-[10px] text-slate-500">
                        {now.toLocaleDateString('en-US', {
                          timeZone: c.timezone,
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'meeting' && (
          <div className="mt-4">
            <MeetingPlanner cities={pinned.length ? pinned : [primary]} />
          </div>
        )}
        {tab === 'globe' && (
          <div className="mt-4">
            <WorldClock3DGlobe cities={pinned} primary={primary} onSelect={selectCity} />
          </div>
        )}
        {tab === 'map' && (
          <div className="mt-4">
            <WorldClockMap cities={pinned} primary={primary} onSelect={selectCity} />
          </div>
        )}
        {tab === 'regions' && (
          <div className="mt-4">
            <WorldClockRegions onSelectCity={selectCity} />
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl text-xs font-bold shadow-xl">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
