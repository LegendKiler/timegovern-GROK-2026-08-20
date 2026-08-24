import type { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB?: D1Database;
}

const cors = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}

async function hashPassword(password: string, saltB64?: string): Promise<{ salt: string; hash: string }> {
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

async function verifyPassword(password: string, salt: string, expectedHash: string) {
  const { hash } = await hashPassword(password, salt);
  return hash === expectedHash;
}

function randomToken(bytes = 32) {
  const u8 = crypto.getRandomValues(new Uint8Array(bytes));
  return [...u8].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bearer(request: Request) {
  const auth = request.headers.get('Authorization') || '';
  return auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
}

/** Route /api/auth/* inside the main Worker */
export async function handleAuth(request: Request, env: Env, pathname: string): Promise<Response> {
  if (request.method === 'OPTIONS') return json({ ok: true }, 204);
  if (!env.DB) return json({ success: false, error: 'Database not configured' }, 503);

  const path = pathname.replace(/\/$/, '') || '/';

  if (path.endsWith('/register') && request.method === 'POST') {
    let body: { email?: string; password?: string; fullName?: string };
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON' }, 400);
    }
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const fullName = (body.fullName || '').trim();
    if (!email.includes('@')) return json({ success: false, error: 'Valid email required' }, 400);
    if (password.length < 8) return json({ success: false, error: 'Password must be at least 8 characters' }, 400);

    const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existing) return json({ success: false, error: 'An account with this email already exists' }, 409);

    const { salt, hash } = await hashPassword(password);
    const id = randomToken(16);
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO users (id, email, password_salt, password_hash, full_name, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, ?, ?)`
    )
      .bind(id, email, salt, hash, fullName, now, now)
      .run();
    await env.DB.prepare(
      `INSERT INTO user_prefs (user_id, home_city, time_format, temp_unit, dst_alerts, astronomy_bulletin, holiday_alerts, updated_at)
       VALUES (?, 'Melbourne', '24h', 'C', 1, 1, 0, ?)`
    )
      .bind(id, now)
      .run();
    const token = randomToken(32);
    const expires = new Date(Date.now() + 30 * 864e5).toISOString();
    await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`)
      .bind(token, id, expires, now)
      .run();
    return json({
      success: true,
      token,
      expiresAt: expires,
      user: { id, email, fullName, emailVerified: false },
    });
  }

  if (path.endsWith('/login') && request.method === 'POST') {
    let body: { email?: string; password?: string };
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON' }, 400);
    }
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    if (!email || !password) return json({ success: false, error: 'Email and password required' }, 400);
    const row = await env.DB.prepare(
      'SELECT id, email, full_name, password_salt, password_hash, email_verified FROM users WHERE email = ?'
    )
      .bind(email)
      .first<{
        id: string;
        email: string;
        full_name: string;
        password_salt: string;
        password_hash: string;
        email_verified: number;
      }>();
    if (!row) return json({ success: false, error: 'Invalid email or password' }, 401);
    if (!(await verifyPassword(password, row.password_salt, row.password_hash))) {
      return json({ success: false, error: 'Invalid email or password' }, 401);
    }
    const token = randomToken(32);
    const now = new Date().toISOString();
    const expires = new Date(Date.now() + 30 * 864e5).toISOString();
    await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`)
      .bind(token, row.id, expires, now)
      .run();
    return json({
      success: true,
      token,
      expiresAt: expires,
      user: {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        emailVerified: !!row.email_verified,
      },
    });
  }

  if (path.endsWith('/logout') && request.method === 'POST') {
    const token = bearer(request);
    if (token) await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return json({ success: true });
  }

  if (path.endsWith('/me') && request.method === 'GET') {
    const token = bearer(request);
    if (!token) return json({ success: false, error: 'Unauthorized' }, 401);
    const session = await env.DB.prepare(
      `SELECT s.user_id, s.expires_at, u.email, u.full_name, u.email_verified
       FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`
    )
      .bind(token)
      .first<{
        user_id: string;
        expires_at: string;
        email: string;
        full_name: string;
        email_verified: number;
      }>();
    if (!session || new Date(session.expires_at) < new Date()) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    const prefs = await env.DB.prepare('SELECT * FROM user_prefs WHERE user_id = ?').bind(session.user_id).first();
    return json({
      success: true,
      user: {
        id: session.user_id,
        email: session.email,
        fullName: session.full_name,
        emailVerified: !!session.email_verified,
      },
      prefs,
    });
  }

  if (path.endsWith('/prefs') && request.method === 'POST') {
    const token = bearer(request);
    if (!token) return json({ success: false, error: 'Unauthorized' }, 401);
    const session = await env.DB.prepare(`SELECT user_id, expires_at FROM sessions WHERE token = ?`)
      .bind(token)
      .first<{ user_id: string; expires_at: string }>();
    if (!session || new Date(session.expires_at) < new Date()) {
      return json({ success: false, error: 'Unauthorized' }, 401);
    }
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return json({ success: false, error: 'Invalid JSON' }, 400);
    }
    const now = new Date().toISOString();
    const homeCity = String(body.homeCity || 'Melbourne');
    const timeFormat = body.timeFormat === '12h' ? '12h' : '24h';
    const tempUnit = body.tempUnit === 'F' ? 'F' : 'C';
    await env.DB.prepare(
      `INSERT INTO user_prefs (user_id, home_city, time_format, temp_unit, dst_alerts, astronomy_bulletin, holiday_alerts, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         home_city = excluded.home_city,
         time_format = excluded.time_format,
         temp_unit = excluded.temp_unit,
         dst_alerts = excluded.dst_alerts,
         astronomy_bulletin = excluded.astronomy_bulletin,
         holiday_alerts = excluded.holiday_alerts,
         updated_at = excluded.updated_at`
    )
      .bind(
        session.user_id,
        homeCity,
        timeFormat,
        tempUnit,
        body.dstAlerts ? 1 : 0,
        body.astronomyBulletin ? 1 : 0,
        body.holidayAlerts ? 1 : 0,
        now
      )
      .run();
    if (typeof body.fullName === 'string') {
      await env.DB.prepare(`UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?`)
        .bind(body.fullName, now, session.user_id)
        .run();
    }
    return json({ success: true, updatedAt: now });
  }

  return json({ success: false, error: 'Auth route not found', path }, 404);
}
