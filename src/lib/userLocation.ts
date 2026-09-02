/**
 * Phase A+B — detect visitor home city + nearest regional cities.
 * Priority: saved home → browser IANA timezone → optional IP API → safe fallback.
 */
import { City } from '../types';
import { MAJOR_CITIES } from './citiesData';

const HOME_KEY = 'timegovern_home_city_v1';
const SEEDED_KEY = 'timegovern_location_seeded_v1';

/** Neighbouring country codes for “Near you” packs (ISO 3166-1 alpha-2). */
export const REGION_NEIGHBORS: Record<string, string[]> = {
  AU: ['NZ', 'SG', 'ID', 'JP', 'IN', 'PH'],
  NZ: ['AU', 'SG', 'JP', 'FJ'],
  US: ['CA', 'MX', 'GB'],
  CA: ['US', 'GB'],
  MX: ['US', 'CO'],
  GB: ['IE', 'FR', 'DE', 'NL', 'ES', 'US'],
  IE: ['GB', 'FR'],
  FR: ['GB', 'DE', 'ES', 'IT', 'BE', 'CH'],
  DE: ['FR', 'NL', 'PL', 'AT', 'CH', 'GB'],
  NL: ['DE', 'BE', 'GB', 'FR'],
  BE: ['NL', 'FR', 'DE'],
  ES: ['FR', 'PT', 'GB'],
  PT: ['ES'],
  IT: ['FR', 'CH', 'DE', 'ES'],
  CH: ['DE', 'FR', 'IT', 'AT'],
  AT: ['DE', 'CH', 'IT'],
  PL: ['DE', 'CZ', 'UA'],
  SE: ['NO', 'DK', 'FI', 'DE'],
  NO: ['SE', 'DK'],
  DK: ['SE', 'NO', 'DE'],
  FI: ['SE'],
  JP: ['KR', 'CN', 'TW', 'SG', 'AU'],
  KR: ['JP', 'CN'],
  CN: ['HK', 'TW', 'JP', 'SG', 'KR'],
  HK: ['CN', 'SG', 'TW', 'JP'],
  TW: ['HK', 'JP', 'CN', 'SG'],
  SG: ['MY', 'ID', 'TH', 'AU', 'JP', 'IN'],
  MY: ['SG', 'ID', 'TH'],
  ID: ['SG', 'MY', 'AU'],
  TH: ['SG', 'MY', 'VN', 'IN'],
  VN: ['TH', 'SG'],
  PH: ['SG', 'JP', 'AU'],
  IN: ['SG', 'AE', 'GB', 'AU'],
  PK: ['IN', 'AE'],
  BD: ['IN'],
  AE: ['SA', 'IN', 'GB'],
  SA: ['AE', 'EG'],
  EG: ['SA', 'AE'],
  ZA: ['GB', 'AE'],
  BR: ['AR', 'US', 'PT'],
  AR: ['BR', 'CL'],
  CL: ['AR', 'BR'],
  CO: ['MX', 'BR'],
  RU: ['DE', 'TR', 'CN'],
  TR: ['DE', 'RU', 'AE'],
  IL: ['TR', 'AE', 'GB'],
};

const GLOBAL_HUB_IDS = ['lon', 'nyc', 'tyo', 'dxb', 'sin', 'utc'] as const;

export type LocationSource = 'saved' | 'timezone' | 'ip' | 'fallback';

export interface DetectedLocation {
  city: City;
  countryCode: string;
  timezone: string;
  source: LocationSource;
  nearYou: City[];
}

export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Exact timezone match, else same country from zone prefix, else largest city in similar offset. */
export function matchCityFromTimezone(tz: string): City | undefined {
  if (!tz) return undefined;
  const exact = MAJOR_CITIES.filter((c) => c.timezone === tz);
  if (exact.length === 1) return exact[0];
  if (exact.length > 1) {
    return [...exact].sort((a, b) => (b.population || 0) - (a.population || 0))[0];
  }

  // Region/city token in IANA id (e.g. Australia/Melbourne)
  const parts = tz.split('/');
  const last = (parts[parts.length - 1] || '').replace(/_/g, ' ').toLowerCase();
  const byName = MAJOR_CITIES.find(
    (c) => c.name.toLowerCase() === last || c.timezone.toLowerCase().endsWith('/' + last.replace(/ /g, '_'))
  );
  if (byName) return byName;

  // Continent bucket: pick most populous in same area prefix
  const prefix = parts[0];
  if (prefix) {
    const sameArea = MAJOR_CITIES.filter((c) => c.timezone.startsWith(prefix + '/'));
    if (sameArea.length) {
      return [...sameArea].sort((a, b) => (b.population || 0) - (a.population || 0))[0];
    }
  }
  return undefined;
}

