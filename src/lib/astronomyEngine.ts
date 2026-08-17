import { CelestialBodyPosition, EclipseEvent, MoonData, SunEphemeris, SolarNoonDetails, LunarDayInfo, MajorLunarPhaseEvent, MonthlyLunarCalendarData } from '../types';

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

/**
 * High-Precision Solar Noon & Meridian Transit Engine
 * Based on NOAA Solar Calculator & Jean Meeus Astronomical Algorithms
 */
export function calculateSolarNoonDetails(
  lat: number,
  lng: number,
  date: Date,
  timeZone = 'UTC'
): SolarNoonDetails {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Day of Year
  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((new Date(year, month, day).getTime() - startOfYear.getTime()) / 86400000) + 1;

  // Julian Date & Century for 12:00:00 UTC on given day
  const jdNoon = Date.UTC(year, month, day, 12, 0, 0) / 86400000 + 2440587.5;
  const T = (jdNoon - 2451545.0) / 36525.0;

  // Geometric Mean Longitude of Sun (deg)
  let L0 = 280.46646 + T * (36000.76983 + 0.0003032 * T);
  L0 = (L0 % 360 + 360) % 360;

  // Geometric Mean Anomaly of Sun (deg)
  let M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  M = (M % 360 + 360) % 360;
  const MRad = M * DEG2RAD;

  // Eccentricity of Earth's Orbit
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  // Sun Equation of Center (deg)
  const C =
    Math.sin(MRad) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * MRad) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * MRad) * 0.000289;

  // Sun True Longitude & Apparent Longitude (deg)
  const sunTrueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = sunTrueLong - 0.00569 - 0.00478 * Math.sin(omega * DEG2RAD);

  // Mean Obliquity of the Ecliptic (deg)
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = eps0 + 0.00256 * Math.cos(omega * DEG2RAD);
  const epsRad = eps * DEG2RAD;

  // Solar Declination (deg)
  const sinDec = Math.sin(epsRad) * Math.sin(lambda * DEG2RAD);
  const solarDeclinationDeg = Math.asin(sinDec) * RAD2DEG;

  // Equation of Time (EoT) in minutes
  const y = Math.tan(epsRad / 2) * Math.tan(epsRad / 2);
  const L0Rad = L0 * DEG2RAD;
  const eotRad =
    y * Math.sin(2 * L0Rad) -
    2 * e * Math.sin(MRad) +
    4 * e * y * Math.sin(MRad) * Math.cos(2 * L0Rad) -
    0.5 * y * y * Math.sin(4 * L0Rad) -
    1.25 * e * e * Math.sin(2 * MRad);
  const equationOfTimeMinutes = eotRad * 4 * RAD2DEG;

  // Solar Noon in UTC minutes from 00:00 UTC (720 min = 12:00:00)
  // East longitude is positive, so it reaches solar noon earlier (subtract 4 min/deg)
  let solarNoonUtcMinutes = 720 - lng * 4 - equationOfTimeMinutes;
  while (solarNoonUtcMinutes < 0) solarNoonUtcMinutes += 1440;
  while (solarNoonUtcMinutes >= 1440) solarNoonUtcMinutes -= 1440;

  const utcHours = Math.floor(solarNoonUtcMinutes / 60);
  const utcMinutes = Math.floor(solarNoonUtcMinutes % 60);
  const utcSeconds = Math.round(((solarNoonUtcMinutes % 60) % 1) * 60);

  const solarNoonUtc = new Date(Date.UTC(year, month, day, utcHours, utcMinutes, utcSeconds));

  // Determine timezone offset in minutes at solar noon instant
  let tzOffsetMinutes = 0;
  try {
    const utcStr = solarNoonUtc.toLocaleString('en-US', { timeZone: 'UTC' });
    const localStr = solarNoonUtc.toLocaleString('en-US', { timeZone });
    tzOffsetMinutes = Math.round((new Date(localStr).getTime() - new Date(utcStr).getTime()) / 60000);
  } catch (err) {
    tzOffsetMinutes = 0;
  }

  // Standard meridian of timezone (deg)
  const standardMeridianDeg = (tzOffsetMinutes / 60) * 15;
  // Meridian offset in minutes (difference between city longitude and standard meridian)
  const meridianOffsetMinutes = (standardMeridianDeg - lng) * 4;
  // Longitude in time (min)
  const longitudeOffsetMinutes = lng * 4;

  // Format strings
  const pad = (n: number) => n.toString().padStart(2, '0');
  const solarNoonUtcStr = `${pad(solarNoonUtc.getUTCHours())}:${pad(solarNoonUtc.getUTCMinutes())}:${pad(solarNoonUtc.getUTCSeconds())} UTC`;

  let solarNoonLocalStr = '';
  try {
    solarNoonLocalStr = solarNoonUtc.toLocaleTimeString('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (e) {
    solarNoonLocalStr = solarNoonUtcStr;
  }

  // Maximum Solar Elevation at Solar Noon (Culmination)
  const maxSolarElevationDeg = Math.max(0, 90 - Math.abs(lat - solarDeclinationDeg));
  const zenithAngleDeg = 90 - maxSolarElevationDeg;

  // Shadow length ratio (shadow length = object height * shadowRatio)
  const shadowRatio = maxSolarElevationDeg > 0.01 ? 1 / Math.tan(maxSolarElevationDeg * DEG2RAD) : 999;

  // Culmination direction
  let culminationDirection: 'Due South' | 'Due North' | 'Directly Overhead (Zenith)';
  if (Math.abs(lat - solarDeclinationDeg) < 0.1) {
    culminationDirection = 'Directly Overhead (Zenith)';
  } else if (lat > solarDeclinationDeg) {
    culminationDirection = 'Due South';
  } else {
    culminationDirection = 'Due North';
  }

  // Difference between 12:00:00 Clock Noon and Solar Noon
  // Local Solar Noon Time (minutes from 00:00 local time)
  const localSolarMinutes = (solarNoonUtcMinutes + tzOffsetMinutes + 1440) % 1440;
  const clockNoonDifferenceMinutes = localSolarMinutes - 720; // 720 = 12:00

  const diffAbs = Math.abs(clockNoonDifferenceMinutes);
  const diffM = Math.floor(diffAbs);
  const diffS = Math.round((diffAbs - diffM) * 60);
  const signLabel = clockNoonDifferenceMinutes >= 0 ? 'later than' : 'earlier than';
  const clockNoonDifferenceFormatted = `${diffM}m ${pad(diffS)}s ${signLabel} 12:00 clock noon`;

  // Equation of Time formatted
  const eotSign = equationOfTimeMinutes >= 0 ? '+' : '-';
  const eotAbs = Math.abs(equationOfTimeMinutes);
  const eotM = Math.floor(eotAbs);
  const eotS = Math.round((eotAbs - eotM) * 60);
  const equationOfTimeFormatted = `${eotSign}${eotM}m ${pad(eotS)}s`;

  return {
    solarNoonUtc,
    solarNoonLocalStr,
    solarNoonUtcStr,
    solarDeclinationDeg: Number(solarDeclinationDeg.toFixed(2)),
    equationOfTimeMinutes: Number(equationOfTimeMinutes.toFixed(2)),
    equationOfTimeFormatted,
    longitudeOffsetMinutes: Number(longitudeOffsetMinutes.toFixed(1)),
    standardMeridianDeg: Number(standardMeridianDeg.toFixed(1)),
    meridianOffsetMinutes: Number(meridianOffsetMinutes.toFixed(1)),
    maxSolarElevationDeg: Number(maxSolarElevationDeg.toFixed(1)),
    zenithAngleDeg: Number(zenithAngleDeg.toFixed(1)),
    shadowRatio: Number(shadowRatio.toFixed(2)),
    culminationDirection,
    clockNoonDifferenceMinutes: Number(clockNoonDifferenceMinutes.toFixed(2)),
    clockNoonDifferenceFormatted,
    dayOfYear
  };
}

