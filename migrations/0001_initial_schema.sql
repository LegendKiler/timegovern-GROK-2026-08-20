-- Cloudflare D1 Migration: 0001_initial_schema.sql
-- High-performance schema for global time, timezone, astronomical & calculation platform

-- 1. Countries Table (Global ISO 3166-1 Alpha-2 records)
CREATE TABLE IF NOT EXISTS countries (
  iso_code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  continent TEXT NOT NULL,
  capital TEXT,
  currency_code TEXT,
  phone_prefix TEXT
);

-- 2. Cities Table (Global GeoNames records for 195+ countries)
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

-- 3. Calculators Table (Interactive temporal, IT, network & financial calculators)
CREATE TABLE IF NOT EXISTS calculators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  formula_config_json TEXT NOT NULL
);

-- 4. News Table (Temporal, Daylight Saving, Astronomical & Timezone News)
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes for sub-millisecond Edge Lookups
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_cities_timezone ON cities(timezone);
CREATE INDEX IF NOT EXISTS idx_cities_country_code ON cities(country_code);
CREATE INDEX IF NOT EXISTS idx_calculators_slug ON calculators(slug);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
