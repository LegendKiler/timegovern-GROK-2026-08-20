/**
 * LIVE shell: synced clock, city-following LIVE bar (AS5), sun table (AS2), moon disc (AS3).
 */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City } from '../types';
import { getSyncedNow, ensureTimeSynced } from '../lib/timeDrift';
import { LiveSunMoonBar } from './astronomy/LiveSunMoonBar';
import { SunForecastTable } from './astronomy/SunForecastTable';
import { MoonLiveDisc } from './astronomy/MoonLiveDisc';
import { resolveAstroCity, subscribeAstroCity, saveAstroCity } from './AstronomyCitySync';

const AstronomyPillar = lazy(() =>
  import('./AstronomyPillar').then((m) => ({ default: m.AstronomyPillar }))
);

export const AstronomyPillarLive: React.FC = () => {
  const [liveNow, setLiveNow] = useState<Date>(() => getSyncedNow());
  const [clockSynced, setClockSynced] = useState(false);
  const [city, setCity] = useState<City>(() => resolveAstroCity(MAJOR_CITIES[0]));

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      await ensureTimeSynced();
      if (!cancelled) setClockSynced(true);
    };
    sync();
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      setLiveNow(getSyncedNow());
    }, 1000);
    const resync = setInterval(sync, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(timer);
      clearInterval(resync);
    };
  }, []);

  // AS5 — follow city from pillar (session + custom event)
  useEffect(() => {
    setCity(resolveAstroCity(MAJOR_CITIES[0]));
    return subscribeAstroCity((c) => setCity(c));
  }, []);

  // City picker on LIVE shell (also writes sync so pillar can match when wired)
  const onPickCity = (id: string) => {
    const c = MAJOR_CITIES.find((x) => x.id === id);
    if (c) {
      setCity(c);
      saveAstroCity(c);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">LIVE location</label>
        <select
          value={city.id}
          onChange={(e) => onPickCity(e.target.value)}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 max-w-[220px]"
        >
          {MAJOR_CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}, {c.countryCode || c.country}
            </option>
          ))}
        </select>
        <span className="text-[10px] text-slate-400">Bar, table & moon disc use this city</span>
      </div>

      <LiveSunMoonBar city={city} now={liveNow} synced={clockSynced} />
      <MoonLiveDisc lat={city.lat} lng={city.lng} now={liveNow} cityName={city.name} />
      <SunForecastTable city={city} fromDate={liveNow} />

      <Suspense fallback={<div className="text-xs text-slate-500 p-4">Loading astronomy panels…</div>}>
        <AstronomyPillar />
      </Suspense>
    </div>
  );
};