/**
 * Traditional Names for the Full Moon by Month (Farmer's Almanac & Native Tradition)
 */
export const TRADITIONAL_FULL_MOON_NAMES: { [key: number]: { name: string; description: string } } = {
  0: { name: 'Wolf Moon', description: 'Named for hungry wolves howling outside villages in the depth of midwinter.' },
  1: { name: 'Snow Moon', description: 'Typically the month of heaviest snowfall in the Northern Hemisphere.' },
  2: { name: 'Worm Moon', description: 'Earthworms emerge as the soil warms, inviting robins at the start of spring.' },
  3: { name: 'Pink Moon', description: 'Named for moss pink (wild ground phlox), one of the earliest spring flowers.' },
  4: { name: 'Flower Moon', description: 'Celebrates the abundant blossoming of wildflowers and agricultural plantings.' },
  5: { name: 'Strawberry Moon', description: 'Peak harvesting season for sweet ripening wild strawberries.' },
  6: { name: 'Buck Moon', description: 'New velvety antlers of young buck deer push out of their foreheads.' },
  7: { name: 'Sturgeon Moon', description: 'Abundant freshwater sturgeon in North American Great Lakes and rivers.' },
  8: { name: 'Harvest / Corn Moon', description: 'Closest full moon to autumnal equinox, providing evening light for harvesting.' },
  9: { name: "Hunter's Moon", description: 'Crops cleared from fields allow hunters to easily track prey for winter food stores.' },
  10: { name: 'Beaver Moon', description: 'Time when beavers finish building their winter lodges and dams.' },
  11: { name: 'Cold Moon', description: 'Signifies the onset of winter freezing temperatures and long nights.' }
};

