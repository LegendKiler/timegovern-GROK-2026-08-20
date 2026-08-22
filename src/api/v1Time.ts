/**
 * TimeGovern public time API v1 — real handlers (Worker + Vite dev).
 * GET /api/v1/time | /v1/time
 * GET /api/v1/convert | /v1/convert
 */

const cors = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), { status, headers: cors });
}

function offsetForTz(date: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'longOffset',
    }).formatToParts(date);
    const name = parts.find((p) => p.type === 'timeZoneName')?.value || 'UTC';
    const m = name.match(/([+-]\d{1,2}):?(\d{2})?/);
    if (m) {
      const mm = m[2] || '00';
      return `${m[1].includes('-') || m[1].startsWith('+') ? m[1] : '+' + m[1]}:${mm}`.replace(
        /([+-])(\d):/,
        (_, s, d) => `${s}0${d}:`
      );
    }
    if (name.includes('GMT') && !name.match(/[+-]/)) return '+00:00';
    return name;
  } catch {
    return '+00:00';
  }
}

function formatInTz(date: Date, timeZone: string) {
  const local = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
  return local.replace(', ', 'T');
}

function resolveTz(params: URLSearchParams): { tz: string; source: string } | { error: string } {
  const tz = params.get('tz') || params.get('timezone') || '';
  const city = params.get('city') || '';
  if (tz) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return { tz, source: 'tz' };
    } catch {
      return { error: `Invalid IANA timezone: ${tz}` };
    }
  }
  if (city) {
    const map: Record<string, string> = {
      melbourne: 'Australia/Melbourne',
      sydney: 'Australia/Sydney',
      brisbane: 'Australia/Brisbane',
      perth: 'Australia/Perth',
      london: 'Europe/London',
      'new york': 'America/New_York',
      'new york city': 'America/New_York',
      tokyo: 'Asia/Tokyo',
      singapore: 'Asia/Singapore',
      dubai: 'Asia/Dubai',
      paris: 'Europe/Paris',
      berlin: 'Europe/Berlin',
      auckland: 'Pacific/Auckland',
      'los angeles': 'America/Los_Angeles',
      chicago: 'America/Chicago',
      mumbai: 'Asia/Kolkata',
      delhi: 'Asia/Kolkata',
      shanghai: 'Asia/Shanghai',
      'hong kong': 'Asia/Hong_Kong',
    };
    const key = city.trim().toLowerCase();
    const found = map[key];
    if (found) return { tz: found, source: 'city' };
    return { error: `Unknown city '${city}'. Pass tz=IANA (e.g. Australia/Melbourne).` };
  }
  return { tz: 'UTC', source: 'default' };
}

/** GET current time for a zone */
export function handleV1Time(request: Request): Response {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const resolved = resolveTz(url.searchParams);
  if ('error' in resolved) return json({ status: 400, error: resolved.error }, 400);

  const now = new Date();
  const { tz, source } = resolved;

  return json({
    status: 200,
    api: 'timegovern',
    version: 'v1',
    endpoint: '/api/v1/time',
    timezone_iana: tz,
    resolved_from: source,
    utc_iso: now.toISOString(),
    unix_timestamp: Math.floor(now.getTime() / 1000),
    local_iso_like: formatInTz(now, tz),
    utc_offset: offsetForTz(now, tz),
  });
}

/** GET convert time between zones */
export function handleV1Convert(request: Request): Response {
  if (request.method === 'OPTIONS') return new Response(null, { headers: cors });
  if (request.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  const url = new URL(request.url);
  const from = url.searchParams.get('from') || url.searchParams.get('from_tz') || 'UTC';
  const to = url.searchParams.get('to') || url.searchParams.get('to_tz') || 'UTC';
  const at = url.searchParams.get('at') || url.searchParams.get('datetime') || '';

  try {
    Intl.DateTimeFormat(undefined, { timeZone: from });
    Intl.DateTimeFormat(undefined, { timeZone: to });
  } catch {
    return json({ status: 400, error: 'Invalid from= or to= IANA timezone' }, 400);
  }

  let instant = new Date();
  if (at) {
    const normalized = at.includes('T') ? at : at.replace(' ', 'T');
    if (normalized.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(normalized)) {
      instant = new Date(normalized);
    } else {
      const [datePart, timePart = '00:00:00'] = normalized.split('T');
      const [yy, mm, dd] = datePart.split('-').map(Number);
      const [hh, mi, ss] = timePart.split(':').map((x) => parseInt(x, 10) || 0);
      const utcGuess = new Date(Date.UTC(yy, (mm || 1) - 1, dd || 1, hh, mi, ss));
      for (let i = 0; i < 3; i++) {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: from,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).formatToParts(utcGuess);
        const g = (t: string) => parseInt(parts.find((p) => p.type === t)?.value || '0', 10);
        const got = Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'), g('second'));
        const wanted = Date.UTC(yy, (mm || 1) - 1, dd || 1, hh, mi, ss);
        utcGuess.setTime(utcGuess.getTime() + (wanted - got));
      }
      instant = utcGuess;
    }
  }

  if (isNaN(instant.getTime())) {
    return json({ status: 400, error: 'Invalid at= datetime' }, 400);
  }

  return json({
    status: 200,
    api: 'timegovern',
    version: 'v1',
    endpoint: '/api/v1/convert',
    from_timezone: from,
    to_timezone: to,
    instant_utc: instant.toISOString(),
    from_local: formatInTz(instant, from),
    to_local: formatInTz(instant, to),
    from_offset: offsetForTz(instant, from),
    to_offset: offsetForTz(instant, to),
    unix_timestamp: Math.floor(instant.getTime() / 1000),
  });
}

export function isV1TimePath(pathname: string): boolean {
  return (
    pathname === '/api/v1/time' ||
    pathname === '/api/v1/time/' ||
    pathname === '/v1/time' ||
    pathname === '/v1/time/'
  );
}

export function isV1ConvertPath(pathname: string): boolean {
  return (
    pathname === '/api/v1/convert' ||
    pathname === '/api/v1/convert/' ||
    pathname === '/v1/convert' ||
    pathname === '/v1/convert/'
  );
}

/** Node/Vite middleware helper */
export async function handleV1TimeNode(
  pathname: string,
  search: string,
  method: string
): Promise<{ status: number; body: string } | null> {
  const url = `http://local${pathname}${search}`;
  const req = new Request(url, { method });
  if (isV1TimePath(pathname)) {
    const res = handleV1Time(req);
    return { status: res.status, body: await res.text() };
  }
  if (isV1ConvertPath(pathname)) {
    const res = handleV1Convert(req);
    return { status: res.status, body: await res.text() };
  }
  return null;
}
