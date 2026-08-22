import { TimezoneOffsetInfo } from '../types';

export function getTimeInTimezone(date: Date, timeZone: string): Date {
  try {
    const isoString = date.toLocaleString('en-US', { timeZone, hour12: false });
    return new Date(isoString);
  } catch (e) {
    return date;
  }
}

export function getTimezoneOffsetInfo(date: Date, timeZone: string): TimezoneOffsetInfo {
  let offsetMinutes = 0;
  let isDst = false;
  let abbreviation = 'UTC';

  try {
    const nowUtcStr = date.toLocaleString('en-US', { timeZone: 'UTC' });
    const nowTzStr = date.toLocaleString('en-US', { timeZone });
    const dateUtc = new Date(nowUtcStr);
    const dateTz = new Date(nowTzStr);
    offsetMinutes = Math.round((dateTz.getTime() - dateUtc.getTime()) / (60 * 1000));

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short'
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    if (tzPart) {
      abbreviation = tzPart.value;
    }

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

  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const offsetFormatted = `UTC${sign}${pad(hours)}:${pad(mins)}`;

  let nextTransition;
  if (isDst) {
    const checkYear = date.getFullYear();
    const estNext = new Date(checkYear, date.getMonth() < 6 ? 10 : 3, 1);
    nextTransition = {
      date: estNext,
      type: 'DST_END' as const,
      newOffsetFormatted: `UTC${offsetMinutes - 60 >= 0 ? '+' : ''}${Math.floor((offsetMinutes - 60) / 60)}:00`
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

export function formatCityDateTime(
  date: Date,
  timeZone: string,
  includeSeconds = true,
  hour12 = true
): {
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
      hour12
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

export function getHourSuitability(hour: number): 'WORK_HOURS' | 'SHOULDER_HOURS' | 'SLEEP_HOURS' {
  if (hour >= 8 && hour < 18) {
    return 'WORK_HOURS';
  }
  if ((hour >= 7 && hour < 8) || (hour >= 18 && hour < 22)) {
    return 'SHOULDER_HOURS';
  }
  return 'SLEEP_HOURS';
}

export function encodeSharedEvent(title: string, utcTimestamp: number, originCityId: string): string {
  const payload = { t: title, ts: utcTimestamp, c: originCityId };
  return btoa(JSON.stringify(payload));
}

export function decodeSharedEvent(
  encoded: string
): { title: string; utcTimestamp: number; originCityId: string } | null {
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
