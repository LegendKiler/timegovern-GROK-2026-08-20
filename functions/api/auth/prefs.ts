import { json, corsOptions } from '../../_lib/authCrypto';

interface Env { DB?: D1Database }

export async function onRequestOptions() {
  return corsOptions();
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  if (!env.DB) return json({ success: false, error: 'Database not configured' }, 503);

  const auth = request.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
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
  const dst = body.dstAlerts ? 1 : 0;
  const astro = body.astronomyBulletin ? 1 : 0;
  const hol = body.holidayAlerts ? 1 : 0;
  const fullName = typeof body.fullName === 'string' ? body.fullName : undefined;

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
    .bind(session.user_id, homeCity, timeFormat, tempUnit, dst, astro, hol, now)
    .run();

  if (fullName !== undefined) {
    await env.DB.prepare(`UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?`)
      .bind(fullName, now, session.user_id)
      .run();
  }

  return json({ success: true, updatedAt: now });
}
