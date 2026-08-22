/**
 * Server time drift correction using /api/v1/time (WC1).
 * displayInstant = Date.now() + driftMs
 */
let driftMs = 0;
let lastSync = 0;
const SYNC_INTERVAL_MS = 10 * 60 * 1000;

export function getDriftMs(): number {
  return driftMs;
}

export function getSyncedNow(): Date {
  return new Date(Date.now() + driftMs);
}

export async function syncTimeWithServer(): Promise<{ ok: boolean; driftMs: number }> {
  try {
    const res = await fetch('/api/v1/time?tz=UTC');
    if (!res.ok) return { ok: false, driftMs };
    const data = await res.json();
    const serverUnix =
      typeof data.unix_timestamp === 'number' ? data.unix_timestamp * 1000 : Date.parse(data.utc_iso);
    if (!serverUnix || Number.isNaN(serverUnix)) return { ok: false, driftMs };
    const clientNow = Date.now();
    driftMs = serverUnix - clientNow;
    lastSync = clientNow;
    return { ok: true, driftMs };
  } catch {
    return { ok: false, driftMs };
  }
}

export function shouldResync(): boolean {
  return Date.now() - lastSync > SYNC_INTERVAL_MS;
}

/** Call from clock tick / visibility */
export async function ensureTimeSynced(): Promise<void> {
  if (!lastSync || shouldResync()) {
    await syncTimeWithServer();
  }
}