export function citiesInCountry(countryCode: string, limit = 8): City[] {
  const code = countryCode.toUpperCase();
  return MAJOR_CITIES.filter((c) => c.countryCode === code)
    .sort((a, b) => (b.population || 0) - (a.population || 0))
    .slice(0, limit);
}

/** Same country (ex home) + neighbour countries' top cities. */
export function getNearYouCities(home: City, limit = 10): City[] {
  const seen = new Set<string>([home.id]);
  const out: City[] = [];

  const push = (c: City | undefined) => {
    if (!c || seen.has(c.id)) return;
    seen.add(c.id);
    out.push(c);
  };

  for (const c of citiesInCountry(home.countryCode, 6)) {
    if (c.id === home.id) continue;
    push(c);
    if (out.length >= limit) return out;
  }

  const neighbors = REGION_NEIGHBORS[home.countryCode.toUpperCase()] || [];
  for (const cc of neighbors) {
    for (const c of citiesInCountry(cc, 2)) {
      push(c);
      if (out.length >= limit) return out;
    }
  }

  // Distance-ish fallback: closest lat/lng in DB not yet included
  if (out.length < limit && home.lat != null && home.lng != null) {
    const ranked = [...MAJOR_CITIES]
      .filter((c) => !seen.has(c.id))
      .map((c) => ({
        c,
        d: (c.lat - home.lat) ** 2 + (c.lng - home.lng) ** 2,
      }))
      .sort((a, b) => a.d - b.d);
    for (const { c } of ranked) {
      push(c);
      if (out.length >= limit) break;
    }
  }

  return out;
}

export function getSavedHomeCity(): City | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem(HOME_KEY);
    if (!id) return null;
    return MAJOR_CITIES.find((c) => c.id === id) || null;
  } catch {
    return null;
  }
}

export function saveHomeCity(city: City): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HOME_KEY, city.id);
  } catch {
    /* ignore */
  }
}

export function isLocationSeeded(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(SEEDED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markLocationSeeded(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SEEDED_KEY, '1');
  } catch {
    /* ignore */
  }
}

async function detectCityFromIp(): Promise<City | undefined> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(t);
    if (!res.ok) return undefined;
    const data = await res.json();
    const tz = typeof data.timezone === 'string' ? data.timezone : '';
    const cityName = typeof data.city === 'string' ? data.city : '';
    const cc = typeof data.country_code === 'string' ? data.country_code : '';

    if (cityName && cc) {
      const byName = MAJOR_CITIES.find(
        (c) =>
          c.countryCode === cc &&
          (c.name.toLowerCase() === cityName.toLowerCase() ||
            cityName.toLowerCase().includes(c.name.toLowerCase()) ||
            c.name.toLowerCase().includes(cityName.toLowerCase()))
      );
      if (byName) return byName;
    }
    if (tz) {
      const byTz = matchCityFromTimezone(tz);
      if (byTz) return byTz;
    }
    if (cc) {
      const top = citiesInCountry(cc, 1)[0];
      if (top) return top;
    }
  } catch {
    /* offline / blocked */
  }
  return undefined;
}

/** Resolve home city + near-you list for World Clock. */
export async function detectUserLocation(): Promise<DetectedLocation> {
  const saved = getSavedHomeCity();
  if (saved) {
    return {
      city: saved,
      countryCode: saved.countryCode,
      timezone: saved.timezone,
      source: 'saved',
      nearYou: getNearYouCities(saved),
    };
  }

  const tz = getBrowserTimezone();
  let city = matchCityFromTimezone(tz);
  let source: LocationSource = city ? 'timezone' : 'fallback';

  if (!city) {
    const fromIp = await detectCityFromIp();
    if (fromIp) {
      city = fromIp;
      source = 'ip';
    }
  }

  if (!city) {
    city =
      MAJOR_CITIES.find((c) => c.id === 'lon') ||
      MAJOR_CITIES.find((c) => c.id === 'nyc') ||
      MAJOR_CITIES[0];
    source = 'fallback';
  }

  saveHomeCity(city);

  return {
    city,
    countryCode: city.countryCode,
    timezone: city.timezone || tz,
    source,
    nearYou: getNearYouCities(city),
  };
}

/** Suggested pin IDs: home + near + global hubs (unique). */
export function buildSeedPinIds(home: City, nearYou: City[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const add = (id: string) => {
    if (seen.has(id)) return;
    if (!MAJOR_CITIES.some((c) => c.id === id)) return;
    seen.add(id);
    ids.push(id);
  };
  add(home.id);
  nearYou.forEach((c) => add(c.id));
  GLOBAL_HUB_IDS.forEach((id) => add(id));
  return ids.slice(0, 12);
}
