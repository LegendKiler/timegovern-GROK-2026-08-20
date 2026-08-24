import { json, corsOptions } from '../../_lib/authCrypto';

interface Env { DB?: D1Database }

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
  if (token && env.DB) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  return json({ success: true });
}
