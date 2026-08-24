/** Phase 2b helpers — imported by accountAuth and UI */

import type { AuthUser, UserPrefs } from './accountAuthCore';

// Re-export types used by UI when core splits — for now helpers are self-contained with duplicated minimal types

export type { AuthUser, UserPrefs };

const SESSION_KEY = 'tg_session_v2';

type Session = { token: string; user: AuthUser; source: 'cloud' | 'local'; expiresAt: string };

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

async function apiPost(path: string, body: unknown, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(path, { method: 'POST', headers, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export async function requestMagicLink(email: string): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  labLink?: string;
  emailSent?: boolean;
}> {
  const e = email.trim().toLowerCase();
  if (!e.includes('@')) return { success: false, error: 'Valid email required' };
  try {
    const { ok, data } = await apiPost('/api/auth/magic-link', { email: e });
    if (ok && data.success) {
      return { success: true, message: data.message, labLink: data.labLink, emailSent: data.emailSent };
    }
    return { success: false, error: data.error || 'Magic link unavailable (needs Worker + D1)' };
  } catch {
    return { success: false, error: 'Cloud API offline. Use password account or deploy Worker.' };
  }
}

export async function consumeMagicLink(token: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const { ok, data } = await apiPost('/api/auth/magic-link/consume', { token });
    if (ok && data.success && data.token) {
      saveSession({
        token: data.token,
        user: data.user,
        source: 'cloud',
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 864e5).toISOString(),
      });
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Invalid link' };
  } catch {
    return { success: false, error: 'Could not verify magic link' };
  }
}

export async function loginWithGoogle(credential: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const { ok, data } = await apiPost('/api/auth/google', { credential });
    if (ok && data.success && data.token) {
      saveSession({
        token: data.token,
        user: data.user,
        source: 'cloud',
        expiresAt: data.expiresAt || new Date(Date.now() + 30 * 864e5).toISOString(),
      });
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || 'Google sign-in failed' };
  } catch {
    return { success: false, error: 'Google needs deployed Worker + GOOGLE_CLIENT_ID. Lab: email/password.' };
  }
}

export async function sendVerificationEmail(): Promise<{ success: boolean; error?: string; message?: string; labLink?: string }> {
  const s = loadSession();
  if (!s || s.source !== 'cloud') {
    return { success: false, error: 'Sign in with a cloud account first (after deploy).' };
  }
  try {
    const { ok, data } = await apiPost('/api/auth/send-verification', {}, s.token);
    if (ok && data.success) return { success: true, message: data.message, labLink: data.labLink };
    return { success: false, error: data.error || 'Could not send verification' };
  } catch {
    return { success: false, error: 'API offline' };
  }
}

export async function consumeVerifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { ok, data } = await apiPost('/api/auth/verify-email', { token });
    if (ok && data.success) return { success: true };
    return { success: false, error: data.error || 'Invalid token' };
  } catch {
    return { success: false, error: 'API offline' };
  }
}

export async function exportSyncCode(passphrase: string): Promise<{ success: boolean; code?: string; error?: string }> {
  const s = loadSession();
  if (!s) return { success: false, error: 'Sign in first' };
  let prefs: UserPrefs | null = null;
  try {
    const raw = localStorage.getItem(`tg_local_prefs_${s.user.id}`);
    if (raw) prefs = JSON.parse(raw);
  } catch { /* */ }
  const payload = JSON.stringify({ v: 1, user: s.user, prefs, exportedAt: new Date().toISOString() });
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(payload));
  const pack = {
    s: btoa(String.fromCharCode(...Array.from(salt))),
    i: btoa(String.fromCharCode(...Array.from(iv))),
    c: btoa(String.fromCharCode(...Array.from(new Uint8Array(cipher)))),
  };
  return { success: true, code: btoa(JSON.stringify(pack)) };
}

export async function importSyncCode(code: string, passphrase: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
  try {
    const pack = JSON.parse(atob(code)) as { s: string; i: string; c: string };
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const salt = Uint8Array.from(atob(pack.s), (ch) => ch.charCodeAt(0));
    const iv = Uint8Array.from(atob(pack.i), (ch) => ch.charCodeAt(0));
    const cipher = Uint8Array.from(atob(pack.c), (ch) => ch.charCodeAt(0));
    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    const data = JSON.parse(dec.decode(plain)) as { user: AuthUser; prefs: UserPrefs | null };
    const token = crypto.randomUUID() + crypto.randomUUID();
    saveSession({
      token,
      user: data.user,
      source: 'local',
      expiresAt: new Date(Date.now() + 30 * 864e5).toISOString(),
    });
    if (data.prefs) localStorage.setItem(`tg_local_prefs_${data.user.id}`, JSON.stringify(data.prefs));
    return { success: true, user: data.user };
  } catch {
    return { success: false, error: 'Invalid code or passphrase' };
  }
}

export function getGoogleClientId(): string {
  try {
    return (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  } catch {
    return '';
  }
}
