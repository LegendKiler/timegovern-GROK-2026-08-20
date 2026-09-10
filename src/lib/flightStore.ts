export type SavedFlight = {
  id: string;
  flightNumber: string; // e.g. QF1
  date: string; // YYYY-MM-DD (departure local date)
  depAirport: string; // IATA e.g. SYD
  arrAirport: string; // IATA e.g. LAX
  depTime: string; // HH:mm local at dep
  arrTime: string; // HH:mm local at arr (may be next day)
  arrDateOffset: number; // 0 = same day, 1 = +1 day, etc.
  depTz?: string;
  arrTz?: string;
  notes?: string;
  createdAt: string;
};

const KEY = "tg_saved_flights_v1";

export function loadFlights(): SavedFlight[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveFlights(list: SavedFlight[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertFlight(f: SavedFlight) {
  const list = loadFlights();
  const i = list.findIndex((x) => x.id === f.id);
  if (i >= 0) list[i] = f;
  else list.push(f);
  saveFlights(list);
  return list;
}

export function removeFlight(id: string) {
  const list = loadFlights().filter((x) => x.id !== id);
  saveFlights(list);
  return list;
}

export function newFlightId() {
  return "flt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
