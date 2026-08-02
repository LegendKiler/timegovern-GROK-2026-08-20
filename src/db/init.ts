import { D1Database } from '@cloudflare/workers-types';

let isSchemaInitialized = false;

/**
 * Ensures that all Cloudflare D1 Database tables and indexes exist automatically on Cloudflare Edge.
 * Runs seamlessly on first worker invocation without requiring manual terminal commands.
 */
export async function ensureSchema(db?: D1Database): Promise<void> {
  if (!db || isSchemaInitialized) return;

  try {
    await db.batch([
      // 1. Countries Table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS countries (
          iso_code TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          continent TEXT NOT NULL,
          capital TEXT,
          currency_code TEXT,
          phone_prefix TEXT
        );
      `),
      // 2. Cities Table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS cities (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          geoname_id INTEGER UNIQUE,
          name TEXT NOT NULL,
          ascii_name TEXT,
          country_code TEXT NOT NULL,
          latitude REAL NOT NULL,
          longitude REAL NOT NULL,
          timezone TEXT NOT NULL,
          population INTEGER DEFAULT 0,
          elevation INTEGER DEFAULT 0,
          FOREIGN KEY (country_code) REFERENCES countries(iso_code)
        );
      `),
      // 3. Calculators Table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS calculators (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          formula_config_json TEXT NOT NULL
        );
      `),
      // 4. News Table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS news (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          title TEXT NOT NULL,
          summary TEXT,
          content TEXT NOT NULL,
          category TEXT NOT NULL,
          published_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),
      // Performance Indexes
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cities_timezone ON cities(timezone);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_calculators_slug ON calculators(slug);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);`)
    ]);

    isSchemaInitialized = true;
  } catch (err: any) {
    console.warn('Auto-schema initialization check:', err?.message || err);
  }
}
