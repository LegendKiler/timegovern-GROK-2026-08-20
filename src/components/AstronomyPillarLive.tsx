/**
 * LIVE wrapper around AstronomyPillar — 1s synced clock + LiveSunMoonBar above the pillar.
 * Keeps original AstronomyPillar intact; App should render this instead of AstronomyPillar.
 */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City } from '../types';
import { getSyncedNow, ensureTimeSynced } from '../lib/timeDrift';
import { LiveSunMoonBar } from './astronomy/LiveSunMoonBar';

const AstronomyPillar = lazy(() =>
  import('./AstronomyPillar').then((m) => ({ default: m.AstronomyPillar }))
);

export const AstronomyPillarLive: React.FC = () => {
  const [liveNow, setLiveNow] = useState<Date>(() => getSyncedNow());
  const [clockSynced, setClockSynced] = useState(false);
  // Default city aligns with pillar default (first major city); user still changes city inside pillar
  const [previewCity] = useState<City>(MAJOR_CITIES[0]);

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

  return (
    <div className="space-y-4">
      <LiveSunMoonBar city={previewCity} now={liveNow} synced={clockSynced} />
      <p className="text-[10px] text-slate-500 px-1">
        LIVE positions use your selected city inside the panels below. Header strip defaults to{" "}
        {previewCity.name} until city-sync is wired (AS5).
      </p>
      <Suspense fallback={<div className="text-xs text-slate-500 p-4">Loading astronomy…</div>}>
        <AstronomyPillar />
      </Suspense>
    </div>
  );
};
