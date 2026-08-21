import React, { useState } from 'react';
import { Key, Zap, ShieldCheck, Check, Copy, ExternalLink, Code2, Database } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { AdBanner } from './AdBanner';

export const EnterpriseServicesPillar: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'timezone' | 'convert' | 'astronomy' | 'holidays' | 'weather'>(
    'timezone'
  );
  const [targetCity, setTargetCity] = useState('Melbourne');
  const [toCity, setToCity] = useState('London');
  const [apiKey, setApiKey] = useState('tg_live_lab_demo_key');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [apiResponse, setApiResponse] = useState('');
  const [error, setError] = useState('');

  const cityObj = MAJOR_CITIES.find((c) => c.name === targetCity) || MAJOR_CITIES[0];
  const toObj = MAJOR_CITIES.find((c) => c.name === toCity) || MAJOR_CITIES[1];

  const handleGenerateKey = () => {
    const randomHex = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setApiKey(`tg_live_${randomHex}`);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleExecuteApiCall = async () => {
    setIsExecuting(true);
    setError('');
    setApiResponse('Requesting…');

    try {
      let path = '';
      if (selectedEndpoint === 'timezone') {
        path = `/api/v1/time?tz=${encodeURIComponent(cityObj.timezone)}&city=${encodeURIComponent(cityObj.name)}`;
      } else if (selectedEndpoint === 'convert') {
        path = `/api/v1/convert?from=${encodeURIComponent(cityObj.timezone)}&to=${encodeURIComponent(toObj.timezone)}`;
      } else {
        // Still demo JSON for endpoints not yet live
        await new Promise((r) => setTimeout(r, 400));
        const demo =
          selectedEndpoint === 'astronomy'
            ? {
                status: 501,
                message: 'Astronomy API scheduled Phase E — see docs/API-ROADMAP.md',
                city: cityObj.name,
              }
            : selectedEndpoint === 'holidays'
              ? {
                  status: 501,
                  message: 'Holidays API scheduled Phase E',
                  country_code: cityObj.countryCode,
                }
              : {
                  status: 501,
                  message: 'Weather proxy scheduled later',
                  city: cityObj.name,
                };
        setApiResponse(JSON.stringify(demo, null, 2));
        setIsExecuting(false);
        return;
      }

      const res = await fetch(path);
      const text = await res.text();
      setApiResponse(text);
      if (!res.ok) setError(`HTTP ${res.status}`);
    } catch (e: any) {
      setError(e?.message || 'Request failed');
      setApiResponse(JSON.stringify({ error: String(e) }, null, 2));
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
            LAB · Live v1 time + convert
          </span>
        </div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <Code2 className="w-6 h-6 text-cyan-400" /> TimeGovern API console
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Real endpoints: <code className="text-emerald-400">GET /api/v1/time</code> and{' '}
          <code className="text-emerald-400">GET /api/v1/convert</code>. Roadmap:{' '}
          <code className="text-slate-300">docs/API-ROADMAP.md</code>. API keys are demo-only until Phase C.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-500" /> API key (demo)
            </h2>
            <div className="flex gap-2">
              <code className="flex-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-950 px-3 py-2 rounded-lg truncate">
                {apiKey}
              </code>
              <button type="button" onClick={handleCopyKey} className="px-3 py-2 rounded-lg bg-slate-800 text-white text-xs">
                {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button type="button" onClick={handleGenerateKey} className="px-3 py-2 rounded-lg border text-xs font-semibold">
                Generate
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" /> Endpoint
            </h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {(['timezone', 'convert', 'astronomy', 'holidays', 'weather'] as const).map((ep) => (
                <button
                  key={ep}
                  type="button"
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`p-2 rounded-xl border font-semibold ${
                    selectedEndpoint === ep
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {ep}
                  {(ep === 'timezone' || ep === 'convert') && (
                    <span className="block text-[9px] opacity-80 font-normal">live</span>
                  )}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium">From city</label>
            <select
              value={targetCity}
              onChange={(e) => setTargetCity(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-950"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name} ({c.timezone})
                </option>
              ))}
            </select>

            {selectedEndpoint === 'convert' && (
              <>
                <label className="block text-xs font-medium">To city</label>
                <select
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-950"
                >
                  {MAJOR_CITIES.map((c) => (
                    <option key={`to-${c.id}`} value={c.name}>
                      {c.name} ({c.timezone})
                    </option>
                  ))}
                </select>
              </>
            )}

            <button
              type="button"
              onClick={handleExecuteApiCall}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-bold disabled:opacity-50"
            >
              {isExecuting ? 'Calling…' : 'Execute request'}
            </button>
            {error && <p className="text-xs text-rose-500">{error}</p>}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 border rounded-2xl p-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-bold flex items-center gap-1 text-slate-800 dark:text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Try in browser
            </p>
            <a className="text-cyan-600 hover:underline break-all" href="/api/v1/time?tz=Australia/Melbourne" target="_blank" rel="noreferrer">
              /api/v1/time?tz=Australia/Melbourne
            </a>
            <br />
            <a
              className="text-cyan-600 hover:underline break-all"
              href="/api/v1/convert?from=America/New_York&to=Australia/Melbourne"
              target="_blank"
              rel="noreferrer"
            >
              /api/v1/convert?from=America/New_York&to=Australia/Melbourne
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Response
            </h2>
            <span className="text-[10px] font-mono text-slate-500">JSON</span>
          </div>
          <pre className="text-[11px] font-mono text-emerald-400/90 overflow-auto max-h-[480px] whitespace-pre-wrap">
            {apiResponse || '// Click Execute — timezone & convert hit live /api/v1/*'}
          </pre>
        </div>
      </div>

      <AdBanner type="in-feed" />
    </div>
  );
};
