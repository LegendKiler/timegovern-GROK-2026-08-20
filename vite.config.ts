import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { fetchGoogleSearchGroundedNews } from './src/api/news';
import { handleLeapSeconds } from './src/api/leapSeconds';
import { handleV1TimeNode } from './src/api/v1Time';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url) return next();

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        try {
          const v1 = await handleV1TimeNode(url.pathname, url.search, req.method || 'GET');
          if (v1) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = v1.status;
            return res.end(v1.body);
          }
        } catch {
          /* fall through */
        }

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

        if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              message: 'Thank you for contacting TimeGovern Headquarters in Melbourne, Australia. Your message has been safely logged.',
              ticket_id: `TG-MELB-${Date.now().toString(36).toUpperCase()}`,
              whatsapp_link: 'https://wa.me/61390001000'
            })
          );
        }

        if (url.pathname === '/api/newsletter' || url.pathname === '/api/newsletter/') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              message: 'Subscribed successfully to TimeGovern Weekly Timezone & Daylight Saving Bulletin.'
            })
          );
        }

        if (url.pathname === '/api/job-subscribe' || url.pathname === '/api/job-subscribe/') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              message: 'Career profile saved! Our Melbourne HR team will alert you whenever new positions open at TimeGovern.'
            })
          );
        }

        if (url.pathname === '/api/news' || url.pathname === '/api/news/') {
          const topic = url.searchParams.get('q') || url.searchParams.get('topic') || undefined;
          const category = url.searchParams.get('category') || undefined;
          const forceRefresh = url.searchParams.get('force') === 'true' || url.searchParams.get('refresh') === 'true';

          try {
            const payload = await fetchGoogleSearchGroundedNews({
              q: topic,
              topic,
              category,
              force: forceRefresh,
              forceRefresh
            });
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            return res.end(JSON.stringify(payload));
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: err?.message || 'Server error' }));
          }
        }

        if (
          url.pathname === '/api/leap-seconds' ||
          url.pathname === '/api/leap-seconds/' ||
          url.pathname === '/api/time/tai-utc' ||
          url.pathname === '/api/time/tai-utc/'
        ) {
          const webReq = new Request(url.toString(), {
            method: req.method || 'GET',
            headers: req.headers as any
          });
          const apiRes = await handleLeapSeconds(webReq);
          const body = await apiRes.text();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = apiRes.status;
          return res.end(body);
        }

        return next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), apiDevServerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
