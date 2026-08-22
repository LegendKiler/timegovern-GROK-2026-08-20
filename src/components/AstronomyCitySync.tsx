/**
 * Optional: store last astronomy city in sessionStorage so Live bar can follow pillar selection later.
 */
const KEY = 'tg_astro_city_id';

export function saveAstroCityId(id: string) {
  try {
    sessionStorage.setItem(KEY, id);
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
