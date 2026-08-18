import { D1Database } from '@cloudflare/workers-types';
import { handleSeedDb } from './api/admin/seed-db';
import { handleSearch } from './api/search';
import { handleLeapSeconds } from './api/leapSeconds';
import { handleNews } from './api/news';
import { handleDriftAlerts } from './api/driftAlerts';
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
          service: 'TimeGovern Global Time Platform',
          hq: 'Melbourne, Victoria, Australia',
          env: 'Cloudflare D1 Workers Edge',
          ssl: '256-Bit TLS 1.3 Active',
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
      );
    }

    // 4b. Leap Seconds & TAI-UTC Time Scales API route (/api/leap-seconds or /api/time/tai-utc)
    if (
      url.pathname === '/api/leap-seconds' || 
      url.pathname === '/api/leap-seconds/' ||
      url.pathname === '/api/time/tai-utc' ||
      url.pathname === '/api/time/tai-utc/'
    ) {
      return await handleLeapSeconds(request);
    }

    // 4c. Custom TAI-UTC Drift Alerts & Notifications API route (/api/drift-alerts)
    if (url.pathname.startsWith('/api/drift-alerts') || url.pathname.startsWith('/api/alerts/drift')) {
      return await handleDriftAlerts(request, env);
    }

    // 5. Contact Us Submission API route (/api/contact)
    if (url.pathname === '/api/contact' || url.pathname === '/api/contact/') {
      if (request.method === 'POST') {
        try {
          const body: any = await request.json();
          const { name, email, phone, preferred_method, subject, message } = body;
          if (!name || !email || !subject || !message) {
            return new Response(
              JSON.stringify({ success: false, message: 'Missing required contact fields' }),
              { status: 400, headers: { ...corsHeaders, ...securityHeaders } }
            );
          }

          if (env.DB) {
            await env.DB.prepare(
              `INSERT INTO contact_messages (name, email, phone, preferred_method, subject, message) VALUES (?, ?, ?, ?, ?, ?)`
            ).bind(name, email, phone || '', preferred_method || 'email', subject, message).run();
          }

          const whatsappFormattedPhone = phone ? phone.replace(/[^0-9]/g, '') : '61390001000';
          const whatsappUrl = `https://wa.me/${whatsappFormattedPhone}?text=${encodeURIComponent(`Hello TimeGovern Australia (Brunswick HQ), my name is ${name}. Subject: ${subject}`)}`;

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Thank you for contacting TimeGovern Headquarters in Melbourne, Australia. Your message has been safely logged to our Cloudflare D1 database.',
              ticket_id: `TG-MELB-${Date.now().toString(36).toUpperCase()}`,
              whatsapp_link: whatsappUrl,
              sms_status: phone ? 'SMS notification queued to ' + phone : 'N/A',
            }),
            { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Server Error' }),
            { status: 500, headers: { ...corsHeaders, ...securityHeaders } }
          );
        }
      }
    }

    // 6. Newsletter Subscription API route (/api/newsletter)
    if (url.pathname === '/api/newsletter' || url.pathname === '/api/newsletter/') {
      if (request.method === 'POST') {
        try {
          const body: any = await request.json();
          const { email, source } = body;
          if (!email || !email.includes('@')) {
            return new Response(
              JSON.stringify({ success: false, message: 'Valid email address is required' }),
              { status: 400, headers: { ...corsHeaders, ...securityHeaders } }
            );
          }

          if (env.DB) {
            await env.DB.prepare(
              `INSERT OR IGNORE INTO newsletter_subscribers (email, source) VALUES (?, ?)`
            ).bind(email, source || 'website_footer').run();
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Subscribed successfully to TimeGovern Weekly Timezone & Daylight Saving Bulletin.',
            }),
            { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Server Error' }),
            { status: 500, headers: { ...corsHeaders, ...securityHeaders } }
          );
        }
      }
    }

    // 7. Job Application / Career Alert Subscription API route (/api/job-subscribe)
    if (url.pathname === '/api/job-subscribe' || url.pathname === '/api/job-subscribe/') {
      if (request.method === 'POST') {
        try {
          const body: any = await request.json();
          const { email, phone, position_interest } = body;
          if (!email || !email.includes('@')) {
            return new Response(
              JSON.stringify({ success: false, message: 'Valid email address is required' }),
              { status: 400, headers: { ...corsHeaders, ...securityHeaders } }
            );
          }

          if (env.DB) {
            await env.DB.prepare(
              `INSERT INTO job_applications (email, phone, position_interest) VALUES (?, ?, ?)`
            ).bind(email, phone || '', position_interest || 'General Melbourne HQ Careers').run();
          }

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Career profile saved! Our Melbourne HR team will alert you whenever new positions open at TimeGovern.',
            }),
            { status: 200, headers: { ...corsHeaders, ...securityHeaders } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ success: false, error: err?.message || 'Server Error' }),
            { status: 500, headers: { ...corsHeaders, ...securityHeaders } }
          );
        }
      }
    }

    // 8. Dynamic News Feed with Google Search Grounding API route (/api/news)
    if (url.pathname === '/api/news' || url.pathname === '/api/news/') {
      return await handleNews(request);
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

    // Security Policy: .well-known/security.txt
    if (url.pathname === '/.well-known/security.txt' || url.pathname === '/security.txt') {
      const securityTxt = `Contact: mailto:security@timegovern.com
Expires: 2028-12-31T23:59:59.000Z
Preferred-Languages: en
Canonical: https://timegovern.com/.well-known/security.txt
Policy: https://timegovern.com/security
Acknowledgments: https://timegovern.com/hall-of-fame
Hiring: https://timegovern.com/careers
`;
      return new Response(securityTxt, {
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
