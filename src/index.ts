import { Env, handleSeedDb } from './api/admin/seed-db';
import { handleSearch } from './api/search';

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight options
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API Routing matching Cloudflare Workers & Pages Functions
    if (url.pathname === '/api/admin/seed-db' || url.pathname === '/api/admin/seed-db/') {
      if (request.method === 'POST' || request.method === 'GET') {
        const res = await handleSeedDb(env);
        const text = await res.text();
        return new Response(text, {
          status: res.status,
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: corsHeaders
      });
    }

    if (url.pathname === '/api/search' || url.pathname === '/api/search/') {
      const res = await handleSearch(request, env);
      const text = await res.text();
      return new Response(text, {
        status: res.status,
        headers: corsHeaders
      });
    }

    if (url.pathname === '/api/health' || url.pathname === '/api/health/') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'TimeGovern Edge Worker API',
          env: 'Cloudflare D1 Workers',
          timestamp: new Date().toISOString()
        }),
        {
          status: 200,
          headers: corsHeaders
        }
      );
    }

    // Default response for unmatched worker endpoints
    return new Response(
      JSON.stringify({
        status: 'active',
        service: 'TimeGovern Cloudflare Worker Engine',
        endpoint: url.pathname
      }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  }
};

