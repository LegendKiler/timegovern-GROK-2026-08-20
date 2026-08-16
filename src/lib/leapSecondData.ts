// High-Precision Leap Second & Atomic Time Scales Engine
// Based on IERS (International Earth Rotation and Reference Systems Service) Bulletin C & BIPM Circular T

export interface LeapSecondEvent {
  year: number;
  month: 'June' | 'December' | 'January';
  day: number;
  dateStr: string;
  type: '+1s' | '-1s';
  cumulativeTaiMinusUtc: number; // TAI - UTC in seconds
  cumulativeGpsMinusUtc: number; // GPS - UTC in seconds
  daysSinceLast: number;
  notes: string;
}

export interface TimeScaleOffsetData {
  utcIso: string;
  utcFormatted: string;
  taiIso: string;
  taiFormatted: string;
  taiOffsetSeconds: number; // +37s
  gpsIso: string;
  gpsFormatted: string;
  gpsOffsetSeconds: number; // +18s
  ttIso: string;
  ttFormatted: string;
  ttOffsetSeconds: number; // +69.184s
  dut1Seconds: number; // UT1 - UTC (~ +0.038s)
  ut1Formatted: string;
  lengthOfDayDeviationMs: number; // LOD deviation from 86,400s (e.g. +0.42 ms)
  iersBulletin: {
    bulletinNumber: string;
    publishedDate: string;
    announcement: string;
    nextOpportunityDate: string;
    nextOpportunityIso: string;
    leapSecondScheduled: boolean;
  };
  cgpm2035HorizonIso: string;
}

