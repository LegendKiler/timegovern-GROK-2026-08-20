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
              source: 'Google News Temporal Feed & TimeGovern IANA Bureau',
              articles: [
                {
                  id: 'news-1',
                  title: 'European Union & UK Confirm October 2026 Daylight Saving Fall Back Time Schedule',
                  category: 'dst',
                  date: new Date(now.getTime() - 2 * 3600 * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                  timeAgo: '2 hours ago',
                  author: 'Google News - Daylight Saving',
                  readTime: '3 min read',
                  featured: true,
                  summary: 'Official IANA tzdata 2026 release confirms daylight saving transition dates across EU member states and UK GMT switch.',
                  content: 'Millions across Europe and North America will adjust their clocks for the autumn transition. TimeGovern servers have updated regional leap second and offset matrix maps automatically.',
                  imageUrl: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80',
                  sourceUrl: 'https://news.google.com/search?q=daylight+saving+time'
                },
                {
                  id: 'news-2',
                  title: 'NASA & European Space Agency Prepare for Total Lunar Eclipse Observation Stream',
                  category: 'astronomy',
                  date: new Date(now.getTime() - 5 * 3600 * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                  timeAgo: '5 hours ago',
                  author: 'Google News - Astronomy',
                  readTime: '4 min read',
                  summary: 'Observatories worldwide synchronize UTC timestamps for upcoming lunar alignment visible across Australia, Asia and Pacific rim.',
                  content: 'Astronomers are aligning UTC atomic standard clocks to track the lunar eclipse path across the southern hemisphere.',
                  imageUrl: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?auto=format&fit=crop&w=800&q=80',
                  sourceUrl: 'https://news.google.com/search?q=astronomy+eclipse+utc'
                },
                {
                  id: 'news-3',
                  title: 'Global Financial Markets Standardize UTC High-Frequency Trading Timestamp Rules',
                  category: 'timezones',
                  date: new Date(now.getTime() - 9 * 3600 * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                  timeAgo: '9 hours ago',
                  author: 'Google News - Global Markets',
                  readTime: '5 min read',
                  summary: 'Wall Street, London Stock Exchange, and Tokyo Exchange enforce nanosecond UTC synchronization across borderless trading nodes.',
                  content: 'Financial regulatory authorities mandated unified UTC clock synchronization to prevent cross-border latency discrepancies during high-frequency arbitrage.',
                  imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
                  sourceUrl: 'https://news.google.com/search?q=timezones+utc+stock+exchange'
                },
                {
                  id: 'news-4',
                  title: 'Optical Lattice Atomic Clocks Achieve 1 Second Precision in 300 Billion Years',
                  category: 'technology',
                  date: new Date(now.getTime() - 14 * 3600 * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                  timeAgo: '14 hours ago',
                  author: 'Google News - Quantum Tech',
                  readTime: '4 min read',
                  summary: 'Physicists redefine International Atomic Time (TAI) utilizing strontium optical lattice clocks for future leap second calibration.',
                  content: 'Scientists at BIPM Paris have reported milestone stability in optical quantum clocks, paving the way for redefining the SI second by 2030.',
                  imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=800&q=80',
                  sourceUrl: 'https://news.google.com/search?q=atomic+clock+quantum+time'
                },
                {
                  id: 'news-5',
                  title: 'Australia & New Zealand Daylight Saving Transition Dates Announced for Southern Hemisphere',
                  category: 'dst',
                  date: new Date(now.getTime() - 20 * 3600 * 1000).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
                  timeAgo: '20 hours ago',
                  author: 'Melbourne Time Bureau',
                  readTime: '3 min read',
                  summary: 'Southeastern Australian states (VIC, NSW, TAS, SA, ACT) prepare to advance clocks by 1 hour as summer approaches.',
                  content: 'Clocks in Melbourne, Sydney, and Adelaide will transition smoothly, while Queensland and Western Australia remain on standard time.',
                  imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
                  sourceUrl: 'https://news.google.com/search?q=australia+daylight+saving+time'
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
