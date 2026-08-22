import React, { useEffect, useState } from 'react';
import { loadClockPrefs, saveClockPrefs, ClockPrefs } from '../lib/clockPrefs';
import { ensureTimeSynced, getDriftMs } from '../lib/timeDrift';

/**
 * WC1 toolbar: 12/24h, seconds, sort, LIVE sync label.
 * Mount above World Clock board (or inside pillar when fully merged).
 */
export function WorldClockPrefsBar({
  onChange,
}: {
  onChange?: (p: ClockPrefs) => void;
}) {
  const [prefs, setPrefs] = useState<ClockPrefs>(() =>
    typeof window !== 'undefined' ? loadClockPrefs() : { hour12: true, showSeconds: true, sortMode: 'name' }
  );
  const [syncLabel, setSyncLabel] = useState('local');

  useEffect(() => {
    ensureTimeSynced().then(() => {
      const d = getDriftMs();
      setSyncLabel(Math.abs(d) < 500 ? 'synced' : `drift ${d > 0 ? '+' : ''}${Math.round(d / 1000)}s`);
    });
  }, []);

  const update = (partial: Partial<ClockPrefs>) => {
    const next = saveClockPrefs(partial);
    setPrefs(next);
    onChange?.(next);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center text-[11px] mb-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <span className="font-bold text-slate-600 dark:text-slate-300">Display</span>
      <button
        type="button"
        className={`px-2 py-1 rounded-lg font-semibold ${prefs.hour12 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
        onClick={() => update({ hour12: true })}
      >
        12h
      </button>
      <button
        type="button"
        className={`px-2 py-1 rounded-lg font-semibold ${!prefs.hour12 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
        onClick={() => update({ hour12: false })}
      >
        24h
      </button>
      <button
        type="button"
        className={`px-2 py-1 rounded-lg font-semibold ${prefs.showSeconds ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
        onClick={() => update({ showSeconds: !prefs.showSeconds })}
      >
        {prefs.showSeconds ? 'Seconds on' : 'Seconds off'}
      </button>
      <select
        value={prefs.sortMode}
        onChange={(e) => update({ sortMode: e.target.value as ClockPrefs['sortMode'] })}
        className="px-2 py-1 rounded-lg border bg-white dark:bg-slate-900"
      >
        <option value="name">Sort: name</option>
        <option value="offset">Sort: UTC offset</option>
        <option value="region">Sort: country</option>
      </select>
      <span className="text-slate-500 font-mono">LIVE · {syncLabel}</span>
    </div>
  );
}

export default WorldClockPrefsBar;
