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
      // 5. Contact Messages Table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS contact_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          preferred_method TEXT DEFAULT 'email',
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),
      // 6. Newsletter Subscribers Table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS newsletter_subscribers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          source TEXT DEFAULT 'website_footer',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),
      // 7. Job Application / Talent Alert Subscribers Table
      db.prepare(`
        CREATE TABLE IF NOT EXISTS job_applications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL,
          phone TEXT,
          position_interest TEXT DEFAULT 'general',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `),
      // Performance Indexes
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cities_timezone ON cities(timezone);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_calculators_slug ON calculators(slug);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_messages(email);`),
      db.prepare(`CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);`)
    ]);

    isSchemaInitialized = true;
  } catch (err: any) {
    console.warn('Auto-schema initialization check:', err?.message || err);
  }
}
