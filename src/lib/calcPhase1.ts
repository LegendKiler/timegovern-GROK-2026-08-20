/**
 * Phase 1 calculator pure functions (A1–A4).
 * Client-side only — no network required.
 */

export function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** A1 — calendar difference (end exclusive of time-of-day; date-only) */
export function dateDifference(startIso: string, endIso: string) {
  const start = parseLocalDate(startIso);
  const end = parseLocalDate(endIso);
  const ms = end.getTime() - start.getTime();
  const sign = ms < 0 ? -1 : 1;
  const absMs = Math.abs(ms);
  const totalDays = Math.round(absMs / 86400000);
  const weeks = Math.floor(totalDays / 7);
  const remDays = totalDays % 7;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;

  // Approximate Y/M/D breakdown walking months
  let y = 0;
  let mo = 0;
  let d = 0;
  const a = new Date(Math.min(start.getTime(), end.getTime()));
  const b = new Date(Math.max(start.getTime(), end.getTime()));
  y = b.getFullYear() - a.getFullYear();
  mo = b.getMonth() - a.getMonth();
  d = b.getDate() - a.getDate();
  if (d < 0) {
    mo -= 1;
    const prev = new Date(b.getFullYear(), b.getMonth(), 0);
    d += prev.getDate();
  }
  if (mo < 0) {
    y -= 1;
    mo += 12;
  }

  return {
    sign,
    totalDays: sign * totalDays,
    absDays: totalDays,
    weeks,
    remDays,
    totalHours: sign * totalHours,
    totalMinutes: sign * totalMinutes,
    years: y,
    months: mo,
    daysPart: d,
    startWeekday: start.toLocaleDateString('en-US', { weekday: 'long' }),
    endWeekday: end.toLocaleDateString('en-US', { weekday: 'long' }),
  };
}

/** A2 — add/subtract days, weeks, months, years */
export function addToDate(
  startIso: string,
  amount: number,
  unit: 'days' | 'weeks' | 'months' | 'years'
): string {
  const d = parseLocalDate(startIso);
  if (unit === 'days') d.setDate(d.getDate() + amount);
  else if (unit === 'weeks') d.setDate(d.getDate() + amount * 7);
  else if (unit === 'months') d.setMonth(d.getMonth() + amount);
  else if (unit === 'years') d.setFullYear(d.getFullYear() + amount);
  return toISODate(d);
}

function isWeekend(d: Date, weekend: 'sat-sun' | 'fri-sat'): boolean {
  const day = d.getDay(); // 0 Sun .. 6 Sat
  if (weekend === 'fri-sat') return day === 5 || day === 6;
  return day === 0 || day === 6;
}

/** A3 — count business days between two dates (inclusive of start, exclusive of end by default) */
export function countBusinessDays(
  startIso: string,
  endIso: string,
  weekend: 'sat-sun' | 'fri-sat' = 'sat-sun',
  inclusiveEnd = false
): number {
  const start = parseLocalDate(startIso);
  const end = parseLocalDate(endIso);
  if (end < start) return -countBusinessDays(endIso, startIso, weekend, inclusiveEnd);

  let count = 0;
  const cur = new Date(start);
  const last = new Date(end);
  if (!inclusiveEnd) last.setDate(last.getDate() - 1);

  while (cur <= last) {
    if (!isWeekend(cur, weekend)) count += 1;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

/** A3 — add N business days to a start date */
export function addBusinessDays(
  startIso: string,
  businessDays: number,
  weekend: 'sat-sun' | 'fri-sat' = 'sat-sun'
): string {
  const d = parseLocalDate(startIso);
  const step = businessDays >= 0 ? 1 : -1;
  let left = Math.abs(businessDays);
  while (left > 0) {
    d.setDate(d.getDate() + step);
    if (!isWeekend(d, weekend)) left -= 1;
  }
  return toISODate(d);
}

/** A4 — convert a local wall time in one IANA zone to another */
export function convertBetweenZones(
  dateIso: string,
  timeHm: string,
  fromTz: string,
  toTz: string
): { fromLabel: string; toLabel: string; utcIso: string; offsetFrom: string; offsetTo: string } {
  const [hh, mm] = timeHm.split(':').map((x) => parseInt(x, 10) || 0);
  // Interpret date+time as wall clock in fromTz via iterative offset (Intl)
  const utcGuess = new Date(`${dateIso}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00Z`);

  // Refine: format utcGuess in fromTz and adjust difference
  const asInFrom = (d: Date) => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: fromTz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(d);
    const g = (t: string) => parts.find((p) => p.type === t)?.value || '0';
    return {
      y: parseInt(g('year'), 10),
      mo: parseInt(g('month'), 10),
      d: parseInt(g('day'), 10),
      h: parseInt(g('hour'), 10) % 24,
      mi: parseInt(g('minute'), 10),
    };
  };

  let instant = utcGuess;
  for (let i = 0; i < 3; i++) {
    const p = asInFrom(instant);
    const [ty, tm, td] = dateIso.split('-').map(Number);
    const wanted = Date.UTC(ty, tm - 1, td, hh, mm, 0);
    const got = Date.UTC(p.y, p.mo - 1, p.d, p.h, p.mi, 0);
    instant = new Date(instant.getTime() + (wanted - got));
  }

  const fmt = (tz: string) =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short',
    }).format(instant);

  const offsetOf = (tz: string) => {
    const s = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
      hour: '2-digit',
    }).formatToParts(instant);
    return s.find((p) => p.type === 'timeZoneName')?.value || '';
  };

  return {
    fromLabel: fmt(fromTz),
    toLabel: fmt(toTz),
    utcIso: instant.toISOString(),
    offsetFrom: offsetOf(fromTz),
    offsetTo: offsetOf(toTz),
  };
}

export function formatInTz(date: Date, tz: string, opts: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, ...opts }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', opts).format(date);
  }
}
