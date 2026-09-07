import React, { useEffect, useMemo, useState } from "react";
import { Search, Phone, Copy, Check, Flag, ArrowRightLeft, Clock, Cloud, X, MapPin } from "lucide-react";
import { COUNTRY_CODES, type CountryCodeRow } from "../data/countryCodes";
import { buildDialSequence, getIdd } from "../data/iddCodes";
import { getAreaCodes } from "../data/areaCodes";
import { findCityForCountry } from "../lib/citiesData";
import type { City } from "../types";

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

type Props = {
  onNavigatePillar?: (pillar: number) => void;
  onSelectCity?: (city: City) => void;
};

export const CountryCodesPillar: React.FC<Props> = ({ onNavigatePillar, onSelectCity }) => {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [fromIso, setFromIso] = useState("AU");

  // tg-cc6-geo-from: default dial "From country" from visitor /api/geo
  useEffect(() => {
    const STORAGE = "tg_dial_from_iso_v1";
    const USER_LOCK = "tg_dial_from_user_set";

    try {
      if (localStorage.getItem(USER_LOCK) === "1") {
        const saved = localStorage.getItem(STORAGE);
        if (saved) setFromIso(saved.toUpperCase());
        return;
      }
      const saved = localStorage.getItem(STORAGE);
      if (saved) setFromIso(saved.toUpperCase());
    } catch { /* ignore */ }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/geo");
        if (!res.ok) throw new Error("geo");
        const data = await res.json();
        if (cancelled) return;
        try {
          if (localStorage.getItem(USER_LOCK) === "1") return;
        } catch { /* ignore */ }
        const country = (data.country || data.country_code || "").toString().toUpperCase();
        if (!country) return;
        // only apply if we have that ISO in the list
        setFromIso((prev) => {
          const exists = true; // validated below via sorted in render; ISO codes are 2-letter
          return country.length === 2 ? country : prev;
        });
        try {
          localStorage.setItem(STORAGE, country);
        } catch { /* ignore */ }
      } catch {
        // keep default AU/US state
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const [toIso, setToIso] = useState("US");
  const [national, setNational] = useState("");
  const [selected, setSelected] = useState<CountryCodeRow | null>(null);
  const [liveClock, setLiveClock] = useState("");

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

  const linkedCity = useMemo(
    () => (selected ? findCityForCountry(selected.iso2) : undefined),
    [selected]
  );

  useEffect(() => {
    if (!linkedCity?.timezone) {
      setLiveClock("");
      return;
    }
    const tick = () => {
      try {
        setLiveClock(
          new Intl.DateTimeFormat(undefined, {
            timeZone: linkedCity.timezone,
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(new Date())
        );
      } catch {
        setLiveClock("");
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [linkedCity?.timezone]);

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

  const openWorldClock = () => {
    if (linkedCity && onSelectCity) onSelectCity(linkedCity);
    onNavigatePillar?.(1);
  };

  const openWeather = () => {
    if (linkedCity && onSelectCity) onSelectCity(linkedCity);
    onNavigatePillar?.(4);
  };

  return (
    <div className="space-y-4">
      {/* Phase 2 dial helper */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-slate-950/40 to-slate-900/80 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-500" />
            How to dial internationally
          </h2>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Choose where you are calling from and to. Enter the destination local number only (no country code).
        </p>
        {/* Dial controls — aligned grid: From | Swap | To, then number full width */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <label className="block space-y-1.5 min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                From country
              </span>
              <select
                value={fromIso}
                onChange={(e) => { const v = e.target.value; setFromIso(v); try { localStorage.setItem('tg_dial_from_iso_v1', v); localStorage.setItem('tg_dial_from_user_set', '1'); } catch {} }}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                {sorted.map((c) => (
                  <option key={c.iso2} value={c.iso2}>
                    {c.name} (+{c.dial})
                  </option>
                ))}
              </select>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Exit code (IDD): {getIdd(fromIso)}
              </span>
            </label>

            <div className="flex justify-center md:pb-6">
              <button
                type="button"
                onClick={swapFromTo}
                title="Swap from and to"
                className="inline-flex items-center justify-center gap-1.5 h-11 min-w-[5.5rem] px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-500/20"
              >
                <ArrowRightLeft className="w-4 h-4 shrink-0" />
                Swap
              </button>
            </div>

            <label className="block space-y-1.5 min-w-0">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                To country
              </span>
              <select
                value={toIso}
                onChange={(e) => setToIso(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                {sorted.map((c) => (
                  <option key={"to-" + c.iso2} value={c.iso2}>
                    {c.name} (+{c.dial})
                  </option>
                ))}
              </select>
              <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Country code: +{toCountry?.dial}
              </span>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Local / national number
            </span>
            <input
              value={national}
              onChange={(e) => setNational(e.target.value)}
              placeholder="Digits only, e.g. 0212345678 (not the country code)"
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
            <span className="block text-[11px] text-slate-500 dark:text-slate-400">
              Enter the number as dialed inside the destination country. Do not include + or the country calling code.
            </span>
          </label>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-950/80 p-3 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Dial this sequence</p>
              <p className="text-lg sm:text-xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                {sequence.full || "—"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Mobile form: <span className="font-mono font-bold">{sequence.plusForm}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => copyText(sequence.full, "seq")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {copied === "seq" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy sequence
              </button>
              <button
                type="button"
                onClick={() => copyText(sequence.plusForm, "plus")}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-600"
              >
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

      {/* Phase 2b detail */}
      {selected && (
        <div className="rounded-2xl border border-cyan-500/30 bg-slate-50 dark:bg-slate-950/90 p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-500" />
                {selected.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calling code <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">+{selected.dial}</span>
                {" · "}ISO {selected.iso2} / {selected.iso3}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800"
              aria-label="Close detail"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => copyText("+" + selected.dial, "det-dial")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600"
            >
              {copied === "det-dial" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              Copy +{selected.dial}
            </button>
            <button
              type="button"
              onClick={() => copyText(selected.iso2, "det-iso2")}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600"
            >
              Copy {selected.iso2}
            </button>
            <button
              type="button"
              onClick={() => {
                setToIso(selected.iso2);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
            >
              Use in dial helper
            </button>
          </div>

          {linkedCity ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 p-3 space-y-2">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Linked city: <strong>{linkedCity.name}</strong>
                {linkedCity.isCapital ? " (capital)" : ""}
                {" · "}
                <span className="font-mono text-[11px]">{linkedCity.timezone}</span>
              </p>
              {liveClock && (
                <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">
                  Local time now: {liveClock}
                </p>
              )}
          {getAreaCodes(selected.iso2).length > 0 && (
            <div data-tg-area-codes className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 p-3 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Area / city codes
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  After +{selected.dial} · major list (not exhaustive)
                </p>
              </div>
              <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-100 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-2 py-1.5 font-semibold">Code</th>
                      <th className="px-2 py-1.5 font-semibold">City / region</th>
                      <th className="px-2 py-1.5 font-semibold w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAreaCodes(selected.iso2).map((a) => (
                      <tr key={a.code + a.label} className="border-t border-slate-100 dark:border-slate-800">
                        <td className="px-2 py-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{selected.dial}-{a.code}
                        </td>
                        <td className="px-2 py-1.5 text-slate-800 dark:text-slate-200">{a.label}</td>
                        <td className="px-2 py-1.5">
                          <button
                            type="button"
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            onClick={() => copyText("+" + selected.dial + a.code, "ac-" + a.code)}
                          >
                            {copied === "ac-" + a.code ? "Copied" : "Copy"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openWorldClock}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  <Clock className="w-3.5 h-3.5" /> Open World Clock
                </button>
                <button
                  type="button"
                  onClick={openWeather}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white"
                >
                  <Cloud className="w-3.5 h-3.5" /> Open Weather
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-700 dark:text-amber-300/90 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2">
              No city in the World Clock database for this country yet. Dial codes still work; World Clock / Weather links appear when a matching city exists.
            </p>
          )}
        </div>
      )}

      {/* Directory */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-500" />
              Country calling codes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Click a row for detail, dial helper, and World Clock / Weather when available.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            {rows.length} / {COUNTRY_CODES.length} countries
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search country, ISO, or dial code…"
            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm font-semibold"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-950/80 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5 font-bold">Country</th>
                <th className="px-3 py-2.5 font-bold">Dial code</th>
                <th className="px-3 py-2.5 font-bold">ISO-2</th>
                <th className="px-3 py-2.5 font-bold">ISO-3</th>
                <th className="px-3 py-2.5 font-bold w-36">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const dialFull = "+" + r.dial;
                const active = selected?.iso2 === r.iso2;
                return (
                  <tr
                    key={r.iso2}
                    onClick={() => setSelected(r)}
                    className={`border-t border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/60 ${
                      active ? "bg-cyan-500/10" : ""
                    }`}
                  >
                    <td className="px-3 py-2.5 font-semibold text-slate-900 dark:text-slate-100">{r.name}</td>
                    <td className="px-3 py-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">{dialFull}</td>
                    <td className="px-3 py-2.5 font-mono">{r.iso2}</td>
                    <td className="px-3 py-2.5 font-mono">{r.iso3}</td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => copyText(dialFull, r.iso2)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border border-slate-200 dark:border-slate-600"
                        >
                          {copied === r.iso2 ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(r);
                            setToIso(r.iso2);
                          }}
                          className="inline-flex items-center px-2 py-1 rounded-lg text-[11px] font-bold border border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
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
    </div>
  );
};

export default CountryCodesPillar;
