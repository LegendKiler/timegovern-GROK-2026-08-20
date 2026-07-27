import { City } from '../types';

export const MAJOR_CITIES: City[] = [
  // North America
  { id: 'nyc', name: 'New York', country: 'United States', countryCode: 'US', state: 'NY', timezone: 'America/New_York', lat: 40.7128, lng: -74.006, population: 8804190 },
  { id: 'lax', name: 'Los Angeles', country: 'United States', countryCode: 'US', state: 'CA', timezone: 'America/Los_Angeles', lat: 34.0522, lng: -118.2437, population: 3898747 },
  { id: 'chi', name: 'Chicago', country: 'United States', countryCode: 'US', state: 'IL', timezone: 'America/Chicago', lat: 41.8781, lng: -87.6298, population: 2746388 },
  { id: 'hou', name: 'Houston', country: 'United States', countryCode: 'US', state: 'TX', timezone: 'America/Chicago', lat: 29.7604, lng: -95.3698, population: 2304580 },
  { id: 'phx', name: 'Phoenix', country: 'United States', countryCode: 'US', state: 'AZ', timezone: 'America/Phoenix', lat: 33.4484, lng: -112.074, population: 1608139 },
  { id: 'tor', name: 'Toronto', country: 'Canada', countryCode: 'CA', state: 'ON', timezone: 'America/Toronto', lat: 43.6532, lng: -79.3832, population: 2794356 },
  { id: 'van', name: 'Vancouver', country: 'Canada', countryCode: 'CA', state: 'BC', timezone: 'America/Vancouver', lat: 49.2827, lng: -123.1207, population: 662248 },
  { id: 'mtl', name: 'Montreal', country: 'Canada', countryCode: 'CA', state: 'QC', timezone: 'America/Toronto', lat: 45.5017, lng: -73.5673, population: 1762949 },
  { id: 'ott', name: 'Ottawa', country: 'Canada', countryCode: 'CA', state: 'ON', timezone: 'America/Toronto', lat: 45.4215, lng: -75.6972, population: 1017449, isCapital: true },
  { id: 'mex', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', timezone: 'America/Mexico_City', lat: 19.4326, lng: -99.1332, population: 9209944, isCapital: true },
  { id: 'gdl', name: 'Guadalajara', country: 'Mexico', countryCode: 'MX', timezone: 'America/Mexico_City', lat: 20.6597, lng: -103.3496, population: 1385629 },
  { id: 'sfo', name: 'San Francisco', country: 'United States', countryCode: 'US', state: 'CA', timezone: 'America/Los_Angeles', lat: 37.7749, lng: -122.4194, population: 873965 },
  { id: 'mia', name: 'Miami', country: 'United States', countryCode: 'US', state: 'FL', timezone: 'America/New_York', lat: 25.7617, lng: -80.1918, population: 442241 },
  { id: 'sea', name: 'Seattle', country: 'United States', countryCode: 'US', state: 'WA', timezone: 'America/Los_Angeles', lat: 47.6062, lng: -122.3321, population: 737015 },
  { id: 'hnl', name: 'Honolulu', country: 'United States', countryCode: 'US', state: 'HI', timezone: 'Pacific/Honolulu', lat: 21.3069, lng: -157.8583, population: 350964 },
  { id: 'anc', name: 'Anchorage', country: 'United States', countryCode: 'US', state: 'AK', timezone: 'America/Anchorage', lat: 61.2181, lng: -149.9003, population: 291247 },

  // South America & Caribbean
  { id: 'sao', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', lat: -23.5505, lng: -46.6333, population: 12325232 },
  { id: 'rio', name: 'Rio de Janeiro', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', lat: -22.9068, lng: -43.1729, population: 6748000 },
  { id: 'bsb', name: 'Brasília', country: 'Brazil', countryCode: 'BR', timezone: 'America/Sao_Paulo', lat: -15.7975, lng: -47.8919, population: 3055149, isCapital: true },
  { id: 'bue', name: 'Buenos Aires', country: 'Argentina', countryCode: 'AR', timezone: 'America/Argentina/Buenos_Aires', lat: -34.6037, lng: -58.3816, population: 3075646, isCapital: true },
  { id: 'bog', name: 'Bogotá', country: 'Colombia', countryCode: 'CO', timezone: 'America/Bogota', lat: 4.711, lng: -74.0721, population: 7181469, isCapital: true },
  { id: 'lim', name: 'Lima', country: 'Peru', countryCode: 'PE', timezone: 'America/Lima', lat: -12.0464, lng: -77.0428, population: 9674755, isCapital: true },
  { id: 'scl', name: 'Santiago', country: 'Chile', countryCode: 'CL', timezone: 'America/Santiago', lat: -33.4489, lng: -70.6693, population: 6269384, isCapital: true },
  { id: 'ccs', name: 'Caracas', country: 'Venezuela', countryCode: 'VE', timezone: 'America/Caracas', lat: 10.4806, lng: -66.9036, population: 2245744, isCapital: true },
  { id: 'uio', name: 'Quito', country: 'Ecuador', countryCode: 'EC', timezone: 'America/Guayaquil', lat: -0.1807, lng: -78.4678, population: 2011388, isCapital: true },
  { id: 'mvd', name: 'Montevideo', country: 'Uruguay', countryCode: 'UY', timezone: 'America/Montevideo', lat: -34.9011, lng: -56.1645, population: 1381000, isCapital: true },
  { id: 'hav', name: 'Havana', country: 'Cuba', countryCode: 'CU', timezone: 'America/Havana', lat: 23.1136, lng: -82.3666, population: 2130000, isCapital: true },

  // Europe
  { id: 'lon', name: 'London', country: 'United Kingdom', countryCode: 'GB', timezone: 'Europe/London', lat: 51.5074, lng: -0.1278, population: 8982000, isCapital: true },
  { id: 'par', name: 'Paris', country: 'France', countryCode: 'FR', timezone: 'Europe/Paris', lat: 48.8566, lng: 2.3522, population: 2161000, isCapital: true },
  { id: 'ber', name: 'Berlin', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin', lat: 52.52, lng: 13.405, population: 3645000, isCapital: true },
  { id: 'fra', name: 'Frankfurt', country: 'Germany', countryCode: 'DE', timezone: 'Europe/Berlin', lat: 50.1109, lng: 8.6821, population: 764101 },
  { id: 'mad', name: 'Madrid', country: 'Spain', countryCode: 'ES', timezone: 'Europe/Madrid', lat: 40.4168, lng: -3.7038, population: 3223000, isCapital: true },
  { id: 'bcn', name: 'Barcelona', country: 'Spain', countryCode: 'ES', timezone: 'Europe/Madrid', lat: 41.3851, lng: 2.1734, population: 1620343 },
  { id: 'rom', name: 'Rome', country: 'Italy', countryCode: 'IT', timezone: 'Europe/Rome', lat: 41.9028, lng: 12.4964, population: 2873000, isCapital: true },
  { id: 'mil', name: 'Milan', country: 'Italy', countryCode: 'IT', timezone: 'Europe/Rome', lat: 45.4642, lng: 9.19, population: 1378689 },
  { id: 'ams', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', timezone: 'Europe/Amsterdam', lat: 52.3676, lng: 4.9041, population: 821752, isCapital: true },
  { id: 'bru', name: 'Brussels', country: 'Belgium', countryCode: 'BE', timezone: 'Europe/Brussels', lat: 50.8503, lng: 4.3517, population: 1209000, isCapital: true },
  { id: 'vie', name: 'Vienna', country: 'Austria', countryCode: 'AT', timezone: 'Europe/Vienna', lat: 48.2082, lng: 16.3738, population: 1897000, isCapital: true },
  { id: 'zrh', name: 'Zurich', country: 'Switzerland', countryCode: 'CH', timezone: 'Europe/Zurich', lat: 47.3769, lng: 8.5417, population: 402762 },
  { id: 'gne', name: 'Geneva', country: 'Switzerland', countryCode: 'CH', timezone: 'Europe/Zurich', lat: 46.2044, lng: 6.1432, population: 201818 },
  { id: 'sto', name: 'Stockholm', country: 'Sweden', countryCode: 'SE', timezone: 'Europe/Stockholm', lat: 59.3293, lng: 18.0686, population: 975551, isCapital: true },
  { id: 'osl', name: 'Oslo', country: 'Norway', countryCode: 'NO', timezone: 'Europe/Oslo', lat: 59.9139, lng: 10.7522, population: 634293, isCapital: true },
  { id: 'cph', name: 'Copenhagen', country: 'Denmark', countryCode: 'DK', timezone: 'Europe/Copenhagen', lat: 55.6761, lng: 12.5683, population: 602481, isCapital: true },
  { id: 'hel', name: 'Helsinki', country: 'Finland', countryCode: 'FI', timezone: 'Europe/Helsinki', lat: 60.1699, lng: 24.9384, population: 631695, isCapital: true },
  { id: 'ath', name: 'Athens', country: 'Greece', countryCode: 'GR', timezone: 'Europe/Athens', lat: 37.9838, lng: 23.7275, population: 664046, isCapital: true },
  { id: 'ist', name: 'Istanbul', country: 'Turkey', countryCode: 'TR', timezone: 'Europe/Istanbul', lat: 41.0082, lng: 28.9784, population: 15460000 },
  { id: 'ank', name: 'Ankara', country: 'Turkey', countryCode: 'TR', timezone: 'Europe/Istanbul', lat: 39.9334, lng: 32.8597, population: 5663000, isCapital: true },
  { id: 'mow', name: 'Moscow', country: 'Russia', countryCode: 'RU', timezone: 'Europe/Moscow', lat: 55.7558, lng: 37.6173, population: 12655000, isCapital: true },
  { id: 'led', name: 'St. Petersburg', country: 'Russia', countryCode: 'RU', timezone: 'Europe/Moscow', lat: 59.9311, lng: 30.3609, population: 5384342 },
  { id: 'waw', name: 'Warsaw', country: 'Poland', countryCode: 'PL', timezone: 'Europe/Warsaw', lat: 52.2297, lng: 21.0122, population: 1790658, isCapital: true },
  { id: 'dub', name: 'Dublin', country: 'Ireland', countryCode: 'IE', timezone: 'Europe/Dublin', lat: 53.3498, lng: -6.2603, population: 544107, isCapital: true },
  { id: 'lis', name: 'Lisbon', country: 'Portugal', countryCode: 'PT', timezone: 'Europe/Lisbon', lat: 38.7223, lng: -9.1393, population: 504718, isCapital: true },
  { id: 'prg', name: 'Prague', country: 'Czech Republic', countryCode: 'CZ', timezone: 'Europe/Prague', lat: 50.0755, lng: 14.4378, population: 1309000, isCapital: true },
  { id: 'bud', name: 'Budapest', country: 'Hungary', countryCode: 'HU', timezone: 'Europe/Budapest', lat: 47.4979, lng: 19.0402, population: 1752000, isCapital: true },
  { id: 'iev', name: 'Kyiv', country: 'Ukraine', countryCode: 'UA', timezone: 'Europe/Kyiv', lat: 50.4501, lng: 30.5234, population: 2962180, isCapital: true },
  { id: 'otp', name: 'Bucharest', country: 'Romania', countryCode: 'RO', timezone: 'Europe/Bucharest', lat: 44.4268, lng: 26.1025, population: 1830000, isCapital: true },

  // Asia & Middle East
  { id: 'tyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo', lat: 35.6762, lng: 139.6503, population: 13960000, isCapital: true },
  { id: 'osa', name: 'Osaka', country: 'Japan', countryCode: 'JP', timezone: 'Asia/Tokyo', lat: 34.6937, lng: 135.5023, population: 2691000 },
  { id: 'bjg', name: 'Beijing', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', lat: 39.9042, lng: 116.4074, population: 21540000, isCapital: true },
  { id: 'sha', name: 'Shanghai', country: 'China', countryCode: 'CN', timezone: 'Asia/Shanghai', lat: 31.2304, lng: 121.4737, population: 24870000 },
  { id: 'hkg', name: 'Hong Kong', country: 'Hong Kong', countryCode: 'HK', timezone: 'Asia/Hong_Kong', lat: 22.3193, lng: 114.1694, population: 7413000 },
  { id: 'sin', name: 'Singapore', country: 'Singapore', countryCode: 'SG', timezone: 'Asia/Singapore', lat: 1.3521, lng: 103.8198, population: 5686000, isCapital: true },
  { id: 'sel', name: 'Seoul', country: 'South Korea', countryCode: 'KR', timezone: 'Asia/Seoul', lat: 37.5665, lng: 126.978, population: 9776000, isCapital: true },
  { id: 'del', name: 'New Delhi', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', lat: 28.6139, lng: 77.209, population: 16787941, isCapital: true },
  { id: 'bom', name: 'Mumbai', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', lat: 19.076, lng: 72.8777, population: 12442373 },
  { id: 'blr', name: 'Bengaluru', country: 'India', countryCode: 'IN', timezone: 'Asia/Kolkata', lat: 12.9716, lng: 77.5946, population: 8443675 },
  { id: 'khi', name: 'Karachi', country: 'Pakistan', countryCode: 'PK', timezone: 'Asia/Karachi', lat: 24.8607, lng: 67.0011, population: 14910352 },
  { id: 'lhe', name: 'Lahore', country: 'Pakistan', countryCode: 'PK', timezone: 'Asia/Karachi', lat: 31.5204, lng: 74.3587, population: 11126285 },
  { id: 'isb', name: 'Islamabad', country: 'Pakistan', countryCode: 'PK', timezone: 'Asia/Karachi', lat: 33.6844, lng: 73.0479, population: 1014825, isCapital: true },
  { id: 'dha', name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', timezone: 'Asia/Dhaka', lat: 23.8103, lng: 90.4125, population: 8906039, isCapital: true },
  { id: 'cmb', name: 'Colombo', country: 'Sri Lanka', countryCode: 'LK', timezone: 'Asia/Colombo', lat: 6.9271, lng: 79.8612, population: 752993, isCapital: true },
  { id: 'kat', name: 'Kathmandu', country: 'Nepal', countryCode: 'NP', timezone: 'Asia/Kathmandu', lat: 27.7172, lng: 85.324, population: 1442271, isCapital: true },
  { id: 'dxb', name: 'Dubai', country: 'United Arab Emirates', countryCode: 'AE', timezone: 'Asia/Dubai', lat: 25.2048, lng: 55.2708, population: 3331000 },
  { id: 'auh', name: 'Abu Dhabi', country: 'United Arab Emirates', countryCode: 'AE', timezone: 'Asia/Dubai', lat: 24.4539, lng: 54.3773, population: 1450000, isCapital: true },
  { id: 'ruh', name: 'Riyadh', country: 'Saudi Arabia', countryCode: 'SA', timezone: 'Asia/Riyadh', lat: 24.7136, lng: 46.6753, population: 7684219, isCapital: true },
  { id: 'jed', name: 'Jeddah', country: 'Saudi Arabia', countryCode: 'SA', timezone: 'Asia/Riyadh', lat: 21.5433, lng: 39.1728, population: 3976000 },
  { id: 'doh', name: 'Doha', country: 'Qatar', countryCode: 'QA', timezone: 'Asia/Qatar', lat: 25.2854, lng: 51.531, population: 2382000, isCapital: true },
  { id: 'kwi', name: 'Kuwait City', country: 'Kuwait', countryCode: 'KW', timezone: 'Asia/Kuwait', lat: 29.3759, lng: 47.9774, population: 2989000, isCapital: true },
  { id: 'mct', name: 'Muscat', country: 'Oman', countryCode: 'OM', timezone: 'Asia/Muscat', lat: 23.588, lng: 58.3829, population: 1421459, isCapital: true },
  { id: 'bkk', name: 'Bangkok', country: 'Thailand', countryCode: 'TH', timezone: 'Asia/Bangkok', lat: 13.7563, lng: 100.5018, population: 10539000, isCapital: true },
  { id: 'jkts', name: 'Jakarta', country: 'Indonesia', countryCode: 'ID', timezone: 'Asia/Jakarta', lat: -6.2088, lng: 106.8456, population: 10562088, isCapital: true },
  { id: 'mnl', name: 'Manila', country: 'Philippines', countryCode: 'PH', timezone: 'Asia/Manila', lat: 14.5995, lng: 120.9842, population: 1780148, isCapital: true },
  { id: 'tpe', name: 'Taipei', country: 'Taiwan', countryCode: 'TW', timezone: 'Asia/Taipei', lat: 25.033, lng: 121.5654, population: 2603000, isCapital: true },
  { id: 'kul', name: 'Kuala Lumpur', country: 'Malaysia', countryCode: 'MY', timezone: 'Asia/Kuala_Lumpur', lat: 3.139, lng: 101.6869, population: 1800000, isCapital: true },
  { id: 'sgn', name: 'Ho Chi Minh City', country: 'Vietnam', countryCode: 'VN', timezone: 'Asia/Ho_Chi_Minh', lat: 10.8231, lng: 106.6297, population: 8993000 },
  { id: 'han', name: 'Hanoi', country: 'Vietnam', countryCode: 'VN', timezone: 'Asia/Ho_Chi_Minh', lat: 21.0285, lng: 105.8542, population: 8053663, isCapital: true },
  { id: 'tlv', name: 'Tel Aviv', country: 'Israel', countryCode: 'IL', timezone: 'Asia/Tel_Aviv', lat: 32.0853, lng: 34.7818, population: 460613 },
  { id: 'tas', name: 'Tashkent', country: 'Uzbekistan', countryCode: 'UZ', timezone: 'Asia/Tashkent', lat: 41.2995, lng: 69.2401, population: 2571000, isCapital: true },
  { id: 'ala', name: 'Almaty', country: 'Kazakhstan', countryCode: 'KZ', timezone: 'Asia/Almaty', lat: 43.222, lng: 76.8512, population: 2000000 },
  { id: 'bgw', name: 'Baghdad', country: 'Iraq', countryCode: 'IQ', timezone: 'Asia/Baghdad', lat: 33.3152, lng: 44.3661, population: 7144000, isCapital: true },
  { id: 'thr', name: 'Tehran', country: 'Iran', countryCode: 'IR', timezone: 'Asia/Tehran', lat: 35.6892, lng: 51.389, population: 8693706, isCapital: true },

  // Africa
  { id: 'cai', name: 'Cairo', country: 'Egypt', countryCode: 'EG', timezone: 'Africa/Cairo', lat: 30.0444, lng: 31.2357, population: 9540000, isCapital: true },
  { id: 'jnb', name: 'Johannesburg', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', lat: -26.2041, lng: 28.0473, population: 5635000 },
  { id: 'cpt', name: 'Cape Town', country: 'South Africa', countryCode: 'ZA', timezone: 'Africa/Johannesburg', lat: -33.9249, lng: 18.4241, population: 433688 },
  { id: 'los', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', timezone: 'Africa/Lagos', lat: 6.5244, lng: 3.3792, population: 14862000 },
  { id: 'abv', name: 'Abuja', country: 'Nigeria', countryCode: 'NG', timezone: 'Africa/Lagos', lat: 9.0765, lng: 7.3986, population: 1235880, isCapital: true },
  { id: 'nbo', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', timezone: 'Africa/Nairobi', lat: -1.2921, lng: 36.8219, population: 4397073, isCapital: true },
  { id: 'cas', name: 'Casablanca', country: 'Morocco', countryCode: 'MA', timezone: 'Africa/Casablanca', lat: 33.5731, lng: -7.5898, population: 3359818 },
  { id: 'acc', name: 'Accra', country: 'Ghana', countryCode: 'GH', timezone: 'Africa/Accra', lat: 5.6037, lng: -0.187, population: 2291352, isCapital: true },
  { id: 'add', name: 'Addis Ababa', country: 'Ethiopia', countryCode: 'ET', timezone: 'Africa/Addis_Ababa', lat: 9.03, lng: 38.74, population: 3384569, isCapital: true },
  { id: 'alg', name: 'Algiers', country: 'Algeria', countryCode: 'DZ', timezone: 'Africa/Algiers', lat: 36.7538, lng: 3.0588, population: 2364230, isCapital: true },
  { id: 'tun', name: 'Tunis', country: 'Tunisia', countryCode: 'TN', timezone: 'Africa/Tunis', lat: 36.8065, lng: 10.1815, population: 1056247, isCapital: true },

  // Oceania / Pacific
  { id: 'syd', name: 'Sydney', country: 'Australia', countryCode: 'AU', state: 'NSW', timezone: 'Australia/Sydney', lat: -33.8688, lng: 151.2093, population: 5312000 },
  { id: 'mel', name: 'Melbourne', country: 'Australia', countryCode: 'AU', state: 'VIC', timezone: 'Australia/Melbourne', lat: -37.8136, lng: 144.9631, population: 5078000 },
  { id: 'bne', name: 'Brisbane', country: 'Australia', countryCode: 'AU', state: 'QLD', timezone: 'Australia/Brisbane', lat: -27.4705, lng: 153.026, population: 2560000 },
  { id: 'per', name: 'Perth', country: 'Australia', countryCode: 'AU', state: 'WA', timezone: 'Australia/Perth', lat: -31.9505, lng: 115.8605, population: 2067000 },
  { id: 'adl', name: 'Adelaide', country: 'Australia', countryCode: 'AU', state: 'SA', timezone: 'Australia/Adelaide', lat: -34.9285, lng: 138.6007, population: 1359760 },
  { id: 'akl', name: 'Auckland', country: 'New Zealand', countryCode: 'NZ', timezone: 'Pacific/Auckland', lat: -36.8485, lng: 174.7633, population: 1657000 },
  { id: 'wlg', name: 'Wellington', country: 'New Zealand', countryCode: 'NZ', timezone: 'Pacific/Auckland', lat: -41.2865, lng: 174.7762, population: 212700, isCapital: true },
  { id: 'fji', name: 'Suva', country: 'Fiji', countryCode: 'FJ', timezone: 'Pacific/Fiji', lat: -18.1248, lng: 178.4501, population: 93970, isCapital: true }
];

/**
 * Filter or search cities by query string across name, country, timezone or state
 * Fallback to dynamic IANA timezone discovery if specific city is not matched in static list
 */
export function searchCities(query: string, limit = 25): City[] {
  if (!query || query.trim() === '') {
    return MAJOR_CITIES.slice(0, limit);
  }
  const q = query.toLowerCase().trim();

  // 1. First search in explicit major cities
  const matchedCities = MAJOR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.state && c.state.toLowerCase().includes(q)) ||
      c.timezone.toLowerCase().includes(q)
  );

  if (matchedCities.length >= limit) {
    return matchedCities.slice(0, limit);
  }

  // 2. Dynamic lookup from browser supported IANA timezones for full global coverage
  const results: City[] = [...matchedCities];
  try {
    const supportedTz = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [];
    for (const tz of supportedTz) {
      if (results.length >= limit) break;
      const tzLower = tz.toLowerCase();
      if (tzLower.includes(q)) {
        const parts = tz.split('/');
        const cityName = parts[parts.length - 1].replace(/_/g, ' ');
        const countryName = parts[0];
        const id = `tz-${tz.replace(/[\/_\s]/g, '-').toLowerCase()}`;
        
        if (!results.some((r) => r.timezone === tz || r.id === id)) {
          results.push({
            id,
            name: cityName,
            country: countryName,
            countryCode: 'GLOBAL',
            timezone: tz,
            lat: 0,
            lng: 0,
            population: 100000
          });
        }
      }
    }
  } catch {
    // fallback if Intl.supportedValuesOf is unsupported in environment
  }

  return results.slice(0, limit);
}

export function getCityById(id: string): City | undefined {
  const found = MAJOR_CITIES.find((c) => c.id === id);
  if (found) return found;

  // If dynamic timezone ID, reconstruct
  if (id.startsWith('tz-')) {
    const tzName = id.replace('tz-', '').replace(/-/g, '/');
    return {
      id,
      name: id.split('-').pop() || 'Global City',
      country: 'Global Region',
      countryCode: 'UN',
      timezone: tzName,
      lat: 0,
      lng: 0,
      population: 100000
    };
  }
  return undefined;
}

