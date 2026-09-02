import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock, Plus, LayoutGrid, List, Users, Star, MapPin, Navigation,
} from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import {
  getPinnedCities, isCityPinned, togglePinCity, subscribeToPinnedCities,
  applyDetectedLocationSeed,
} from '../lib/pinnedCitiesStorage';
import { detectUserLocation, saveHomeCity, type DetectedLocation } from '../lib/userLocation';
import { City } from '../types';
import {
  getTimezoneOffsetInfo,
  formatCityDateTime,
  getTimeInTimezone,
} from '../lib/timezoneUtils';
import { getSyncedNow, ensureTimeSynced } from '../lib/timeDrift';
import { loadClockPrefs, ClockPrefs } from '../lib/clockPrefs';
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
    typeof window !== 'undefined'
      ? loadClockPrefs()
      : { hour12: true, showSeconds: true, sortMode: 'name' }
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
  const [nearYou, setNearYou] = useState<City[]>([]);
  const [locationSource, setLocationSource] = useState<DetectedLocation['source'] | null>(null);
  const [locationReady, setLocationReady] = useState(false);
  const [addCityQuery, setAddCityQuery] = useState('');
  const [addCityResults, setAddCityResults] = useState<City[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    ensureTimeSynced();
    const id = setInterval(() => setNow(getSyncedNow()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => subscribeToPinnedCities(() => setPinnedCities(getPinnedCities())), []);

  // Phase A+B: detect home city + near-you pack
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const detected = await detectUserLocation();
        if (cancelled) return;
        setNearYou(detected.nearYou);
        setLocationSource(detected.source);
        if (!selectedCityFromSearch) {
          setFocalCity(detected.city);
          onPrimaryCityChange?.(detected.city);
        }
        const seeded = applyDetectedLocationSeed(detected);
        setPinnedCities(seeded);
        setWatchList((prev) => {
          const ids = new Set(prev.map((c) => c.id));
          const merged = [detected.city, ...detected.nearYou, ...prev].filter((c) => {
            if (ids.has(c.id) && c.id !== detected.city.id) {
              // keep order but ensure home first
            }
            return true;
          });
          const out: City[] = [];
          const seen = new Set<string>();
          for (const c of [detected.city, ...detected.nearYou, ...seeded, ...prev]) {
            if (seen.has(c.id)) continue;
            seen.add(c.id);
            out.push(c);
          }
          return out.slice(0, 24);
        });
      } catch {
        /* keep London fallback */
      } finally {
        if (!cancelled) setLocationReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedCityFromSearch) return;
    setFocalCity(selectedCityFromSearch);
    saveHomeCity(selectedCityFromSearch);
    onPrimaryCityChange?.(selectedCityFromSearch);
    setWatchList((prev) =>
      prev.some((c) => c.id === selectedCityFromSearch.id) ? prev : [selectedCityFromSearch, ...prev]
    );
  }, [selectedCityFromSearch, onPrimaryCityChange]);

  useEffect(() => {
    if (!addCityQuery.trim()) {
      setAddCityResults([]);
      return;
    }
    setAddCityResults(searchCities(addCityQuery, 8));
  }, [addCityQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
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
    saveHomeCity(city);
    onPrimaryCityChange?.(city);
  };

  const fmtCity = (city: City) =>
    formatCityDateTime(now, city.timezone, {
      hour12: clockPrefs.hour12,
      showSeconds: clockPrefs.showSeconds,
    });
  const offCity = (city: City) => getTimezoneOffsetInfo(city.timezone, now);

  const displayCities = useMemo(() => {
    let list = filterOnlyPinned ? pinnedCities : watchList;
    if (!list.length) list = MAJOR_CITIES.slice(0, 8);
    const sorted = [...list];
    if (clockPrefs.sortMode === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (clockPrefs.sortMode === 'offset') {
      sorted.sort(
        (a, b) =>
          getTimezoneOffsetInfo(a.timezone, now).offsetMinutes -
          getTimezoneOffsetInfo(b.timezone, now).offsetMinutes
      );
    }
    return sorted;
  }, [watchList, pinnedCities, filterOnlyPinned, clockPrefs.sortMode, now]);

  const focalFmt = fmtCity(focalCity);
  const focalOff = offCity(focalCity);
  const focalLocal = getTimeInTimezone(now, focalCity.timezone);
  const isDaytime = focalLocal.getHours() >= 6 && focalLocal.getHours() < 18;

  const sourceLabel =
    locationSource === 'saved'
      ? 'Saved home'
      : locationSource === 'timezone'
        ? 'From your device timezone'
        : locationSource === 'ip'
          ? 'Approx. from network'
          : locationSource === 'fallback'
            ? 'Default'
            : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-500" />
            World Clock
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            LIVE · 1s tick · server drift sync · 12/24h · sort · free pins 12 / Supporter 50
          </p>
        </div>
        <WorldClockPrefsBar prefs={clockPrefs} onChange={setClockPrefs} />
      </div>

      {subTab === 'clock' && (
        <>
          {locationReady && sourceLabel && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>
                Showing <span className="font-bold text-white">{focalCity.name}, {focalCity.country}</span>
                <span className="text-cyan-300/80"> · {sourceLabel}</span>
              </span>
              <span className="text-cyan-400/70">Change focal city below or search to set a new home.</span>
            </div>
          )}

          {nearYou.length > 0 && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-300">
                  Near you
                </span>
                <span className="text-[10px] text-slate-500">Same country & neighbours</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {nearYou.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectFocalCity(city)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                      focalCity.id === city.id
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-slate-800 border-slate-600 text-slate-200 hover:border-emerald-500/50'
                    }`}
                  >
                    {city.name}
                    <span className="text-slate-400 font-normal ml-1">{city.countryCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div
            className={`rounded-2xl border overflow-hidden ${
              isDaytime
                ? 'border-amber-500/30 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900'
                : 'border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950'
            }`}
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300/90 bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 rounded">
                      FOCAL
                    </span>
                    {focalOff.isDst && (
                      <span className="text-[10px] font-bold uppercase text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                        DST
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="font-bold text-white text-lg">{focalCity.name}</span>
                    <span className="text-sm text-slate-400">
                      {focalCity.country} · {focalCity.timezone}
                    </span>
                  </div>
                  <div className="mt-2">
                    <AnimatedDigitalClock timeStr={focalFmt.timeStr} />
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    {focalFmt.dateStr} · {focalOff.offsetFormatted} · {focalOff.abbreviation}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePinCity(focalCity)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-600 text-slate-200 hover:border-amber-400/50"
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isCityPinned(focalCity) ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
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
                  <AnalogClock date={focalLocal} size={160} cityName={focalCity.name} />
                </div>
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
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                        onClick={() => {
                          handleSelectFocalCity(c);
                          setWatchList((prev) =>
                            prev.some((x) => x.id === c.id) ? prev : [c, ...prev]
                          );
                          setAddCityQuery('');
                          setAddCityResults([]);
                        }}
                      >
                        {c.name}, {c.country}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFilterOnlyPinned((p) => !p)}
              className={`h-9 px-3 rounded-lg text-xs font-semibold border ${
                filterOnlyPinned
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-200'
                  : 'border-slate-600 text-slate-300'
              }`}
            >
              Only pinned
            </button>
            <button
              type="button"
              onClick={() => setClockDisplayStyle((s) => (s === 'grid' ? 'table' : 'grid'))}
              className="h-9 px-3 rounded-lg text-xs font-semibold border border-slate-600 text-slate-300 inline-flex items-center gap-1"
            >
              {clockDisplayStyle === 'grid' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
              {clockDisplayStyle === 'grid' ? 'Table' : 'Grid'}
            </button>
          </div>

          {clockDisplayStyle === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayCities.map((city) => {
                const fmt = fmtCity(city);
                const off = offCity(city);
                return (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelectFocalCity(city)}
                    className={`text-left rounded-xl border p-3 transition-colors ${
                      focalCity.id === city.id
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white text-sm">{city.name}</p>
                        <p className="text-[11px] text-slate-400">{city.country}</p>
                      </div>
                      {isCityPinned(city) && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </div>
                    <p className="mt-2 text-lg font-bold tabular-nums text-cyan-200">{fmt.timeStr}</p>
                    <p className="text-[11px] text-slate-500">
                      {off.offsetFormatted} · {off.abbreviation}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm text-slate-200">
                <thead className="bg-slate-900 text-[11px] uppercase text-slate-400">
                  <tr>
                    <th className="p-2 text-left">City</th>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Offset</th>
                    <th className="p-2 text-left">Pin</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCities.map((city) => {
                    const fmt = fmtCity(city);
                    const off = offCity(city);
                    return (
                      <tr key={city.id} className="border-t border-slate-800">
                        <td className="p-2">
                          <button type="button" onClick={() => handleSelectFocalCity(city)} className="text-left font-semibold hover:text-cyan-300">
                            {city.name}
                            <span className="block text-[11px] text-slate-500 font-normal">{city.country}</span>
                          </button>
                        </td>
                        <td className="p-2 tabular-nums">{fmt.timeStr}</td>
                        <td className="p-2 text-slate-400">{off.offsetFormatted}</td>
                        <td className="p-2">
                          <button type="button" onClick={() => handleTogglePinCity(city)} className="p-1">
                            <Star className={`w-4 h-4 ${isCityPinned(city) ? 'text-amber-400 fill-amber-400' : 'text-slate-500'}`} />
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
          <MeetingPlanner cities={displayCities.slice(0, 8)} now={now} />
        </>
      )}

      {subTab === 'converter' && (
        <GlobalTimeOffsetConverter focalCity={focalCity} cities={displayCities} />
      )}
      {subTab === '3d-globe' && <InteractiveGlobe3D onSelectCity={handleSelectFocalCity} />}
      {subTab === 'map' && <WorldMapCanvas onSelectCity={handleSelectFocalCity} />}
      {subTab === 'regions' && (
        <div className="rounded-xl border border-slate-700 p-4 text-sm text-slate-300">
          Browse regions from the city search or Near you chips. Full region browser uses your city database.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {(['clock', 'converter', '3d-globe', 'map', 'regions'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setSubTab(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${
              subTab === t ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            {t.replace('-', ' ')}
          </button>
        ))}
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 px-4 py-2 rounded-xl bg-slate-900 border border-slate-600 text-sm text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default WorldClockPillar;
