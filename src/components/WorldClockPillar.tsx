import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Clock, Globe, Plus, Trash2, Sun, Moon, LayoutGrid, List, Users, Star, RotateCcw, MapPin,
} from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import {
  getPinnedCities, isCityPinned, togglePinCity, resetPinnedCities, subscribeToPinnedCities,
} from '../lib/pinnedCitiesStorage';
import { City } from '../types';
import { getTimezoneOffsetInfo, formatCityDateTime } from '../lib/timezoneUtils';
import { getSyncedNow, ensureTimeSynced } from '../lib/timeDrift';
import { loadClockPrefs, saveClockPrefs, ClockPrefs } from '../lib/clockPrefs';
import { WorldClockPrefsBar } from './WorldClockPrefsBar';
import { AnalogClock } from './AnalogClock';
import { AnimatedDigitalClock } from './AnimatedDigitalClock';
import { MeetingPlanner } from './MeetingPlanner';
import { GlobalTimeOffsetConverter } from './GlobalTimeOffsetConverter';
import { InteractiveGlobe3D } from './InteractiveGlobe3D';
import { WorldMapCanvas } from './WorldMapCanvas';
import { AdBanner } from './AdBanner';

interface WorldClockPillarProps {
  selectedCityFromSearch?: City;
  onPrimaryCityChange?: (city: City) => void;
}

