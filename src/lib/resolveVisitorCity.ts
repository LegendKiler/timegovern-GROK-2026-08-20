import type { City } from "../types";
import { MAJOR_CITIES, findCityForCountry } from "./citiesData";
import { getCapitalByIso2 } from "../data/countryCapitals";

export type VisitorGeo = {
  country?: string | null;
  city?: string | null;
  timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

const STORAGE_KEY = "tg_primary_city_v1";
const STORAGE_LOCK = "tg_primary_city_user_set"; // if "1", never overwrite with geo

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match geo payload to best City in our databases. */
export function resolveCityFromGeo(geo: VisitorGeo): City | undefined {
  const country = (geo.country || "").toUpperCase();
  const cityName = (geo.city || "").trim();
  const tz = (geo.timezone || "").trim();

  // 1) Exact / fuzzy name + same country in MAJOR_CITIES
  if (cityName) {
    const n = norm(cityName);
    const inMajor = MAJOR_CITIES.filter((c) => {
      if (country && (c.countryCode || "").toUpperCase() !== country) return false;
      const cn = norm(c.name);
      return cn === n || cn.includes(n) || n.includes(cn);
    });
    if (inMajor.length === 1) return inMajor[0];
    if (inMajor.length > 1) {
      return inMajor.slice().sort((a, b) => (b.population || 0) - (a.population || 0))[0];
    }
  }

  // 2) Same timezone in MAJOR_CITIES
  if (tz) {
    const byTz = MAJOR_CITIES.filter((c) => c.timezone === tz);
    if (byTz.length) {
      if (country) {
        const same = byTz.filter((c) => (c.countryCode || "").toUpperCase() === country);
        if (same.length) return same.sort((a, b) => (b.population || 0) - (a.population || 0))[0];
      }
      return byTz.sort((a, b) => (b.population || 0) - (a.population || 0))[0];
    }
  }

  // 3) Capital for country (C1 list)
  if (country) {
    const cap = getCapitalByIso2(country) || findCityForCountry(country);
    if (cap) {
      // If CF gave a city name but we only have capital, still use capital for weather/clock
      return cap;
    }
  }

  // 4) Synthesize from timezone if possible
  if (tz && country) {
    const cap = getCapitalByIso2(country);
    if (cap) return { ...cap, timezone: tz };
  }

  return undefined;
}

export function loadSavedPrimaryCity(): City | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as City;
    if (c && c.name && c.timezone) return c;
  } catch {
    /* ignore */
  }
  return null;
}

export function savePrimaryCity(city: City, userChosen: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(city));
    if (userChosen) localStorage.setItem(STORAGE_LOCK, "1");
  } catch {
    /* ignore */
  }
}

export function isPrimaryCityUserLocked(): boolean {
  try {
    return localStorage.getItem(STORAGE_LOCK) === "1";
  } catch {
    return false;
  }
}

/** Default HQ when everything fails */
export function melbourneFallback(): City {
  return (
    MAJOR_CITIES.find((c) => norm(c.name) === "melbourne") ||
    getCapitalByIso2("AU") || {
      id: "fallback-mel",
      name: "Melbourne",
      country: "Australia",
      countryCode: "AU",
      timezone: "Australia/Melbourne",
      lat: -37.8136,
      lng: 144.9631,
      population: 5078193,
      isCapital: false,
    }
  );
}
