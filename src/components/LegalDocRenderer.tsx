import React from 'react';
import { legalContent } from '../content/legalContent';
import { legalExpand } from '../content/legalExpand';

export type LegalSectionId = 'privacy' | 'terms' | 'ads' | 'cookies' | 'disclaimer' | 'linkpolicy';

type Doc = {
  title: string;
  intro?: string;
  sections?: { heading: string; body: string }[];
};

/** Renders full legal documents (base legalContent + expanded multi-region overrides). */
export const LegalDocRenderer: React.FC<{ section: LegalSectionId }> = ({ section }) => {
  const L = legalContent;
  const map: Record<LegalSectionId, Doc> = {
    privacy: L.privacyPolicy as Doc,
    terms: L.termsOfUse as Doc,
    ads: legalExpand.advertisingPolicy as Doc,
    cookies: legalExpand.cookieNotice as Doc,
    disclaimer: legalExpand.disclaimer as Doc,
    linkpolicy: legalExpand.linkPolicy as Doc,
  };
  const doc = map[section];
  if (!doc) return <p className="text-xs text-slate-500">Policy not found.</p>;

  return (
    <div className="space-y-4 text-slate-700 dark:text-slate-300">
      <div>
        <h4 className="text-slate-900 dark:text-white font-bold text-base mb-1">{doc.title}</h4>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">
          Last updated: {L.lastUpdated} · {L.entity}
          {L.abn ? ` · ABN ${L.abn}` : ''}
        </p>
      </div>
      {doc.intro ? (
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 border-l-2 border-indigo-500/50 pl-3">
          {doc.intro}
        </p>
      ) : null}
      <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
        {(doc.sections || []).map((s) => (
          <section
            key={s.heading}
            className="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-900/40 px-3 py-2.5"
          >
            <h5 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5">{s.heading}</h5>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{s.body}</p>
          </section>
        ))}
      </div>
      <p className="text-[10px] text-slate-500">
        Contact: {L.privacyEmail} (privacy) · {L.legalEmail} (legal). Website policy notice — not personalised legal
        advice.
      </p>
    </div>
  );
};

export default LegalDocRenderer;
