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
          const now = new Date();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              success: true,
              updated_at: now.toISOString(),
              articles: [
                {
                  id: 'news-1',
                  title: 'European Union & UK Confirm October 2026 Daylight Saving Fall Back Time Schedule',
                  category: 'dst',
                  date: new Date(now.getTime() - 2 * 3600 * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                  timeAgo: '2 hours ago',
                  author: 'Melbourne Time Bureau',
                  readTime: '3 min read',
                  featured: true,
                  summary: 'Official IANA tzdata 2026 release confirms daylight saving transition dates across EU member states and UK GMT switch.',
                  content: 'Millions across Europe and North America will adjust their clocks for the autumn transition. TimeGovern servers have updated regional leap second and offset matrix maps automatically.',
                  imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80',
                  sourceUrl: 'https://news.google.com/search?q=daylight+saving+time'
                }
              ]
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
