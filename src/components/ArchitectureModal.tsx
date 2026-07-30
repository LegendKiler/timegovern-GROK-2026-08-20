import React, { useState } from 'react';
import { Database, Server, Cpu, Globe, Zap, CheckCircle2, Shield, X, GitBranch, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'github-autoupdates' | 'recommendations'>('github-autoupdates');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-xl shadow-md">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">TimeGovern Architecture & GitHub Daily Automation</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cloudflare Edge Engine, IANA tzdata 2026a Pipeline & Automated GitHub Actions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 text-xs font-bold">
          <button
            onClick={() => setActiveTab('github-autoupdates')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'github-autoupdates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <GitBranch className="w-4 h-4 text-cyan-300" />
            <span>GitHub Daily Auto-Updates</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-300" />
            <span>DB & Systems Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg cursor-pointer transition-all ${
              activeTab === 'recommendations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Recommended Next Steps</span>
          </button>
        </div>

        {/* TAB 1: GitHub Daily Auto-Updates */}
        {activeTab === 'github-autoupdates' && (
          <div className="space-y-5 text-xs">
            <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 p-4 rounded-xl border border-blue-500/30 text-slate-100 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-300">
                <RefreshCw className="w-4 h-4 animate-spin-slow text-cyan-400" />
                <span>How GitHub Daily Auto-Updates Work (No Local PC Needed!)</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Your application uses <strong>GitHub Actions</strong> workflows defined in <code>.github/workflows/daily-update.yml</code>.
                You do <strong>NOT</strong> need to keep your PC turned on or run any background software. GitHub runs serverless containers automatically in the cloud every day.
              </p>
            </div>

            {/* Where Updates Come From */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> Where Data Updates Come From:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-blue-600 dark:text-cyan-400 block mb-1">1. News & Articles Feed</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Fetched dynamically via Open RSS feeds, Daylight Saving Time legislative databases, and IANA timezone announcements.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">2. IANA Timezone Data (tzdata 2026a)</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Automatically checks official IANA tz repository for updated Daylight Saving Time rules and country offset shifts.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">3. Weather & Astronomical Data</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Pulled directly from Open-Meteo real-time satellite APIs and NOAA Meeus solar/lunar horizon algorithms.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">4. Worldometers & Ticker Statistics</span>
                  <p className="text-slate-600 dark:text-slate-400">
                    Real-time algorithmic state models calculating population growth, energy consumption, and birth/death rates live.
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow File Example */}
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">GitHub Action Workflow Configuration (.github/workflows/daily-update.yml)</span>
              <pre className="font-mono text-[11px] text-slate-300 overflow-x-auto p-2 bg-slate-950 rounded">
{`name: Daily Auto-Update & Cloudflare Deploy
on:
  schedule:
    - cron: '0 0 * * *' # Runs daily at 00:00 UTC
  workflow_dispatch:

jobs:
  update-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: \${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`}
              </pre>
            </div>
          </div>
        )}

        {/* TAB 2: DB & Systems Architecture */}
        {activeTab === 'architecture' && (
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
CREATE INDEX idx_cities_search ON cities(name, country_name);`}
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
                  <Zap className="w-4 h-4" /> 3. Edge Caching & High-Concurrency
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
          </div>
        )}

        {/* TAB 3: Recommended Next Steps */}
        {activeTab === 'recommendations' && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" /> Recommended Enhancements & Best Practices:
            </h3>

            <div className="space-y-3">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-xl border border-amber-300 dark:border-amber-800/60 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-amber-900 dark:text-amber-200 font-bold block">1. Cloudflare Repository Secrets Setup</strong>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                    In your GitHub repository settings under <strong>Settings → Secrets and variables → Actions</strong>, add <code>CLOUDFLARE_API_TOKEN</code> and <code>CLOUDFLARE_ACCOUNT_ID</code> so GitHub Actions can deploy cleanly every day without failing.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-xl border border-blue-300 dark:border-blue-800/60 flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-blue-900 dark:text-blue-200 font-bold block">2. Google AdSense / Mediavine Ads.txt Setup</strong>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                    Place your custom <code>ads.txt</code> publisher file inside the <code>/public</code> directory. This enables commercial monetization banners automatically.
                  </p>
                </div>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-800/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-900 dark:text-emerald-200 font-bold block">3. Cloudflare D1 Database Auto-Migrations</strong>
                  <p className="text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                    The edge API in <code>src/index.ts</code> uses <code>env.DB</code> to serve search and seed endpoints. Execute <code>npx wrangler d1 execute zoneshift-db --file=migrations/0001_initial.sql</code> on initial deployment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span className="flex items-center gap-1 font-mono text-[11px]">
            <Shield className="w-4 h-4 text-emerald-500" /> Fully functional Cloudflare Workers & GitHub Actions ecosystem
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs cursor-pointer"
          >
            Close Docs
          </button>
        </div>
      </div>
    </div>
  );
};
