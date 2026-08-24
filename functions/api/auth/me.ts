import { json, corsOptions } from '../../_lib/authCrypto';

interface Env { DB?: D1Database }

export async function onRequestOptions() {
  return corsOptions();
}

async function userFromAuth(request: Request, env: Env) {
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (!token || !env.DB) return null;
  const session = await env.DB.prepare(
    `SELECT s.token, s.user_id, s.expires_at, u.email, u.full_name, u.email_verified
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token = ?`
  )
    .bind(token)
    .first<{
      token: string;
      user_id: string;
      expires_at: string;
      email: string;
      full_name: string;
      email_verified: number;
    }>();
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return json({ success: false, error: 'Database not configured' }, 503);
  const session = await userFromAuth(request, env);
  if (!session) return json({ success: false, error: 'Unauthorized' }, 401);

  const prefs = await env.DB.prepare('SELECT * FROM user_prefs WHERE user_id = ?')
    .bind(session.user_id)
    .first();

  return json({
    success: true,
    user: {
      id: session.user_id,
      email: session.email,
      fullName: session.full_name,
      emailVerified: !!session.email_verified,
    },
    prefs: prefs || null,
  });
}
