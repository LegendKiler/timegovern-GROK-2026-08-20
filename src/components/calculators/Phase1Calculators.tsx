import React, { useMemo, useState } from 'react';
import { Calendar, CalendarPlus, Briefcase, ArrowRightLeft, Copy, Check } from 'lucide-react';
import { MAJOR_CITIES } from '../../lib/citiesData';
import {
  addBusinessDays,
  addToDate,
  convertBetweenZones,
  countBusinessDays,
  dateDifference,
  toISODate,
} from '../../lib/calcPhase1';

const today = () => toISODate(new Date());

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
    >
      {ok ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {ok ? 'Copied' : 'Copy'}
    </button>
  );
}

const card =
  'bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3 text-xs';
const input =
  'w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium';
const label = 'block font-medium text-slate-600 dark:text-slate-400 mb-1';

export function Phase1Calculators() {
  // A1
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return toISODate(d);
  });
  const diff = useMemo(() => dateDifference(startDate, endDate), [startDate, endDate]);

  // A2
  const [baseDate, setBaseDate] = useState(today());
  const [amount, setAmount] = useState(45);
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const resultDate = useMemo(() => addToDate(baseDate, amount, unit), [baseDate, amount, unit]);

  // A3
  const [bizStart, setBizStart] = useState(today());
  const [bizEnd, setBizEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return toISODate(d);
  });
  const [weekend, setWeekend] = useState<'sat-sun' | 'fri-sat'>('sat-sun');
  const [addBiz, setAddBiz] = useState(10);
  const bizCount = useMemo(
    () => countBusinessDays(bizStart, bizEnd, weekend, false),
    [bizStart, bizEnd, weekend]
  );
  const bizProjected = useMemo(
    () => addBusinessDays(bizStart, addBiz, weekend),
    [bizStart, addBiz, weekend]
  );

  // A4
  const defaultFrom = MAJOR_CITIES.find((c) => c.name === 'London') || MAJOR_CITIES[0];
  const defaultTo = MAJOR_CITIES.find((c) => c.name === 'New York') || MAJOR_CITIES[1];
  const [fromCity, setFromCity] = useState(defaultFrom.name);
  const [toCity, setToCity] = useState(defaultTo.name);
  const [convDate, setConvDate] = useState(today());
  const [convTime, setConvTime] = useState('09:00');
  const fromTz =
    MAJOR_CITIES.find((c) => c.name === fromCity)?.timezone || 'Europe/London';
  const toTz =
    MAJOR_CITIES.find((c) => c.name === toCity)?.timezone || 'America/New_York';
  const converted = useMemo(
    () => convertBetweenZones(convDate, convTime, fromTz, toTz),
    [convDate, convTime, fromTz, toTz]
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-800/40 bg-blue-950/30 px-3 py-2 text-[11px] text-blue-200">
        <strong>Phase 1 (lab)</strong> — A1 Date difference · A2 Add/subtract · A3 Business days · A4 Time zone
        converter. All client-side.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* A1 */}
        <div className={card}>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" /> A1 · Date difference
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Start</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>End</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={input} />
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-1.5 text-blue-900 dark:text-blue-100">
            <div className="flex justify-between text-sm font-bold">
              <span>Calendar days</span>
              <span className="font-mono text-cyan-600 dark:text-cyan-400">{diff.totalDays}</span>
            </div>
            <p className="text-[11px] opacity-80">
              {diff.absDays} days absolute · {diff.weeks}w {diff.remDays}d · {diff.totalHours.toLocaleString()} hours
            </p>
            <p className="text-[11px]">
              Breakdown: <strong>{diff.years}</strong>y <strong>{diff.months}</strong>m <strong>{diff.daysPart}</strong>d
            </p>
            <p className="text-[11px] opacity-70">
              {diff.startWeekday} → {diff.endWeekday}
            </p>
            <CopyBtn text={`${diff.totalDays} days (${diff.years}y ${diff.months}m ${diff.daysPart}d)`} />
          </div>
        </div>

        {/* A2 */}
        <div className={card}>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarPlus className="w-4 h-4 text-emerald-500" /> A2 · Add / subtract date
          </h2>
          <div>
            <label className={label}>Base date</label>
            <input type="date" value={baseDate} onChange={(e) => setBaseDate(e.target.value)} className={input} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Amount (+/−)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value as typeof unit)} className={input}>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
            <span className="text-[11px] text-slate-600 dark:text-slate-400 block">Result date</span>
            <span className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-300">{resultDate}</span>
            <p className="text-[11px] mt-1 opacity-70">
              {parseLocalLabel(resultDate)}
            </p>
            <div className="mt-2">
              <CopyBtn text={resultDate} />
            </div>
          </div>
        </div>

        {/* A3 */}
        <div className={card}>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-amber-500" /> A3 · Business days
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>From</label>
              <input type="date" value={bizStart} onChange={(e) => setBizStart(e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>To</label>
              <input type="date" value={bizEnd} onChange={(e) => setBizEnd(e.target.value)} className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Weekend rule</label>
            <select
              value={weekend}
              onChange={(e) => setWeekend(e.target.value as typeof weekend)}
              className={input}
            >
              <option value="sat-sun">Sat–Sun (most countries)</option>
              <option value="fri-sat">Fri–Sat (e.g. some MENA)</option>
            </select>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
            <div className="flex justify-between font-bold text-sm">
              <span>Business days (start incl., end excl.)</span>
              <span className="font-mono text-amber-700 dark:text-amber-300">{bizCount}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 items-end">
            <div>
              <label className={label}>Add N business days to From</label>
              <input
                type="number"
                value={addBiz}
                onChange={(e) => setAddBiz(Number(e.target.value))}
                className={input}
              />
            </div>
            <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <span className="text-[10px] opacity-60 block">Projected date</span>
              <span className="font-mono font-bold">{bizProjected}</span>
            </div>
          </div>
          <CopyBtn text={`Business days: ${bizCount}; +${addBiz} biz → ${bizProjected}`} />
        </div>

        {/* A4 */}
        <div className={card}>
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-violet-500" /> A4 · Time zone converter
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>From city</label>
              <select value={fromCity} onChange={(e) => setFromCity(e.target.value)} className={input}>
                {MAJOR_CITIES.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name} ({c.countryCode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>To city</label>
              <select value={toCity} onChange={(e) => setToCity(e.target.value)} className={input}>
                {MAJOR_CITIES.map((c) => (
                  <option key={`to-${c.id}`} value={c.name}>
                    {c.name} ({c.countryCode})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Date</label>
              <input type="date" value={convDate} onChange={(e) => setConvDate(e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Local time (from)</label>
              <input type="time" value={convTime} onChange={(e) => setConvTime(e.target.value)} className={input} />
            </div>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800/50 rounded-xl space-y-2">
            <div>
              <span className="text-[10px] uppercase tracking-wide opacity-60">In {fromCity}</span>
              <p className="font-semibold text-sm">{converted.fromLabel}</p>
              <p className="font-mono text-[10px] opacity-70">{fromTz} · {converted.offsetFrom}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wide opacity-60">In {toCity}</span>
              <p className="font-semibold text-sm text-violet-700 dark:text-violet-300">{converted.toLabel}</p>
              <p className="font-mono text-[10px] opacity-70">{toTz} · {converted.offsetTo}</p>
            </div>
            <p className="font-mono text-[10px] opacity-60">UTC {converted.utcIso}</p>
            <CopyBtn text={`${converted.fromLabel} → ${converted.toLabel} (UTC ${converted.utcIso})`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function parseLocalLabel(iso: string): string {
  try {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default Phase1Calculators;