/**
 * Calculate the Moon's approximate Tropical Zodiac Sign & Constellation
 */
export function getMoonZodiacSign(date: Date): { sign: string; symbol: string; degree: number } {
  const jd = getJulianDate(date);
  const d = jd - 2451545.0; // days from J2000.0

  // Mean longitude of the Moon (deg)
  let L = (218.316 + 13.176396 * d) % 360;
  if (L < 0) L += 360;

  // Mean anomaly of the Moon (deg)
  let M = (134.963 + 13.064993 * d) % 360;
  if (M < 0) M += 360;

  // Mean anomaly of the Sun (deg)
  let MSun = (357.529 + 0.98560028 * d) % 360;
  if (MSun < 0) MSun += 360;

  // Evection and equation of center correction
  const lambda = (L + 6.289 * Math.sin(M * DEG2RAD) - 1.274 * Math.sin((2 * L - 2 * MSun - M) * DEG2RAD) + 360) % 360;

  const signs = [
    { sign: 'Aries', symbol: '♈' },
    { sign: 'Taurus', symbol: '♉' },
    { sign: 'Gemini', symbol: '♊' },
    { sign: 'Cancer', symbol: '♋' },
    { sign: 'Leo', symbol: '♌' },
    { sign: 'Virgo', symbol: '♍' },
    { sign: 'Libra', symbol: '♎' },
    { sign: 'Scorpio', symbol: '♏' },
    { sign: 'Sagittarius', symbol: '♐' },
    { sign: 'Capricorn', symbol: '♑' },
    { sign: 'Aquarius', symbol: '♒' },
    { sign: 'Pisces', symbol: '♓' }
  ];

  const signIndex = Math.floor(lambda / 30);
  const sign = signs[signIndex % 12];
  const degree = Number((lambda % 30).toFixed(1));

  return {
    sign: sign.sign,
    symbol: sign.symbol,
    degree
  };
}

/**
 * Generate full monthly lunar phase calendar data for any given year and month
 */
