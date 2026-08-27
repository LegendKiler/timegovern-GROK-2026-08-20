import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  MapPin,
  Clock,
  Banknote,
  ChevronDown,
  ChevronUp,
  Mail,
  ExternalLink,
  Building2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { careersContent, type CareerJob } from '../content/careersContent';

function applyMailto(job: CareerJob): string {
  const subject = encodeURIComponent(`${careersContent.applySubjectPrefix}: ${job.title} (${job.id})`);
  const body = encodeURIComponent(
    [
      `Hello TimeGovern hiring team,`,
      ``,
      `I am applying for: ${job.title} (${job.id})`,
      `Department: ${job.department}`,
      `Preferred location: ${job.location} / ${job.remote}`,
      ``,
      `Attached / linked: CV (PDF)`,
      ``,
      `Cover note:`,
      `[Why TimeGovern and this role — 4–8 sentences]`,
      ``,
      `Full name:`,
      `Phone:`,
      `LinkedIn / portfolio:`,
      `Work rights in Australia: Yes / No / Visa type`,
      ``,
      `Thank you,`,
      `[Your name]`,
    ].join('\n')
  );
  return `mailto:${careersContent.careersEmail}?subject=${subject}&body=${body}`;
}

const JobCard: React.FC<{ job: CareerJob; open: boolean; onToggle: () => void }> = ({
  job,
  open,
  onToggle,
}) => {
  return (
    <article className="rounded-2xl border border-slate-700/80 bg-slate-900/70 overflow-hidden shadow-sm hover:border-cyan-500/40 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-3"
        aria-expanded={open}
      >
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">{job.title}</h3>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {job.level}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-600">
              {job.type}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{job.summary}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-500" /> {job.department}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> {job.remote}
            </span>
            <span className="inline-flex items-center gap-1">
              <Banknote className="w-3.5 h-3.5 text-emerald-500/80" /> {job.salaryAud}
            </span>
          </div>
        </div>
        <span className="shrink-0 self-center text-slate-400">
          {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-5 border-t border-slate-800 space-y-4 pt-4">
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-400 mb-1.5">About the role</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{job.aboutRole}</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Responsibilities</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {job.responsibilities.map((r) => (
                  <li key={r} className="flex gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">Requirements</h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {job.requirements.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span className="text-cyan-500">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {job.niceToHave.length > 0 && (
                <>
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mt-3 mb-1.5">Nice to have</h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    {job.niceToHave.map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href={applyMailto(job)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/40 transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              Apply by email
            </a>
            <a
              href={`mailto:${careersContent.careersEmail}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-600 text-slate-300 hover:border-cyan-500/50 hover:text-white"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {careersContent.careersEmail}
            </a>
            <span className="text-[10px] text-slate-500 ml-auto">Posted {job.posted}</span>
          </div>
        </div>
      )}
    </article>
  );
};

export const CareersPanel: React.FC = () => {
  const jobs = careersContent.jobs;
  const [openId, setOpenId] = useState<string | null>(jobs[0]?.id ?? null);
  const [dept, setDept] = useState<string>('All');

  const departments = useMemo(() => {
    const s = new Set(jobs.map((j) => j.department));
    return ['All', ...Array.from(s)];
  }, [jobs]);

  const filtered = dept === 'All' ? jobs : jobs.filter((j) => j.department === dept);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 p-5 sm:p-7">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 text-cyan-300" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-400 mb-1">Careers at TimeGovern</p>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">{careersContent.hero.title}</h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-2xl">{careersContent.hero.subtitle}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`mailto:${careersContent.careersEmail}?subject=${encodeURIComponent('General application — TimeGovern')}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white text-slate-900 hover:bg-cyan-100"
              >
                <Mail className="w-3.5 h-3.5" />
                General application
              </a>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 px-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {jobs.length} open roles
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* About company */}
      <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" />
          {careersContent.aboutCompany.title}
        </h3>
        {careersContent.aboutCompany.paragraphs.map((p) => (
          <p key={p.slice(0, 24)} className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {p}
          </p>
        ))}
        <ul className="grid sm:grid-cols-2 gap-2 pt-1">
          {careersContent.aboutCompany.perks.map((perk) => (
            <li
              key={perk}
              className="text-[11px] text-slate-300 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              {perk}
            </li>
          ))}
        </ul>
      </div>

      {/* Filters + jobs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Department</span>
        {departments.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDept(d)}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              dept === d
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            open={openId === job.id}
            onToggle={() => setOpenId((id) => (id === job.id ? null : job.id))}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-8">No roles in this department right now.</p>
        )}
      </div>

      {/* Apply process */}
      <div className="rounded-2xl border border-slate-700 bg-slate-900/50 p-5 space-y-2">
        <h3 className="text-sm font-extrabold text-white">How to apply</h3>
        <p className="text-xs text-slate-300 leading-relaxed">{careersContent.howToApply}</p>
        <p className="text-xs text-slate-400">
          Primary inbox:{' '}
          <a className="text-cyan-400 font-semibold hover:underline" href={`mailto:${careersContent.careersEmail}`}>
            {careersContent.careersEmail}
          </a>
          {' · '}HR:{' '}
          <a className="text-cyan-400 font-semibold hover:underline" href={`mailto:${careersContent.hrEmail}`}>
            {careersContent.hrEmail}
          </a>
        </p>
        <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-800">
          {careersContent.equalOpportunity}
        </p>
      </div>
    </div>
  );
};

export default CareersPanel;
