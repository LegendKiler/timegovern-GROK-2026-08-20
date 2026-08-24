import { D1Database } from '@cloudflare/workers-types';
import { handleSeedDb } from './api/admin/seed-db';
import { handleSearch } from './api/search';
import { handleLeapSeconds } from './api/leapSeconds';
import { handleNews } from './api/news';
import { handleDriftAlerts } from './api/driftAlerts';
import { ensureSchema } from './db/init';
import { handleV1Time, handleV1Convert, isV1TimePath, isV1ConvertPath } from './api/v1Time';
import { handleAuth } from './api/auth';

export interface Env {
  DB?: D1Database;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-XSS-Protection': '1; mode=block',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    if (proto === 'http') {
      return Response.redirect(`https://${url.host}${url.pathname}${url.search}`, 301);
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    if (env.DB) {
      try {
        await ensureSchema(env.DB);
      } catch (dbErr) {
        console.warn('Non-blocking D1 schema init warning:', dbErr);
      }
    }

    if (url.pathname === '/api/admin/seed-db' || url.pathname === '/api/admin/seed-db/') {
      if (request.method === 'POST' || request.method === 'GET') {
        const res = await handleSeedDb(env);
        const body = await res.text();
        return new Response(body, {
          status: res.status,
          headers: { ...corsHeaders, ...securityHeaders },
        });
      }
      return new Response(
        JSON.stringify({ success: false, message: 'Method Not Allowed' }),
        { status: 405, headers: { ...corsHeaders, ...securityHeaders } }
      );
    }

    if (url.pathname === '/api/search' || url.pathname === '/api/search/') {
      const res = await handleSearch(request, env);
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    if (url.pathname === '/api/health' || url.pathname === '/api/health/') {
      return new Response(
        JSON.stringify({ status: 'ok', service: 'timegovern', ts: new Date().toISOString() }),
        { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
      );
    }

    if (url.pathname.startsWith('/api/auth')) {
      return handleAuth(request, env, url.pathname);
    }

    if (isV1TimePath(url.pathname)) {
      return handleV1Time(request);
    }
    if (isV1ConvertPath(url.pathname)) {
      return handleV1Convert(request);
    }

    if (
      url.pathname === '/api/leap-seconds' ||
      url.pathname === '/api/leap-seconds/' ||
      url.pathname === '/api/time/tai-utc' ||
      url.pathname === '/api/time/tai-utc/'
    ) {
      return await handleLeapSeconds(request);
    }

    if (url.pathname.startsWith('/api/drift-alerts') || url.pathname.startsWith('/api/alerts/drift')) {
      return await handleDriftAlerts(request, env);
    }

    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      if (request.method === 'POST') {
        try {
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Thank you for contacting TimeGovern Headquarters in Melbourne, Australia.',
              ticket_id: `TG-MELB-${Date.now().toString(36).toUpperCase()}`,
            }),
            { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
          );
        } catch {
          return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { ...corsHeaders, ...securityHeaders },
          });
        }
      }
      return new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    if (url.pathname === '/api/newsletter' || url.pathname === '/api/newsletter/') {
      if (request.method === 'POST') {
        return new Response(
          JSON.stringify({ success: true, message: 'Subscribed successfully.' }),
          { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
        );
      }
      return new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    if (url.pathname === '/api/job-subscribe' || url.pathname === '/api/job-subscribe/') {
      if (request.method === 'POST') {
        return new Response(
          JSON.stringify({ success: true, message: 'Career profile saved.' }),
          { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
        );
      }
      return new Response(JSON.stringify({ success: false, message: 'Method Not Allowed' }), {
        status: 405,
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    if (url.pathname === '/api/news' || url.pathname === '/api/news/') {
      return await handleNews(request);
    }

    if (url.pathname === '/robots.txt') {
      const robotsTxt = `User-agent: *\nAllow: /\nSitemap: https://timegovern.com/sitemap.xml\n`;
      return new Response(robotsTxt, {
        headers: { 'Content-Type': 'text/plain', ...securityHeaders },
      });
    }

    if (url.pathname === '/.well-known/security.txt' || url.pathname === '/security.txt') {
      const securityTxt = `Contact: mailto:security@timegovern.com\nPreferred-Languages: en\n`;
      return new Response(securityTxt, {
        headers: { 'Content-Type': 'text/plain', ...securityHeaders },
      });
    }

    if (url.pathname === '/sitemap.xml') {
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
      return new Response(sitemapXml, {
        headers: { 'Content-Type': 'application/xml', ...securityHeaders },
      });
    }

    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ error: 'API route not found', path: url.pathname }),
        { status: 404, headers: { ...corsHeaders, ...securityHeaders } }
      );
    }

    if (env.ASSETS) {
      try {
        const assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status === 404 && !url.pathname.startsWith('/api/')) {
          const indexReq = new Request(new URL('/index.html', url.origin), request);
          const indexRes = await env.ASSETS.fetch(indexReq);
          return new Response(indexRes.body, {
            status: 200,
            headers: { ...Object.fromEntries(indexRes.headers), ...securityHeaders },
          });
        }
        const headers = new Headers(assetRes.headers);
        Object.entries(securityHeaders).forEach(([k, v]) => headers.set(k, v));
        return new Response(assetRes.body, { status: assetRes.status, headers });
      } catch (e) {
        console.error(e);
      }
    }

    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"/><title>TimeGovern</title></head><body><div id="root">TimeGovern Edge Worker Online</div></body></html>',
      { headers: { 'Content-Type': 'text/html', ...securityHeaders } }
    );
  },
};
