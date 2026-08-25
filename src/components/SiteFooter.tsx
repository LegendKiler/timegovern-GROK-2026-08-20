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
} from 'lucide-react';
import { companyContent, companyMailto } from '../content/companyContent';

export type FooterPillarNav = (pillar: number) => void;

type Props = {
  onNavigatePillar: FooterPillarNav;
  onOpenSupporter: () => void;
  onOpenAccount: () => void;
  onOpenSecurity: () => void;
  isDarkMode?: boolean;
};

/**
 * F1 — timeanddate-style footer:
 * - Experience feedback bar + Contact Us
 * - Love our site? Become a Supporter (3 clear bullets + CTA)
 * - Company | Legal | Services | Follow Us
 * - Brand + copyright
 */
export const SiteFooter: React.FC<Props> = ({
  onNavigatePillar,
  onOpenSupporter,
  onOpenAccount,
  onOpenSecurity,
  isDarkMode = false,
}) => {
  const c = companyContent;
  const year = c.legal?.year ?? new Date().getFullYear();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    try {
      return (localStorage.getItem('tg_footer_feedback') as 'up' | 'down') || null;
    } catch {
      return null;
    }
  });

  const sendFeedback = (value: 'up' | 'down') => {
    setFeedback(value);
    try {
      localStorage.setItem('tg_footer_feedback', value);
      localStorage.setItem('tg_footer_feedback_at', new Date().toISOString());
    } catch {
      /* ignore */
    }
  };

  const goCompany = (hash?: string) => {
    onNavigatePillar(11);
    if (hash) {
      window.setTimeout(() => {
        window.location.hash = hash;
      }, 50);
    }
  };

  const linkBtn =
    'text-left hover:underline text-[13px] leading-relaxed text-blue-700 dark:text-cyan-400/90';

  const colTitle =
    'text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-2';

  return (
    <footer className="w-full mt-auto text-slate-700 dark:text-slate-300">
      {/* Top utility bar — matches timeanddate blue strip */}
      <div className="bg-[#0b6aa2] text-white text-[13px]">
        <div className="max-w-[1200px] mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-medium">How was your experience?</span>
            <button
              type="button"
              aria-label="Good experience"
              onClick={() => sendFeedback('up')}
              className={`p-1 rounded hover:bg-white/15 ${
                feedback === 'up' ? 'bg-white/25' : ''
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="Poor experience"
              onClick={() => sendFeedback('down')}
              className={`p-1 rounded hover:bg-white/15 ${
                feedback === 'down' ? 'bg-white/25' : ''
              }`}
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
            {feedback && (
              <span className="text-[12px] text-white/90">Thanks for your feedback.</span>
            )}
          </div>
          <a
            href={companyMailto('TimeGovern contact')}
            className="inline-flex items-center gap-1.5 hover:underline font-medium"
          >
            Contact Us <Mail className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main footer body — light panel like T&D */}
      <div
        className={
          isDarkMode
            ? 'bg-slate-900 border-t border-slate-800'
            : 'bg-[#eef3f9] border-t border-slate-200'
        }
      >
        <div className="max-w-[1200px] mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6">
            {/* Supporter CTA — 3 bullets only */}
            <div className="lg:col-span-4 flex gap-4">
              <div
                className="shrink-0 w-14 h-16 rounded-2xl bg-gradient-to-b from-rose-500 to-pink-700 flex items-center justify-center shadow-md"
                aria-hidden
              >
                <Heart className="w-7 h-7 text-white fill-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-[#2c5aa0] dark:text-cyan-300 mb-2">
                  Love Our Site? Become a Supporter
                </h2>
                <ul className="space-y-1.5 text-[13px] text-slate-700 dark:text-slate-300 list-disc pl-4">
                  <li>
                    Browse our site <strong className="text-slate-900 dark:text-white">advert free</strong>.
                  </li>
                  <li>
                    Sun &amp; Moon times <strong className="text-slate-900 dark:text-white">precise to the second</strong>.
                  </li>
                  <li>
                    <strong className="text-slate-900 dark:text-white">Exclusive calendar templates</strong> for PDF
                    Calendar.
                  </li>
                </ul>
                <button
                  type="button"
                  onClick={onOpenSupporter}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-bold text-white bg-[#0b6aa2] hover:bg-[#095a8a] shadow-sm"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  Become a Supporter
                </button>
                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  From <strong>A$29.99/year</strong> · Not a tax-deductible donation
                </p>
              </div>
            </div>

            {/* Link columns */}
            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div>
                <h3 className={colTitle}>Company</h3>
                <ul className="space-y-1">
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('about')}>
                      About us
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('careers')}>
                      Careers/Jobs
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('contact')}>
                      Contact Us
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('contact')}>
                      Contact Details
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('sitemap')}>
                      Sitemap
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('newsletter')}>
                      Newsletter
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={onOpenAccount}>
                      Free account
                    </button>
                  </li>
                </ul>

                <h3 className={`${colTitle} mt-5`}>Follow Us</h3>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { href: c.social.facebook, Icon: Facebook, label: 'Facebook' },
                      { href: c.social.twitter, Icon: Twitter, label: 'X' },
                      { href: c.social.linkedin, Icon: Linkedin, label: 'LinkedIn' },
                      {
                        href: (c.social as { instagram?: string }).instagram || '',
                        Icon: Instagram,
                        label: 'Instagram',
                      },
                      { href: c.social.youtube, Icon: Youtube, label: 'YouTube' },
                    ] as const
                  ).map(({ href, Icon, label }) =>
                    href ? (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="w-8 h-8 rounded bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span
                        key={label}
                        title={`${label} — add URL in companyContent`}
                        className="w-8 h-8 rounded bg-slate-300 dark:bg-slate-700 text-slate-500 flex items-center justify-center cursor-default"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                    )
                  )}
                </div>
              </div>

              <div>
                <h3 className={colTitle}>Legal</h3>
                <ul className="space-y-1">
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('legal')}>
                      Link policy
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('advertise')}>
                      Advertising
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('legal')}>
                      Disclaimer
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('legal')}>
                      Terms &amp; Conditions
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={onOpenSecurity}>
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('trust')}>
                      Privacy Settings
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('trust')}>
                      Trust Centre
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className={colTitle}>Services</h3>
                <ul className="space-y-1">
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(1)}>
                      World Clock
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(1)}>
                      Time Zones
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(2)}>
                      Calendar
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(4)}>
                      Weather
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(3)}>
                      Sun &amp; Moon
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(5)}>
                      Timers
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(10)}>
                      Calculators
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(9)}>
                      News
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => onNavigatePillar(7)}>
                      Widgets
                    </button>
                  </li>
                  <li>
                    <button type="button" className={linkBtn} onClick={() => goCompany('api')}>
                      API
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Brand row */}
          <div className="mt-8 pt-6 border-t border-slate-300/80 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#0b6aa2] dark:text-cyan-400" />
              <span className="font-extrabold text-slate-800 dark:text-white text-sm">
                {c.brandName}
                <span className="text-[#0b6aa2] dark:text-cyan-400">.com</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              © {c.legal?.copyrightName || c.legalName} 2024–{year}
              {c.hq.abn ? ` · ABN ${c.hq.abn}` : ''}
              {' · '}
              {c.hq.city}, {c.hq.country}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
