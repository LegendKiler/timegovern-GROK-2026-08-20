import { City } from '../types';
import { MAJOR_CITIES } from './citiesData';
import { getMemberEntitlements, FREE_PIN_LIMIT, SUPPORTER_PIN_LIMIT } from './memberEntitlements';
import { isLocationSeeded, markLocationSeeded, buildSeedPinIds, type DetectedLocation } from './userLocation';

const STORAGE_KEY = 'timegovern_pinned_cities_v1';
const PINNED_CHANGE_EVENT = 'timegovern_pinned_cities_changed';

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
  const id = typeof cityOrId === 'string' ? cityOrId : cityOrId?.id;
  if (!id) return false;
  return getPinnedCityIds().includes(id);
}

export function savePinnedCityIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(PINNED_CHANGE_EVENT, { detail: { ids } }));
  } catch (err) {
    console.error('Failed to save pinned cities:', err);
  }
}

export type PinResult = {
  ok: boolean;
  isPinned: boolean;
  cities: City[];
  error?: string;
  pinLimit?: number;
};

export function pinCity(city: City): PinResult {
  const ids = getPinnedCityIds();
  if (ids.includes(city.id)) {
    return { ok: true, isPinned: true, cities: getPinnedCities() };
  }
  const limit = getMemberEntitlements().pinLimit;
  if (ids.length >= limit) {
    const needSupporter = limit <= FREE_PIN_LIMIT;
    return {
      ok: false,
      isPinned: false,
      cities: getPinnedCities(),
      pinLimit: limit,
      error: needSupporter
        ? `Free accounts can pin up to ${FREE_PIN_LIMIT} cities. Become a Supporter for ${SUPPORTER_PIN_LIMIT}.`
        : `Pin limit reached (${limit}). Unpin a city first.`,
    };
  }
  savePinnedCityIds([city.id, ...ids]);
  return { ok: true, isPinned: true, cities: getPinnedCities() };
}

export function unpinCity(cityId: string): City[] {
  const ids = getPinnedCityIds().filter((id) => id !== cityId);
  savePinnedCityIds(ids);
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

/** First visit only: replace default pins with home + near + hubs. */
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