export const WorldClockPillar: React.FC<WorldClockPillarProps> = ({
  selectedCityFromSearch,
  onPrimaryCityChange,
}) => {
  const [subTab, setSubTab] = useState<'clock' | '3d-globe' | 'converter' | 'map' | 'regions'>('clock');
  const [clockDisplayStyle, setClockDisplayStyle] = useState<'grid' | 'table'>('grid');
  const [filterOnlyPinned, setFilterOnlyPinned] = useState(false);
  const [now, setNow] = useState(() => getSyncedNow());
  const [clockPrefs, setClockPrefs] = useState<ClockPrefs>(() =>
    typeof window !== 'undefined' ? loadClockPrefs() : { hour12: true, showSeconds: true, sortMode: 'name' }
  );
  const [pinnedCities, setPinnedCities] = useState<City[]>(() => getPinnedCities());
  const [watchList, setWatchList] = useState<City[]>(() => {
    const saved = getPinnedCities();
    if (saved?.length) return saved;
    return ['nyc', 'lon', 'par', 'tyo', 'syd', 'dxb']
      .map((id) => MAJOR_CITIES.find((c) => c.id === id))
      .filter(Boolean) as City[];
  });
  const [focalCity, setFocalCity] = useState<City>(
    () => selectedCityFromSearch || MAJOR_CITIES.find((c) => c.id === 'lon') || MAJOR_CITIES[0]
  );
  const [addCityQuery, setAddCityQuery] = useState('');
  const [addCityResults, setAddCityResults] = useState<City[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [plannerCities, setPlannerCities] = useState<City[]>([]);

  useEffect(() => {
    ensureTimeSynced();
    const timer = setInterval(() => setNow(getSyncedNow()), 1000);
    const resync = setInterval(() => ensureTimeSynced(), 5 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === 'visible') ensureTimeSynced();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(timer);
      clearInterval(resync);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    return subscribeToPinnedCities(() => setPinnedCities(getPinnedCities()));
  }, []);

  useEffect(() => {
    saveClockPrefs(clockPrefs);
  }, [clockPrefs]);

  useEffect(() => {
    if (!selectedCityFromSearch) return;
    setFocalCity(selectedCityFromSearch);
    setSubTab('clock');
    onPrimaryCityChange?.(selectedCityFromSearch);
    setWatchList((prev) =>
      prev.some((c) => c.id === selectedCityFromSearch.id) ? prev : [selectedCityFromSearch, ...prev]
    );
  }, [selectedCityFromSearch]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTogglePinCity = (city: City) => {
    const result = togglePinCity(city);
    setPinnedCities(result.cities);
    if (!result.ok && result.error) {
      showToast(result.error);
      return;
    }
    showToast(result.isPinned ? `Pinned ${city.name}` : `Unpinned ${city.name}`);
  };

  const handleSelectFocalCity = (city: City) => {
    setFocalCity(city);
    onPrimaryCityChange?.(city);
    if (!watchList.some((c) => c.id === city.id)) setWatchList((p) => [city, ...p]);
  };

  const handleAddCityToWatchlist = (city: City) => {
    if (!watchList.some((c) => c.id === city.id)) setWatchList((p) => [...p, city]);
    setFocalCity(city);
    setAddCityQuery('');
    setAddCityResults([]);
  };

  const sortedWatchList = useMemo(() => {
    const list = [...watchList];
    if (clockPrefs.sortMode === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (clockPrefs.sortMode === 'offset') {
      list.sort(
        (a, b) =>
          getTimezoneOffsetInfo(now, a.timezone).offsetMinutes -
          getTimezoneOffsetInfo(now, b.timezone).offsetMinutes
      );
    } else list.sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
    return list;
  }, [watchList, clockPrefs.sortMode, now]);

  const visible = sortedWatchList.filter((c) => !filterOnlyPinned || isCityPinned(c.id));
  const focalOffset = getTimezoneOffsetInfo(now, focalCity.timezone);
  const focalFormatted = formatCityDateTime(
    now,
    focalCity.timezone,
    clockPrefs.showSeconds,
    clockPrefs.hour12
  );
  const focalLocal = new Date(now.toLocaleString('en-US', { timeZone: focalCity.timezone }));
  const isDaytime = focalLocal.getHours() >= 6 && focalLocal.getHours() < 18;

  const tabs: { id: typeof subTab; label: string }[] = [
    { id: 'clock', label: 'World Clock' },
    { id: 'converter', label: 'Meeting Planner' },
    { id: '3d-globe', label: '3D Globe' },
    { id: 'map', label: 'Map' },
    { id: 'regions', label: 'Regions' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-sky-50 dark:bg-[#0b101f] border border-sky-300 dark:border-slate-700 rounded-2xl p-5 shadow-md ring-1 ring-sky-200/60 dark:ring-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Clock className="w-6 h-6 text-cyan-500" /> World Clock & Global Time
            </h1>
            <p className="text-xs text-slate-500 mt-1">LIVE · 1s tick · server drift sync · 12/24h · sort · free pins 12 / Supporter 50</p>
          </div>
          <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-3 py-1.5 rounded-lg ${
                  subTab === t.id ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {subTab === 'clock' && (
          <div className="mt-5 space-y-4">
            <WorldClockPrefsBar onChange={setClockPrefs} />

            <div className="flex flex-wrap gap-2 items-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              {pinnedCities.map((city) => {
                const t = formatCityDateTime(now, city.timezone, clockPrefs.showSeconds, clockPrefs.hour12);
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectFocalCity(city)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border ${
                      focalCity.id === city.id ? 'border-blue-500 bg-blue-500/10' : ''
                    }`}
                  >
                    {city.name} <span className="font-mono text-[10px] opacity-70">{t.timeStr}</span>
                  </button>
                );
              })}
            </div>

            {/* A — Graphic focal hero */}
            <div
              className={`relative overflow-hidden rounded-2xl border p-5 sm:p-7 ${
                isDaytime
                  ? 'border-amber-500/30 bg-gradient-to-br from-sky-900/90 via-indigo-950 to-slate-950'
                  : 'border-indigo-500/40 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950'
              }`}
            >
              <div
                className={`pointer-events-none absolute -top-16 -right-10 h-48 w-48 rounded-full blur-3xl opacity-40 ${
                  isDaytime ? 'bg-amber-400' : 'bg-indigo-500'
                }`}
                aria-hidden
              />
              <div
                className={`pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full blur-3xl opacity-30 ${
                  isDaytime ? 'bg-sky-400' : 'bg-violet-600'
                }`}
                aria-hidden
              />

              <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold items-center">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="tg-live-dot" /> LIVE
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-indigo-200 border border-white/10">FOCAL</span>
                    {isDaytime ? (
                      <span className="flex items-center gap-1 text-amber-300">
                        <Sun className="w-3.5 h-3.5" /> Day
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <Moon className="w-3.5 h-3.5" /> Night
                      </span>
                    )}
                    {focalOffset.isDst && (
                      <span className="text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">DST</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-white">
                    <MapPin className="w-5 h-5 text-indigo-300 shrink-0" />
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                      {focalCity.name}
                      <span className="block sm:inline sm:ml-2 text-sm font-semibold text-slate-400">
                        {focalCity.country} · {focalCity.timezone}
                      </span>
                    </h2>
                  </div>

                  <AnimatedDigitalClock
                    timeStr={focalFormatted.timeStr}
                    animationStyle="flip"
                    className="text-5xl sm:text-6xl md:text-7xl font-black font-mono text-white tracking-tight drop-shadow-lg"
                    colonClassName="text-indigo-300"
                    amPmClassName="text-2xl font-bold ml-2 text-indigo-200"
                  />

                  <p className="text-sm text-slate-300 font-medium">
                    {focalFormatted.dateStr}
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="font-mono text-indigo-200">{focalOffset.offsetFormatted}</span>
                    <span className="mx-2 text-slate-600">·</span>
                    <span className="font-mono text-slate-400">{focalOffset.abbreviation}</span>
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePinCity(focalCity)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-white/15 bg-white/5 text-white hover:bg-white/10"
                    >
                      <Star className="w-3.5 h-3.5 inline" /> Pin
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!plannerCities.some((c) => c.id === focalCity.id))
                          setPlannerCities((p) => [focalCity, ...p]);
                        setSubTab('converter');
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white shadow-md shadow-indigo-500/25"
                    >
                      <Users className="w-3.5 h-3.5 inline" /> Plan meeting
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 flex justify-center lg:justify-end">
                  <div className="rounded-full p-3 bg-white/5 border border-white/10 shadow-2xl shadow-indigo-500/20">
                    <AnalogClock date={focalLocal} size={168} cityName={focalCity.name} />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[180px]">
                <input
                  value={addCityQuery}
                  onChange={(e) => {
                    setAddCityQuery(e.target.value);
                    setAddCityResults(searchCities(e.target.value, 6));
                  }}
                  placeholder="Add city..."
                  className="w-full border rounded-xl px-3 py-1.5 text-xs bg-white dark:bg-slate-900"
                />
                {addCityResults.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 border rounded-xl bg-white dark:bg-slate-900 shadow-lg">
                    {addCityResults.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => handleAddCityToWatchlist(c)}
                      >
                        {c.name}, {c.country}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFilterOnlyPinned(!filterOnlyPinned)}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border ${
                  filterOnlyPinned ? 'bg-amber-400 text-slate-950' : ''
                }`}
              >
                Only pinned
              </button>
              <button type="button" onClick={() => setClockDisplayStyle('grid')} className="p-1.5 rounded-lg border">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setClockDisplayStyle('table')} className="p-1.5 rounded-lg border">
                <List className="w-4 h-4" />
              </button>
            </div>

            {clockDisplayStyle === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {visible.map((city) => {
                  const local = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));
                  const fmt = formatCityDateTime(now, city.timezone, clockPrefs.showSeconds, clockPrefs.hour12);
                  const off = getTimezoneOffsetInfo(now, city.timezone);
                  const day = local.getHours() >= 6 && local.getHours() < 18;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectFocalCity(city)}
                      className={`text-left rounded-xl border p-3 hover:border-blue-500 transition ${
                        focalCity.id === city.id ? 'ring-2 ring-blue-500' : ''
                      } ${day ? 'bg-slate-50 dark:bg-slate-900' : 'bg-slate-100 dark:bg-slate-950'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-bold text-sm">{city.name}</p>
                          <p className="text-[10px] text-slate-500">{city.country}</p>
                          <p className="font-mono text-lg font-bold mt-1">{fmt.timeStr}</p>
                          <p className="text-[10px] text-slate-500">{off.offsetFormatted}</p>
                        </div>
                        <AnalogClock date={local} size={72} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-xs">
                    <tr>
                      <th className="p-2 text-left">City</th>
                      <th className="p-2 text-left">Time</th>
                      <th className="p-2 text-left">Offset</th>
                      <th className="p-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((city) => {
                      const fmt = formatCityDateTime(now, city.timezone, clockPrefs.showSeconds, clockPrefs.hour12);
                      const off = getTimezoneOffsetInfo(now, city.timezone);
                      return (
                        <tr key={city.id} className="border-t border-slate-200 dark:border-slate-800">
                          <td className="p-2">
                            <button type="button" className="font-semibold text-left" onClick={() => handleSelectFocalCity(city)}>
                              {city.name}
                            </button>
                            <span className="text-xs text-slate-500 block">{city.country}</span>
                          </td>
                          <td className="p-2 font-mono">{fmt.timeStr}</td>
                          <td className="p-2 font-mono text-xs">{off.offsetFormatted}</td>
                          <td className="p-2">
                            <button type="button" onClick={() => handleTogglePinCity(city)} className="p-1">
                              <Star className={`w-3.5 h-3.5 ${isCityPinned(city.id) ? 'text-amber-400 fill-amber-400' : ''}`} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <AdBanner type="in-feed" />
          </div>
        )}

        {subTab === 'converter' && (
          <div className="mt-5 space-y-4">
            <MeetingPlanner cities={plannerCities.length ? plannerCities : watchList.slice(0, 6)} now={now} />
            <GlobalTimeOffsetConverter />
          </div>
        )}

        {subTab === '3d-globe' && (
          <div className="mt-5">
            <InteractiveGlobe3D onSelectCity={handleSelectFocalCity} />
          </div>
        )}

        {subTab === 'map' && (
          <div className="mt-5">
            <WorldMapCanvas onSelectCity={handleSelectFocalCity} />
          </div>
        )}

        {subTab === 'regions' && (
          <div className="mt-5 text-sm text-slate-500">
            <p>Browse cities via search in the header, or add from the World Clock list. Regions filter is available in city search.</p>
            <button type="button" className="mt-2 text-blue-600 font-semibold" onClick={() => setSubTab('clock')}>
              Back to clocks
            </button>
          </div>
        )}
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default WorldClockPillar;
