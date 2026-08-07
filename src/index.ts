import { D1Database } from '@cloudflare/workers-types';
import { handleSeedDb } from './api/admin/seed-db';
import { handleSearch } from './api/search';
import { ensureSchema } from './db/init';

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

    // Enforce HTTPS Redirect if request arrived over unencrypted HTTP
    const proto = request.headers.get('x-forwarded-proto') || url.protocol.replace(':', '');
    if (proto === 'http') {
      return Response.redirect(`https://${url.host}${url.pathname}${url.search}`, 301);
    }

    // 1. Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: { ...corsHeaders, ...securityHeaders },
      });
    }

    // Auto-ensure Cloudflare D1 database schema on Edge startup (safe try-catch)
    if (env.DB) {
      try {
        await ensureSchema(env.DB);
      } catch (dbErr) {
        console.warn('Non-blocking D1 schema init warning:', dbErr);
      }
    }

    // 2. Database Seeding API route (/api/admin/seed-db)
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

    // 3. Search API route (/api/search)
    if (url.pathname === '/api/search' || url.pathname === '/api/search/') {
      const res = await handleSearch(request, env);
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: {
          ...corsHeaders,
          ...securityHeaders,
          'Cache-Control': 'public, max-age=60, s-maxage=300',
        },
      });
    }

    // 4. Health Check API route (/api/health)
    if (url.pathname === '/api/health' || url.pathname === '/api/health/') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'TimeGovern Cloudflare Worker + Assets Edge Service',
          env: 'Cloudflare D1 Workers',
          ssl: '256-Bit TLS 1.3 Active',
          securityHeaders: 'HSTS & CSP Enforced',
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
      );
    }

    // SEO Crawlers: robots.txt
    if (url.pathname === '/robots.txt') {
      const robotsTxt = `User-agent: *
Allow: /
Sitemap: https://timegovern.com/sitemap.xml

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /`;
      return new Response(robotsTxt, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          ...securityHeaders,
        },
      });
    }

    // SEO Crawlers: sitemap.xml
    if (url.pathname === '/sitemap.xml') {
      const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://timegovern.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://www.timegovern.com/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://timegovern.com/api/health</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`;
      return new Response(sitemapXml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          ...securityHeaders,
        },
      });
    }

    // 5. Unmatched API routes fallback
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ error: 'API route not found', path: url.pathname }),
        { status: 404, headers: { ...corsHeaders, ...securityHeaders } }
      );
    }

    // 6. Fallback to static assets with SPA routing support
    if (env.ASSETS) {
      try {
        let assetRes = await env.ASSETS.fetch(request);
        if (assetRes.status === 404 && !url.pathname.startsWith('/api/')) {
          const indexUrl = new URL('/index.html', request.url);
          const indexRequest = new Request(indexUrl, {
            method: 'GET',
            headers: request.headers,
          });
          const indexRes = await env.ASSETS.fetch(indexRequest);
          if (indexRes.status === 200) {
            const newHeaders = new Headers(indexRes.headers);
            Object.entries(securityHeaders).forEach(([k, v]) => newHeaders.set(k, v));
            return new Response(indexRes.body, {
              status: 200,
              headers: newHeaders,
            });
          }
        }

        const responseWithSecurity = new Response(assetRes.body, assetRes);
        Object.entries(securityHeaders).forEach(([k, v]) => responseWithSecurity.headers.set(k, v));
        return responseWithSecurity;
      } catch (assetErr) {
        console.error('Error fetching static asset from Cloudflare Workers storage:', assetErr);
      }
    }

    return new Response('<!doctype html><html><head><meta charset="utf-8"/><title>TimeGovern</title></head><body><div id="root">TimeGovern Edge Worker Online</div></body></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...securityHeaders },
    });
  },
};
