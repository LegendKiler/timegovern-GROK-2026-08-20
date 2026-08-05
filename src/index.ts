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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
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
          headers: corsHeaders,
        });
      }
      return new Response(
        JSON.stringify({ success: false, message: 'Method Not Allowed' }),
        { status: 405, headers: corsHeaders }
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
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // 5. Unmatched API routes fallback
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ error: 'API route not found', path: url.pathname }),
        { status: 404, headers: corsHeaders }
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
            return indexRes;
          }
        }
        return assetRes;
      } catch (assetErr) {
        console.error('Error fetching static asset from Cloudflare Workers storage:', assetErr);
      }
    }

    return new Response('<!doctype html><html><head><meta charset="utf-8"/><title>TimeGovern</title></head><body><div id="root">TimeGovern Edge Worker Online</div></body></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};
