/**
 * Full C: password reset (activation key) + authenticator 2FA.
 * Lab: localStorage mock (shows key on screen when no email provider).
 * Production: same API shapes → Worker + D1 + Resend/Brevo.
 */
import {
  generateTotpSecret,
  verifyTotp,
  buildOtpAuthUrl,
  generateBackupCodes,
} from './totp';
import { getSession, getAuthToken, type AuthUser } from './accountAuth';

const LOCAL_USERS_KEY = 'tg_local_users_v2';
const RESET_KEY = 'tg_reset_tokens_v1';

type LocalUser = {
  id: string;
  email: string;
  fullName: string;
  salt: string;
  hash: string;
  prefs?: unknown;
  totpSecret?: string | null;
  totpEnabled?: boolean;
  backupCodes?: string[];
};

type ResetRow = {
  email: string;
  token: string;
  expiresAt: string;
  used?: boolean;
};

async function pbkdf2(password: string, saltB64?: string): Promise<{ salt: string; hash: string }> {
  const enc = new TextEncoder();
  const salt = saltB64
    ? Uint8Array.from(atob(saltB64), (c) => c.charCodeAt(0))
    : crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const hashArr = new Uint8Array(bits);
  const b64 = (u8: Uint8Array) => btoa(String.fromCharCode(...Array.from(u8)));
  return { salt: b64(salt), hash: b64(hashArr) };
}

function loadUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(u: LocalUser[]) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(u));
}

