import { TimezoneOffsetInfo } from '../types';

/**
 * Format date in a given IANA timezone safely using Intl
 */
export function getTimeInTimezone(date: Date, timeZone: string): Date {
  try {
    const isoString = date.toLocaleString('en-US', { timeZone, hour12: false });
    return new Date(isoString);
  } catch (e) {
    return date;
  }
}

/**
 * Calculate precise timezone offset, DST status, and upcoming DST transitions for any IANA timezone
 */
export function getTimezoneOffsetInfo(date: Date, timeZone: string): TimezoneOffsetInfo {
  let offsetMinutes = 0;
  let isDst = false;
  let abbreviation = 'UTC';

  try {
    // Determine offset in minutes
    const nowUtcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
    const nowTzStr = date.toLocaleString('en-US', { timeZone });
    const dateUtc = new Date(nowUtcStr);
    const dateTz = new Date(nowTzStr);
    offsetMinutes = Math.round((dateTz.getTime() - dateUtc.getTime()) / (60 * 1000));

    // Abbreviation detection
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (tzPart) {
      abbreviation = tzPart.value;
    }

    // DST Detection by comparing offset in Jan vs July
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    
    const janUtcStr = jan.toLocaleString('en-US', { timeZone: 'UTC' });
    const janTzStr = jan.toLocaleString('en-US', { timeZone });
    const janOffset = Math.round((new Date(janTzStr).getTime() - new Date(janUtcStr).getTime()) / 60000);

    const julUtcStr = jul.toLocaleString('en-US', { timeZone: 'UTC' });
    const julTzStr = jul.toLocaleString('en-US', { timeZone });
    const julOffset = Math.round((new Date(julTzStr).getTime() - new Date(julUtcStr).getTime()) / 60000);

    const maxOffset = Math.max(janOffset, julOffset);
    const minOffset = Math.min(janOffset, julOffset);

    if (maxOffset !== minOffset) {
      isDst = offsetMinutes === maxOffset;
    }
  } catch (err) {
    offsetMinutes = 0;
  }

  // Format offset string e.g. "UTC+05:30", "UTC-05:00"
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const offsetFormatted = `UTC${sign}${pad(hours)}:${pad(mins)}`;

  // Find next DST shift boundary (approximate)
  let nextTransition;
  if (isDst) {
    // If currently DST, transitions to Standard Time around Nov / April
    const checkYear = date.getFullYear();
    const estNext = new Date(checkYear, date.getMonth() < 6 ? 10 : 3, 1);
    nextTransition = {
      date: estNext,
      type: 'DST_END' as const,
      newOffsetFormatted: `UTC${offsetMinutes - 60 >= 0 ? '+' : ''}${Math.floor((offsetMinutes - 60)/60)}:00`
    };
  }

  return {
    tzId: timeZone,
    displayName: timeZone.replace('_', ' '),
    abbreviation,
    offsetMinutes,
    offsetFormatted,
    isDst,
    dstShiftMinutes: isDst ? 60 : 0,
    nextTransition
  };
}

/**
 * Format date time string in a city's local time e.g. "Sun, Jul 26, 03:25:00 PM"
 */
export function formatCityDateTime(date: Date, timeZone: string, includeSeconds = true): {
  dateStr: string;
  timeStr: string;
  fullStr: string;
  hour24: number;
} {
  try {
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);

    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: true
    }).format(date);

    const parts24 = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hour12: false
    }).formatToParts(date);
    const hourPart = parts24.find((p) => p.type === 'hour');
    const hour24 = hourPart ? parseInt(hourPart.value, 10) : date.getUTCHours();

    return {
      dateStr: dateFormatted,
      timeStr: timeFormatted,
      fullStr: `${dateFormatted} - ${timeFormatted}`,
      hour24
    };
  } catch (e) {
    return {
      dateStr: date.toDateString(),
      timeStr: date.toLocaleTimeString(),
      fullStr: date.toLocaleString(),
      hour24: date.getUTCHours()
    };
  }
}

/**
 * Classify a local hour (0-23) for meeting planning suitability:
 * - 08:00 - 17:59 -> 'WORK_HOURS' (Green)
 * - 07:00 - 07:59, 18:00 - 21:59 -> 'SHOULDER_HOURS' (Yellow)
 * - 22:00 - 06:59 -> 'SLEEP_HOURS' (Red)
 */
export function getHourSuitability(hour: number): 'WORK_HOURS' | 'SHOULDER_HOURS' | 'SLEEP_HOURS' {
  if (hour >= 8 && hour < 18) {
    return 'WORK_HOURS';
  }
  if ((hour >= 7 && hour < 8) || (hour >= 18 && hour < 22)) {
    return 'SHOULDER_HOURS';
  }
  return 'SLEEP_HOURS';
}

/**
 * Encode shared event state into a URL hash or param
 */
export function encodeSharedEvent(title: string, utcTimestamp: number, originCityId: string): string {
  const payload = { t: title, ts: utcTimestamp, c: originCityId };
  return btoa(JSON.stringify(payload));
}

export function decodeSharedEvent(encoded: string): { title: string; utcTimestamp: number; originCityId: string } | null {
  try {
    const decoded = JSON.parse(atob(encoded));
    if (decoded && decoded.ts) {
      return {
        title: decoded.t || 'Global Scheduled Event',
        utcTimestamp: decoded.ts,
        originCityId: decoded.c || 'nyc'
      };
    }
  } catch (e) {
    return null;
  }
  return null;
}
