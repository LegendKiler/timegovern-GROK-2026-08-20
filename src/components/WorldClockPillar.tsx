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
  const [plannerCities, setPlannerCities] = useState<City[]>(() =>
    (['nyc', 'lon', 'tyo'].map((id) => MAJOR_CITIES.find((c) => c.id === id)).filter(Boolean) as City[])
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState('europe');

  useEffect(() => {
    const unsub = subscribeToPinnedCities(setPinnedCities);
    return unsub;
  }, []);

  // LIVE 1s + server drift (WC1)
  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      await ensureTimeSynced();
    };
    sync();
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setNow(getSyncedNow());
    }, 1000);
    const resync = setInterval(sync, 10 * 60 * 1000);
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        sync();
        setNow(getSyncedNow());
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      cancelled = true;
      clearInterval(timer);
      clearInterval(resync);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

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
    const { isPinned, cities } = togglePinCity(city);
    setPinnedCities(cities);
    showToast(isPinned ? `Pinned ${city.name}` : `Unpinned ${city.name}`);
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
      <div className="bg-white dark:bg-[#0b101f] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <Clock className="w-6 h-6 text-cyan-500" /> World Clock & Global Time
            </h1>
            <p className="text-xs text-slate-500 mt-1">LIVE · 1s tick · server drift sync · 12/24h · sort</p>
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

            {/* Pinned hub */}
            <div className="flex flex-wrap gap-2 items-center">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              {pinnedCities.map((city) => {
                const t = formatCityDateTime(now, city.timezone, clockPrefs.showSeconds, clockPrefs.hour12);
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectFocalCity(city)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs border flex items-center gap-1.5 ${
                      focalCity.id === city.id
                        ? 'bg-blue-600 text-white border-blue-500'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {city.name}
                    <span className="font-mono opacity-80">{t.timeStr}</span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => {
                  const d = resetPinnedCities();
                  setPinnedCities(d);
                  setWatchList(d);
                }}
                className="text-[10px] text-slate-500 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset pins
              </button>
            </div>

            {/* Focal card */}
            <div
              className={`rounded-2xl border p-5 ${
                isDaytime
                  ? 'bg-gradient-to-br from-blue-50 to-amber-50/40 dark:from-slate-900 dark:to-slate-800 border-blue-200 dark:border-blue-800'
                  : 'bg-gradient-to-br from-indigo-950/40 to-slate-900 border-indigo-800'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-8 space-y-2">
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-blue-600/15 text-blue-700 dark:text-cyan-300">FOCAL</span>
                    {isDaytime ? (
                      <span className="flex items-center gap-1 text-amber-600">
                        <Sun className="w-3.5 h-3.5" /> Day
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-indigo-400">
                        <Moon className="w-3.5 h-3.5" /> Night
                      </span>
                    )}
                    {focalOffset.isDst && (
                      <span className="text-emerald-600 dark:text-emerald-400">DST</span>
                    )}
                  </div>
                  <h2 className="text-3xl font-black">
                    {focalCity.name}{' '}
                    <span className="text-sm font-semibold text-slate-500">
                      {focalCity.country} · {focalCity.timezone}
                    </span>
                  </h2>
                  <AnimatedDigitalClock
                    timeStr={focalFormatted.timeStr}
                    animationStyle="flip"
                    className="text-4xl sm:text-5xl font-black font-mono text-blue-600 dark:text-cyan-400"
                    colonClassName="text-blue-400"
                    amPmClassName="text-xl font-bold ml-2"
                  />
                  <p className="text-sm text-slate-500">{focalFormatted.dateStr} · {focalOffset.offsetFormatted}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePinCity(focalCity)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border"
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
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white"
                    >
                      <Users className="w-3.5 h-3.5 inline" /> Plan meeting
                    </button>
                  </div>
                </div>
                <div className="lg:col-span-4 flex justify-center">
                  <AnalogClock date={focalLocal} size={140} cityName={focalCity.name} />
                </div>
              </div>
            </div>

            {/* Add + filters */}
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

            {/* Grid */}
            {clockDisplayStyle === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {visible.map((city) => {
                  const off = getTimezoneOffsetInfo(now, city.timezone);
                  const fmt = formatCityDateTime(
                    now,
                    city.timezone,
                    clockPrefs.showSeconds,
                    clockPrefs.hour12
                  );
                  const local = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));
                  const day = local.getHours() >= 6 && local.getHours() < 18;
                  return (
                    <div
                      key={city.id}
                      onClick={() => handleSelectFocalCity(city)}
                      className={`border rounded-xl p-3 cursor-pointer ${
                        focalCity.id === city.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm flex items-center gap-1">
                            {city.name}
                            {day ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-indigo-400" />}
                          </p>
                          <p className="text-[10px] font-mono text-cyan-600">{off.offsetFormatted}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePinCity(city);
                          }}
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              isCityPinned(city.id) ? 'fill-amber-400 text-amber-400' : 'text-slate-400'
                            }`}
                          />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <AnalogClock date={local} size={72} />
                        <div className="text-right">
                          <AnimatedDigitalClock
                            timeStr={fmt.timeStr}
                            animationStyle="flip"
                            className="text-xl font-extrabold font-mono"
                            colonClassName="text-slate-400"
                            amPmClassName="text-xs ml-1"
                          />
                          <p className="text-[10px] text-slate-500">{fmt.dateStr}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {clockDisplayStyle === 'table' && (
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase">
                    <tr>
                      <th className="p-2">City</th>
                      <th className="p-2">Time</th>
                      <th className="p-2">Offset</th>
                      <th className="p-2">DST</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((city) => {
                      const off = getTimezoneOffsetInfo(now, city.timezone);
                      const fmt = formatCityDateTime(
                        now,
                        city.timezone,
                        clockPrefs.showSeconds,
                        clockPrefs.hour12
                      );
                      return (
                        <tr
                          key={city.id}
                          className="border-t cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          onClick={() => handleSelectFocalCity(city)}
                        >
                          <td className="p-2 font-semibold">
                            <MapPin className="w-3 h-3 inline text-blue-500" /> {city.name}
                          </td>
                          <td className="p-2 font-mono">{fmt.timeStr}</td>
                          <td className="p-2 font-mono">{off.offsetFormatted}</td>
                          <td className="p-2">{off.isDst ? 'Yes' : 'No'}</td>
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
          <div className="mt-4 space-y-4">
            <GlobalTimeOffsetConverter />
            <MeetingPlanner initialCities={plannerCities} onAddCityToWatchlist={handleAddCityToWatchlist} />
          </div>
        )}

        {subTab === '3d-globe' && (
          <div className="mt-4">
            <InteractiveGlobe3D onAddCityToWatchlist={handleAddCityToWatchlist} />
          </div>
        )}

        {subTab === 'map' && (
          <div className="mt-4">
            <WorldMapCanvas onSelectCity={handleAddCityToWatchlist} selectedCityId={focalCity.id} />
          </div>
        )}

        {subTab === 'regions' && (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {['africa', 'europe', 'asia', 'north-america', 'south-america', 'australasia'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setSelectedRegion(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                    selectedRegion === r ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {MAJOR_CITIES.filter((city) => {
                const tz = city.timezone;
                if (selectedRegion === 'africa') return tz.startsWith('Africa/');
                if (selectedRegion === 'europe') return tz.startsWith('Europe/');
                if (selectedRegion === 'asia') return tz.startsWith('Asia/');
                if (selectedRegion === 'north-america')
                  return tz.startsWith('America/') && ['US', 'CA', 'MX'].includes(city.countryCode);
                if (selectedRegion === 'south-america')
                  return tz.startsWith('America/') && !['US', 'CA', 'MX'].includes(city.countryCode);
                if (selectedRegion === 'australasia')
                  return tz.startsWith('Australia/') || tz.startsWith('Pacific/');
                return true;
              }).map((city) => {
                const fmt = formatCityDateTime(
                  now,
                  city.timezone,
                  clockPrefs.showSeconds,
                  clockPrefs.hour12
                );
                return (
                  <div key={city.id} className="border rounded-xl p-3 flex justify-between text-xs">
                    <div>
                      <p className="font-bold">{city.name}</p>
                      <p className="text-slate-500">{city.country}</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-cyan-600">{fmt.timeStr}</p>
                      <button
                        type="button"
                        className="text-blue-600 font-bold"
                        onClick={() => handleAddCityToWatchlist(city)}
                      >
                        + Clock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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
};
