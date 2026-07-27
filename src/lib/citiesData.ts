import { City } from '../types';

export const MAJOR_CITIES: City[] = [
  // North America
  { id: 'nyc', name: 'New York', country: 'United States', countryCode: 'US', state: 'NY', timezone: 'America/New_York', lat: 40.7128, lng: -74.006, population: 8804190 },
  { id: 'lax', name: 'Los Angeles', country: 'United States', countryCode: 'US', state: 'CA', timezone: 'America/Los_Angeles', lat: 34.0522, lng: -118.2437, population: 3898747 },
  { id: 'chi', name: 'Chicago', country: 'United States', countryCode: 'US', state: 'IL', timezone: 'America/Chicago', lat: 41.8781, lng: -87.6298, population: 2746388 },
  { id: 'lon_ca', name: 'London', country: 'Canada', countryCode: 'CA', state: 'ON', timezone: 'America/Toronto', lat: 42.9849, lng: -81.2453, population: 422324 },
  { id: 'tor', name: 'Toronto', country: 'Canada', countryCode: 'CA', state: 'ON', timezone: 'America/Toronto', lat: 43.6532, lng: -79.3832, population: 2794356 },
  { id: 'van', name: 'Vancouver', country: 'Canada', countryCode: 'CA', state: 'BC', timezone: 'America/Vancouver', lat: 49.2827, lng: -123.1207, population: 662248 },
  { id: 'mex', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', timezone: 'America/Mexico_City', lat: 19.4326, lng: -99.1332, population: 9209944, isCapital: true },
  { id: 'sfo', name: 'San Francisco', country: 'United States', countryCode: 'US', state: 'CA', timezone: 'America/Los_Angeles', lat: 37.7749, lng: -122.4194, population: 873965 },
  { id: 'mia', name: 'Miami', country: 'United States', countryCode: 'US', state: 'FL', timezone: 'America/New_York', lat: 25.7617, lng: -80.1918, population: 442241 },
  { id: 'sea', name: 'Seattle', country: 'United States', countryCode: 'US', state: 'WA', timezone: 'America/Los_Angeles', lat: 47.6062, lng: -122.3321, population: 737015 },
  { id: 'hnl', name: 'Honolulu', country: 'United States', countryCode: 'US', state: 'HI', timezone: 'Pacific/Honolulu', lat: 21.3069, lng: -157.8583, population: 350964 },
  { id: 'anc', name: 'Anchorage', country: 'United States', countryCode: 'US', state: 'AK', timezone: 'America/Anchorage', lat: 61.2181, lng: -149.9003, population: 291247 },

  // South America
  { id: 'sao', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', lat: -23.5505, lng: -46.6333, population: 12325232 },
  { id: 'rio', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', lat: -22.9068, lng: -43.1729, population: 6748000 },
  { id: 'bue', name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', timezone: 'America/Argentina/Buenos_Aires', lat: -34.6037, lng: -58.3816, population: 3075646, isCapital: true },
  { id: 'bog', name: 'Bogotá', country: 'Colombia', countryCode: 'CO', timezone: 'America/Bogota', lat: 4.711, lng: -74.0721, population: 7181469, isCapital: true },
  { id: 'lim', name: 'Lima', country: 'Peru', countryCode: 'PE', timezone: 'America/Lima', lat: -12.0464, lng: -77.0428, population: 9674755, isCapital: true },
  { id: 'scl', name: 'Santiago', country: 'Chile', countryCode: 'CL', timezone: 'America/Santiago', lat: -33.4489, lng: -70.6693, population: 6269384, isCapital: true },

  // Europe
  { id: 'lon', name: 'London', country: 'United Kingdom', countryCode: 'GB', timezone: 'Europe/London', lat: 51.5074, lng: -0.1278, population: 8982000, isCapital: true },
  { id: 'par', name: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris', lat: 48.8566, lng: 2.3522, population: 2161000, isCapital: true },
  { id: 'ber', name: 'Berlin', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin', lat: 52.52, lng: 13.405, population: 3645000, isCapital: true },
  { id: 'mad', name: 'Madrid', country: 'Spain', countryCode: 'ES', timezone: 'Europe/Madrid', lat: 40.4168, lng: -3.7038, population: 3223000, isCapital: true },
  { id: 'rom', name: 'Rome', country: 'Italy', countryCode: 'IT', timezone: 'Europe/Rome', lat: 41.9028, lng: 12.4964, population: 2873000, isCapital: true },
  { id: 'ams', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', timezone: 'Europe/Amsterdam', lat: 52.3676, lng: 4.9041, population: 821752, isCapital: true },
  { id: 'bru', name: 'Brussels', country: 'Belgium', countryCode: 'BE', timezone: 'Europe/Brussels', lat: 50.8503, lng: 4.3517, population: 1209000, isCapital: true },
  { id: 'vie', name: 'Vienna', country: 'Austria', countryCode: 'AT', timezone: 'Europe/Vienna', lat: 48.2082, lng: 16.3738, population: 1897000, isCapital: true },
  { id: 'zrh', name: 'Zurich', country: 'Switzerland', countryCode: 'CH', timezone: 'Europe/Zurich', lat: 47.3769, lng: 8.5417, population: 402762 },
  { id: 'sto', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', timezone: 'Europe/Stockholm', lat: 59.3293, lng: 18.0686, population: 975551, isCapital: true },
  { id: 'osl', name: 'Oslo', country: 'Norway', countryCode: 'NO', timezone: 'Europe/Oslo', lat: 59.9139, lng: 10.7522, population: 634293, isCapital: true },
  { id: 'cph', name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', timezone: 'Europe/Copenhagen', lat: 55.6761, lng: 12.5683, population: 602481, isCapital: true },
  { id: 'hel', name: 'Helsinki', country: 'Finland', countryCode: 'FI', timezone: 'Europe/Helsinki', lat: 60.1699, lng: 24.9384, population: 631695, isCapital: true },
  { id: 'ath', name: 'Athens', country: 'Greece', countryCode: 'GR', timezone: 'Europe/Athens', lat: 37.9838, lng: 23.7275, population: 664046, isCapital: true },
  { id: 'ist', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', timezone: 'Europe/Istanbul', lat: 41.0082, lng: 28.9784, population: 15460000 },
  { id: 'mow', name: 'Moscow', country: 'Russia', countryCode: 'RU', timezone: 'Europe/Moscow', lat: 55.7558, lng: 37.6173, population: 12655000, isCapital: true },
  { id: 'waw', name: 'Warsaw', country: 'Poland', countryCode: 'PL', timezone: 'Europe/Warsaw', lat: 52.2297, lng: 21.0122, population: 1790658, isCapital: true },
  { id: 'dub', name: 'Dublin', country: 'Ireland', countryCode: 'IE', timezone: 'Europe/Dublin', lat: 53.3498, lng: -6.2603, population: 544107, isCapital: true },
  { id: 'lis', name: 'Lisbon', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', lat: 38.7223, lng: -9.1393, population: 504718, isCapital: true },
  { id: 'prg', name: 'Prague', country: 'Czech Republic', countryCode: 'CZ', timezone: 'Europe/Prague', lat: 50.0755, lng: 14.4378, population: 1309000, isCapital: true },
  { id: 'bud', name: 'Budapest', country: 'Hungary', countryCode: 'HU', timezone: 'Europe/Budapest', lat: 47.4979, lng: 19.0402, population: 1752000, isCapital: true },

  // Asia
  { id: 'tyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo', lat: 35.6762, lng: 139.6503, population: 13960000, isCapital: true },
  { id: 'bjg', name: 'Beijing', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', lat: 39.9042, lng: 116.4074, population: 21540000, isCapital: true },
  { id: 'sha', name: 'Shanghai', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', lat: 31.2304, lng: 121.4737, population: 24870000 },
  { id: 'hkg', name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', timezone: 'Asia/Hong_Kong', lat: 22.3193, lng: 114.1694, population: 7413000 },
  { id: 'sin', name: 'Singapore', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore', lat: 1.3521, lng: 103.8198, population: 5686000, isCapital: true },
  { id: 'sel', name: 'Seoul', country: 'South Korea', countryCode: 'KR', timezone: 'Asia/Seoul', lat: 37.5665, lng: 126.978, population: 9776000, isCapital: true },
  { id: 'del', name: 'New Delhi', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', lat: 28.6139, lng: 77.209, population: 16787941, isCapital: true },
  { id: 'bom', name: 'Mumbai', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', lat: 19.076, lng: 72.8777, population: 12442373 },
  { id: 'dxb', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', timezone: 'Asia/Dubai', lat: 25.2048, lng: 55.2708, population: 3331000 },
  { id: 'bkk', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', timezone: 'Asia/Bangkok', lat: 13.7563, lng: 100.5018, population: 10539000, isCapital: true },
  { id: 'jkts', name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', timezone: 'Asia/Jakarta', lat: -6.2088, lng: 106.8456, population: 10562088, isCapital: true },
  { id: 'mnl', name: 'Manila', country: 'Philippines', countryCode: 'PH', timezone: 'Asia/Manila', lat: 14.5995, lng: 120.9842, population: 1780148, isCapital: true },
  { id: 'tpe', name: 'Taipei', country: 'Taiwan', countryCode: 'TW', timezone: 'Asia/Taipei', lat: 25.033, lng: 121.5654, population: 2603000, isCapital: true },
  { id: 'kul', name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', timezone: 'Asia/Kuala_Lumpur', lat: 3.139, lng: 101.6869, population: 1800000, isCapital: true },
  { id: 'sgn', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', timezone: 'Asia/Ho_Chi_Minh', lat: 10.8231, lng: 106.6297, population: 8993000 },
  { id: 'ruh', name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', timezone: 'Asia/Riyadh', lat: 24.7136, lng: 46.6753, population: 7684219, isCapital: true },
  { id: 'tlv', name: 'Tel Aviv', country: 'Israel', countryCode: 'IL', timezone: 'Asia/Tel_Aviv', lat: 32.0853, lng: 34.7818, population: 460613 },
  { id: 'kat', name: 'Kathmandu', country: 'Nepal', countryCode: 'NP', timezone: 'Asia/Kathmandu', lat: 27.7172, lng: 85.324, population: 1442271, isCapital: true },

  // Africa
  { id: 'cai', name: 'Cairo', country: 'Egypt', countryCode: 'EG', timezone: 'Africa/Cairo', lat: 30.0444, lng: 31.2357, population: 9540000, isCapital: true },
  { id: 'jnb', name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', lat: -26.2041, lng: 28.0473, population: 5635000 },
  { id: 'cpt', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', lat: -33.9249, lng: 18.4241, population: 433688 },
  { id: 'los', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', timezone: 'Africa/Lagos', lat: 6.5244, lng: 3.3792, population: 14862000 },
  { id: 'nbo', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', timezone: 'Africa/Nairobi', lat: -1.2921, lng: 36.8219, population: 4397073, isCapital: true },
  { id: 'cas', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', timezone: 'Africa/Casablanca', lat: 33.5731, lng: -7.5898, population: 3359818 },

  // Oceania / Pacific
  { id: 'syd', name: 'Sydney', country: 'Australia', countryCode: 'AU', state: 'NSW', timezone: 'Australia/Sydney', lat: -33.8688, lng: 151.2093, population: 5312000 },
  { id: 'mel', name: 'Melbourne', country: 'Australia', countryCode: 'AU', state: 'VIC', timezone: 'Australia/Melbourne', lat: -37.8136, lng: 144.9631, population: 5078000 },
  { id: 'bne', name: 'Brisbane', country: 'Australia', countryCode: 'AU', state: 'QLD', timezone: 'Australia/Brisbane', lat: -27.4705, lng: 153.026, population: 2560000 },
  { id: 'per', name: 'Perth', country: 'Australia', countryCode: 'AU', state: 'WA', timezone: 'Australia/Perth', lat: -31.9505, lng: 115.8605, population: 2067000 },
  { id: 'akl', name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', timezone: 'Pacific/Auckland', lat: -36.8485, lng: 174.7633, population: 1657000 },
  { id: 'wlg', name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', timezone: 'Pacific/Auckland', lat: -41.2865, lng: 174.7762, population: 212700, isCapital: true },
  { id: 'fji', name: 'Suva', country: 'Fiji', countryCode: 'FJ', timezone: 'Pacific/Fiji', lat: -18.1248, lng: 178.4501, population: 93970, isCapital: true }
];

/**
 * Filter or search cities by query string across name, country, timezone or state
 */
export function searchCities(query: string, limit = 20): City[] {
  if (!query || query.trim() === '') {
    return MAJOR_CITIES.slice(0, limit);
  }
  const q = query.toLowerCase().trim();
  const results = MAJOR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.state && c.state.toLowerCase().includes(q)) ||
      c.timezone.toLowerCase().includes(q)
  );
  return results.slice(0, limit);
}

export function getCityById(id: string): City | undefined {
  return MAJOR_CITIES.find((c) => c.id === id);
}
