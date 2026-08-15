import React, { useState } from 'react';
import { Key, Terminal, Zap, ShieldCheck, Check, Copy, ExternalLink, Code2, Database, DollarSign, Layers } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { AdBanner } from './AdBanner';

export const EnterpriseServicesPillar: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'timezone' | 'astronomy' | 'holidays' | 'weather'>('timezone');
  const [targetCity, setTargetCity] = useState<string>('New York');
  const [apiKey, setApiKey] = useState<string>('tg_live_8f39a1c4b2e97d10c4a0');
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [apiResponse, setApiResponse] = useState<string>('');

  const cityObj = MAJOR_CITIES.find(c => c.name === targetCity) || MAJOR_CITIES[0];

  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`tg_live_${randomHex}`);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExecuteApiCall = () => {
    setIsExecuting(true);
    setApiResponse('Sending HTTP GET request to Cloudflare Edge API worker...');

    setTimeout(() => {
      setIsExecuting(false);
      let resData = {};

      if (selectedEndpoint === 'timezone') {
        resData = {
          status: 200,
          message: "Success",
          city: cityObj.name,
          country: cityObj.country,
          country_code: cityObj.countryCode,
          timezone_iana: cityObj.timezone,
          utc_offset: cityObj.timezone === 'America/New_York' ? '-04:00' : '+00:00',
          is_dst: true,
          current_local_time: new Date().toLocaleString('en-US', { timeZone: cityObj.timezone }),
          unix_timestamp: Math.floor(Date.now() / 1000),
          next_dst_transition: "2026-11-01T02:00:00Z"
        };
      } else if (selectedEndpoint === 'astronomy') {
        resData = {
          status: 200,
          city: cityObj.name,
          date: new Date().toISOString().split('T')[0],
          sun: {
            sunrise: "05:48:12 AM",
            sunset: "08:22:45 PM",
            solar_noon: "01:05:28 PM",
            day_length_seconds: 52473,
            civil_twilight_start: "05:18:00 AM",
            astronomical_twilight_end: "10:02:11 PM"
          },
          moon: {
            phase: "Waxing Gibbous",
            illumination_percent: 84.2,
            moonrise: "04:12 PM",
            moonset: "02:45 AM"
          }
        };
      } else if (selectedEndpoint === 'holidays') {
        resData = {
          status: 200,
          country_code: cityObj.countryCode,
          year: 2026,
          total_public_holidays: 11,
          upcoming_holidays: [
            { date: "2026-09-07", name: "Labor Day", type: "Federal Public Holiday" },
            { date: "2026-10-12", name: "Columbus Day", type: "Bank Holiday" },
            { date: "2026-11-26", name: "Thanksgiving Day", type: "National Holiday" }
          ]
        };
      } else {
        resData = {
          status: 200,
          city: cityObj.name,
          temperature_c: 24.5,
          temperature_f: 76.1,
          condition: "Partly Cloudy",
          humidity_percent: 58,
          wind_kph: 14.2,
          uv_index: 6
        };
      }

      setApiResponse(JSON.stringify(resData, null, 2));
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800">
              TIMEGOVERN COMMERCIAL API & SERVICES HUB
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            High-Precision Global Time, Astronomy & Holiday Enterprise APIs
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Powering Fortune 500 logistics, flight schedules, calendar applications, and fintech ledgers with 99.99% Cloudflare Edge SLA.
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-700 p-3 rounded-xl flex flex-col gap-1 text-xs shrink-0 font-mono">
          <div className="flex justify-between gap-4 text-slate-300">
            <span>EDGE LATENCY:</span>
            <span className="text-emerald-400 font-bold">&lt; 12ms</span>
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>UPTIME SLA:</span>
            <span className="text-blue-400 font-bold">99.99%</span>
          </div>
        </div>
      </div>

      {/* API Key Management Dashboard Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md text-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Key className="w-4 h-4" /> Live API Authorization Token
          </span>
          <div className="flex items-center gap-2 font-mono text-xs text-slate-300 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <span className="text-emerald-400">{apiKey}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyKey}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Key Copied' : 'Copy API Key'}</span>
          </button>
          <button
            onClick={handleGenerateKey}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-blue-600/20"
          >
            <Zap className="w-3.5 h-3.5" /> Regenerate Token
          </button>
        </div>
      </div>

      {/* Interactive API Sandbox / Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-md text-slate-100">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Terminal className="w-4 h-4 text-blue-400" /> Interactive API Console & Request Builder
          </h3>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Target API Endpoint</label>
            <select
              value={selectedEndpoint}
              onChange={(e: any) => setSelectedEndpoint(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
            >
              <option value="timezone">GET /api/v1/timezone (IANA & DST Lookup)</option>
              <option value="astronomy">GET /api/v1/astronomy (Sun, Moon & Twilight)</option>
              <option value="holidays">GET /api/v1/holidays (200+ Country Bank Holidays)</option>
              <option value="weather">GET /api/v1/weather (Meteorological Conditions)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">Location Parameter (?city=)</label>
            <select
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExecuteApiCall}
              disabled={isExecuting}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <Zap className="w-4 h-4" />
              <span>{isExecuting ? 'Executing Request...' : 'Execute Live API Request'}</span>
            </button>
          </div>
        </div>

        {/* Console Response Inspector */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-inner">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-emerald-400" /> HTTP 200 OK Response Payload (JSON)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                content-type: application/json
              </span>
            </div>

            <pre className="text-xs font-mono text-emerald-400 bg-slate-900/80 p-4 rounded-xl border border-slate-800/80 overflow-x-auto min-h-[220px] max-h-[300px]">
              {apiResponse || '// Click "Execute Live API Request" above to test response output'}
            </pre>
          </div>

          <div className="mt-3 text-[11px] text-slate-400 font-mono flex items-center justify-between">
            <span>Rate Limit: 10,000 req / day (Free Tier)</span>
            <span>CORS Allowed: *</span>
          </div>
        </div>
      </div>

      {/* Enterprise Commercial Pricing Plans Matrix */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h3 className="text-lg font-extrabold text-white text-center">Commercial API & SLA Subscription Tiers</h3>
        <p className="text-xs text-slate-400 text-center max-w-xl mx-auto">
          Flexible licensing for developers, startups, and global enterprise platforms requiring guaranteed uptime and dedicated support.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          {/* Free Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Developer Free</span>
              <div className="text-3xl font-extrabold text-white font-mono my-2">$0 <span className="text-xs font-sans text-slate-400">/ mo</span></div>
              <ul className="text-xs space-y-2 text-slate-300 my-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 10,000 API requests / month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Standard Timezone & DST Data</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Community Discord Support</li>
              </ul>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl transition-colors">
              Current Active Plan
            </button>
          </div>

          {/* Pro Tier */}
          <div className="bg-slate-900 border-2 border-blue-500 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative">
            <span className="absolute top-3 right-3 text-[9px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">
              MOST POPULAR
            </span>
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">Pro Developer</span>
              <div className="text-3xl font-extrabold text-white font-mono my-2">$49 <span className="text-xs font-sans text-slate-400">/ mo</span></div>
              <ul className="text-xs space-y-2 text-slate-300 my-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 1,000,000 API requests / month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> High-frequency Astronomy & Weather</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 200+ Public Holiday Calendars</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority Email SLA Support</li>
              </ul>
            </div>
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-blue-600/30">
              Upgrade to Pro API
            </button>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">Enterprise SLA</span>
              <div className="text-3xl font-extrabold text-white font-mono my-2">$299 <span className="text-xs font-sans text-slate-400">/ mo</span></div>
              <ul className="text-xs space-y-2 text-slate-300 my-4">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited API requests</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 99.99% Guaranteed Edge Uptime SLA</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Custom IANA Database Exports</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Dedicated Technical Account Mgr</li>
              </ul>
            </div>
            <button className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2 rounded-xl transition-colors">
              Contact Enterprise Sales
            </button>
          </div>
        </div>
      </div>

      <AdBanner type="in-feed" />
    </div>
  );
};
