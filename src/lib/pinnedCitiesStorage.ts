import { City } from '../types';
import { MAJOR_CITIES } from './citiesData';
import { getMemberEntitlements, FREE_PIN_LIMIT, SUPPORTER_PIN_LIMIT } from './memberEntitlements';
import { isLocationSeeded, markLocationSeeded, buildSeedPinIds, type DetectedLocation } from './userLocation';

const STORAGE_KEY = 'timegovern_pinned_cities_v1';
const PINNED_CHANGE_EVENT = 'timegovern_pinned_cities_changed';

/** Legacy defaults until first geo seed runs. */
export const DEFAULT_PINNED_CITY_IDS: string[] = [
  'nyc', 'lon', 'par', 'tyo', 'syd', 'dxb', 'sin', 'sao',
];

export function getPinnedCityIds(): string[] {
  if (typeof window === 'undefined') return DEFAULT_PINNED_CITY_IDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PINNED_CITY_IDS));
      return DEFAULT_PINNED_CITY_IDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return DEFAULT_PINNED_CITY_IDS;
  } catch {
    return DEFAULT_PINNED_CITY_IDS;
  }
}

function savePinnedCityIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event(PINNED_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export function getPinnedCities(): City[] {
  const ids = getPinnedCityIds();
  const pinnedList: City[] = [];
  ids.forEach((id) => {
    const found = MAJOR_CITIES.find((c) => c.id === id);
    if (found) pinnedList.push(found);
  });
  return pinnedList;
}

export function isCityPinned(cityOrId: City | string): boolean {
  const id = typeof cityOrId === 'string' ? cityOrId : cityOrId.id;
  return getPinnedCityIds().includes(id);
}

export type PinResult = {
  ok: boolean;
  isPinned: boolean;
  cities: City[];
  reason?: string;
};

export function pinCity(city: City): PinResult {
  const ids = getPinnedCityIds();
  if (ids.includes(city.id)) {
    return { ok: true, isPinned: true, cities: getPinnedCities() };
  }
  const { pinLimit } = getMemberEntitlements();
  if (ids.length >= pinLimit) {
    return {
      ok: false,
      isPinned: false,
      cities: getPinnedCities(),
      reason: `Pin limit (${pinLimit}) reached`,
    };
  }
  savePinnedCityIds([...ids, city.id]);
  return { ok: true, isPinned: true, cities: getPinnedCities() };
}

export function unpinCity(cityId: string): City[] {
  const next = getPinnedCityIds().filter((id) => id !== cityId);
  savePinnedCityIds(next.length ? next : DEFAULT_PINNED_CITY_IDS);
  return getPinnedCities();
}

export function togglePinCity(city: City): PinResult {
  if (isCityPinned(city.id)) {
    return { ok: true, isPinned: false, cities: unpinCity(city.id) };
  }
  return pinCity(city);
}

export function resetPinnedCities(): City[] {
  savePinnedCityIds(DEFAULT_PINNED_CITY_IDS);
  return getPinnedCities();
}

/** Phase A+B: first visit replaces default pins with home + near + hubs. */
export function applyDetectedLocationSeed(detected: DetectedLocation): City[] {
  if (typeof window === 'undefined') return getPinnedCities();
  if (isLocationSeeded()) return getPinnedCities();
  const seedIds = buildSeedPinIds(detected.city, detected.nearYou);
  savePinnedCityIds(seedIds);
  markLocationSeeded();
  return getPinnedCities();
}

export function subscribeToPinnedCities(callback: (cities: City[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(getPinnedCities());
  window.addEventListener(PINNED_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(PINNED_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}

export { FREE_PIN_LIMIT, SUPPORTER_PIN_LIMIT };
