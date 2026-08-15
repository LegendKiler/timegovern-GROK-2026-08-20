import { PublicHoliday } from '../types';

/**
 * Calculate Easter Sunday date for a given year (Meeus/Jones/Butcher algorithm)
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * L) / 451);
  const month = Math.floor((h + L - 7 * m + 114) / 31);
  const day = ((h + L - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Get Nth weekday of a month (e.g. 4th Thursday of November)
 */
export function getNthWeekdayOfMonth(year: number, monthZeroBased: number, weekdayZeroSunday: number, nth: number): Date {
  const date = new Date(year, monthZeroBased, 1);
  let count = 0;
  while (date.getMonth() === monthZeroBased) {
    if (date.getDay() === weekdayZeroSunday) {
      count++;
      if (count === nth) return new Date(date);
    }
    date.setDate(date.getDate() + 1);
  }
  return new Date(year, monthZeroBased, 1);
}

/**
 * Get last weekday of a month (e.g. Last Monday of May)
 */
export function getLastWeekdayOfMonth(year: number, monthZeroBased: number, weekdayZeroSunday: number): Date {
  const date = new Date(year, monthZeroBased + 1, 0); // last day of month
  while (date.getDay() !== weekdayZeroSunday) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

const pad = (n: number) => n.toString().padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export function getPublicHolidaysForCountry(countryCode: string, year: number): PublicHoliday[] {
  const holidays: PublicHoliday[] = [];

  // Universal New Year's Day
  holidays.push({
    date: `${year}-01-01`,
    name: "New Year's Day",
    countryCode,
    type: 'NATIONAL'
  });

  const easter = getEasterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);

  if (countryCode === 'US') {
    // MLK Day: 3rd Monday in Jan
    const mlk = getNthWeekdayOfMonth(year, 0, 1, 3);
    holidays.push({ date: toIso(mlk), name: 'Martin Luther King Jr. Day', countryCode: 'US', type: 'NATIONAL' });

    // Washington's Birthday (Presidents' Day): 3rd Monday in Feb
    const pres = getNthWeekdayOfMonth(year, 1, 1, 3);
    holidays.push({ date: toIso(pres), name: "Presidents' Day", countryCode: 'US', type: 'NATIONAL' });

    // Memorial Day: Last Monday in May
    const mem = getLastWeekdayOfMonth(year, 4, 1);
    holidays.push({ date: toIso(mem), name: 'Memorial Day', countryCode: 'US', type: 'NATIONAL' });

    // Juneteenth
    holidays.push({ date: `${year}-06-19`, name: 'Juneteenth National Independence Day', countryCode: 'US', type: 'NATIONAL' });

    // Independence Day
    holidays.push({ date: `${year}-07-04`, name: 'Independence Day', countryCode: 'US', type: 'NATIONAL' });

    // Labor Day: 1st Monday in Sep
    const labor = getNthWeekdayOfMonth(year, 8, 1, 1);
    holidays.push({ date: toIso(labor), name: 'Labor Day', countryCode: 'US', type: 'NATIONAL' });

    // Columbus Day / Indigenous Peoples' Day: 2nd Monday in Oct
    const columbus = getNthWeekdayOfMonth(year, 9, 1, 2);
    holidays.push({ date: toIso(columbus), name: "Columbus Day / Indigenous Peoples' Day", countryCode: 'US', type: 'NATIONAL' });

    // Veterans Day
    holidays.push({ date: `${year}-11-11`, name: 'Veterans Day', countryCode: 'US', type: 'NATIONAL' });

    // Thanksgiving: 4th Thursday in Nov
    const thx = getNthWeekdayOfMonth(year, 10, 4, 4);
    holidays.push({ date: toIso(thx), name: 'Thanksgiving Day', countryCode: 'US', type: 'NATIONAL' });

    // Christmas
    holidays.push({ date: `${year}-12-25`, name: 'Christmas Day', countryCode: 'US', type: 'NATIONAL' });
  } else if (countryCode === 'GB') {
    holidays.push({ date: toIso(goodFriday), name: 'Good Friday', countryCode: 'GB', type: 'NATIONAL' });
    holidays.push({ date: toIso(easterMonday), name: 'Easter Monday', countryCode: 'GB', type: 'NATIONAL' });

    // Early May Bank Holiday: 1st Monday in May
    const mayBank = getNthWeekdayOfMonth(year, 4, 1, 1);
    holidays.push({ date: toIso(mayBank), name: 'Early May Bank Holiday', countryCode: 'GB', type: 'NATIONAL' });

    // Spring Bank Holiday: Last Monday in May
    const springBank = getLastWeekdayOfMonth(year, 4, 1);
    holidays.push({ date: toIso(springBank), name: 'Spring Bank Holiday', countryCode: 'GB', type: 'NATIONAL' });

    // Summer Bank Holiday: Last Monday in August
    const summerBank = getLastWeekdayOfMonth(year, 7, 1);
    holidays.push({ date: toIso(summerBank), name: 'Summer Bank Holiday', countryCode: 'GB', type: 'NATIONAL' });

    holidays.push({ date: `${year}-12-25`, name: 'Christmas Day', countryCode: 'GB', type: 'NATIONAL' });
    holidays.push({ date: `${year}-12-26`, name: 'Boxing Day', countryCode: 'GB', type: 'NATIONAL' });
  } else if (countryCode === 'CA') {
    holidays.push({ date: toIso(goodFriday), name: 'Good Friday', countryCode: 'CA', type: 'NATIONAL' });
    const victoria = getLastWeekdayOfMonth(year, 4, 1); // Victoria Day
    holidays.push({ date: toIso(victoria), name: 'Victoria Day', countryCode: 'CA', type: 'NATIONAL' });
    holidays.push({ date: `${year}-07-01`, name: 'Canada Day', countryCode: 'CA', type: 'NATIONAL' });
    const caLabor = getNthWeekdayOfMonth(year, 8, 1, 1);
    holidays.push({ date: toIso(caLabor), name: 'Labour Day', countryCode: 'CA', type: 'NATIONAL' });
    const caThx = getNthWeekdayOfMonth(year, 9, 1, 2); // 2nd Monday in Oct
    holidays.push({ date: toIso(caThx), name: 'Thanksgiving', countryCode: 'CA', type: 'NATIONAL' });
    holidays.push({ date: `${year}-11-11`, name: 'Remembrance Day', countryCode: 'CA', type: 'NATIONAL' });
    holidays.push({ date: `${year}-12-25`, name: 'Christmas Day', countryCode: 'CA', type: 'NATIONAL' });
  } else {
    // Default holidays for JP, DE, FR, AU, IN, etc.
    holidays.push({ date: toIso(goodFriday), name: 'Good Friday', countryCode, type: 'OBSERVANCE' });
    holidays.push({ date: `${year}-05-01`, name: 'International Workers\' Day', countryCode, type: 'NATIONAL' });
    holidays.push({ date: `${year}-12-25`, name: 'Christmas Day', countryCode, type: 'NATIONAL' });
  }

  return holidays.sort((a, b) => a.date.localeCompare(b.date));
}
