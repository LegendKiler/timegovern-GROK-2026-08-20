import React, { useState } from 'react';
import {
  Heart,
  Mail,
  ThumbsUp,
  ThumbsDown,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
  Globe,
  X,
  Send,
} from 'lucide-react';
import { companyContent, companyMailto } from '../content/companyContent';
import { submitExperienceFeedback, type ExperienceVote } from '../lib/experienceFeedback';

export type FooterPillarNav = (pillar: number) => void;

type Props = {
  onNavigatePillar: FooterPillarNav;
  onOpenSupporter: () => void;
  onOpenAccount: () => void;
  onOpenSecurity: () => void;
  isDarkMode?: boolean;
};

export const SiteFooter: React.FC<Props> = ({
  onNavigatePillar,
  onOpenSupporter,
  onOpenAccount,
  onOpenSecurity,
  isDarkMode = false,
}) => {
  const c = companyContent;
  const year = c.legal?.year ?? new Date().getFullYear();
  const [feedback, setFeedback] = useState<ExperienceVote | null>(() => {
    try {
      return (localStorage.getItem('tg_footer_feedback') as ExperienceVote) || null;
    } catch {
      return null;
    }
  });
  const [showForm, setShowForm] = useState(false);
  const [pendingVote, setPendingVote] = useState<ExperienceVote>('up');
  const [comment, setComment] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [wantPublic, setWantPublic] = useState(false);
  const [doneMsg, setDoneMsg] = useState<string | null>(null);

  const openFeedback = (vote: ExperienceVote) => {
    setPendingVote(vote);
    setShowForm(true);
    setDoneMsg(null);
  };

  const submit = () => {
    submitExperienceFeedback({
      vote: pendingVote,
      comment,
      displayName,
      wantPublic,
    });
    setFeedback(pendingVote);
    setShowForm(false);
    setComment('');
    setDisplayName('');
    setWantPublic(false);
    setDoneMsg(
      wantPublic
        ? 'Thanks — saved. Public share waits for approval (Company → Feedback).'
        : 'Thanks — your private feedback was saved.'
    );
  };

  const goCompany = (hash: string) => {
    onNavigatePillar(11);
    window.setTimeout(() => {
      window.location.hash = hash;
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    }, 120);
  };

  // Strong contrast on light footer (screenshot was washed out)
  const linkBtn =
    'text-left text-[13px] leading-relaxed text-slate-900 dark:text-slate-100 hover:text-cyan-700 dark:hover:text-cyan-300 hover:underline font-semibold';
  const colTitle =
    'text-[12px] font-bold uppercase tracking-wide text-slate-900 dark:text-white mb-2.5';

  return (
    <footer className="w-full mt-auto font-sans text-slate-900 dark:text-slate-100">
      <div className="bg-slate-800 dark:bg-slate-950 text-slate-100 text-[13px] border-t border-slate-700">
        <div className="max-w-[1200px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold">How was your experience?</span>
            <button type="button" aria-label="Good experience" onClick={() => openFeedback('up')}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${feedback === 'up' ? 'bg-emerald-500/30 ring-1 ring-emerald-400/50' : ''}`}>
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button type="button" aria-label="Poor experience" onClick={() => openFeedback('down')}
              className={`p-1.5 rounded-lg hover:bg-white/10 ${feedback === 'down' ? 'bg-rose-500/30 ring-1 ring-rose-400/50' : ''}`}>
              <ThumbsDown className="w-4 h-4" />
            </button>
            {doneMsg && <span className="text-[12px] text-emerald-300 max-w-md">{doneMsg}</span>}
          </div>
          <a href={companyMailto('TimeGovern contact')}
            className="inline-flex items-center gap-1.5 hover:underline font-semibold text-cyan-300">
            Contact Us <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                {pendingVote === 'up' ? <ThumbsUp className="w-4 h-4 text-emerald-500" /> : <ThumbsDown className="w-4 h-4 text-rose-500" />}
                Share your experience
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name (optional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white" />
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
              placeholder="What worked well or what should we improve? (optional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white" />
            <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={wantPublic} onChange={(e) => setWantPublic(e.target.checked)} className="mt-0.5" />
              <span>Show on public Feedback wall only after the site owner approves.</span>
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="button" onClick={submit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold">
                <Send className="w-3.5 h-3.5" /> Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={isDarkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-slate-200 border-t border-slate-300'}>
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6">
            <div className="lg:col-span-4 flex gap-4">
              <div className="shrink-0 w-14 h-16 rounded-2xl bg-gradient-to-b from-rose-500 to-pink-700 flex items-center justify-center shadow-md" aria-hidden>
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-slate-900 dark:text-cyan-300 mb-2">Love Our Site? Become a Supporter</h2>
                <ul className="space-y-1.5 text-[13px] text-slate-800 dark:text-slate-200 list-disc pl-4">
                  <li>Browse our site <strong>advert free</strong>.</li>
                  <li>Sun &amp; Moon times <strong>precise to the second</strong>.</li>
                  <li><strong>Exclusive calendar templates</strong> for PDF Calendar.</li>
                </ul>
                <button type="button" onClick={onOpenSupporter}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-cyan-700 hover:bg-cyan-600 shadow-sm">
                  <Heart className="w-3.5 h-3.5 fill-white" /> Become a Supporter
                </button>
                <p className="mt-2 text-[11px] text-slate-700 dark:text-slate-300">
                  From <strong>A$29.99/year</strong> · Not a tax-deductible donation
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h3 className={colTitle}>Company</h3>
                <ul className="space-y-1.5">
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('about')}>About us</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('careers')}>Careers/Jobs</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('contact')}>Contact Us</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('contact-details')}>Contact Details</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('sitemap')}>Sitemap</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('newsletter')}>Newsletter</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('feedback')}>Feedback wall</button></li>
                  <li><button type="button" className={linkBtn} onClick={onOpenAccount}>Free account</button></li>
                </ul>
                <h3 className={`${colTitle} mt-5`}>Follow Us</h3>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { href: c.social.facebook, Icon: Facebook, label: 'Facebook' },
                      { href: c.social.twitter, Icon: Twitter, label: 'X' },
                      { href: c.social.linkedin, Icon: Linkedin, label: 'LinkedIn' },
                      { href: (c.social as { instagram?: string }).instagram || '', Icon: Instagram, label: 'Instagram' },
                      { href: c.social.youtube, Icon: Youtube, label: 'YouTube' },
                    ] as const
                  ).map(({ href, Icon, label }) =>
                    href ? (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                        className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-cyan-700">
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span key={label} title={`${label} — add URL in companyContent`}
                        className="w-8 h-8 rounded-lg bg-slate-500 text-white flex items-center justify-center opacity-70">
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className={colTitle}>Legal</h3>
                <ul className="space-y-1.5">
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('legal')}>Link policy</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('advertise')}>Advertising</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('legal')}>Disclaimer</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('terms')}>Terms &amp; Conditions</button></li>
                  <li><button type="button" className={linkBtn} onClick={onOpenSecurity}>Privacy Policy</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('trust')}>Privacy Settings</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('trust')}>Trust Centre</button></li>
                </ul>
              </div>

              <div>
                <h3 className={colTitle}>Services</h3>
                <ul className="space-y-1.5">
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(1)}>World Clock</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(1)}>Time Zones</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(2)}>Calendar</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(4)}>Weather</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(3)}>Sun &amp; Moon</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(5)}>Timers</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(10)}>Calculators</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(9)}>News</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => onNavigatePillar(7)}>Widgets</button></li>
                  <li><button type="button" className={linkBtn} onClick={() => goCompany('api')}>API</button></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-400 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-700 dark:text-cyan-400" />
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {c.brandName}<span className="text-cyan-700 dark:text-cyan-400">.com</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-700 dark:text-slate-300">
              © {c.legal?.copyrightName || c.legalName} 2024–{year}
              {c.hq.abn ? ` · ABN ${c.hq.abn}` : ''} · {c.hq.city}, {c.hq.country}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
