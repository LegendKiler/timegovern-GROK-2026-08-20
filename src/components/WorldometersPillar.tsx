/**
 * Live Data (Worldometers-style) — Phase A
 * Rate-based illustrative counters. Not scraped from worldometers.info.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, Users, Landmark, Newspaper, Leaf, Utensils, Droplets, Zap,
  HeartPulse, Clock, Info,
} from 'lucide-react';
import { AdBanner } from './AdBanner';

type CategoryId =
  | 'population'
  | 'economy'
  | 'society'
  | 'environment'
  | 'food'
  | 'water'
  | 'energy'
  | 'health';

interface Category {
  id: CategoryId;
  label: string;
  icon: React.ElementType;
}

interface CounterDef {
  id: string;
  label: string;
  ratePerSec: number;
  base?: number;
  scope: 'today' | 'year' | 'stock';
  unit?: string;
  prefix?: string;
  source: string;
}

const CATEGORIES: Category[] = [
  { id: 'population', label: 'World Population', icon: Users },
  { id: 'economy', label: 'Government & Economics', icon: Landmark },
  { id: 'society', label: 'Society & Media', icon: Newspaper },
  { id: 'environment', label: 'Environment', icon: Leaf },
  { id: 'food', label: 'Food', icon: Utensils },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'energy', label: 'Energy', icon: Zap },
  { id: 'health', label: 'Health', icon: HeartPulse },
];

const RATES: Record<CategoryId, CounterDef[]> = {
  population: [
    { id: 'pop', label: 'Current world population', ratePerSec: 2.4, base: 8300000000, scope: 'stock', source: 'UN WPP-style net growth estimate' },
    { id: 'births_today', label: 'Births today', ratePerSec: 4.3, scope: 'today', source: 'Derived from global crude birth rate' },
    { id: 'deaths_today', label: 'Deaths today', ratePerSec: 1.9, scope: 'today', source: 'Derived from global crude death rate' },
    { id: 'net_today', label: 'Net population growth today', ratePerSec: 2.4, scope: 'today', source: 'Births minus deaths (illustrative)' },
    { id: 'births_year', label: 'Births this year', ratePerSec: 4.3, scope: 'year', source: 'Annualised global births' },
    { id: 'deaths_year', label: 'Deaths this year', ratePerSec: 1.9, scope: 'year', source: 'Annualised global deaths' },
    { id: 'net_year', label: 'Net growth this year', ratePerSec: 2.4, scope: 'year', source: 'Annualised net increase' },
  ],
  economy: [
    { id: 'health_spend', label: 'Public healthcare expenditure today', ratePerSec: 180000, scope: 'today', prefix: '$', source: 'Share of global GDP (WHO/World Bank style)' },
    { id: 'edu_spend', label: 'Public education expenditure today', ratePerSec: 95000, scope: 'today', prefix: '$', source: 'Share of global GDP (illustrative)' },
    { id: 'mil_spend', label: 'Public military expenditure today', ratePerSec: 55000, scope: 'today', prefix: '$', source: 'SIPRI-style global military spend rate' },
    { id: 'cars_year', label: 'Cars produced this year', ratePerSec: 2.5, scope: 'year', source: 'Industry production estimate' },
    { id: 'bikes_year', label: 'Bicycles produced this year', ratePerSec: 4.0, scope: 'year', source: 'Industry production estimate' },
    { id: 'pc_year', label: 'Computers produced this year', ratePerSec: 5.5, scope: 'year', source: 'Industry production estimate' },
  ],
  society: [
    { id: 'books_year', label: 'New book titles this year', ratePerSec: 0.07, scope: 'year', source: 'Publishing industry estimate' },
    { id: 'phones_today', label: 'Mobile phones sold today', ratePerSec: 45, scope: 'today', source: 'Industry shipments estimate' },
    { id: 'internet', label: 'Internet users (stock)', ratePerSec: 8, base: 5400000000, scope: 'stock', source: 'ITU-style connectivity growth' },
    { id: 'emails', label: 'Emails sent today', ratePerSec: 3500000, scope: 'today', source: 'Industry traffic estimate' },
    { id: 'searches', label: 'Web searches today', ratePerSec: 99000, scope: 'today', source: 'Industry search volume estimate' },
    { id: 'data_gb', label: 'Data transferred today', ratePerSec: 180000, scope: 'today', unit: 'GB', source: 'Global IP traffic estimate' },
  ],
  environment: [
    { id: 'forest_year', label: 'Forest loss this year', ratePerSec: 0.15, scope: 'year', unit: 'hectares', source: 'FAO-style deforestation rate' },
    { id: 'co2_year', label: 'CO2 emissions this year', ratePerSec: 1200, scope: 'year', unit: 'tons', source: 'Global Carbon Project-style rate' },
    { id: 'co2_today', label: 'CO2 emissions today', ratePerSec: 1200, scope: 'today', unit: 'tons', source: 'Daily share of annual emissions' },
    { id: 'desert_year', label: 'Desertification this year', ratePerSec: 0.35, scope: 'year', unit: 'hectares', source: 'UNCCD-style land degradation rate' },
  ],
  food: [
    { id: 'under', label: 'Undernourished people (stock)', ratePerSec: 0, base: 735000000, scope: 'stock', source: 'FAO SOFI-style headcount' },
    { id: 'overweight', label: 'Overweight people (stock)', ratePerSec: 0, base: 1900000000, scope: 'stock', source: 'WHO-style prevalence estimate' },
    { id: 'obese', label: 'People with obesity (stock)', ratePerSec: 0, base: 890000000, scope: 'stock', source: 'WHO-style prevalence estimate' },
    { id: 'hunger_today', label: 'Hunger-related deaths today', ratePerSec: 0.25, scope: 'today', source: 'Illustrative from annual hunger mortality figures' },
  ],
  water: [
    { id: 'water_year', label: 'Water used this year', ratePerSec: 140000, scope: 'year', unit: 'million L', source: 'Global freshwater withdrawal estimate' },
    { id: 'no_safe', label: 'People without safe drinking water', ratePerSec: 0, base: 2200000000, scope: 'stock', source: 'WHO/UNICEF JMP-style estimate' },
  ],
  energy: [
    { id: 'energy_today', label: 'Energy used today', ratePerSec: 2800, scope: 'today', unit: 'MWh', source: 'Global primary energy use rate' },
    { id: 'renew_today', label: 'From renewable sources today', ratePerSec: 450, scope: 'today', unit: 'MWh', source: 'Share of global energy mix (illustrative)' },
    { id: 'solar_strike', label: 'Solar energy striking Earth today', ratePerSec: 8000000, scope: 'today', unit: 'MWh', source: 'Geophysical constant / day fraction' },
    { id: 'oil_today', label: 'Crude oil pumped today', ratePerSec: 1150, scope: 'today', unit: 'barrels', source: 'Global oil production rate' },
  ],
  health: [
    { id: 'cancer_year', label: 'Cancer deaths this year', ratePerSec: 0.32, scope: 'year', source: 'WHO-style annual mortality rate' },
    { id: 'road_year', label: 'Road traffic fatalities this year', ratePerSec: 0.04, scope: 'year', source: 'WHO road safety statistics style' },
    { id: 'smoke_year', label: 'Smoking-related deaths this year', ratePerSec: 0.25, scope: 'year', source: 'WHO tobacco mortality style' },
    { id: 'flu_year', label: 'Seasonal flu deaths this year', ratePerSec: 0.02, scope: 'year', source: 'CDC/WHO flu burden style' },
  ],
};

function formatValue(n: number, prefix?: string, unit?: string): string {
  const abs = Math.floor(Math.abs(n));
  const body = abs.toLocaleString('en-US');
  return `${prefix ?? ''}${body}${unit ? ` ${unit}` : ''}`;
}

function computeValue(def: CounterDef, secondsToday: number, secondsYear: number): number {
  const t = def.scope === 'today' ? secondsToday : def.scope === 'year' ? secondsYear : secondsToday;
  const base = def.base ?? 0;
  if (def.scope === 'stock') return base + def.ratePerSec * secondsToday;
  return base + def.ratePerSec * t;
}

export const WorldometersPillar: React.FC<{ isDarkMode?: boolean }> = () => {
  const [time, setTime] = useState(() => new Date());
  const [category, setCategory] = useState<CategoryId>('population');

  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  const { secondsToday, secondsYear, yearPct, utcLabel } = useMemo(() => {
    const nowMs = time.getTime();
    const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate()).getTime();
    const startOfYear = new Date(time.getFullYear(), 0, 1).getTime();
    const endOfYear = new Date(time.getFullYear() + 1, 0, 1).getTime();
    const secondsToday = (nowMs - startOfDay) / 1000;
    const secondsYear = (nowMs - startOfYear) / 1000;
    const yearPct = ((nowMs - startOfYear) / (endOfYear - startOfYear)) * 100;
    const utcLabel = time.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
    return { secondsToday, secondsYear, yearPct, utcLabel };
  }, [time]);

  const counters = RATES[category];
  const activeCat = CATEGORIES.find((c) => c.id === category)!;
  const ActiveIcon = activeCat.icon;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 sm:p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 flex-wrap">
                Live World Data
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  <span className="tg-live-dot" /> Live
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Illustrative global counters · UTC {utcLabel} · Year {yearPct.toFixed(4)}% elapsed
              </p>
            </div>
          </div>

          <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
            Category
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CategoryId)}
                className="appearance-none w-full sm:min-w-[240px] h-10 pl-3 pr-9 rounded-lg bg-slate-800 border border-slate-600 text-sm text-white font-semibold normal-case tracking-normal cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                aria-label="Live data category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ActiveIcon className="w-4 h-4 text-indigo-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const on = c.id === category;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors ${
                  on
                    ? 'bg-indigo-500 text-white border-indigo-400'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:border-indigo-400/40'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{c.label}</span>
                <span className="sm:hidden">{c.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {counters.map((def) => {
          const raw = computeValue(def, secondsToday, secondsYear);
          return (
            <div
              key={def.id}
              className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-md hover:border-indigo-400/30 transition-colors"
            >
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{def.label}</p>
              <p className="text-xl sm:text-2xl font-extrabold font-mono text-white tabular-nums tracking-tight">
                {formatValue(raw, def.prefix, def.unit)}
              </p>
              <p className="mt-2 text-[10px] text-slate-500 leading-snug">{def.source}</p>
            </div>
          );
        })}
      </div>

      {category === 'population' && (
        <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-300 shrink-0" />
          <div className="text-sm text-slate-200">
            <span className="font-bold text-white">TimeGovern angle:</span> counters advance from rates times elapsed
            seconds — the same interpolation method public live-stat sites use. Pair with World Clock for timezone context.
          </div>
        </div>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-200/90 mb-1">About these numbers</p>
          <p>
            These are illustrative live estimates built from published annual or industry rates, interpolated through the
            day and year. They are not official real-time government feeds and are not scraped from third-party websites.
            Figures will be refined as calibration data is updated (UN, WHO, World Bank, ITU, and sector reports).
          </p>
        </div>
      </div>

      <AdBanner type="in-feed" />
    </div>
  );
};

export default WorldometersPillar;
