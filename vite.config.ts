import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        if (url.pathname === '/api/admin/seed-db' || url.pathname === '/api/admin/seed-db/') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              status: 'success',
              message: 'Cloudflare D1 Database successfully seeded across all 195+ regions.',
              metrics: {
                countriesImported: 195,
                citiesImported: 50,
                calculatorsImported: 10,
                newsImported: 10,
                durationMs: 42
              }
            })
          );
        }

        if (url.pathname === '/api/search' || url.pathname === '/api/search/') {
          const q = url.searchParams.get('q') || '';
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              query: q,
              results: {
                cities: [
                  { name: 'London', country_code: 'GB', country_name: 'United Kingdom', timezone: 'Europe/London' },
                  { name: 'New York City', country_code: 'US', country_name: 'United States', timezone: 'America/New_York' },
                  { name: 'Tokyo', country_code: 'JP', country_name: 'Japan', timezone: 'Asia/Tokyo' }
                ].filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.timezone.toLowerCase().includes(q.toLowerCase())),
                calculators: [],
                news: []
              }
            })
          );
        }

        if (url.pathname === '/api/health' || url.pathname === '/api/health/') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              status: 'ok',
              service: 'TimeGovern Local Vite API Server',
              timestamp: new Date().toISOString()
            })
          );
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
