/**
 * Phase 2 account client.
 * Tries Cloudflare /api/auth/* (D1). If unavailable (local Vite), uses browser-local accounts.
 * Passwords: PBKDF2-SHA256 via Web Crypto (never stored plain).
 */

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
};

export type UserPrefs = {
  fullName: string;
  email: string;
  homeCity: string;
  timeFormat: '12h' | '24h';
  tempUnit: 'C' | 'F';
  dstAlerts: boolean;
  astronomyBulletin: boolean;
  holidayAlerts: boolean;
};

const SESSION_KEY = 'tg_session_v2';
const LOCAL_USERS_KEY = 'tg_local_users_v2';

type Session = { token: string; user: AuthUser; source: 'cloud' | 'local'; expiresAt: string };

async function pbkdf2(password: string, saltB64?: string): Promise<{ salt: string; hash: string }> {
  const enc = new TextEncoder();
  const salt = saltB64
    ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArr = new Uint8Array(bits);
  const b64 = (u8: Uint8Array) => btoa(String.fromCharCode(...Array.from(u8)));
  return { salt: b64(salt), hash: b64(hashArr) };
}

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as Session;
    if (new Date(s.expiresAt) < new Date()) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function saveSession(s: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function getSession(): Session | null {
  return loadSession();
}

export function getAuthToken(): string | null {
  return loadSession()?.token ?? null;
}

type LocalUser = {
  id: string;
  email: string;
  fullName: string;
  salt: string;
  hash: string;
  prefs: UserPrefs;
};

function loadLocalUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

async function apiPost(path: string, body: unknown, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function apiGet(path: string, token: string) {
  const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function registerAccount(opts: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ success: boolean; error?: string; user?: AuthUser; source?: 'cloud' | 'local' }> {
  const email = opts.email.trim().toLowerCase();
  if (!email.includes('@')) return { success: false, error: 'Valid email required' };
  if (opts.password.length < 8) return { success: false, error: 'Password must be at least 8 characters' };

  try {
    const { ok, data } = await apiPost('/api/auth/register', {
      email,
      password: opts.password,
      fullName: opts.fullName,
    });
    if (ok && data.success && data.token) {
      saveSession({
        token: data.token,
        user: data.user,
        source: 'cloud',
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 864e5).toISOString(),
      });
      return { success: true, user: data.user, source: 'cloud' };
    }
    if (data.error && !String(data.error).includes('not configured')) {
      return { success: false, error: data.error };
    }
  } catch {
    /* fall through to local */
  }

  const users = loadLocalUsers();
  if (users.some((u) => u.email === email)) {
    return { success: false, error: 'An account with this email already exists on this device' };
  }
  const { salt, hash } = await pbkdf2(opts.password);
  const id = crypto.randomUUID();
  const prefs: UserPrefs = {
    fullName: opts.fullName,
    email,
    homeCity: 'Melbourne',
    timeFormat: '24h',
    tempUnit: 'C',
    dstAlerts: true,
    astronomyBulletin: true,
    holidayAlerts: false,
  };
  users.push({ id, email, fullName: opts.fullName, salt, hash, prefs });
  saveLocalUsers(users);
  const token = crypto.randomUUID() + crypto.randomUUID();
  const user: AuthUser = { id, email, fullName: opts.fullName, emailVerified: false };
  saveSession({
    token,
    user,
    source: 'local',
    expiresAt: new Date(Date.now() + 30 * 864e5).toISOString(),
  });
  localStorage.setItem(`tg_local_prefs_${id}`, JSON.stringify(prefs));
  return { success: true, user, source: 'local' };
}

export async function loginAccount(opts: {
  email: string;
  password: string;
}): Promise<{ success: boolean; error?: string; user?: AuthUser; source?: 'cloud' | 'local' }> {
  const email = opts.email.trim().toLowerCase();

  try {
    const { ok, data } = await apiPost('/api/auth/login', { email, password: opts.password });
    if (ok && data.success && data.token) {
      saveSession({
        token: data.token,
        user: data.user,
        source: 'cloud',
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 864e5).toISOString(),
      });
      return { success: true, user: data.user, source: 'cloud' };
    }
    if (data.error && !String(data.error).includes('not configured')) {
      return { success: false, error: data.error };
    }
  } catch {
    /* local */
  }

  const users = loadLocalUsers();
  const row = users.find((u) => u.email === email);
  if (!row) return { success: false, error: 'Invalid email or password' };
  const { hash } = await pbkdf2(opts.password, row.salt);
  if (hash !== row.hash) return { success: false, error: 'Invalid email or password' };

  const token = crypto.randomUUID() + crypto.randomUUID();
  const user: AuthUser = {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    emailVerified: false,
  };
  saveSession({
    token,
    user,
    source: 'local',
    expiresAt: new Date(Date.now() + 30 * 864e5).toISOString(),
  });
  return { success: true, user, source: 'local' };
}

export async function logoutAccount(): Promise<void> {
  const s = loadSession();
  if (s?.source === 'cloud' && s.token) {
    try {
      await apiPost('/api/auth/logout', {}, s.token);
    } catch {
      /* ignore */
    }
  }
  localStorage.removeItem(SESSION_KEY);
}

export async function saveUserPrefs(prefs: UserPrefs): Promise<{ success: boolean; source: 'cloud' | 'local'; error?: string }> {
  const s = loadSession();
  if (!s) return { success: false, source: 'local', error: 'Not signed in' };

  if (s.source === 'cloud') {
    try {
      const { ok, data } = await apiPost(
        '/api/auth/prefs',
        {
          fullName: prefs.fullName,
          homeCity: prefs.homeCity,
          timeFormat: prefs.timeFormat,
          tempUnit: prefs.tempUnit,
          dstAlerts: prefs.dstAlerts,
          astronomyBulletin: prefs.astronomyBulletin,
          holidayAlerts: prefs.holidayAlerts,
        },
        s.token
      );
      if (ok && data.success) {
        localStorage.setItem(`tg_local_prefs_${s.user.id}`, JSON.stringify(prefs));
        saveSession({
          ...s,
          user: { ...s.user, fullName: prefs.fullName },
        });
        return { success: true, source: 'cloud' };
      }
    } catch {
      /* fall local */
    }
  }

  localStorage.setItem(`tg_local_prefs_${s.user.id}`, JSON.stringify(prefs));
  const users = loadLocalUsers();
  const idx = users.findIndex((u) => u.id === s.user.id);
  if (idx >= 0) {
    users[idx].prefs = prefs;
    users[idx].fullName = prefs.fullName;
    saveLocalUsers(users);
  }
  saveSession({ ...s, user: { ...s.user, fullName: prefs.fullName } });
  return { success: true, source: s.source };
}

export function loadUserPrefs(userId: string): UserPrefs | null {
  try {
    const raw = localStorage.getItem(`tg_local_prefs_${userId}`);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function refreshMe(): Promise<{ user: AuthUser; prefs: Partial<UserPrefs> | null; source: 'cloud' | 'local' } | null> {
  const s = loadSession();
  if (!s) return null;
  if (s.source === 'cloud') {
    try {
      const { ok, data } = await apiGet('/api/auth/me', s.token);
      if (ok && data.success) {
        saveSession({ ...s, user: data.user });
        return { user: data.user, prefs: data.prefs, source: 'cloud' };
      }
    } catch {
      /* local */
    }
  }
  return { user: s.user, prefs: loadUserPrefs(s.user.id), source: s.source };
}
