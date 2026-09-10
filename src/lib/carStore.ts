export type SavedCarBooking = {
  id: string;
  supplier: string;
  confirmation?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  vehicle?: string;
  notes?: string;
  createdAt: string;
};

const KEY = "tg_saved_cars_v1";

export function loadCars(): SavedCarBooking[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveCars(list: SavedCarBooking[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function upsertCar(c: SavedCarBooking) {
  const list = loadCars();
  const i = list.findIndex((x) => x.id === c.id);
  if (i >= 0) list[i] = c;
  else list.push(c);
  saveCars(list);
  return list;
}

export function removeCar(id: string) {
  const list = loadCars().filter((x) => x.id !== id);
  saveCars(list);
  return list;
}

export function newCarId() {
  return "car_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}