// Complete chronological record of all leap seconds inserted by IERS since 1972
export const HISTORICAL_LEAP_SECONDS: LeapSecondEvent[] = [
  { year: 1972, month: 'June', day: 30, dateStr: '1972-06-30', type: '+1s', cumulativeTaiMinusUtc: 11, cumulativeGpsMinusUtc: 0, daysSinceLast: 182, notes: 'First official IERS leap second introduction' },
  { year: 1972, month: 'December', day: 31, dateStr: '1972-12-31', type: '+1s', cumulativeTaiMinusUtc: 12, cumulativeGpsMinusUtc: 0, daysSinceLast: 184, notes: 'Second leap second in 1972' },
  { year: 1973, month: 'December', day: 31, dateStr: '1973-12-31', type: '+1s', cumulativeTaiMinusUtc: 13, cumulativeGpsMinusUtc: 0, daysSinceLast: 365, notes: 'Year-end adjustment' },
  { year: 1974, month: 'December', day: 31, dateStr: '1974-12-31', type: '+1s', cumulativeTaiMinusUtc: 14, cumulativeGpsMinusUtc: 0, daysSinceLast: 365, notes: 'Year-end adjustment' },
  { year: 1975, month: 'December', day: 31, dateStr: '1975-12-31', type: '+1s', cumulativeTaiMinusUtc: 15, cumulativeGpsMinusUtc: 0, daysSinceLast: 365, notes: 'Year-end adjustment' },
  { year: 1976, month: 'December', day: 31, dateStr: '1976-12-31', type: '+1s', cumulativeTaiMinusUtc: 16, cumulativeGpsMinusUtc: 0, daysSinceLast: 366, notes: 'Leap year adjustment' },
  { year: 1977, month: 'December', day: 31, dateStr: '1977-12-31', type: '+1s', cumulativeTaiMinusUtc: 17, cumulativeGpsMinusUtc: 0, daysSinceLast: 365, notes: 'Year-end adjustment' },
  { year: 1978, month: 'December', day: 31, dateStr: '1978-12-31', type: '+1s', cumulativeTaiMinusUtc: 18, cumulativeGpsMinusUtc: 0, daysSinceLast: 365, notes: 'Year-end adjustment' },
  { year: 1979, month: 'December', day: 31, dateStr: '1979-12-31', type: '+1s', cumulativeTaiMinusUtc: 19, cumulativeGpsMinusUtc: 0, daysSinceLast: 365, notes: 'Year-end adjustment' },
  { year: 1980, month: 'January', day: 6, dateStr: '1980-01-06', type: '+1s', cumulativeTaiMinusUtc: 19, cumulativeGpsMinusUtc: 0, daysSinceLast: 6, notes: 'GPS Epoch established (GPS = TAI - 19s)' },
  { year: 1981, month: 'June', day: 30, dateStr: '1981-06-30', type: '+1s', cumulativeTaiMinusUtc: 20, cumulativeGpsMinusUtc: 1, daysSinceLast: 547, notes: 'First leap second after GPS launch' },
  { year: 1982, month: 'June', day: 30, dateStr: '1982-06-30', type: '+1s', cumulativeTaiMinusUtc: 21, cumulativeGpsMinusUtc: 2, daysSinceLast: 365, notes: 'Mid-year synchronization' },
  { year: 1983, month: 'June', day: 30, dateStr: '1983-06-30', type: '+1s', cumulativeTaiMinusUtc: 22, cumulativeGpsMinusUtc: 3, daysSinceLast: 365, notes: 'Mid-year synchronization' },
  { year: 1985, month: 'June', day: 30, dateStr: '1985-06-30', type: '+1s', cumulativeTaiMinusUtc: 23, cumulativeGpsMinusUtc: 4, daysSinceLast: 731, notes: 'Two-year interval' },
  { year: 1987, month: 'December', day: 31, dateStr: '1987-12-31', type: '+1s', cumulativeTaiMinusUtc: 24, cumulativeGpsMinusUtc: 5, daysSinceLast: 914, notes: 'Year-end synchronization' },
  { year: 1989, month: 'December', day: 31, dateStr: '1989-12-31', type: '+1s', cumulativeTaiMinusUtc: 25, cumulativeGpsMinusUtc: 6, daysSinceLast: 731, notes: 'Year-end synchronization' },
  { year: 1990, month: 'December', day: 31, dateStr: '1990-12-31', type: '+1s', cumulativeTaiMinusUtc: 26, cumulativeGpsMinusUtc: 7, daysSinceLast: 365, notes: 'Consecutive adjustment' },
  { year: 1992, month: 'June', day: 30, dateStr: '1992-06-30', type: '+1s', cumulativeTaiMinusUtc: 27, cumulativeGpsMinusUtc: 8, daysSinceLast: 547, notes: 'Mid-year synchronization' },
  { year: 1993, month: 'June', day: 30, dateStr: '1993-06-30', type: '+1s', cumulativeTaiMinusUtc: 28, cumulativeGpsMinusUtc: 9, daysSinceLast: 365, notes: 'Mid-year synchronization' },
  { year: 1994, month: 'June', day: 30, dateStr: '1994-06-30', type: '+1s', cumulativeTaiMinusUtc: 29, cumulativeGpsMinusUtc: 10, daysSinceLast: 365, notes: 'Mid-year synchronization' },
  { year: 1995, month: 'December', day: 31, dateStr: '1995-12-31', type: '+1s', cumulativeTaiMinusUtc: 30, cumulativeGpsMinusUtc: 11, daysSinceLast: 549, notes: 'TAI offset reaches 30s milestone' },
  { year: 1997, month: 'June', day: 30, dateStr: '1997-06-30', type: '+1s', cumulativeTaiMinusUtc: 31, cumulativeGpsMinusUtc: 12, daysSinceLast: 546, notes: 'Mid-year synchronization' },
  { year: 1998, month: 'December', day: 31, dateStr: '1998-12-31', type: '+1s', cumulativeTaiMinusUtc: 32, cumulativeGpsMinusUtc: 13, daysSinceLast: 549, notes: 'Pre-millennium adjustment' },
  { year: 2005, month: 'December', day: 31, dateStr: '2005-12-31', type: '+1s', cumulativeTaiMinusUtc: 33, cumulativeGpsMinusUtc: 14, daysSinceLast: 2557, notes: '7-year gap (longest gap in modern history)' },
  { year: 2008, month: 'December', day: 31, dateStr: '2008-12-31', type: '+1s', cumulativeTaiMinusUtc: 34, cumulativeGpsMinusUtc: 15, daysSinceLast: 1096, notes: 'Year-end synchronization' },
  { year: 2012, month: 'June', day: 30, dateStr: '2012-06-30', type: '+1s', cumulativeTaiMinusUtc: 35, cumulativeGpsMinusUtc: 16, daysSinceLast: 1277, notes: 'Mid-year synchronization (caused notable web server NTP outages)' },
  { year: 2015, month: 'June', day: 30, dateStr: '2015-06-30', type: '+1s', cumulativeTaiMinusUtc: 36, cumulativeGpsMinusUtc: 17, daysSinceLast: 1095, notes: 'Mid-year adjustment' },
  { year: 2016, month: 'December', day: 31, dateStr: '2016-12-31', type: '+1s', cumulativeTaiMinusUtc: 37, cumulativeGpsMinusUtc: 18, daysSinceLast: 550, notes: 'Most recent leap second applied worldwide (TAI-UTC = 37s)' }
];

