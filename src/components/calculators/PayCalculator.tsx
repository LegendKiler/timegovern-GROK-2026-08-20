import React, { useMemo, useState } from 'react';
import { DollarSign, Copy, Check, Info } from 'lucide-react';
import {
  PAY_COUNTRIES,
  PayCountry,
  PayFrequency,
  AuResidentType,
  US_STATES,
  calculatePay,
  fromAnnual,
} from '../../lib/payTaxTables';

function money(symbol: string, n: number) {
  return `${symbol}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function PayCalculator() {
  const [country, setCountry] = useState<PayCountry>('AU');
  const [freq, setFreq] = useState<PayFrequency>('annual');
  const [gross, setGross] = useState(90000);
  const [hours, setHours] = useState(38);
  const [hasHecs, setHasHecs] = useState(false);
  const [medicareExempt, setMedicareExempt] = useState(false);
  const [auResident, setAuResident] = useState<AuResidentType>('resident');
  const [hasPrivateHospital, setHasPrivateHospital] = useState(true);
  const [familyMls, setFamilyMls] = useState(false);
  const [usState, setUsState] = useState('CA');
  const [sacrifice, setSacrifice] = useState(0);
  const [extraSuper, setExtraSuper] = useState(0);

  const result = useMemo(
    () =>
      calculatePay({
        country,
        grossInput: gross,
        frequency: freq,
        hoursPerWeek: hours,
        hasHecs,
        medicareExempt,
        includeSuperOnTop: true,
        usStateCode: usState,
        auResident,
        hasPrivateHospital,
        familyMls,
        salarySacrificeAnnual: sacrifice,
        extraSuperAnnual: extraSuper,
      }),
    [
      country,
      gross,
      freq,
      hours,
      hasHecs,
      medicareExempt,
      usState,
      auResident,
      hasPrivateHospital,
      familyMls,
      sacrifice,
      extraSuper,
    ]
  );

  const [copied, setCopied] = useState(false);
  const periodNet = fromAnnual(result.netAnnual, freq, hours);
  const periodGross = fromAnnual(result.grossAnnual, freq, hours);
  const meta = PAY_COUNTRIES.find((c) => c.code === country)!;

  return (
    <div className="space-y-4 text-xs">
      <div className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 px-3 py-2 text-[11px] text-emerald-200 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Pay calculator (lab).</strong> Default <strong>Australia</strong> with LITO, Medicare, MLS,
          resident types, HELP, super, and salary sacrifice. US includes all 50 states + DC. Estimates only — not
          official advice.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-500" /> Take-home pay
          </h2>

          <div>
            <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value as PayCountry)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-medium"
            >
              {PAY_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Gross amount</label>
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Frequency</label>
              <select
                value={freq}
                onChange={(e) => setFreq(e.target.value as PayFrequency)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
              >
                <option value="annual">Annual</option>
                <option value="monthly">Monthly</option>
                <option value="fortnightly">Fortnightly</option>
                <option value="weekly">Weekly</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>

          {freq === 'hourly' && (
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Hours / week</label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2"
              />
            </div>
          )}

          {country === 'AU' && (
            <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-700 pt-3">
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Resident type</label>
              <select
                value={auResident}
                onChange={(e) => setAuResident(e.target.value as AuResidentType)}
                className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2"
              >
                <option value="resident">Australian resident</option>
                <option value="foreign">Foreign resident</option>
                <option value="whm">Working holiday maker</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={hasHecs} onChange={(e) => setHasHecs(e.target.checked)} />
                HELP / HECS debt
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={medicareExempt}
                  onChange={(e) => setMedicareExempt(e.target.checked)}
                />
                Medicare levy exempt
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPrivateHospital}
                  onChange={(e) => setHasPrivateHospital(e.target.checked)}
                />
                Private hospital cover (avoids MLS)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={familyMls} onChange={(e) => setFamilyMls(e.target.checked)} />
                Family MLS thresholds
              </label>
            </div>
          )}

          {country === 'US' && (
            <div>
              <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">US state</label>
              <select
                value={usState}
                onChange={(e) => setUsState(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2"
              >
                {US_STATES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name} ({s.code}){s.rate === 0 ? ' — no state income tax' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-2">
            <p className="font-bold text-slate-700 dark:text-slate-200">Salary sacrifice / packaging (annual)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Pre-tax package / 401k-style
                </label>
                <input
                  type="number"
                  value={sacrifice}
                  onChange={(e) => setSacrifice(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Extra concessional super (AU)
                </label>
                <input
                  type="number"
                  value={extraSuper}
                  onChange={(e) => setExtraSuper(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border rounded-lg px-3 py-2 font-mono"
                  disabled={country !== 'AU'}
                />
              </div>
            </div>
            <p className="text-[10px] opacity-60">
              Reduces taxable income. AU: car/novated-style package amount + voluntary concessional super. US: models
              pre-tax deduction. Not a full FBT engine.
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-emerald-800 dark:text-emerald-300 font-bold">
                Take-home ({freq}) · {meta.name}
              </p>
              <p className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300 mt-1">
                {money(result.symbol, periodNet)}
              </p>
              <p className="text-[11px] opacity-70 mt-0.5">
                from {money(result.symbol, periodGross)} gross / {freq}
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const t = `${meta.name}: net ${money(result.symbol, result.netAnnual)}/yr from ${money(result.symbol, result.grossAnnual)} gross`;
                try {
                  await navigator.clipboard.writeText(t);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* */
                }
              }}
              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
          </div>

          <div className="space-y-1.5 font-mono text-[11px]">
            <Row label="Gross (annual)" value={money(result.symbol, result.grossAnnual)} />
            <Row label="Taxable income" value={money(result.symbol, result.taxableIncome)} />
            {result.salarySacrifice > 0 && (
              <Row label="Sacrifice / packaging" value={`−${money(result.symbol, result.salarySacrifice)}`} />
            )}
            <Row label="Income tax (gross)" value={`−${money(result.symbol, result.incomeTax)}`} />
            {result.lito > 0 && <Row label="LITO offset" value={`+${money(result.symbol, result.lito)}`} />}
            <Row label="Income tax after offset" value={`−${money(result.symbol, result.incomeTaxAfterOffset)}`} />
            <Row
              label={
                country === 'AU' ? 'Medicare levy' : country === 'US' ? 'FICA' : country === 'UK' ? 'NI' : 'Social / levy'
              }
              value={`−${money(result.symbol, result.socialOrLevy)}`}
            />
            {result.mls > 0 && <Row label="MLS" value={`−${money(result.symbol, result.mls)}`} />}
            {result.studentLoan > 0 && (
              <Row label="HELP/HECS" value={`−${money(result.symbol, result.studentLoan)}`} />
            )}
            {result.other > 0 && <Row label="State tax" value={`−${money(result.symbol, result.other)}`} />}
            <Row label="Net (annual)" value={money(result.symbol, result.netAnnual)} bold />
            <Row label="Effective rate (cash)" value={`${result.effectiveRate.toFixed(1)}%`} />
            {result.employerPensionOrSuper > 0 && (
              <Row label="Employer super (on top)" value={money(result.symbol, result.employerPensionOrSuper)} />
            )}
            {result.employeeExtraSuper > 0 && (
              <Row label="Extra super (yours)" value={money(result.symbol, result.employeeExtraSuper)} />
            )}
          </div>

          <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-1 pt-2 border-t border-emerald-200/50 dark:border-emerald-900">
            {result.notes.map((n) => (
              <li key={n}>• {n}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? 'font-bold text-sm pt-1' : ''}`}>
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default PayCalculator;