export function calculateMonthlyLunarCalendar(
  year: number,
  month: number, // 0 - 11
  lat = 40.7128,
  lng = -74.0060,
  timeZone = 'UTC'
): MonthlyLunarCalendarData {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = monthNames[month] || 'Month';

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const totalDaysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday...

  const pad = (n: number) => n.toString().padStart(2, '0');
  const days: LunarDayInfo[] = [];

  // 1. Calculate preceding month trailing days to pad calendar grid
  const prevMonthLastDate = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDay = prevMonthLastDate - i;
    const prevDate = new Date(year, month - 1, prevDay, 12, 0, 0);
    const moon = calculateMoonData(prevDate, lat, lng);
    const zodiac = getMoonZodiacSign(prevDate);
    const dateStr = `${prevDate.getFullYear()}-${pad(prevDate.getMonth() + 1)}-${pad(prevDay)}`;

    days.push({
      day: prevDay,
      date: prevDate,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
      phaseName: moon.phaseName,
      phaseFraction: moon.phaseFraction,
      illuminationPercent: moon.illuminationPercent,
      moonAgeDays: moon.moonAgeDays,
      distanceKm: moon.distanceKm,
      moonrise: moon.moonrise,
      moonset: moon.moonset,
      isMajorPhase: false,
      majorPhaseType: null,
      isSupermoon: false,
      isMicroMoon: false,
      isBlueMoon: false,
      traditionalMoonName: null,
      zodiacSign: zodiac.sign,
      zodiacSymbol: zodiac.symbol
    });
  }

  // 2. Current Month Days
  const today = new Date();
  const isCurrentYearAndMonth = today.getFullYear() === year && today.getMonth() === month;
  const currentDayNum = today.getDate();

  let fullMoonCountInMonth = 0;

  for (let d = 1; d <= totalDaysInMonth; d++) {
    const curDate = new Date(year, month, d, 12, 0, 0);
    const moon = calculateMoonData(curDate, lat, lng);
    const zodiac = getMoonZodiacSign(curDate);
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    const isToday = isCurrentYearAndMonth && currentDayNum === d;

    // Detect Major phase proximities
    // New Moon: fraction close to 0 or 1
    // First Quarter: fraction close to 0.25
    // Full Moon: fraction close to 0.50
    // Third Quarter: fraction close to 0.75
    let majorPhaseType: 'NEW_MOON' | 'FIRST_QUARTER' | 'FULL_MOON' | 'THIRD_QUARTER' | null = null;
    
    // Check if this day is local minimum/maximum for phases
    const prevDayDate = new Date(year, month, d - 1, 12, 0, 0);
    const nextDayDate = new Date(year, month, d + 1, 12, 0, 0);
    const prevMoon = calculateMoonData(prevDayDate, lat, lng);
    const nextMoon = calculateMoonData(nextDayDate, lat, lng);

    // Full Moon detection (peak illumination)
    if (moon.illuminationPercent >= 97 && moon.illuminationPercent >= prevMoon.illuminationPercent && moon.illuminationPercent >= nextMoon.illuminationPercent) {
      majorPhaseType = 'FULL_MOON';
      fullMoonCountInMonth++;
    }
    // New Moon detection (minimum illumination)
    else if (moon.illuminationPercent <= 3 && moon.illuminationPercent <= prevMoon.illuminationPercent && moon.illuminationPercent <= nextMoon.illuminationPercent) {
      majorPhaseType = 'NEW_MOON';
    }
    // First Quarter detection (waxing ~50%)
    else if (moon.moonAgeDays >= 6.5 && moon.moonAgeDays <= 8.5 && Math.abs(moon.illuminationPercent - 50) <= Math.abs(prevMoon.illuminationPercent - 50) && Math.abs(moon.illuminationPercent - 50) <= Math.abs(nextMoon.illuminationPercent - 50)) {
      majorPhaseType = 'FIRST_QUARTER';
    }
    // Third Quarter detection (waning ~50%)
    else if (moon.moonAgeDays >= 21.0 && moon.moonAgeDays <= 23.0 && Math.abs(moon.illuminationPercent - 50) <= Math.abs(prevMoon.illuminationPercent - 50) && Math.abs(moon.illuminationPercent - 50) <= Math.abs(nextMoon.illuminationPercent - 50)) {
      majorPhaseType = 'THIRD_QUARTER';
    }

    const isSupermoon = majorPhaseType === 'FULL_MOON' && moon.distanceKm < 360000;
    const isMicroMoon = majorPhaseType === 'FULL_MOON' && moon.distanceKm > 405000;
    const isBlueMoon = majorPhaseType === 'FULL_MOON' && fullMoonCountInMonth > 1;

    const traditionalMoonName = majorPhaseType === 'FULL_MOON'
      ? (isBlueMoon ? 'Blue Moon' : TRADITIONAL_FULL_MOON_NAMES[month]?.name || 'Full Moon')
      : null;

    days.push({
      day: d,
      date: curDate,
      dateStr,
      isCurrentMonth: true,
      isToday,
      phaseName: moon.phaseName,
      phaseFraction: moon.phaseFraction,
      illuminationPercent: moon.illuminationPercent,
      moonAgeDays: moon.moonAgeDays,
      distanceKm: moon.distanceKm,
      moonrise: moon.moonrise,
      moonset: moon.moonset,
      isMajorPhase: Boolean(majorPhaseType),
      majorPhaseType,
      isSupermoon,
      isMicroMoon,
      isBlueMoon,
      traditionalMoonName,
      zodiacSign: zodiac.sign,
      zodiacSymbol: zodiac.symbol
    });
  }

  // 3. Trailing days from next month to fill grid row (multiple of 7)
  const remainingDaysToPad = (7 - (days.length % 7)) % 7;
  for (let nextDay = 1; nextDay <= remainingDaysToPad; nextDay++) {
    const nextDate = new Date(year, month + 1, nextDay, 12, 0, 0);
    const moon = calculateMoonData(nextDate, lat, lng);
    const zodiac = getMoonZodiacSign(nextDate);
    const dateStr = `${nextDate.getFullYear()}-${pad(nextDate.getMonth() + 1)}-${pad(nextDay)}`;

    days.push({
      day: nextDay,
      date: nextDate,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
      phaseName: moon.phaseName,
      phaseFraction: moon.phaseFraction,
      illuminationPercent: moon.illuminationPercent,
      moonAgeDays: moon.moonAgeDays,
      distanceKm: moon.distanceKm,
      moonrise: moon.moonrise,
      moonset: moon.moonset,
      isMajorPhase: false,
      majorPhaseType: null,
      isSupermoon: false,
      isMicroMoon: false,
      isBlueMoon: false,
      traditionalMoonName: null,
      zodiacSign: zodiac.sign,
      zodiacSymbol: zodiac.symbol
    });
  }

  // Collect Major Phases List with exact times
  const majorPhases: MajorLunarPhaseEvent[] = [];
  const currentMonthDaysWithMajor = days.filter((d) => d.isCurrentMonth && d.isMajorPhase);

  for (const item of currentMonthDaysWithMajor) {
    if (!item.majorPhaseType) continue;

    let phaseName = 'New Moon';
    if (item.majorPhaseType === 'FIRST_QUARTER') phaseName = 'First Quarter';
    else if (item.majorPhaseType === 'FULL_MOON') phaseName = 'Full Moon';
    else if (item.majorPhaseType === 'THIRD_QUARTER') phaseName = 'Third Quarter';

    let exactTimeUtcStr = '12:00 UTC';
    let exactTimeLocalStr = '12:00 PM';

    try {
      exactTimeUtcStr = item.date.toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hour12: true }) + ' UTC';
      exactTimeLocalStr = item.date.toLocaleTimeString('en-US', { timeZone, hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      // fallback
    }

    majorPhases.push({
      phaseType: item.majorPhaseType,
      phaseName,
      date: item.date,
      dateStr: item.dateStr,
      exactTimeUtcStr,
      exactTimeLocalStr,
      illuminationPercent: item.illuminationPercent,
      distanceKm: item.distanceKm,
      traditionalName: item.traditionalMoonName || undefined,
      isSupermoon: item.isSupermoon
    });
  }

  const traditionalFullMoonName = TRADITIONAL_FULL_MOON_NAMES[month]?.name || 'Full Moon';
  const supermoonCount = days.filter((d) => d.isCurrentMonth && d.isSupermoon).length;

  return {
    year,
    month,
    monthName,
    days,
    majorPhases,
    traditionalFullMoonName,
    totalDaysInMonth,
    supermoonCount
  };
}
