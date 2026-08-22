import React from 'react';
import { Megaphone, Mail, MapPin, Phone, CheckCircle2, LayoutTemplate } from 'lucide-react';
import { advertiseContent as A } from '../content/advertiseContent';
import { AdSlot } from './ads/AdSlot';

/** Media kit + rate card UI — open via Company hub or hash #advertise */
export const AdvertiseHub: React.FC = () => {
  return (
    <div className="space-y-8 text-slate-800 dark:text-slate-100">
      <header className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 sm:p-8">
        <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Megaphone className="w-4 h-4" /> Advertise on TimeGovern
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display">{A.tagline}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">{A.audience.summary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs">
          <a
            href={`mailto:${A.contactEmail}?subject=TimeGovern%20Advertising%20Enquiry`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold"
          >
            <Mail className="w-3.5 h-3.5" /> {A.contactEmail}
          </a>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <Phone className="w-3.5 h-3.5" /> {A.contactPhone}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
            <MapPin className="w-3.5 h-3.5" /> {A.hqLine}
          </span>
        </div>
      </header>

      <section>
        <h2 className="text-lg font-bold mb-3">Why this audience</h2>
        <ul className="grid sm:grid-cols-2 gap-2">
          {A.whyUs.map((w) => (
            <li
              key={w}
              className="flex gap-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-white dark:bg-slate-900"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              {w}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-500">
          Priority geos: {A.audience.geos.join(' · ')}
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-blue-600" /> Inventory & sizes
        </h2>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="p-3">Slot ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Sizes</th>
                <th className="p-3">Placement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {A.slots.map((s) => (
                <tr key={s.id} className="bg-white dark:bg-slate-900">
                  <td className="p-3 font-mono text-blue-600 dark:text-cyan-400">{s.id}</td>
                  <td className="p-3 font-semibold">{s.name}</td>
                  <td className="p-3">{s.sizes}</td>
                  <td className="p-3 text-slate-600 dark:text-slate-300">{s.placement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-2">Indicative rate card (AUD)</h2>
        <p className="text-xs text-amber-700 dark:text-amber-300/90 mb-3">{A.rateCardAud.disclaimer}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {A.rateCardAud.packages.map((p) => (
            <div
              key={p.name}
              className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900"
            >
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-lg font-extrabold text-blue-600 dark:text-cyan-400">
                  from ${p.fromAud.toLocaleString('en-AU')}
                  <span className="text-[10px] font-normal text-slate-500"> / {p.period}</span>
                </p>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{p.includes.join(' · ')}</p>
              <p className="text-xs mt-2 text-slate-600 dark:text-slate-300">{p.notes}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">{A.rateCardAud.cpmGuidance}</p>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">Creative specs</h2>
        <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-300">
          <li>File types: {A.specs.fileTypes.join(', ')}</li>
          <li>Max weight: ~{A.specs.maxFileKb} KB (static preferred)</li>
          <li>Click URL: {A.specs.clickUrl}</li>
          <li>Lead time: {A.specs.leadTimeDays} business days</li>
          <li>Tracking: {A.specs.tracking}</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">Policy highlights</h2>
        <ul className="space-y-2">
          {A.policySummary.map((line) => (
            <li key={line} className="text-sm flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              {line}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-3">Live placeholder previews</h2>
        <p className="text-xs text-slate-500 mb-3">Same units used on-site (house creatives until direct/programmatic fill).</p>
        <div className="space-y-4">
          <AdSlot slotId="tg_header" persistent />
          <div className="flex justify-center">
            <AdSlot slotId="tg_rail_sticky" persistent className="!flex" />
          </div>
          <AdSlot slotId="tg_infeed" persistent />
        </div>
      </section>
    </div>
  );
};
