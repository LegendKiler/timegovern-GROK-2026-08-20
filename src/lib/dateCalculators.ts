import { getPublicHolidaysForCountry } from './holidayData';

export interface DateDiffResult {
  totalDays: number;
  years: number;
  months: number;
  days: number;
  totalWeeks: number;
  exactWeeks: number;
  weeksAndDays: { weeks: number; days: number };
  totalHours: number;
  totalMinutes: number;
  businessDays: number;
  weekendDaysCount: number;
  holidaysCount: number;
  workingHours: number;
  holidaysList: { name: string; date: string; type: string }[];
}

/**
 * Calculate difference between two dates with high detail
 */
export function calculateDaysBetweenDates(
  startDate: Date,
  endDate: Date,
  countryCode = 'US',
  weekendDays: number[] = [0, 6], // 0=Sun, 6=Sat
  excludeHolidays = false,
  includeEndDate = true
): DateDiffResult {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  const isReverse = end < start;
  const d1 = isReverse ? end : start;
  const d2 = isReverse ? start : end;

  // Base difference in ms
  const totalTimeMs = d2.getTime() - d1.getTime();
  let rawDays = Math.round(totalTimeMs / 86400000);
  
  if (includeEndDate && rawDays >= 0) {
    rawDays += 1;
  }

  const totalDays = Math.max(0, rawDays);

  // Breakdown years, months, days
  let years = d2.getFullYear() - d1.getFullYear();
  let months = d2.getMonth() - d1.getMonth();
  let days = d2.getDate() - d1.getDate();

  if (days < 0) {
    months--;
    const prevMonthLastDay = new Date(d2.getFullYear(), d2.getMonth(), 0).getDate();
    days += prevMonthLastDay;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  // Calculate Business days & Weekend counts
  let businessDays = 0;
  let weekendDaysCount = 0;
  let holidaysCount = 0;
  const holidaysList: { name: string; date: string; type: string }[] = [];

  const holidaysMap = new Map<string, { name: string; date: string; type: string }>();
  if (excludeHolidays) {
    for (let y = d1.getFullYear(); y <= d2.getFullYear(); y++) {
      const hList = getPublicHolidaysForCountry(countryCode, y);
      hList.forEach((h) => holidaysMap.set(h.date, h));
    }
  }

  const curr = new Date(d1);
  const targetEnd = new Date(d2);
  if (!includeEndDate) {
    targetEnd.setDate(targetEnd.getDate() - 1);
  }

  while (curr <= targetEnd) {
    const dayOfWeek = curr.getDay();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const isoDateStr = `${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`;

    const isWeekend = weekendDays.includes(dayOfWeek);
    const holidayInfo = excludeHolidays ? holidaysMap.get(isoDateStr) : undefined;

    if (isWeekend) {
      weekendDaysCount++;
    } else if (holidayInfo) {
      holidaysCount++;
      holidaysList.push(holidayInfo);
    } else {
      businessDays++;
    }

    curr.setDate(curr.getDate() + 1);
  }

  const exactWeeks = totalDays > 0 ? Number((totalDays / 7).toFixed(2)) : 0;
  const fullWeeks = Math.floor(totalDays / 7);
  const remainderDays = totalDays % 7;

  return {
    totalDays: isReverse ? -totalDays : totalDays,
    years: isReverse ? -years : years,
    months: isReverse ? -months : months,
    days: isReverse ? -days : days,
    totalWeeks: fullWeeks,
    exactWeeks,
    weeksAndDays: { weeks: fullWeeks, days: remainderDays },
    totalHours: totalDays * 24,
    totalMinutes: totalDays * 1440,
    businessDays,
    weekendDaysCount,
    holidaysCount,
    workingHours: businessDays * 8,
    holidaysList
  };
}

/**
 * Add or subtract days, weeks, months, years to a target date
 */
export function addDurationToDate(
  baseDate: Date,
  amount: number,
  unit: 'days' | 'weeks' | 'months' | 'years' | 'businessDays',
  weekendDays: number[] = [0, 6],
  countryCode = 'US'
): Date {
  const result = new Date(baseDate);

  if (unit === 'days') {
    result.setDate(result.getDate() + amount);
  } else if (unit === 'weeks') {
    result.setDate(result.getDate() + amount * 7);
  } else if (unit === 'months') {
    result.setMonth(result.getMonth() + amount);
  } else if (unit === 'years') {
    result.setFullYear(result.getFullYear() + amount);
  } else if (unit === 'businessDays') {
    let added = 0;
    const step = amount >= 0 ? 1 : -1;
    const target = Math.abs(amount);

    while (added < target) {
      result.setDate(result.getDate() + step);
      const isWeekend = weekendDays.includes(result.getDay());
      if (!isWeekend) {
        added++;
      }
    }
  }

  return result;
}
