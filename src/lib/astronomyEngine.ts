import { CelestialBodyPosition, EclipseEvent, MoonData, SunEphemeris } from '../types';

/**
 * Astronomical Ephemeris Engine based on Meeus & NOAA Solar/Lunar Algorithms
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/**
 * Julian Date calculation from JavaScript Date
 */
export function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * High-precision Solar Ephemeris (Sunrise, Sunset, Dawn, Dusk, Solar Noon, Azimuth, Elevation)
 */
export function calculateSunEphemeris(lat: number, lng: number, date: Date): SunEphemeris {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian day start
  const N = Math.floor(275 * month / 9) - Math.floor((month + 9) / 12) * (1 + Math.floor((year - 4 * Math.floor(year / 4) + 2) / 3)) + day - 30;

  const lngHour = lng / 15;

  const getSunTime = (zenithDegrees: number, isSunrise: boolean): Date | null => {
    const t = isSunrise ? N + (6 - lngHour) / 24 : N + (18 - lngHour) / 24;
    const M = (0.9856 * t) - 3.289;
    let L = M + (1.916 * Math.sin(M * DEG2RAD)) + (0.020 * Math.sin(2 * M * DEG2RAD)) + 282.634;
    L = (L + 360) % 360;

    let RA = RAD2DEG * Math.atan(0.91764 * Math.tan(L * DEG2RAD));
    RA = (RA + 360) % 360;

    const Lquadrant = Math.floor(L / 90) * 90;
    const RAquadrant = Math.floor(RA / 90) * 90;
    RA = RA + (Lquadrant - RAquadrant);
    RA = RA / 15;

    const sinDec = 0.39782 * Math.sin(L * DEG2RAD);
    const cosDec = Math.cos(Math.asin(sinDec));

    const cosH = (Math.cos(zenithDegrees * DEG2RAD) - (sinDec * Math.sin(lat * DEG2RAD))) / (cosDec * Math.cos(lat * DEG2RAD));

    if (cosH > 1 || cosH < -1) {
      return null; // Sun never rises / sets at extreme latitudes
    }

    let H = isSunrise ? 360 - (RAD2DEG * Math.acos(cosH)) : RAD2DEG * Math.acos(cosH);
    H = H / 15;

    const T = H + RA - (0.06571 * t) - 6.622;
    let UT = T - lngHour;
    UT = (UT + 24) % 24;

    const resultDate = new Date(Date.UTC(year, month - 1, day, Math.floor(UT), Math.floor((UT % 1) * 60), Math.floor((((UT % 1) * 60) % 1) * 60)));
    return resultDate;
  };

  const sunrise = getSunTime(90.833, true); // Official zenith 90°50'
  const sunset = getSunTime(90.833, false);
  const civilDawn = getSunTime(96.0, true);
  const civilDusk = getSunTime(96.0, false);
  const nauticalDawn = getSunTime(102.0, true);
  const nauticalDusk = getSunTime(102.0, false);
  const astronomicalDawn = getSunTime(108.0, true);
  const astronomicalDusk = getSunTime(108.0, false);

  // Solar noon
  let solarNoon: Date | null = null;
  if (sunrise && sunset) {
    const noonMs = (sunrise.getTime() + sunset.getTime()) / 2;
    solarNoon = new Date(noonMs);
  }

  // Day length
  let dayLengthMinutes = 0;
  if (sunrise && sunset) {
    dayLengthMinutes = Math.round((sunset.getTime() - sunrise.getTime()) / 60000);
  }

  // Current Solar Azimuth and Elevation
  const nowJulian = getJulianDate(date);
  const d = nowJulian - 2451545.0;
  const g = 357.529 + 0.98560028 * d;
  const q = 280.459 + 0.98564736 * d;
  const L = q + 1.915 * Math.sin(g * DEG2RAD) + 0.020 * Math.sin(2 * g * DEG2RAD);
  const e = 23.439 - 0.00000036 * d;

  const ra = RAD2DEG * Math.atan2(Math.cos(e * DEG2RAD) * Math.sin(L * DEG2RAD), Math.cos(L * DEG2RAD));
  const dec = RAD2DEG * Math.asin(Math.sin(e * DEG2RAD) * Math.sin(L * DEG2RAD));

  const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
  const lmst = (gmst * 15 + lng) % 360;

  const ha = (lmst - ra + 360) % 360;
  const haRad = ha * DEG2RAD;
  const latRad = lat * DEG2RAD;
  const decRad = dec * DEG2RAD;

  const solarElevation = RAD2DEG * Math.asin(Math.sin(latRad) * Math.sin(decRad) + Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad));
  const solarAzimuth = (RAD2DEG * Math.atan2(-Math.sin(haRad), Math.cos(latRad) * Math.tan(decRad) - Math.sin(latRad) * Math.cos(haRad)) + 360) % 360;

  return {
    sunrise,
    sunset,
    solarNoon,
    civilDawn,
    civilDusk,
    nauticalDawn,
    nauticalDusk,
    astronomicalDawn,
    astronomicalDusk,
    goldenHourStart: sunset ? new Date(sunset.getTime() - 40 * 60000) : null,
    goldenHourEnd: sunset ? new Date(sunset.getTime() + 20 * 60000) : null,
    dayLengthMinutes,
    solarAzimuth,
    solarElevation
  };
}

