import { City } from '../types';
import { MAJOR_CITIES } from './citiesData';

const STORAGE_KEY = 'timegovern_pinned_cities_v1';
const PINNED_CHANGE_EVENT = 'timegovern_pinned_cities_changed';

// Default initial pinned cities across major timezones
export const DEFAULT_PINNED_CITY_IDS: string[] = [
  'nyc', // New York (UTC-4/5)
  'lon', // London (UTC+0/1)
  'par', // Paris (UTC+1/2)
  'tyo', // Tokyo (UTC+9)
  'syd', // Sydney (UTC+10/11)
  'dxb', // Dubai (UTC+4)
  'sin', // Singapore (UTC+8)
  'sao'  // São Paulo (UTC-3)
];

/**
 * Retrieves the list of pinned city IDs from localStorage
 */
export function getPinnedCityIds(): string[] {
  if (typeof window === 'undefined') return DEFAULT_PINNED_CITY_IDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Initialize with default
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PINNED_CITY_IDS));
      return DEFAULT_PINNED_CITY_IDS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_PINNED_CITY_IDS;
  } catch (err) {
    console.warn('Failed to load pinned cities from localStorage:', err);
    return DEFAULT_PINNED_CITY_IDS;
  }
}

/**
 * Retrieves the full City objects for all currently pinned cities
 */
export function getPinnedCities(): City[] {
  const ids = getPinnedCityIds();
  const pinnedList: City[] = [];

  ids.forEach((id) => {
    const found = MAJOR_CITIES.find((c) => c.id === id);
    if (found) {
      pinnedList.push(found);
    }
  });

  return pinnedList;
}

/**
 * Checks whether a specific city ID is pinned
 */
export function isCityPinned(cityId: string): boolean {
  const ids = getPinnedCityIds();
  return ids.includes(cityId);
}

/**
 * Saves the given array of city IDs to localStorage and notifies listeners
 */
export function savePinnedCityIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(PINNED_CHANGE_EVENT, { detail: { ids } }));
  } catch (err) {
    console.error('Failed to save pinned cities to localStorage:', err);
  }
}

/**
 * Pins a new city to the user's saved list
 */
export function pinCity(city: City): City[] {
  const ids = getPinnedCityIds();
  if (!ids.includes(city.id)) {
    const updatedIds = [city.id, ...ids];
    savePinnedCityIds(updatedIds);
  }
  return getPinnedCities();
}

/**
 * Unpins a city from the user's saved list
 */
export function unpinCity(cityId: string): City[] {
  const ids = getPinnedCityIds();
  const updatedIds = ids.filter((id) => id !== cityId);
  savePinnedCityIds(updatedIds);
  return getPinnedCities();
}

/**
 * Toggles a city's pinned status
 */
export function togglePinCity(city: City): { isPinned: boolean; cities: City[] } {
  const isCurrentlyPinned = isCityPinned(city.id);
  if (isCurrentlyPinned) {
    const remaining = unpinCity(city.id);
    return { isPinned: false, cities: remaining };
  } else {
    const updated = pinCity(city);
    return { isPinned: true, cities: updated };
  }
}

/**
 * Resets pinned cities back to standard global hub defaults
 */
export function resetPinnedCities(): City[] {
  savePinnedCityIds(DEFAULT_PINNED_CITY_IDS);
  return getPinnedCities();
}

/**
 * Custom React hook helper to listen for pinned cities changes across all components
 */
export function subscribeToPinnedCities(callback: (cities: City[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = () => {
    callback(getPinnedCities());
  };

  window.addEventListener(PINNED_CHANGE_EVENT, handler);
  window.addEventListener('storage', handler);

  return () => {
    window.removeEventListener(PINNED_CHANGE_EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