function loadResets(): ResetRow[] {
  try {
    return JSON.parse(localStorage.getItem(RESET_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveResets(r: ResetRow[]) {
  localStorage.setItem(RESET_KEY, JSON.stringify(r));
}

function randomKey(): string {
  const a = crypto.getRandomValues(new Uint8Array(8));
  const hex = Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
  // timeanddate-style readable key
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

async function apiPost(path: string, body: unknown, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: {} as any };
  }
}

/** Request password reset — always generic success message. Lab returns activation key. */
export async function requestPasswordReset(emailRaw: string): Promise<{
  success: boolean;
  message: string;
  /** Lab only — production sends email instead */
  labActivationKey?: string;
  error?: string;
}> {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes('@')) return { success: false, message: '', error: 'Valid email required' };

  const remote = await apiPost('/api/auth/forgot', { email });
  if (remote.ok && remote.data.success) {
    return {
      success: true,
      message:
        remote.data.message ||
        'If an account exists for that email, reset instructions were sent.',
      labActivationKey: remote.data.labActivationKey,
    };
  }

  // Lab local
  const users = loadUsers();
  const exists = users.some((u) => u.email === email);
  const token = randomKey();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const rows = loadResets().filter((r) => r.email !== email || r.used);
  if (exists) {
    rows.push({ email, token, expiresAt, used: false });
    saveResets(rows);
  }
  // Same public message either way
  return {
    success: true,
    message:
      'If an account exists for that email, use the activation key below (lab demo — production sends email).',
    labActivationKey: exists ? token : undefined,
  };
}

/** Set new password with activation key */
export async function resetPasswordWithKey(opts: {
  email: string;
  activationKey: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string; message?: string }> {
  const email = opts.email.trim().toLowerCase();
  const key = opts.activationKey.trim().toLowerCase();
  if (opts.newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters' };

  const remote = await apiPost('/api/auth/reset', {
    email,
    token: key,
    newPassword: opts.newPassword,
  });
  if (remote.ok && remote.data.success) {
    return { success: true, message: remote.data.message || 'Password updated. Sign in with your new password.' };
  }
  if (remote.status > 0 && remote.data.error) {
    // fall through to local if API incomplete
  }

  const rows = loadResets();
  const row = rows.find(
    (r) =>
      r.email === email &&
      r.token.toLowerCase() === key &&
      !r.used &&
      new Date(r.expiresAt) > new Date()
  );
  if (!row) return { success: false, error: 'Invalid or expired activation key' };

  const users = loadUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx < 0) return { success: false, error: 'Invalid or expired activation key' };

  const { salt, hash } = await pbkdf2(opts.newPassword);
  users[idx].salt = salt;
  users[idx].hash = hash;
  saveUsers(users);
  row.used = true;
  saveResets(rows);
  return { success: true, message: 'Password updated. Sign in with your new password.' };
}

export function getTwoFactorStatus(userId?: string): {
  enabled: boolean;
  hasSecret: boolean;
} {
  const id = userId || getSession()?.user.id;
  if (!id) return { enabled: false, hasSecret: false };
  const u = loadUsers().find((x) => x.id === id);
  return { enabled: !!u?.totpEnabled, hasSecret: !!u?.totpSecret };
}

/** Start 2FA enrollment — returns secret + otpauth URL for QR */
export async function beginTwoFactorSetup(): Promise<{
  success: boolean;
  error?: string;
  secret?: string;
  otpauthUrl?: string;
  email?: string;
}> {
  const s = getSession();
  if (!s) return { success: false, error: 'Sign in first' };
  const secret = generateTotpSecret();
  const otpauthUrl = buildOtpAuthUrl({ secret, email: s.user.email, issuer: 'TimeGovern' });
  // Stash pending secret until verified
  sessionStorage.setItem(`tg_totp_pending_${s.user.id}`, secret);
  return { success: true, secret, otpauthUrl, email: s.user.email };
}

/** Confirm 2FA with first code from authenticator */
export async function confirmTwoFactorSetup(code: string): Promise<{
  success: boolean;
  error?: string;
  backupCodes?: string[];
}> {
  const s = getSession();
  if (!s) return { success: false, error: 'Sign in first' };
  const secret = sessionStorage.getItem(`tg_totp_pending_${s.user.id}`);
  if (!secret) return { success: false, error: 'Start setup again' };
  if (!(await verifyTotp(secret, code))) return { success: false, error: 'Invalid code — check the app time' };

  const remote = await apiPost(
    '/api/auth/2fa/enable',
    { secret, code },
    getAuthToken()
  );
  if (remote.ok && remote.data.success) {
    sessionStorage.removeItem(`tg_totp_pending_${s.user.id}`);
    return {
      success: true,
      backupCodes: remote.data.backupCodes || generateBackupCodes(),
    };
  }

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === s.user.id);
  if (idx < 0) return { success: false, error: 'Account not found on this device' };
  const backupCodes = generateBackupCodes();
  users[idx].totpSecret = secret;
  users[idx].totpEnabled = true;
  users[idx].backupCodes = backupCodes;
  saveUsers(users);
  sessionStorage.removeItem(`tg_totp_pending_${s.user.id}`);
  return { success: true, backupCodes };
}

export async function disableTwoFactor(opts: {
  password: string;
  code: string;
}): Promise<{ success: boolean; error?: string }> {
  const s = getSession();
  if (!s) return { success: false, error: 'Sign in first' };

  const remote = await apiPost(
    '/api/auth/2fa/disable',
    opts,
    getAuthToken()
  );
  if (remote.ok && remote.data.success) return { success: true };

  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === s.user.id);
  if (idx < 0) return { success: false, error: 'Account not found' };
  const u = users[idx];
  if (!u.totpEnabled || !u.totpSecret) return { success: false, error: '2FA is not enabled' };

  // verify password
  const { hash } = await pbkdf2(opts.password, u.salt);
  if (hash !== u.hash) return { success: false, error: 'Wrong password' };

  const okCode =
    (await verifyTotp(u.totpSecret, opts.code)) ||
    (u.backupCodes || []).includes(opts.code.trim());
  if (!okCode) return { success: false, error: 'Invalid authenticator or backup code' };

  u.totpEnabled = false;
  u.totpSecret = null;
  u.backupCodes = [];
  saveUsers(users);
  return { success: true };
}

/** After password OK — if 2FA on, require code */
export async function verifyLoginSecondFactor(opts: {
  email: string;
  code: string;
}): Promise<{ success: boolean; error?: string }> {
  const email = opts.email.trim().toLowerCase();
  const users = loadUsers();
  const u = users.find((x) => x.email === email);
  if (!u?.totpEnabled || !u.totpSecret) return { success: true };

  if (await verifyTotp(u.totpSecret, opts.code)) return { success: true };
  const backup = (u.backupCodes || []).find((c) => c === opts.code.trim());
  if (backup) {
    u.backupCodes = (u.backupCodes || []).filter((c) => c !== backup);
    saveUsers(users);
    return { success: true };
  }
  return { success: false, error: 'Invalid authenticator code' };
}

export function localUserRequires2FA(email: string): boolean {
  const u = loadUsers().find((x) => x.email === email.trim().toLowerCase());
  return !!u?.totpEnabled;
}

export type { AuthUser };