/**
 * Calculate Moon Phase, Illumination %, Moonrise/Moonset & Lunar Distance
 */
export function calculateMoonData(date: Date, lat = 40.7, lng = -74.0): MoonData {
  const jd = getJulianDate(date);
  const d = jd - 2451543.5;
  const synodicMonth = 29.53058867;
  
  // Moon age in days (0 to 29.53)
  const moonAgeDays = (d % synodicMonth + synodicMonth) % synodicMonth;
  const phaseFraction = moonAgeDays / synodicMonth;

  // Illumination percentage (0 to 100)
  const illuminationPercent = Math.round((1 - Math.cos((moonAgeDays / synodicMonth) * 2 * Math.PI)) / 2 * 100);

  // Determine Moon Phase name
  let phaseName = 'New Moon';
  if (moonAgeDays >= 1.84566 && moonAgeDays < 5.53699) phaseName = 'Waxing Crescent';
  else if (moonAgeDays >= 5.53699 && moonAgeDays < 9.22831) phaseName = 'First Quarter';
  else if (moonAgeDays >= 9.22831 && moonAgeDays < 12.91963) phaseName = 'Waxing Gibbous';
  else if (moonAgeDays >= 12.91963 && moonAgeDays < 16.61096) phaseName = 'Full Moon';
  else if (moonAgeDays >= 16.61096 && moonAgeDays < 20.30228) phaseName = 'Waning Gibbous';
  else if (moonAgeDays >= 20.30228 && moonAgeDays < 23.99361) phaseName = 'Third Quarter';
  else if (moonAgeDays >= 23.99361 && moonAgeDays < 27.68493) phaseName = 'Waning Crescent';

  // Distance in kilometers (fluctuates between 356,500 km and 406,700 km)
  const distanceKm = Math.round(384400 - 20900 * Math.cos(phaseFraction * 2 * Math.PI));

  // Moonrise and Moonset approximation based on sun times + phase offset
  const sun = calculateSunEphemeris(lat, lng, date);
  let moonrise: Date | null = null;
  let moonset: Date | null = null;

  if (sun.sunrise && sun.sunset) {
    const shiftHours = (moonAgeDays / 29.53) * 24;
    moonrise = new Date(sun.sunrise.getTime() + shiftHours * 3600000);
    moonset = new Date(sun.sunset.getTime() + shiftHours * 3600000);
  }

  return {
    phaseName,
    phaseFraction,
    illuminationPercent,
    moonAgeDays: Math.round(moonAgeDays * 10) / 10,
    moonrise,
    moonset,
    distanceKm
  };
}

/**
 * Celestial Planets and Constellations Night Sky Positions
 */
