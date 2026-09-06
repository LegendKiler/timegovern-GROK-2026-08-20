import React, { useMemo, useState } from "react";
import { Search, Phone, Copy, Check, Flag, ArrowRightLeft } from "lucide-react";
import { COUNTRY_CODES, type CountryCodeRow } from "../data/countryCodes";
import { buildDialSequence, getIdd } from "../data/iddCodes";

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

  // Phase 2 — dial helper (default From = Australia)
  const [fromIso, setFromIso] = useState("AU");
  const [toIso, setToIso] = useState("US");
  const [national, setNational] = useState("");

  const sorted = useMemo(
    () => COUNTRY_CODES.slice().sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const fromCountry = sorted.find((c) => c.iso2 === fromIso) || sorted[0];
  const toCountry = sorted.find((c) => c.iso2 === toIso) || sorted[0];

  const sequence = useMemo(
    () =>
      buildDialSequence({
        fromIso2: fromCountry?.iso2 || "AU",
        toDial: toCountry?.dial || "1",
        nationalNumber: national,
      }),
    [fromCountry, toCountry, national]
  );

  const rows = useMemo(() => {
    return COUNTRY_CODES.filter((r) => matches(r, query)).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
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

  const swapFromTo = () => {
    setFromIso(toIso);
    setToIso(fromIso);
  };

  return (
    <div className="space-y-4">
      {/* Phase 2: How to dial */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-950/40 to-slate-900/80 dark:from-emerald-500/15 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-500" />
            How to dial internationally
          </h2>
          <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Phase 2
          </span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Choose where you are calling from and to. Optional: paste the local number (with or without leading 0).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <label className="block text-xs space-y-1">
            <span className="font-bold text-slate-600 dark:text-slate-300">From country</span>
            <select
              value={fromIso}
              onChange={(e) => setFromIso(e.target.value)}
              className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {sorted.map((c) => (
                <option key={c.iso2} value={c.iso2}>
                  {c.name} (+{c.dial})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500">Exit code (IDD): {getIdd(fromIso)}</span>
          </label>

          <div className="flex sm:items-end justify-center pb-1">
            <button
              type="button"
              onClick={swapFromTo}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10"
              title="Swap from / to"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Swap
            </button>
          </div>

          <label className="block text-xs space-y-1">
            <span className="font-bold text-slate-600 dark:text-slate-300">To country</span>
            <select
              value={toIso}
              onChange={(e) => setToIso(e.target.value)}
              className="w-full h-10 px-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100"
            >
              {sorted.map((c) => (
                <option key={"to-" + c.iso2} value={c.iso2}>
                  {c.name} (+{c.dial})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-500">Country code: +{toCountry?.dial}</span>
          </label>

          <label className="block text-xs space-y-1">
            <span className="font-bold text-slate-600 dark:text-slate-300">Local / national number</span>
            <input
              value={national}
              onChange={(e) => setNational(e.target.value)}
              placeholder="e.g. 02 1234 5678 or 2125550123"
              className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100"
            />
            <span className="text-[10px] text-slate-500">Leading 0 is removed for international form</span>
          </label>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-950/80 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Dial this sequence</p>
              <p className="text-lg sm:text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wide">
                {sequence.full || "—"}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mobile / contacts form: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{sequence.plusForm}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyText(sequence.full, "seq")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {copied === "seq" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === "seq" ? "Copied" : "Copy sequence"}
              </button>
              <button
                type="button"
                onClick={() => copyText(sequence.plusForm, "plus")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100"
              >
                {copied === "plus" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                Copy +form
              </button>
            </div>
          </div>
          <ol className="list-decimal pl-4 text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
            {sequence.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Directory */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-500" />
              Country calling codes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              International dialling prefixes and ISO codes. Search by name, +code, or ISO (e.g. AU, AUS, 61).
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
                <th className="px-3 py-2.5 font-bold w-28">Actions</th>
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
                    <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-slate-100">{r.name}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{dialFull}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">{r.iso2}</td>
                    <td className="px-3 py-2.5 font-mono text-slate-700 dark:text-slate-300">{r.iso3}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => copyText(dialFull, r.iso2)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-600 hover:bg-emerald-500/10 text-slate-700 dark:text-slate-200"
                        >
                          {copied === r.iso2 ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => setToIso(r.iso2)}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10"
                          title="Set as dial-to country"
                        >
                          Dial to
                        </button>
                      </div>
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

      <p className="text-[11px] text-slate-500 px-1">
        Exit codes can vary by carrier. Always confirm with your provider. Phase 2b will add country detail + World Clock links.
      </p>
    </div>
  );
};

export default CountryCodesPillar;
