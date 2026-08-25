import React, { useState } from 'react';
import {
  Globe,
  Database,
  Sun,
  RefreshCw,
  Shield,
  X,
  Clock,
  Map,
  BookOpen,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'data' | 'update' | 'quality';

/**
 * Public explainer: how TimeGovern keeps clocks, zones and sky data current.
 * Product language only — not a hosting or deploy runbook.
 */
export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TabId>('data');

  if (!isOpen) return null;

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'data', label: 'What powers the clocks', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'update', label: 'How data stays current', icon: <RefreshCw className="w-3.5 h-3.5" /> },
    { id: 'quality', label: 'Accuracy & limits', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto text-slate-100">
        <div className="p-5 border-b border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">How TimeGovern keeps time data current</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                World clocks, calendars and sky tools depend on shared standards — not guesswork.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 pt-4 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                tab === t.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                  : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
          {tab === 'data' && (
            <>
              <p className="text-slate-200">
                TimeGovern is built so that a meeting in Melbourne, a flight in Dubai and a deadline in New York can be
                compared on the same underlying rules.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Map className="w-4 h-4" /> Time zones (IANA)
                  </div>
                  <p>
                    City times follow the public <strong className="text-white">IANA time zone database</strong> — the
                    same family of rules used across modern operating systems and libraries. Each place maps to an IANA
                    id (for example <span className="font-mono text-cyan-300/90">Australia/Melbourne</span>), not only a
                    three-letter abbreviation.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Sun className="w-4 h-4" /> Sun &amp; Moon
                  </div>
                  <p>
                    Sunrise, sunset, twilight and lunar position use established astronomical algorithms. Results are
                    calculated for the city or coordinates you select, including polar day/night messaging where the Sun
                    does not rise or set.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Clock className="w-4 h-4" /> Live display
                  </div>
                  <p>
                    On-screen clocks tick from your device clock, aligned to the selected zone. Optional server time
                    checks reduce long-running drift when you leave a tab open for hours.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-950/80 p-3 space-y-1">
                  <div className="flex items-center gap-2 text-violet-300 font-bold">
                    <BookOpen className="w-4 h-4" /> Calendars &amp; holidays
                  </div>
                  <p>
                    Calendar views and workday helpers use standard date libraries. Public-holiday and business-day
                    helpers are informational — always confirm statutory deadlines with official sources.
                  </p>
                </div>
              </div>
            </>
          )}

          {tab === 'update' && (
            <>
              <p className="text-slate-200">
                Governments occasionally change daylight-saving rules. Leap seconds are rare but real. TimeGovern is
                designed so zone rules and reference data can be refreshed without rewriting the whole product.
              </p>
              <ul className="space-y-2">
                {[
                  {
                    t: 'Zone rule updates',
                    d: 'When the IANA community publishes new daylight-saving or offset changes, libraries and city mappings on TimeGovern are updated so saved cities keep the correct local time.',
                  },
                  {
                    t: 'Continuous product delivery',
                    d: 'Improvements to world clock, meeting planner, astronomy tables and calculators ship through our normal release process so the public site stays current.',
                  },
                  {
                    t: 'News & weather context',
                    d: 'Headline and weather panels refresh from public data sources on a short interval so the “now” context around your clocks stays relevant.',
                  },
                  {
                    t: 'Your preferences',
                    d: 'Pinned cities, theme and many layout choices can stay in your browser so returning visits feel familiar without requiring an account.',
                  },
                ].map((item) => (
                  <li key={item.t} className="flex gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-3">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white text-[11px]">{item.t}</p>
                      <p className="text-slate-400 mt-0.5">{item.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {tab === 'quality' && (
            <>
              <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 flex gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-200">Honest limits:</strong> TimeGovern is a high-quality planning tool,
                  not a national timing laboratory. Device clocks, network delay and brand-new government announcements
                  can still create edge cases.
                </p>
              </div>
              <ul className="space-y-2 list-disc pl-5 text-slate-400">
                <li>
                  Prefer <strong className="text-slate-200">IANA zone ids and numeric UTC offsets</strong> over
                  ambiguous abbreviations (for example “CST” means different things in different countries).
                </li>
                <li>
                  For contracts, transport, medicine or safety-critical work, confirm times with the official authority
                  for that jurisdiction.
                </li>
                <li>
                  Astronomy times are geometric models for the selected location; local horizon, elevation and weather
                  can change what you actually see.
                </li>
                <li>
                  Pay and tax-related calculators are educational helpers, not formal advice from the ATO, IRS or other
                  agencies.
                </li>
              </ul>
              <p className="text-slate-500 pt-1">
                Questions about accuracy or data sources: contact@timegovern.com · Security reports:
                security@timegovern.com
              </p>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureModal;