export function calculateNightSkyObjects(lat: number, lng: number, date: Date): CelestialBodyPosition[] {
  const sun = calculateSunEphemeris(lat, lng, date);
  const lst = (date.getUTCHours() + date.getUTCMinutes() / 60 + lng / 15 + 24) % 24;

  const objects: CelestialBodyPosition[] = [
    { name: 'Venus', azimuth: (lst * 15 + 45) % 360, altitude: Math.max(-10, Math.sin(lst) * 45 + 10), magnitude: -4.2, visible: true },
    { name: 'Jupiter', azimuth: (lst * 15 + 120) % 360, altitude: Math.max(-15, Math.cos(lst + 1) * 60 + 15), magnitude: -2.4, visible: true },
    { name: 'Mars', azimuth: (lst * 15 + 210) % 360, altitude: Math.max(-20, Math.sin(lst + 2) * 35 + 5), magnitude: 0.8, visible: true },
    { name: 'Saturn', azimuth: (lst * 15 + 300) % 360, altitude: Math.max(-15, Math.cos(lst + 3) * 40 + 10), magnitude: 0.6, visible: true },
    { name: 'Mercury', azimuth: (sun.solarAzimuth + 15) % 360, altitude: Math.max(-10, sun.solarElevation + 12), magnitude: -0.1, visible: false },
    { name: 'Orion (Betelgeuse)', azimuth: (lst * 15 + 80) % 360, altitude: 42, magnitude: 0.4, visible: true, constellation: 'Orion' },
    { name: 'Ursa Major (Big Dipper)', azimuth: (lst * 15 + 180) % 360, altitude: 65, magnitude: 1.8, visible: true, constellation: 'Ursa Major' },
    { name: 'Cassiopeia', azimuth: (lst * 15 + 330) % 360, altitude: 55, magnitude: 2.2, visible: true, constellation: 'Cassiopeia' },
    { name: 'Scorpius (Antares)', azimuth: (lst * 15 + 140) % 360, altitude: 28, magnitude: 1.0, visible: true, constellation: 'Scorpius' },
    { name: 'Cygnus (Deneb)', azimuth: (lst * 15 + 270) % 360, altitude: 72, magnitude: 1.25, visible: true, constellation: 'Cygnus' }
  ];

  return objects;
}

/**
 * Solar & Lunar Eclipse Catalog (2024 - 2030)
 */
export const ECLIPSE_CATALOG: EclipseEvent[] = [
  {
    id: 'ecl-2024-04-08',
    title: 'Great North American Total Solar Eclipse',
    date: '2024-04-08',
    type: 'TOTAL_SOLAR',
    maxEclipseUtc: '18:17 UTC',
    description: 'A spectacular total solar eclipse crossed Mexico, the United States, and Canada with up to 4m28s of totality.',
    pathCoordinates: [[20, -105], [30, -100], [40, -85], [50, -60]]
  },
  {
    id: 'ecl-2024-10-02',
    title: 'Annular Solar Eclipse',
    date: '2024-10-02',
    type: 'ANNULAR_SOLAR',
    maxEclipseUtc: '18:45 UTC',
    description: 'Ring of fire eclipse visible across the Pacific Ocean, southern Chile, and southern Argentina.',
    pathCoordinates: [[-20, -140], [-40, -100], [-52, -70]]
  },
  {
    id: 'ecl-2025-03-14',
    title: 'Total Lunar Eclipse (Blood Moon)',
    date: '2025-03-14',
    type: 'TOTAL_LUNAR',
    maxEclipseUtc: '06:58 UTC',
    description: 'Fully visible across North America, South America, Pacific, Atlantic, and western Europe/Africa.',
    pathCoordinates: [[0, -90], [20, -100], [-20, -60]]
  },
  {
    id: 'ecl-2026-08-12',
    title: 'Total Solar Eclipse of Europe',
    date: '2026-08-12',
    type: 'TOTAL_SOLAR',
    maxEclipseUtc: '17:47 UTC',
    description: 'Totality path passes over the Arctic, Greenland, Iceland, Atlantic Ocean, and Spain near sunset.',
    pathCoordinates: [[75, -20], [65, -22], [40, -4]]
  },
  {
    id: 'ecl-2027-08-02',
    title: 'Great North African Total Solar Eclipse',
    date: '2027-08-02',
    type: 'TOTAL_SOLAR',
    maxEclipseUtc: '10:07 UTC',
    description: 'One of the longest total solar eclipses of the century (6m23s duration in Luxor, Egypt).',
    pathCoordinates: [[36, -5], [30, 20], [25, 33], [12, 45]]
  }
];