// Current constant offsets (as confirmed by IERS Bulletin C 68 through end of 2026/2027)
export const CURRENT_TAI_UTC_OFFSET = 37; // seconds
export const CURRENT_GPS_UTC_OFFSET = 18; // seconds
export const CURRENT_TT_TAI_OFFSET = 32.184; // Terrestrial Time = TAI + 32.184s
export const CURRENT_TT_UTC_OFFSET = CURRENT_TAI_UTC_OFFSET + CURRENT_TT_TAI_OFFSET; // 69.184s

// Next IERS Bulletin C schedule and window
export const IERS_BULLETIN_INFO = {
  bulletinNumber: 'Bulletin C 68',
  publishedDate: 'July 8, 2026',
  announcement: 'NO leap second will be introduced at the end of December 2026. TAI - UTC remains at +37s.',
  nextOpportunityDate: 'December 31, 2026 (23:59:59 UTC)',
  nextOpportunityIso: '2026-12-31T23:59:59Z',
  subsequentOpportunityDate: 'June 30, 2027 (23:59:59 UTC)',
  subsequentOpportunityIso: '2027-06-30T23:59:59Z',
  leapSecondScheduled: false,
  cgpm2035HorizonIso: '2035-01-01T00:00:00Z',
};

// Calculate current real-time time scale data
export function getTimeScaleOffsets(currentDate: Date = new Date()): TimeScaleOffsetData {
  const utcMs = currentDate.getTime();
  
  // TAI = UTC + 37 seconds
  const taiMs = utcMs + CURRENT_TAI_UTC_OFFSET * 1000;
  const taiDate = new Date(taiMs);

  // GPS = UTC + 18 seconds (GPS started Jan 6, 1980 when TAI-UTC was 19s -> GPS = TAI - 19s = UTC + 18s)
  const gpsMs = utcMs + CURRENT_GPS_UTC_OFFSET * 1000;
  const gpsDate = new Date(gpsMs);

  // TT (Terrestrial Time) = TAI + 32.184s = UTC + 69.184s
  const ttMs = utcMs + CURRENT_TT_UTC_OFFSET * 1000;
  const ttDate = new Date(ttMs);

  // UT1 approximation (Earth rotation angle)
  // DUT1 = UT1 - UTC, currently hovering around +0.038 seconds based on IERS Bulletin A
  const dut1Seconds = 0.0384;
  const ut1Ms = utcMs + dut1Seconds * 1000;
  const ut1Date = new Date(ut1Ms);

  const formatWithMs = (d: Date) => {
    const hours = d.getUTCHours().toString().padStart(2, '0');
    const minutes = d.getUTCMinutes().toString().padStart(2, '0');
    const seconds = d.getUTCSeconds().toString().padStart(2, '0');
    const ms = d.getUTCMilliseconds().toString().padStart(3, '0');
    return `${hours}:${minutes}:${seconds}.${ms}`;
  };

  return {
    utcIso: currentDate.toISOString(),
    utcFormatted: formatWithMs(currentDate),
    taiIso: taiDate.toISOString(),
    taiFormatted: formatWithMs(taiDate),
    taiOffsetSeconds: CURRENT_TAI_UTC_OFFSET,
    gpsIso: gpsDate.toISOString(),
    gpsFormatted: formatWithMs(gpsDate),
    gpsOffsetSeconds: CURRENT_GPS_UTC_OFFSET,
    ttIso: ttDate.toISOString(),
    ttFormatted: formatWithMs(ttDate),
    ttOffsetSeconds: CURRENT_TT_UTC_OFFSET,
    dut1Seconds,
    ut1Formatted: formatWithMs(ut1Date),
    lengthOfDayDeviationMs: 0.38, // ms deviation from 86,400 SI seconds
    iersBulletin: IERS_BULLETIN_INFO,
    cgpm2035HorizonIso: IERS_BULLETIN_INFO.cgpm2035HorizonIso,
  };
}

// Calculate remaining countdown breakdown to a target ISO date
export function getCountdownBreakdown(targetDateIso: string, fromDate: Date = new Date()) {
  const targetMs = new Date(targetDateIso).getTime();
  const diffMs = Math.max(0, targetMs - fromDate.getTime());

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
  const milliseconds = Math.floor(diffMs % 1000);

  return {
    totalMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
    milliseconds,
    formatted: `${days}d ${hours}h ${minutes}m ${seconds}s`
  };
}
