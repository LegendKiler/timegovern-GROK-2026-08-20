import { City } from '../types';
import { MAJOR_CITIES } from './citiesData';
import { EXTRA_CITIES } from './citiesExtra';

/** Deduped full city list for search / regions (WC2). */
export function allCities(): City[] {
  const map = new Map<string, City>();
  for (const c of [...MAJOR_CITIES, ...EXTRA_CITIES]) {
    if (!map.has(c.id)) map.set(c.id, c);
  }
  return Array.from(map.values());
}
