/**
 * Live Data — Phases A–E
 * Rate counters, sources, top countries, progress charts + session stats.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  Activity, Users, Landmark, Newspaper, Leaf, Utensils, Droplets, Zap,
  HeartPulse, Clock, Info, BookOpen, Globe2,
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

interface CountryRow {
  rank: number;
  name: string;
  base: number;
  netPerSec: number;
}

const CALIBRATION = {
  label: 'August 2026 illustrative calibration',
  date: '2026-08-01',
  method:
    'Counters = published annual/industry rates interpolated over the day and year (same method used by public live-stat sites). Not official real-time telemetry.',
};

const SOURCE_LIST: { domain: string; refs: string }[] = [
  { domain: 'Population', refs: 'UN World Population Prospects (WPP) style totals and crude birth/death rates' },
  { domain: 'Health & mortality', refs: 'WHO Global Health Estimates style annual mortality figures' },
  { domain: 'Economy / public spend', refs: 'World Bank / IMF GDP shares; SIPRI-style military expenditure ratios' },
  { domain: 'Connectivity & media', refs: 'ITU Facts & Figures style; industry email/search/traffic estimates' },
  { domain: 'Environment & energy', refs: 'FAO / Global Carbon Project / IEA-style annual rates' },
  { domain: 'Food & water', refs: 'FAO SOFI; WHO/UNICEF JMP-style access estimates' },
];

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
    { id: 'pop', label: 'Current world population', ratePerSec: 2.4, base: 8300000000, scope: 'stock', source: 'UN WPP-style net growth' },
    { id: 'births_today', label: 'Births today', ratePerSec: 4.3, scope: 'today', source: 'Global crude birth rate' },
    { id: 'deaths_today', label: 'Deaths today', ratePerSec: 1.9, scope: 'today', source: 'Global crude death rate' },
    { id: 'net_today', label: 'Net population growth today', ratePerSec: 2.4, scope: 'today', source: 'Births minus deaths' },
    { id: 'births_year', label: 'Births this year', ratePerSec: 4.3, scope: 'year', source: 'Annualised births' },
    { id: 'deaths_year', label: 'Deaths this year', ratePerSec: 1.9, scope: 'year', source: 'Annualised deaths' },
    { id: 'net_year', label: 'Net growth this year', ratePerSec: 2.4, scope: 'year', source: 'Annualised net increase' },
    { id: 'births_sec', label: 'Births per second (rate)', ratePerSec: 0, base: 4.3, scope: 'stock', source: 'Instantaneous rate display' },
  ],
  economy: [
    { id: 'health_spend', label: 'Public healthcare expenditure today', ratePerSec: 180000, scope: 'today', prefix: '$', source: 'WHO/World Bank style GDP share' },
    { id: 'edu_spend', label: 'Public education expenditure today', ratePerSec: 95000, scope: 'today', prefix: '$', source: 'Education spend / GDP share' },
    { id: 'mil_spend', label: 'Public military expenditure today', ratePerSec: 55000, scope: 'today', prefix: '$', source: 'SIPRI-style military spend' },
    { id: 'cars_year', label: 'Cars produced this year', ratePerSec: 2.5, scope: 'year', source: 'Auto industry production' },
    { id: 'bikes_year', label: 'Bicycles produced this year', ratePerSec: 4.0, scope: 'year', source: 'Industry production estimate' },
    { id: 'pc_year', label: 'Computers produced this year', ratePerSec: 5.5, scope: 'year', source: 'PC shipments estimate' },
    { id: 'phones_year', label: 'Smartphones produced this year', ratePerSec: 45, scope: 'year', source: 'Handset industry estimate' },
    { id: 'gdp_year', label: 'Global GDP produced this year (illustrative)', ratePerSec: 3500000, scope: 'year', prefix: '$', source: 'World Bank GDP / seconds in year' },
  ],
  society: [
    { id: 'books_year', label: 'New book titles this year', ratePerSec: 0.07, scope: 'year', source: 'Publishing industry' },
    { id: 'news_today', label: 'Newspaper copies circulated today', ratePerSec: 1800, scope: 'today', source: 'Print circulation estimate' },
    { id: 'tv_today', label: 'TV sets sold today', ratePerSec: 3.5, scope: 'today', source: 'CE industry estimate' },
    { id: 'phones_today', label: 'Mobile phones sold today', ratePerSec: 45, scope: 'today', source: 'Handset shipments' },
    { id: 'games_today', label: 'Money spent on games today', ratePerSec: 2200, scope: 'today', prefix: '$', source: 'Games industry spend rate' },
    { id: 'internet', label: 'Internet users in the world', ratePerSec: 8, base: 5400000000, scope: 'stock', source: 'ITU-style connectivity' },
    { id: 'emails', label: 'Emails sent today', ratePerSec: 3500000, scope: 'today', source: 'Email traffic estimate' },
    { id: 'blogs_today', label: 'Blog posts written today', ratePerSec: 55, scope: 'today', source: 'Publishing volume estimate' },
    { id: 'tweets_today', label: 'Short posts sent today', ratePerSec: 6000, scope: 'today', source: 'Social traffic estimate' },
    { id: 'searches', label: 'Web searches today', ratePerSec: 99000, scope: 'today', source: 'Search volume estimate' },
    { id: 'data_gb', label: 'Data transferred today', ratePerSec: 180000, scope: 'today', unit: 'GB', source: 'Global IP traffic' },
  ],
  environment: [
    { id: 'forest_year', label: 'Forest loss this year', ratePerSec: 0.15, scope: 'year', unit: 'hectares', source: 'FAO-style deforestation' },
    { id: 'soil_year', label: 'Land lost to soil erosion this year', ratePerSec: 0.2, scope: 'year', unit: 'hectares', source: 'Land degradation estimate' },
    { id: 'co2_year', label: 'CO2 emissions this year', ratePerSec: 1200, scope: 'year', unit: 'tons', source: 'Global Carbon Project style' },
    { id: 'co2_today', label: 'CO2 emissions today', ratePerSec: 1200, scope: 'today', unit: 'tons', source: 'Daily share of annual CO2' },
    { id: 'desert_year', label: 'Desertification this year', ratePerSec: 0.35, scope: 'year', unit: 'hectares', source: 'UNCCD-style rate' },
    { id: 'toxics_year', label: 'Toxic chemicals released this year', ratePerSec: 0.3, scope: 'year', unit: 'tons', source: 'Industrial release estimate' },
  ],
  food: [
    { id: 'under', label: 'Undernourished people', ratePerSec: 0, base: 735000000, scope: 'stock', source: 'FAO SOFI-style' },
    { id: 'overweight', label: 'Overweight people', ratePerSec: 0, base: 1900000000, scope: 'stock', source: 'WHO-style prevalence' },
    { id: 'obese', label: 'People with obesity', ratePerSec: 0, base: 890000000, scope: 'stock', source: 'WHO-style prevalence' },
    { id: 'hunger_today', label: 'Hunger-related deaths today', ratePerSec: 0.25, scope: 'today', source: 'Illustrative annual mortality' },
    { id: 'obesity_cost_us', label: 'Obesity-related disease cost (USA) today', ratePerSec: 2800, scope: 'today', prefix: '$', source: 'US health-cost estimate' },
    { id: 'weight_loss_us', label: 'Weight-loss program spend (USA) today', ratePerSec: 750, scope: 'today', prefix: '$', source: 'Consumer spend estimate' },
  ],
  water: [
    { id: 'water_year', label: 'Water used this year', ratePerSec: 140000, scope: 'year', unit: 'million L', source: 'Freshwater withdrawal' },
    { id: 'water_today', label: 'Water used today', ratePerSec: 140000, scope: 'today', unit: 'million L', source: 'Daily share of annual use' },
    { id: 'no_safe', label: 'People without safe drinking water', ratePerSec: 0, base: 2200000000, scope: 'stock', source: 'WHO/UNICEF JMP-style' },
  ],
  energy: [
    { id: 'energy_today', label: 'Energy used today', ratePerSec: 2800, scope: 'today', unit: 'MWh', source: 'Global primary energy' },
    { id: 'nonrenew_today', label: 'From non-renewable sources today', ratePerSec: 2350, scope: 'today', unit: 'MWh', source: 'Fossil share of mix' },
    { id: 'renew_today', label: 'From renewable sources today', ratePerSec: 450, scope: 'today', unit: 'MWh', source: 'Renewable share of mix' },
    { id: 'solar_strike', label: 'Solar energy striking Earth today', ratePerSec: 8000000, scope: 'today', unit: 'MWh', source: 'Geophysical insolation' },
    { id: 'oil_today', label: 'Crude oil pumped today', ratePerSec: 1150, scope: 'today', unit: 'barrels', source: 'Global oil production' },
    { id: 'oil_left', label: 'Oil left (illustrative stock)', ratePerSec: -1150, base: 1500000000000, scope: 'stock', unit: 'barrels', source: 'Reserves minus production (illustrative)' },
  ],
  health: [
    { id: 'comm_year', label: 'Communicable disease deaths this year', ratePerSec: 0.4, scope: 'year', source: 'WHO-style communicable burden' },
    { id: 'flu_year', label: 'Seasonal flu deaths this year', ratePerSec: 0.02, scope: 'year', source: 'Flu mortality estimate' },
    { id: 'u5_year', label: 'Deaths of children under 5 this year', ratePerSec: 0.15, scope: 'year', source: 'UN IGME-style under-5 mortality' },
    { id: 'cancer_year', label: 'Cancer deaths this year', ratePerSec: 0.32, scope: 'year', source: 'WHO cancer mortality' },
    { id: 'malaria_year', label: 'Malaria deaths this year', ratePerSec: 0.02, scope: 'year', source: 'WHO malaria report style' },
    { id: 'smoke_year', label: 'Smoking-related deaths this year', ratePerSec: 0.25, scope: 'year', source: 'WHO tobacco mortality' },
    { id: 'alcohol_year', label: 'Alcohol-related deaths this year', ratePerSec: 0.08, scope: 'year', source: 'WHO alcohol mortality' },
    { id: 'road_year', label: 'Road traffic fatalities this year', ratePerSec: 0.04, scope: 'year', source: 'WHO road safety' },
    { id: 'cigs_today', label: 'Cigarettes smoked today', ratePerSec: 180000, scope: 'today', source: 'Tobacco consumption estimate' },
  ],
};

const TOP_COUNTRIES: CountryRow[] = [
  { rank: 1, name: 'India', base: 1450000000, netPerSec: 0.35 },
  { rank: 2, name: 'China', base: 1412000000, netPerSec: 0.05 },
  { rank: 3, name: 'United States', base: 345000000, netPerSec: 0.05 },
  { rank: 4, name: 'Indonesia', base: 283000000, netPerSec: 0.08 },
  { rank: 5, name: 'Pakistan', base: 245000000, netPerSec: 0.12 },
  { rank: 6, name: 'Nigeria', base: 232000000, netPerSec: 0.15 },
  { rank: 7, name: 'Brazil', base: 216000000, netPerSec: 0.04 },
  { rank: 8, name: 'Bangladesh', base: 173000000, netPerSec: 0.06 },
  { rank: 9, name: 'Russia', base: 144000000, netPerSec: -0.01 },
  { rank: 10, name: 'Ethiopia', base: 132000000, netPerSec: 0.08 },
  { rank: 11, name: 'Mexico', base: 131000000, netPerSec: 0.03 },
  { rank: 12, name: 'Japan', base: 123000000, netPerSec: -0.02 },
  { rank: 13, name: 'Egypt', base: 116000000, netPerSec: 0.05 },
  { rank: 14, name: 'Philippines', base: 115000000, netPerSec: 0.05 },
  { rank: 15, name: 'DR Congo', base: 109000000, netPerSec: 0.09 },
  { rank: 16, name: 'Vietnam', base: 100000000, netPerSec: 0.03 },
  { rank: 17, name: 'Iran', base: 91000000, netPerSec: 0.03 },
  { rank: 18, name: 'Turkey', base: 87000000, netPerSec: 0.02 },
  { rank: 19, name: 'Germany', base: 84000000, netPerSec: -0.01 },
  { rank: 20, name: 'Thailand', base: 72000000, netPerSec: 0.01 },
];

function formatValue(n: number, prefix?: string, unit?: string): string {
  const abs = Math.floor(Math.abs(n));
  const body = abs.toLocaleString('en-US');
  const sign = n < 0 ? '-' : '';
  return `${sign}${prefix ?? ''}${body}${unit ? ` ${unit}` : ''}`;
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
  const [showSources, setShowSources] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setTime(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  const { secondsToday, secondsYear, yearPct, dayPct, utcLabel, sessionSec } = useMemo(() => {
    const nowMs = time.getTime();
    const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate()).getTime();
    const startOfYear = new Date(time.getFullYear(), 0, 1).getTime();
    const endOfYear = new Date(time.getFullYear() + 1, 0, 1).getTime();
    const secondsToday = (nowMs - startOfDay) / 1000;
    const secondsYear = (nowMs - startOfYear) / 1000;
    const yearPct = ((nowMs - startOfYear) / (endOfYear - startOfYear)) * 100;
    const dayPct = (secondsToday / 86400) * 100;
    const sessionSec = Math.max(0, (nowMs - mountedAt) / 1000);
    const utcLabel = time.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    });
    return { secondsToday, secondsYear, yearPct, dayPct, utcLabel, sessionSec };
  }, [time, mountedAt]);

  const counters = RATES[category];
  const activeCat = CATEGORIES.find((c) => c.id === category)!;
  const ActiveIcon = activeCat.icon;

  const countryRows = useMemo(
    () =>
      TOP_COUNTRIES.map((c) => ({
        ...c,
        live: Math.floor(c.base + c.netPerSec * secondsToday),
      })),
    [secondsToday],
  );

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
                UTC {utcLabel} · Year {yearPct.toFixed(4)}% elapsed · Calibrated {CALIBRATION.date}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowSources((v) => !v)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-lg border border-slate-600 bg-slate-800 text-xs font-semibold text-slate-200 hover:border-indigo-400/40"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
              {showSources ? 'Hide sources' : 'Sources & method'}
            </button>
            <label className="flex flex-col gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Category
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as CategoryId)}
                  className="appearance-none w-full sm:min-w-[220px] h-10 pl-3 pr-9 rounded-lg bg-slate-800 border border-slate-600 text-sm text-white font-semibold normal-case tracking-normal cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-md lg:col-span-2 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Time progress</p>
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Day elapsed (local)</span>
              <span className="font-mono text-indigo-300">{dayPct.toFixed(3)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-[width] duration-300"
                style={{ width: `${Math.min(100, Math.max(0, dayPct))}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>Year elapsed</span>
              <span className="font-mono text-indigo-300">{yearPct.toFixed(4)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-400 transition-[width] duration-300"
                style={{ width: `${Math.min(100, Math.max(0, yearPct))}%` }}
              />
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Global flow rates (per second)
            </p>
            <div className="space-y-2">
              {[
                { label: 'Births', rate: 4.3, color: 'bg-emerald-500' },
                { label: 'Deaths', rate: 1.9, color: 'bg-rose-500' },
                { label: 'Net growth', rate: 2.4, color: 'bg-indigo-500' },
              ].map((row) => {
                const max = 4.3;
                const pct = (row.rate / max) * 100;
                return (
                  <div key={row.label}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-slate-300">{row.label}</span>
                      <span className="font-mono text-slate-400">{row.rate}/s</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full rounded-full ${row.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-md space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            Since you opened this page
          </p>
          <div className="space-y-2">
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5">
              <p className="text-[10px] text-slate-500 uppercase">Session length</p>
              <p className="text-lg font-mono font-bold text-white tabular-nums">
                {Math.floor(sessionSec).toLocaleString()}s
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5">
              <p className="text-[10px] text-slate-500 uppercase">Births worldwide</p>
              <p className="text-lg font-mono font-bold text-emerald-400 tabular-nums">
                +{Math.floor(sessionSec * 4.3).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5">
              <p className="text-[10px] text-slate-500 uppercase">Deaths worldwide</p>
              <p className="text-lg font-mono font-bold text-rose-400 tabular-nums">
                +{Math.floor(sessionSec * 1.9).toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-slate-800/60 border border-slate-700/50 p-2.5">
              <p className="text-[10px] text-slate-500 uppercase">Net population</p>
              <p className="text-lg font-mono font-bold text-indigo-300 tabular-nums">
                +{Math.floor(sessionSec * 2.4).toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 leading-snug">
            Session counters reset when you reload. Same rate model as the main board.
          </p>
        </div>
      </div>

      {showSources && (
        <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <BookOpen className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-white">{CALIBRATION.label}</p>
              <p className="text-xs text-slate-400 mt-1">{CALIBRATION.method}</p>
              <p className="text-[11px] text-slate-500 mt-1">Last calibrated: {CALIBRATION.date}</p>
            </div>
          </div>
          <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {SOURCE_LIST.map((s) => (
              <li key={s.domain} className="rounded-lg border border-slate-700/60 bg-slate-900/50 p-2.5">
                <span className="font-semibold text-indigo-200">{s.domain}</span>
                <span className="block text-slate-400 mt-0.5">{s.refs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        <div className="rounded-xl border border-slate-700/60 bg-slate-900/80 p-4 shadow-md overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <Globe2 className="w-4 h-4 text-indigo-300" />
            <h3 className="text-sm font-bold text-white">Top 20 countries by population (live estimate)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-500 border-b border-slate-700">
                  <th className="py-2 pr-2 font-semibold">#</th>
                  <th className="py-2 pr-2 font-semibold">Country</th>
                  <th className="py-2 text-right font-semibold">Population</th>
                </tr>
              </thead>
              <tbody>
                {countryRows.map((row) => (
                  <tr key={row.name} className="border-b border-slate-800/80 hover:bg-slate-800/40">
                    <td className="py-1.5 pr-2 font-mono text-slate-500">{row.rank}</td>
                    <td className="py-1.5 pr-2 font-semibold text-slate-200">{row.name}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-white">
                      {row.live.toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[10px] text-slate-500">
            Country totals are illustrative bases plus a small net rate per second — for orientation only.
          </p>
        </div>
      )}

      {category === 'population' && (
        <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <Clock className="w-5 h-5 text-indigo-300 shrink-0" />
          <div className="text-sm text-slate-200">
            <span className="font-bold text-white">TimeGovern angle:</span> counters advance from rates times elapsed
            seconds. Pair with World Clock for timezone context.
          </div>
        </div>
      )}

      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 text-xs text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-200/90 mb-1">About these numbers</p>
          <p>
            Illustrative live estimates from published annual or industry rates, interpolated through the day and year.
            Not official real-time government feeds and not scraped from third-party websites. See{' '}
            <button type="button" className="text-indigo-300 underline font-semibold" onClick={() => setShowSources(true)}>
              Sources & method
            </button>{' '}
            for calibration date ({CALIBRATION.date}).
          </p>
        </div>
      </div>

      <AdBanner type="in-feed" />
    </div>
  );
};

export default WorldometersPillar;
