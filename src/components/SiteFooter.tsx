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

/**
 * Footer colours locked in themeForce.css (.tg-site-footer*).
 * Legal links open Company → Legal with the correct document (not mixed modals).
 * Services switch pillars. Account / Supporter stay modals.
 */
export const SiteFooter: React.FC<Props> = ({
  onNavigatePillar,
  onOpenSupporter,
  onOpenAccount,
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

  return (
    <footer className="tg-site-footer w-full mt-auto font-sans">
      <div className="bg-slate-950 text-slate-100 text-[13px] border-b border-slate-700">
        <div className="max-w-[1200px] mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-semibold text-slate-100">How was your experience?</span>
            <button
              type="button"
              aria-label="Good experience"
              onClick={() => openFeedback('up')}
              className={`p-1.5 rounded-lg hover:bg-white/10 text-slate-100 ${
                feedback === 'up' ? 'bg-emerald-500/30 ring-1 ring-emerald-400/50' : ''
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Poor experience"
              onClick={() => openFeedback('down')}
              className={`p-1.5 rounded-lg hover:bg-white/10 text-slate-100 ${
                feedback === 'down' ? 'bg-rose-500/30 ring-1 ring-rose-400/50' : ''
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            {doneMsg && <span className="text-[12px] text-emerald-300 max-w-md">{doneMsg}</span>}
          </div>
          <a
            href={companyMailto('TimeGovern contact')}
            className="inline-flex items-center gap-1.5 hover:underline font-semibold text-cyan-300"
          >
            Contact Us <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-600 shadow-2xl p-5 space-y-3 text-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                {pendingVote === 'up' ? (
                  <ThumbsUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ThumbsDown className="w-4 h-4 text-rose-400" />
                )}
                Share your experience
              </h3>
              <button type="button" onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Display name (optional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-600 bg-slate-950 text-sm text-white"
            />
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="What worked well or what should we improve? (optional)"
              className="w-full px-3 py-2 rounded-xl border border-slate-600 bg-slate-950 text-sm text-white"
            />
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input type="checkbox" checked={wantPublic} onChange={(e) => setWantPublic(e.target.checked)} className="mt-0.5" />
              <span>Show on public Feedback wall only after the site owner approves.</span>
            </label>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-3 py-2 text-xs font-semibold text-slate-400">
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" /> Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tg-footer-body">
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6">
            <div className="lg:col-span-4 flex gap-4">
              <div
                className="shrink-0 w-14 h-16 rounded-2xl bg-gradient-to-b from-rose-500 to-pink-700 flex items-center justify-center shadow-md"
                aria-hidden
              >
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <h2 className="tg-footer-heading tg-footer-heading--hero">Love Our Site? Become a Supporter</h2>
                <ul className="space-y-1.5 text-[13px] list-disc pl-4">
                  <li>
                    Browse our site <span className="tg-footer-strong">advert free</span>.
                  </li>
                  <li>
                    Sun & Moon times <span className="tg-footer-strong">precise to the second</span>.
                  </li>
                  <li>
                    <span className="tg-footer-strong">Exclusive calendar templates</span> for PDF Calendar.
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={onOpenSupporter}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" /> Become a Supporter
                </button>
                <p className="tg-footer-muted mt-2 text-[11px]">
                  From <span className="tg-footer-strong">A$29.99/year</span> · Not a tax-deductible donation
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h3 className="tg-footer-heading">Company</h3>
                <ul className="space-y-1.5">
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('about')}>About us</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('careers')}>Careers/Jobs</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('contact')}>Contact Us</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('contact-details')}>Contact Details</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('sitemap')}>Sitemap</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('newsletter')}>Newsletter</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('feedback')}>Feedback wall</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={onOpenAccount}>Free account</button></li>
                </ul>
                <h3 className="tg-footer-heading tg-footer-heading--sub">Follow Us</h3>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { href: c.social.facebook, Icon: Facebook, label: 'Facebook', tone: 'tg-social-facebook' },
                      { href: c.social.twitter, Icon: Twitter, label: 'X', tone: 'tg-social-x' },
                      { href: c.social.linkedin, Icon: Linkedin, label: 'LinkedIn', tone: 'tg-social-linkedin' },
                      { href: (c.social as { instagram?: string }).instagram || '', Icon: Instagram, label: 'Instagram', tone: 'tg-social-instagram' },
                      { href: c.social.youtube, Icon: Youtube, label: 'YouTube', tone: 'tg-social-youtube' },
                    ] as const
                  ).map(({ href, Icon, label, tone }) =>
                    href ? (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className={`tg-social-btn ${tone}`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2.25} />
                      </a>
                    ) : (
                      <span
                        key={label}
                        title={`${label} — add URL in companyContent`}
                        className={`tg-social-btn tg-social-btn--muted ${tone}`}
                      >
                        <Icon className="w-4 h-4" strokeWidth={2.25} />
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className="tg-footer-heading">Legal</h3>
                <ul className="space-y-1.5">
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('link-policy')}>Link policy</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('advertise')}>Advertising</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('disclaimer')}>Disclaimer</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('terms')}>Terms & Conditions</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('privacy')}>Privacy Policy</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('privacy-settings')}>Privacy Settings</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('trust')}>Trust Centre</button></li>
                </ul>
              </div>

              <div>
                <h3 className="tg-footer-heading">Services</h3>
                <ul className="space-y-1.5">
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(1)}>World Clock</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(1)}>Time Zones</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(2)}>Calendar</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(4)}>Weather</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(3)}>Sun & Moon</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(5)}>Timers</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(10)}>Calculators</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(9)}>News</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => onNavigatePillar(7)}>Widgets</button></li>
                  <li><button type="button" className="tg-footer-link" onClick={() => goCompany('api')}>API</button></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-600 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="tg-footer-brand font-extrabold text-sm">
                {c.brandName}
                <span className="tg-footer-brand-accent">.com</span>
              </span>
            </div>
            <p className="tg-footer-muted text-[11px]">
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
