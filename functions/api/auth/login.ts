import { verifyPassword, randomToken, json, corsOptions } from '../../_lib/authCrypto';

interface Env { DB?: D1Database }

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return json({ success: false, error: 'Database not configured' }, 503);

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
  const ok = await verifyPassword(password, row.password_salt, row.password_hash);
  if (!ok) return json({ success: false, error: 'Invalid email or password' }, 401);

  const token = randomToken(32);
  const now = new Date().toISOString();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
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
