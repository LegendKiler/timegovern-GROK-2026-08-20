import { hashPassword, randomToken, json, corsOptions } from '../../_lib/authCrypto';

interface Env { DB?: D1Database }

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return json({ success: false, error: 'Database not configured' }, 503);

  let body: { email?: string; password?: string; fullName?: string };
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: 'Invalid JSON' }, 400);
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const fullName = (body.fullName || '').trim();

  if (!email || !email.includes('@')) return json({ success: false, error: 'Valid email required' }, 400);
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
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await env.DB.prepare(`INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`)
    .bind(token, id, expires, now)
    .run();

  return json({
    success: true,
    token,
    expiresAt: expires,
    user: { id, email, fullName, emailVerified: false },
    message: 'Account created. Email verification when mail provider is connected.',
  });
}
