/** World clock UI preferences (localStorage). */
export type ClockHourFormat = '12' | '24';
export type ClockSortMode = 'name' | 'offset' | 'region';

const KEY = 'timegovern_clock_prefs_v1';

export interface ClockPrefs {
  hour12: boolean;
  showSeconds: boolean;
  sortMode: ClockSortMode;
}

const DEFAULTS: ClockPrefs = {
  hour12: true,
  showSeconds: true,
  sortMode: 'name',
};

export function loadClockPrefs(): ClockPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveClockPrefs(p: Partial<ClockPrefs>): ClockPrefs {
  const next = { ...loadClockPrefs(), ...p };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* */
  }
  return next;
}

export function isDaytimeHour(hour24: number): boolean {
  return hour24 >= 6 && hour24 < 20;
}
