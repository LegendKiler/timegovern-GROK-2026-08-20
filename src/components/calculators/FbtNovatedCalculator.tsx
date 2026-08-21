import React, { useMemo, useState } from 'react';
import { Car, Copy, Check, Info } from 'lucide-react';
import {
  FBT_COUNTRIES,
  FbtCountry,
  AuCarMethod,
  calcAuCarFbt,
  calcNovatedLease,
  calcInternationalCarBenefit,
} from '../../lib/fbtNovated';

function money(sym: string, n: number) {
  return `${sym}${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function FbtNovatedCalculator() {
  const [country, setCountry] = useState<FbtCountry>('AU');
  const [tab, setTab] = useState<'fbt' | 'novated'>('fbt');

  const [baseValue, setBaseValue] = useState(45000);
  const [km, setKm] = useState(15000);
  const [method, setMethod] = useState<AuCarMethod>('statutory_flat');
  const [bizUse, setBizUse] = useState(20);
  const [opex, setOpex] = useState(8000);
  const [gstCredits, setGstCredits] = useState(true);

  const [price, setPrice] = useState(45000);
  const [residualPct, setResidualPct] = useState(40);
  const [term, setTerm] = useState(3);
  const [rate, setRate] = useState(7.5);
  const [running, setRunning] = useState(6000);
  const [leaseKm, setLeaseKm] = useState(15000);
  const [marginal, setMarginal] = useState(32);
  const [includeFbt, setIncludeFbt] = useState(true);

  const [listPrice, setListPrice] = useState(40000);
  const [co2, setCo2] = useState(120);
  const [privUse, setPrivUse] = useState(100);

  const [copied, setCopied] = useState(false);
  const meta = FBT_COUNTRIES.find((c) => c.code === country)!;

  const auFbt = useMemo(
    () =>
      calcAuCarFbt({
        baseValue,
        kmPerYear: km,
        businessUsePercent: bizUse,
        operatingCosts: opex,
        method,
        hasGstCredits: gstCredits,
      }),
    [baseValue, km, bizUse, opex, method, gstCredits]
  );

  const novated = useMemo(
    () =>
      calcNovatedLease({
        vehiclePrice: price,
        residualPercent: residualPct,
        termYears: term,
        interestRatePa: rate,
        annualRunning: running,
        annualKm: leaseKm,
        employeeMarginalRate: marginal / 100,
        includeFbt,
        baseValueForFbt: price,
      }),
    [price, residualPct, term, rate, running, leaseKm, marginal, includeFbt]
  );

  const intl = useMemo(
    () =>
      calcInternationalCarBenefit({
        country,
        listPrice,
        co2OrBand: co2,
        privateUsePercent: privUse,
      }),
    [country, listPrice, co2, privUse]
  );

  return (
    <div className="space-y-4 text-xs">
      <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 px-3 py-2 text-[11px] text-amber-100 flex gap-2">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <strong>Fringe benefits & novated lease (lab).</strong> Australia is fully modelled (FBT car + novated).
          Other countries use simplified company-car / BIK sketches. Not tax advice.
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value as FbtCountry)}
          className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 font-medium"
        >
          {FBT_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {country === 'AU' && (
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTab('fbt')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                tab === 'fbt' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              FBT (car)
            </button>
            <button
              type="button"
              onClick={() => setTab('novated')}
              className={`px-3 py-1.5 rounded-lg font-semibold ${
                tab === 'novated' ? 'bg-amber-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Novated lease
            </button>
          </div>
        )}
      </div>

      {country === 'AU' && tab === 'fbt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500" /> AU car fringe benefit
            </h3>
            <label className="block font-medium text-slate-600 dark:text-slate-400">Base value (AUD)</label>
            <input type="number" value={baseValue} onChange={(e) => setBaseValue(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900 font-mono" />
            <label className="block font-medium text-slate-600 dark:text-slate-400">Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value as AuCarMethod)} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900">
              <option value="statutory_flat">Statutory 20% flat</option>
              <option value="statutory_km">Statutory by km band</option>
              <option value="operating_cost">Operating cost</option>
            </select>
            {method === 'statutory_km' && (
              <>
                <label className="block font-medium">Annual km</label>
                <input type="number" value={km} onChange={(e) => setKm(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900" />
              </>
            )}
            {method === 'operating_cost' && (
              <>
                <label className="block font-medium">Business use %</label>
                <input type="number" value={bizUse} onChange={(e) => setBizUse(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900" />
                <label className="block font-medium">Annual operating costs</label>
                <input type="number" value={opex} onChange={(e) => setOpex(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900" />
              </>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={gstCredits} onChange={(e) => setGstCredits(e.target.checked)} />
              GST credits available (Type 1 gross-up)
            </label>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-2 font-mono text-[11px]">
            <Row label="Taxable value" value={money('$', auFbt.taxableValue)} />
            <Row label="Grossed-up value" value={money('$', auFbt.grossedUp)} />
            <Row label="FBT payable (employer)" value={money('$', auFbt.fbtPayable)} bold />
            <ul className="text-[10px] font-sans opacity-70 pt-2 space-y-1">
              {auFbt.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {country === 'AU' && tab === 'novated' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500" /> Novated lease
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium mb-1">Vehicle price</label>
                <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 font-mono" />
              </div>
              <div>
                <label className="block font-medium mb-1">Residual %</label>
                <input type="number" value={residualPct} onChange={(e) => setResidualPct(Number(e.target.value))} className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" />
              </div>
              <div>
                <label className="block font-medium mb-1">Term (years)</label>
                <input type="number" value={term} onChange={(e) => setTerm(Number(e.target.value))} className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" />
              </div>
              <div>
                <label className="block font-medium mb-1">Finance rate % p.a.</label>
                <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" />
              </div>
              <div>
                <label className="block font-medium mb-1">Annual running $</label>
                <input type="number" value={running} onChange={(e) => setRunning(Number(e.target.value))} className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" />
              </div>
              <div>
                <label className="block font-medium mb-1">Annual km</label>
                <input type="number" value={leaseKm} onChange={(e) => setLeaseKm(Number(e.target.value))} className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" />
              </div>
              <div>
                <label className="block font-medium mb-1">Your marginal tax %</label>
                <input type="number" value={marginal} onChange={(e) => setMarginal(Number(e.target.value))} className="w-full border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includeFbt} onChange={(e) => setIncludeFbt(e.target.checked)} />
              Include estimated FBT in cost
            </label>
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border border-amber-200 dark:border-amber-800/50 space-y-2 font-mono text-[11px]">
            <Row label="Financed amount" value={money('$', novated.financedAmount)} />
            <Row label="Residual (balloon)" value={money('$', novated.residual)} />
            <Row label="Monthly finance" value={money('$', novated.monthlyFinance)} />
            <Row label="Monthly running" value={money('$', novated.monthlyRunning)} />
            <Row label="Monthly pre-tax total" value={money('$', novated.monthlyTotalPreTax)} />
            <Row label="Est. annual FBT" value={money('$', novated.estimatedAnnualFbt)} />
            <Row label="Est. monthly post-tax cost" value={money('$', novated.estimatedMonthlyPostTaxCost)} bold />
            <button
              type="button"
              className="mt-2 text-[10px] font-bold px-2 py-1 rounded-lg bg-white dark:bg-slate-900 border inline-flex items-center gap-1"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(
                    `Novated lease est. ${money('$', novated.estimatedMonthlyPostTaxCost)}/mo post-tax`
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {
                  /* */
                }
              }}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
            <ul className="text-[10px] font-sans opacity-70 pt-2 space-y-1">
              {novated.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {country !== 'AU' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border space-y-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500" /> {meta.name} company car / BIK
            </h3>
            <label className="block font-medium">List / cost price</label>
            <input type="number" value={listPrice} onChange={(e) => setListPrice(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900 font-mono" />
            {country === 'UK' && (
              <>
                <label className="block font-medium">CO₂ g/km (approx band)</label>
                <input type="number" value={co2} onChange={(e) => setCo2(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900" />
              </>
            )}
            <label className="block font-medium">Private use %</label>
            <input type="number" value={privUse} onChange={(e) => setPrivUse(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900" />
          </div>
          <div className="bg-amber-50 dark:bg-amber-950/30 p-5 rounded-2xl border space-y-2 font-mono text-[11px]">
            <Row label="Est. taxable benefit / year" value={money(meta.symbol, intl.taxableBenefit)} bold />
            <ul className="text-[10px] font-sans opacity-70 pt-2 space-y-1">
              {intl.notes.map((n) => (
                <li key={n}>• {n}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between gap-2 ${bold ? 'font-bold text-sm' : ''}`}>
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default FbtNovatedCalculator;
