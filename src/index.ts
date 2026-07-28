import { Env, handleSeedDb } from './api/admin/seed-db';
import { handleSearch } from './api/search';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API Routing
    if (url.pathname === '/api/admin/seed-db') {
      if (request.method === 'POST' || request.method === 'GET') {
        return handleSeedDb(env);
      }
      return new Response('Method Not Allowed', { status: 405 });
    }

    if (url.pathname === '/api/search') {
      return handleSearch(request, env);
    }

    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ status: 'ok', service: 'TimeGovern Edge API', env: 'Cloudflare D1 Workers' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Default response or proxy
    return new Response('TimeGovern Cloudflare Worker Edge Service Ready', { status: 200 });
  }
};
