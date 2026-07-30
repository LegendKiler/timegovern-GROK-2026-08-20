import { D1Database } from '@cloudflare/workers-types';

export interface Env {
  DB?: D1Database;
}

export async function handleSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = (url.searchParams.get('q') || '').trim();
  const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 50);

  if (!query || query.length < 2) {
    return new Response(
      JSON.stringify({
        success: true,
        query,
        results: { cities: [], timezones: [], calculators: [], news: [] }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const searchTerm = `%${query}%`;
  const startTime = Date.now();

  try {
    // Sub-millisecond prepared statements execution if D1 exists
    if (env.DB) {
      const cityStmt = env.DB.prepare(
        `SELECT c.id, c.geoname_id, c.name, c.country_code, c.latitude, c.longitude, c.timezone, c.population, co.name AS country_name
         FROM cities c
         LEFT JOIN countries co ON c.country_code = co.iso_code
         WHERE c.name LIKE ? OR c.ascii_name LIKE ? OR c.timezone LIKE ?
         ORDER BY c.population DESC
         LIMIT ?`
      ).bind(searchTerm, searchTerm, searchTerm, limit);

      const calcStmt = env.DB.prepare(
        `SELECT id, slug, title, category FROM calculators
         WHERE title LIKE ? OR category LIKE ? OR slug LIKE ?
         LIMIT 10`
      ).bind(searchTerm, searchTerm, searchTerm);

      const newsStmt = env.DB.prepare(
        `SELECT id, slug, title, summary, category, published_at FROM news
         WHERE title LIKE ? OR summary LIKE ? OR category LIKE ?
         ORDER BY published_at DESC
         LIMIT 10`
      ).bind(searchTerm, searchTerm, searchTerm);

      const [citiesResult, calcResult, newsResult] = await env.DB.batch([cityStmt, calcStmt, newsStmt]);

      const executionTimeMs = Date.now() - startTime;

      return new Response(
        JSON.stringify({
          success: true,
          query,
          executionTimeMs,
          results: {
            cities: citiesResult.results || [],
            calculators: calcResult.results || [],
            news: newsResult.results || []
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=60, s-maxage=300',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  } catch (error: any) {
    console.warn('D1 Edge query fallback:', error?.message);
  }

  // Fallback memory search for preview environment
  const fallbackCities = [
    { name: 'London', country_code: 'GB', country_name: 'United Kingdom', timezone: 'Europe/London' },
    { name: 'New York City', country_code: 'US', country_name: 'United States', timezone: 'America/New_York' },
    { name: 'Tokyo', country_code: 'JP', country_name: 'Japan', timezone: 'Asia/Tokyo' },
    { name: 'Cairo', country_code: 'EG', country_name: 'Egypt', timezone: 'Africa/Cairo' },
    { name: 'Rabat', country_code: 'MA', country_name: 'Morocco', timezone: 'Africa/Casablanca' },
    { name: 'Dubai', country_code: 'AE', country_name: 'United Arab Emirates', timezone: 'Asia/Dubai' },
    { name: 'Riyadh', country_code: 'SA', country_name: 'Saudi Arabia', timezone: 'Asia/Riyadh' }
  ].filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.timezone.toLowerCase().includes(query.toLowerCase()));

  return new Response(
    JSON.stringify({
      success: true,
      query,
      executionTimeMs: Date.now() - startTime,
      results: {
        cities: fallbackCities,
        calculators: [],
        news: []
      }
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
  );
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  return handleSearch(context.request, context.env);
}
