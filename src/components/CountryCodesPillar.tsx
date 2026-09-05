import React, { useMemo, useState } from "react";
import { Search, Phone, Copy, Check, Flag } from "lucide-react";
import { COUNTRY_CODES, type CountryCodeRow } from "../data/countryCodes";

function matches(row: CountryCodeRow, q: string): boolean {
  const s = q.trim().toLowerCase();
  if (!s) return true;
  const dial = row.dial.replace(/\s+/g, "");
  const qDial = s.replace(/^\+/, "").replace(/\s+/g, "");
  return (
    row.name.toLowerCase().includes(s) ||
    row.iso2.toLowerCase() === s ||
    row.iso3.toLowerCase() === s ||
    row.iso2.toLowerCase().includes(s) ||
    row.iso3.toLowerCase().includes(s) ||
    dial.includes(qDial) ||
    ("+" + dial).includes(s)
  );
}

export const CountryCodesPillar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = COUNTRY_CODES.filter((r) => matches(r, query));
    return list.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [query]);

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-500" />
              Country calling codes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              International dialling prefixes and ISO country codes. Search by name, +code, or ISO (e.g. AU, AUS, 61).
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            {rows.length} / {COUNTRY_CODES.length} countries
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country, ISO, or dial code…"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            aria-label="Search country codes"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-3 py-2.5 font-bold">Country</th>
                <th className="px-3 py-2.5 font-bold">Dial code</th>
                <th className="px-3 py-2.5 font-bold">ISO-2</th>
                <th className="px-3 py-2.5 font-bold">ISO-3</th>
                <th className="px-3 py-2.5 font-bold w-24">Copy</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const dialFull = "+" + r.dial;
                return (
                  <tr
                    key={r.iso2}
                    className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/60"
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-slate-100">
                      <span className="inline-flex items-center gap-2">
                        <Flag className="w-3.5 h-3.5 text-slate-400" />
                        {r.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {dialFull}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">{r.iso2}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">{r.iso3}</td>
                    <td className="px-3 py-2.5">
                      <button
                        type="button"
                        onClick={() => copyText(dialFull, r.iso2)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-600 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-slate-700 dark:text-slate-200"
                        title={"Copy " + dialFull}
                      >
                        {copied === r.iso2 ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        {copied === r.iso2 ? "Copied" : "Copy"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                    No countries match “{query}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-500 px-1">
        Dial codes follow the international country calling plan (E.164 style). Always confirm local exit codes with your carrier. Phase 2 will add time-zone links and dial-from helpers.
      </p>
    </div>
  );
};

export default CountryCodesPillar;
