import React from 'react';
import { Database, Server, Cpu, Globe, Zap, CheckCircle2, Shield, X } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">System Architecture & Database Schema</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">High-Concurrency Infrastructure & IANA tzdata Pipeline Design</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Database Schema Section */}
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-3">
              <Server className="w-4 h-4" /> 1. PostgreSQL & PostGIS Schema (Cities, Timezones, Boundaries & Holidays)
            </h3>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-md text-xs font-mono overflow-x-auto">
{`-- Enable PostGIS for geographic boundary and spatial indexing
CREATE EXTENSION IF NOT EXISTS postgis;

-- Global Cities Table
CREATE TABLE cities (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country_name VARCHAR(255) NOT NULL,
    country_code CHAR(2) NOT NULL,
    state_province VARCHAR(255),
    timezone_id VARCHAR(128) NOT NULL, -- IANA TZ e.g. 'America/New_York'
    coordinates GEOGRAPHY(Point, 4326) NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    population BIGINT,
    is_capital BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cities_tz ON cities(timezone_id);
CREATE INDEX idx_cities_spatial ON cities USING GIST(coordinates);
CREATE INDEX idx_cities_search ON cities(name, country_name);

-- IANA Time Zone Rules & DST Shift History
CREATE TABLE timezone_rules (
    id SERIAL PRIMARY KEY,
    timezone_id VARCHAR(128) NOT NULL,
    utc_offset_seconds INT NOT NULL,
    dst_offset_seconds INT NOT NULL,
    transition_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    is_dst BOOLEAN NOT NULL,
    abbreviation VARCHAR(16) NOT NULL,
    CONSTRAINT fk_tz FOREIGN KEY(timezone_id) REFERENCES timezone_rules(timezone_id) ON DELETE CASCADE
);

CREATE INDEX idx_tz_rules_lookup ON timezone_rules(timezone_id, transition_timestamp DESC);

-- Regional Public Holidays Database
CREATE TABLE public_holidays (
    id SERIAL PRIMARY KEY,
    country_code CHAR(2) NOT NULL,
    holiday_date DATE NOT NULL,
    holiday_name VARCHAR(255) NOT NULL,
    local_name VARCHAR(255),
    holiday_type VARCHAR(32) CHECK (holiday_type IN ('NATIONAL', 'REGIONAL', 'OBSERVANCE')),
    description TEXT
);

CREATE INDEX idx_holidays_lookup ON public_holidays(country_code, holiday_date);`}
            </pre>
          </div>

          {/* Pipeline & Caching */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" /> 2. Automated IANA tzdata Pipeline
              </h3>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Cron Ingestion:</strong> Monthly automated worker pulls latest <code>tzdb</code> zic rules from standard IANA sources.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>DST Transition Cache:</strong> Pre-calculates DST shift boundaries 10 years in past and 20 years into the future.</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" /> 3. Redis Caching & High-Concurrency
              </h3>
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>City Time Key Cache:</strong> High-frequency city search requests cached with TTL of 60s.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Client-Side Engine:</strong> Low-latency Meeus ephemeris and IANA Intl algorithms executed locally in browser memory for zero UI lag.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Ephemeris & Astronomy Engine */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4" /> 4. Meeus & NOAA Ephemeris Math Algorithms
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Calculates solar declination, equation of time, solar zenith angle (90°50' official sunrise/sunset, 96° civil twilight, 102° nautical, 108° astronomical), synodic moon age (29.53058867 days), and planetary horizon positions (Mercury, Venus, Mars, Jupiter, Saturn) in real-time.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-4 h-4 text-emerald-500" /> Fully functional offline-capable client-side architecture
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs"
          >
            Close Architecture Docs
          </button>
        </div>
      </div>
    </div>
  );
};
