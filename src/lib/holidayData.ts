import { PublicHoliday } from '../types';

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

export function getLastWeekdayOfMonth(year: number, monthZeroBased: number, weekdayZeroSunday: number): Date {
  const date = new Date(year, monthZeroBased + 1, 0);
  while (date.getDay() !== weekdayZeroSunday) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

const pad = (n: number) => n.toString().padStart(2, '0');
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function H(date: string, name: string, countryCode: string): PublicHoliday {
  return { date, name, countryCode, type: 'NATIONAL' };
}

/** Countries shown in Calendar holiday dropdown (P0 expansion). */
export const HOLIDAY_COUNTRY_OPTIONS: { code: string; name: string }[] = [
  { code: 'AU', name: 'Australia' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'IE', name: 'Ireland' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'SG', name: 'Singapore' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'TH', name: 'Thailand' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'EG', name: 'Egypt' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'IL', name: 'Israel' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
].filter((v, i, a) => a.findIndex((x) => x.code === v.code) === i)
 .sort((a, b) => a.name.localeCompare(b.name));

export function getPublicHolidaysForCountry(countryCode: string, year: number): PublicHoliday[] {
  const cc = (countryCode || 'AU').toUpperCase();
  const holidays: PublicHoliday[] = [];
  holidays.push(H(`${year}-01-01`, "New Year's Day", cc));

  const easter = getEasterSunday(year);
  const goodFriday = new Date(easter); goodFriday.setDate(easter.getDate() - 2);
  const easterMonday = new Date(easter); easterMonday.setDate(easter.getDate() + 1);

  const pushEaster = () => {
    holidays.push(H(toIso(goodFriday), 'Good Friday', cc));
    holidays.push(H(toIso(easter), 'Easter Sunday', cc));
    holidays.push(H(toIso(easterMonday), 'Easter Monday', cc));
  };

  // --- Core detailed sets ---
  if (cc === 'US') {
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 0, 1, 3)), 'Martin Luther King Jr. Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 1, 1, 3)), "Presidents' Day", cc));
    holidays.push(H(toIso(getLastWeekdayOfMonth(year, 4, 1)), 'Memorial Day', cc));
    holidays.push(H(`${year}-06-19`, 'Juneteenth', cc));
    holidays.push(H(`${year}-07-04`, 'Independence Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 8, 1, 1)), 'Labor Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 9, 1, 2)), 'Columbus Day', cc));
    holidays.push(H(`${year}-11-11`, 'Veterans Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 10, 4, 4)), 'Thanksgiving Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else if (cc === 'GB') {
    pushEaster();
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 4, 1, 1)), 'Early May Bank Holiday', cc));
    holidays.push(H(toIso(getLastWeekdayOfMonth(year, 4, 1)), 'Spring Bank Holiday', cc));
    holidays.push(H(toIso(getLastWeekdayOfMonth(year, 7, 1)), 'Summer Bank Holiday', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
    holidays.push(H(`${year}-12-26`, 'Boxing Day', cc));
  } else if (cc === 'CA') {
    holidays.push(H(toIso(goodFriday), 'Good Friday', cc));
    holidays.push(H(toIso(getLastWeekdayOfMonth(year, 4, 1)), 'Victoria Day', cc));
    holidays.push(H(`${year}-07-01`, 'Canada Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 8, 1, 1)), 'Labour Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 9, 1, 2)), 'Thanksgiving', cc));
    holidays.push(H(`${year}-11-11`, 'Remembrance Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
    holidays.push(H(`${year}-12-26`, 'Boxing Day', cc));
  } else if (cc === 'AU') {
    pushEaster();
    holidays.push(H(`${year}-01-26`, 'Australia Day', cc));
    holidays.push(H(`${year}-04-25`, 'ANZAC Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 5, 1, 2)), "Queen's Birthday (approx.)", cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
    holidays.push(H(`${year}-12-26`, 'Boxing Day', cc));
  } else if (cc === 'NZ') {
    pushEaster();
    holidays.push(H(`${year}-02-06`, 'Waitangi Day', cc));
    holidays.push(H(`${year}-04-25`, 'ANZAC Day', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 5, 1, 1)), "King's Birthday", cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 9, 1, 4)), 'Labour Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
    holidays.push(H(`${year}-12-26`, 'Boxing Day', cc));
  } else if (cc === 'IE') {
    pushEaster();
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 1, 1, 1)), "St Brigid's Day / Feb holiday", cc));
    holidays.push(H(`${year}-03-17`, "St Patrick's Day", cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 4, 1, 1)), 'May Bank Holiday', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 5, 1, 1)), 'June Bank Holiday', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 7, 1, 1)), 'August Bank Holiday', cc));
    holidays.push(H(toIso(getNthWeekdayOfMonth(year, 9, 1, 1)), 'October Bank Holiday', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
    holidays.push(H(`${year}-12-26`, "St Stephen's Day", cc));
  } else if (cc === 'DE' || cc === 'AT' || cc === 'CH') {
    pushEaster();
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    const asc = new Date(easter); asc.setDate(easter.getDate() + 39);
    holidays.push(H(toIso(asc), 'Ascension Day', cc));
    const whit = new Date(easter); whit.setDate(easter.getDate() + 50);
    holidays.push(H(toIso(whit), 'Whit Monday', cc));
    if (cc === 'DE') holidays.push(H(`${year}-10-03`, 'German Unity Day', cc));
    if (cc === 'AT') holidays.push(H(`${year}-10-26`, 'National Day', cc));
    if (cc === 'CH') holidays.push(H(`${year}-08-01`, 'Swiss National Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
    holidays.push(H(`${year}-12-26`, "St Stephen's Day", cc));
  } else if (cc === 'FR') {
    pushEaster();
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    holidays.push(H(`${year}-05-08`, 'Victory in Europe Day', cc));
    const asc = new Date(easter); asc.setDate(easter.getDate() + 39);
    holidays.push(H(toIso(asc), 'Ascension Day', cc));
    holidays.push(H(`${year}-07-14`, 'Bastille Day', cc));
    holidays.push(H(`${year}-08-15`, 'Assumption', cc));
    holidays.push(H(`${year}-11-01`, "All Saints' Day", cc));
    holidays.push(H(`${year}-11-11`, 'Armistice Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else if (cc === 'ES' || cc === 'IT' || cc === 'PT' || cc === 'PL' || cc === 'NL' || cc === 'BE') {
    pushEaster();
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    if (cc === 'ES') holidays.push(H(`${year}-10-12`, 'National Day', cc));
    if (cc === 'IT') holidays.push(H(`${year}-06-02`, 'Republic Day', cc));
    if (cc === 'PT') holidays.push(H(`${year}-06-10`, 'Portugal Day', cc));
    if (cc === 'PL') holidays.push(H(`${year}-05-03`, 'Constitution Day', cc));
    if (cc === 'NL') holidays.push(H(`${year}-04-27`, "King's Day", cc));
    if (cc === 'BE') holidays.push(H(`${year}-07-21`, 'Belgian National Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else if (cc === 'SE' || cc === 'NO' || cc === 'DK' || cc === 'FI') {
    pushEaster();
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    if (cc === 'SE') holidays.push(H(`${year}-06-06`, 'National Day', cc));
    if (cc === 'NO') holidays.push(H(`${year}-05-17`, 'Constitution Day', cc));
    if (cc === 'DK') holidays.push(H(`${year}-06-05`, 'Constitution Day', cc));
    if (cc === 'FI') holidays.push(H(`${year}-12-06`, 'Independence Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
    holidays.push(H(`${year}-12-26`, 'Boxing Day', cc));
  } else if (cc === 'JP') {
    holidays.push(H(`${year}-02-11`, 'National Foundation Day', cc));
    holidays.push(H(`${year}-04-29`, 'Showa Day', cc));
    holidays.push(H(`${year}-05-03`, 'Constitution Memorial Day', cc));
    holidays.push(H(`${year}-05-04`, 'Greenery Day', cc));
    holidays.push(H(`${year}-05-05`, "Children's Day", cc));
    holidays.push(H(`${year}-11-03`, 'Culture Day', cc));
    holidays.push(H(`${year}-11-23`, 'Labour Thanksgiving Day', cc));
    holidays.push(H(`${year}-12-23`, "Emperor's Birthday (approx.)", cc));
  } else if (cc === 'IN') {
    holidays.push(H(`${year}-01-26`, 'Republic Day', cc));
    holidays.push(H(`${year}-08-15`, 'Independence Day', cc));
    holidays.push(H(`${year}-10-02`, 'Gandhi Jayanti', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else if (cc === 'CN' || cc === 'HK' || cc === 'TW' || cc === 'KR' || cc === 'SG' || cc === 'MY' || cc === 'TH' || cc === 'ID' || cc === 'PH' || cc === 'VN') {
    if (cc === 'CN' || cc === 'HK' || cc === 'TW') holidays.push(H(`${year}-10-01`, 'National Day', cc));
    if (cc === 'KR') holidays.push(H(`${year}-03-01`, 'Independence Movement Day', cc));
    if (cc === 'KR') holidays.push(H(`${year}-08-15`, 'Liberation Day', cc));
    if (cc === 'SG') holidays.push(H(`${year}-08-09`, 'National Day', cc));
    if (cc === 'MY') holidays.push(H(`${year}-08-31`, 'National Day', cc));
    if (cc === 'TH') holidays.push(H(`${year}-12-05`, "King's Birthday (approx.)", cc));
    if (cc === 'ID') holidays.push(H(`${year}-08-17`, 'Independence Day', cc));
    if (cc === 'PH') holidays.push(H(`${year}-06-12`, 'Independence Day', cc));
    if (cc === 'VN') holidays.push(H(`${year}-09-02`, 'National Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else if (cc === 'AE' || cc === 'SA') {
    if (cc === 'AE') holidays.push(H(`${year}-12-02`, 'National Day', cc));
    if (cc === 'SA') holidays.push(H(`${year}-09-23`, 'National Day', cc));
  } else if (cc === 'ZA' || cc === 'NG' || cc === 'KE' || cc === 'EG') {
    if (cc === 'ZA') {
      holidays.push(H(`${year}-03-21`, 'Human Rights Day', cc));
      holidays.push(H(`${year}-04-27`, 'Freedom Day', cc));
      holidays.push(H(`${year}-05-01`, "Workers' Day", cc));
      holidays.push(H(`${year}-06-16`, 'Youth Day', cc));
      holidays.push(H(`${year}-12-16`, 'Day of Reconciliation', cc));
    }
    if (cc === 'NG') holidays.push(H(`${year}-10-01`, 'Independence Day', cc));
    if (cc === 'KE') holidays.push(H(`${year}-12-12`, 'Jamhuri Day', cc));
    if (cc === 'EG') holidays.push(H(`${year}-07-23`, 'Revolution Day', cc));
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else if (cc === 'BR' || cc === 'MX' || cc === 'AR' || cc === 'CL' || cc === 'CO') {
    if (cc === 'BR') holidays.push(H(`${year}-09-07`, 'Independence Day', cc));
    if (cc === 'MX') holidays.push(H(`${year}-09-16`, 'Independence Day', cc));
    if (cc === 'AR') holidays.push(H(`${year}-05-25`, 'May Revolution', cc));
    if (cc === 'CL') holidays.push(H(`${year}-09-18`, 'Independence Day', cc));
    if (cc === 'CO') holidays.push(H(`${year}-07-20`, 'Independence Day', cc));
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else if (cc === 'TR' || cc === 'IL' || cc === 'RU' || cc === 'UA' || cc === 'PK' || cc === 'BD') {
    if (cc === 'TR') holidays.push(H(`${year}-10-29`, 'Republic Day', cc));
    if (cc === 'IL') holidays.push(H(`${year}-05-14`, 'Independence Day (approx. Gregorian)', cc));
    if (cc === 'RU') holidays.push(H(`${year}-06-12`, 'Russia Day', cc));
    if (cc === 'UA') holidays.push(H(`${year}-08-24`, 'Independence Day', cc));
    if (cc === 'PK') holidays.push(H(`${year}-08-14`, 'Independence Day', cc));
    if (cc === 'BD') holidays.push(H(`${year}-03-26`, 'Independence Day', cc));
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  } else {
    // Generic baseline for any other code
    holidays.push(H(`${year}-05-01`, 'Labour Day', cc));
    holidays.push(H(`${year}-12-25`, 'Christmas Day', cc));
  }

  // Dedupe by date+name
  const seen = new Set<string>();
  return holidays
    .filter((h) => {
      const k = h.date + h.name;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
