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

  useEffect(() => {
    const timer = setInterval(() => setNow(getSyncedNow()), 1000);
    const resync = setInterval(() => { ensureTimeSynced().catch(() => undefined); }, 60000);
    const onVis = () => { if (document.visibilityState === 'visible') ensureTimeSynced().catch(() => undefined); };
    document.addEventListener('visibilitychange', onVis);
    ensureTimeSynced().catch(() => undefined);
    return () => {
      clearInterval(timer);
      clearInterval(resync);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => subscribeToPinnedCities(() => setPinnedCities(getPinnedCities())), []);
  useEffect(() => { saveClockPrefs(clockPrefs); }, [clockPrefs]);

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
  };

  useEffect(() => {
    if (!addCityQuery.trim()) {
      setAddCityResults([]);
      return;
    }
    setAddCityResults(searchCities(addCityQuery, 8));
  }, [addCityQuery]);

  const displayCities = useMemo(() => {
    let list = filterOnlyPinned ? pinnedCities : watchList;
    if (!list.length) list = MAJOR_CITIES.slice(0, 8);
    const mode = clockPrefs.sortMode || 'name';
    return [...list].sort((a, b) => {
      if (mode === 'country') return (a.country || '').localeCompare(b.country || '');
      if (mode === 'offset') {
        return getTimezoneOffsetInfo(a.timezone, now).offsetMinutes - getTimezoneOffsetInfo(b.timezone, now).offsetMinutes;
      }
      return a.name.localeCompare(b.name);
    });
  }, [watchList, pinnedCities, filterOnlyPinned, clockPrefs.sortMode, now]);

  const plannerCities = useMemo(() => {
    const ids = new Set<string>();
    const out: City[] = [];
    for (const c of [focalCity, ...pinnedCities, ...watchList]) {
      if (c && !ids.has(c.id)) {
        ids.add(c.id);
        out.push(c);
      }
    }
    return out.slice(0, 8);
  }, [focalCity, pinnedCities, watchList]);

  const focalFmt = formatCityDateTime(focalCity, now, clockPrefs);
  const focalOff = getTimezoneOffsetInfo(focalCity.timezone, now);
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
      <div className="bg-white dark:bg-[#0b101f] border border-slate-300 dark:border-slate-700 rounded-2xl p-5 shadow-md ring-1 ring-slate-200/80 dark:ring-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="w-6 h-6 text-cyan-500" /> World Clock & Global Time
            </h1>
            <p className="text-xs text-slate-500 mt-1">LIVE · 1s tick · server drift sync · 12/24h · sort · free pins 12 / Supporter 50</p>
          </div>
          <div className="flex flex-wrap gap-1 bg-slate-200/80 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-300/80 dark:border-transparent">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSubTab(t.id)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  subTab === t.id
                    ? 'bg-indigo-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {subTab === 'clock' && (
          <div className="mt-4 space-y-4">
            <WorldClockPrefsBar prefs={clockPrefs} setPrefs={setClockPrefs} />

            <div className="flex flex-wrap gap-1.5">
              {displayCities.slice(0, 12).map((city) => {
                const f = formatCityDateTime(city, now, clockPrefs);
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectFocalCity(city)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                      focalCity.id === city.id
                        ? 'bg-indigo-500 text-white border-indigo-400'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {isCityPinned(city) && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                    {city.name} {f.timeStr}
                  </button>
                );
              })}
            </div>

            <div
              className={`relative overflow-hidden rounded-2xl p-5 border ${
                isDaytime
                  ? 'bg-gradient-to-br from-sky-900 via-indigo-950 to-slate-950 border-sky-700/40'
                  : 'bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 border-slate-700'
              }`}
            >
              <div className="flex flex-wrap gap-2 mb-3 text-[10px] font-bold uppercase tracking-wide">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">LIVE</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">FOCAL</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-200 border border-amber-400/30">{isDaytime ? 'Day' : 'Night'}</span>
                {focalOff.isDST && (
                  <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-200 border border-violet-400/30">DST</span>
                )}
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-bold text-white text-lg">{focalCity.name}</span>
                    <span className="text-slate-400">{focalCity.country} · {focalCity.timezone}</span>
                  </p>
                  <div className="mt-2 text-4xl sm:text-5xl font-black text-white tabular-nums tracking-tight">
                    <AnimatedDigitalClock
                      timeStr={focalFmt.timeStr}
                      showSeconds={clockPrefs.showSeconds}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {focalFmt.dateStr} · {focalOff.offsetFormatted} · {focalOff.abbr}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePinCity(focalCity)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600 text-slate-200 hover:border-amber-400/50"
                    >
                      <Star className={`w-3.5 h-3.5 ${isCityPinned(focalCity) ? 'fill-amber-400 text-amber-400' : ''}`} />
                      Pin
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubTab('converter')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500 text-white"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Plan meeting
                    </button>
                  </div>
                </div>
                <div className="shrink-0 flex justify-center">
                  <AnalogClock city={focalCity} now={now} size={160} />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[140px]">
                <input
                  value={addCityQuery}
                  onChange={(e) => setAddCityQuery(e.target.value)}
                  placeholder="Add city…"
                  className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white"
                />
                {addCityResults.length > 0 && (
                  <ul className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
                    {addCityResults.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                          onClick={() => {
                            setWatchList((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, c]));
                            handleSelectFocalCity(c);
                            setAddCityQuery('');
                            setAddCityResults([]);
                          }}
                        >
                          {c.name} <span className="text-slate-500">{c.country}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFilterOnlyPinned((p) => !p)}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 ${
                  filterOnlyPinned ? 'bg-amber-400 text-slate-950 border-amber-500' : 'bg-white dark:bg-slate-900'
                }`}
              >
                Only pinned
              </button>
              <button type="button" onClick={() => setClockDisplayStyle('grid')} className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => setClockDisplayStyle('table')} className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                <List className="w-4 h-4" />
              </button>
            </div>

            {clockDisplayStyle === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {displayCities.map((city) => {
                  const fmt = formatCityDateTime(city, now, clockPrefs);
                  const off = getTimezoneOffsetInfo(city.timezone, now);
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleSelectFocalCity(city)}
                      className={`text-left rounded-xl border p-3 bg-white dark:bg-slate-900/80 hover:border-indigo-400/50 transition-colors ${
                        focalCity.id === city.id
                          ? 'border-indigo-500 ring-1 ring-indigo-400/40'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{city.name}</p>
                          <p className="text-[11px] text-slate-500">{city.country}</p>
                          <p className="mt-1 font-mono text-lg font-semibold text-slate-800 dark:text-slate-100">{fmt.timeStr}</p>
                          <p className="text-[11px] text-slate-500">{off.offsetFormatted}</p>
                        </div>
                        <AnalogClock city={city} now={now} size={56} />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm text-slate-800 dark:text-slate-200">
                  <thead className="bg-slate-100 dark:bg-slate-900 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="p-2 text-left">City</th>
                      <th className="p-2 text-left">Time</th>
                      <th className="p-2 text-left">Offset</th>
                      <th className="p-2 text-left">Pin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayCities.map((city) => {
                      const fmt = formatCityDateTime(city, now, clockPrefs);
                      const off = getTimezoneOffsetInfo(city.timezone, now);
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
                              <Star className={`w-3.5 h-3.5 ${isCityPinned(city) ? 'text-amber-400 fill-amber-400' : ''}`} />
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
          <div className="mt-5 text-sm text-slate-600 dark:text-slate-400">
            <p>Browse cities via search in the header, or add from the World Clock list.</p>
            <button type="button" className="mt-2 text-indigo-600 dark:text-indigo-400 font-semibold" onClick={() => setSubTab('clock')}>
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
