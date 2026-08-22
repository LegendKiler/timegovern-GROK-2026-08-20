/** AS5 — share selected astronomy city between pillar and LIVE bar */
import { City } from '../types';
import { MAJOR_CITIES } from '../lib/citiesData';

const KEY = 'tg_astro_city_id';
const EVENT = 'tg-astro-city';

export function saveAstroCity(city: City) {
  try {
    sessionStorage.setItem(KEY, city.id);
    window.dispatchEvent(new CustomEvent(EVENT, { detail: city }));
  } catch {
    /* ignore */
  }
}

export function loadAstroCityId(): string | null {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function resolveAstroCity(fallback: City = MAJOR_CITIES[0]): City {
  const id = loadAstroCityId();
  if (!id) return fallback;
  return MAJOR_CITIES.find((c) => c.id === id) || fallback;
}

export function subscribeAstroCity(handler: (city: City) => void): () => void {
  const onCustom = (e: Event) => {
    const ce = e as CustomEvent<City>;
    if (ce.detail) handler(ce.detail);
  };
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) handler(resolveAstroCity());
  };
  window.addEventListener(EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}
