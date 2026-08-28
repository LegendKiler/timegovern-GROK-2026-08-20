import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2, Briefcase,
  Globe, Smartphone, ArrowRight, Target, Eye, Mic2, Shield, Scale, Megaphone, Cookie, Radio
} from 'lucide-react';
import { companyContent } from '../content/companyContent';
import { legalContent } from '../content/legalContent';
import { buildNewsletterEmail } from '../content/emailTemplates';
import { ExperienceFeedbackPanel } from './ExperienceFeedbackPanel';
import { CareersPanel } from './CareersPanel';
import { PodcastPanel } from './PodcastPanel';
import { SiteMapPanel } from './SiteMapPanel';

interface CompanyPillarProps {
  onNavigatePillar?: (pillar: number) => void;
}

type HubTab = 'about' | 'contact' | 'newsletter' | 'podcast' | 'legal' | 'trust' | 'feedback' | 'sitemap' | 'careers';
type LegalSection = 'privacy' | 'terms' | 'ads' | 'cookies' | 'disclaimer' | 'linkpolicy';

export const CompanyPillar: React.FC<CompanyPillarProps> = ({ onNavigatePillar }) => {
  const c = companyContent;
  const L = legalContent;
  const [tab, setTab] = useState<HubTab>('about');
  const [legalSection, setLegalSection] = useState<LegalSection>('privacy');
  const [nlEmail, setNlEmail] = useState('');
  const [nlCadence, setNlCadence] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  useEffect(() => {
    const onHash = () => {
      const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
      if (!h) return;
      const map: Record<string, HubTab> = {
        about: 'about', company: 'about', contact: 'contact', newsletter: 'newsletter',
        podcast: 'podcast', legal: 'legal', trust: 'trust', privacy: 'legal', terms: 'legal',
        careers: 'careers', jobs: 'careers', sitemap: 'sitemap', feedback: 'feedback',
      };
      const next = map[h];
      if (next) setTab(next);
      if (h === 'privacy') setLegalSection('privacy');
      if (h === 'terms') setLegalSection('terms');
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const tabs: { id: HubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'About', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'newsletter', label: 'Newsletters', icon: <Send className="w-3.5 h-3.5" /> },
    { id: 'podcast', label: 'Podcast', icon: <Mic2 className="w-3.5 h-3.5" /> },
    { id: 'careers', label: 'Careers', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'trust', label: 'Trust', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'legal', label: 'Legal', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'sitemap', label: 'Sitemap', icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  const renderLegalDoc = () => {
    const docs: Record<LegalSection, { title: string; body: string }> = {
      privacy: { title: L.privacy?.title || 'Privacy Policy', body: (L.privacy as any)?.body || (L.privacy as any)?.summary || '' },
      terms: { title: L.terms?.title || 'Terms & Conditions', body: (L.terms as any)?.body || (L.terms as any)?.summary || '' },
      ads: { title: (L as any).advertising?.title || 'Advertising', body: (L as any).advertising?.body || '' },
      cookies: { title: (L as any).cookies?.title || 'Cookies', body: (L as any).cookies?.body || '' },
      disclaimer: { title: (L as any).disclaimer?.title || 'Disclaimer', body: (L as any).disclaimer?.body || '' },
      linkpolicy: { title: (L as any).linkPolicy?.title || 'Link policy', body: (L as any).linkPolicy?.body || '' },
    };
    const doc = docs[legalSection];
    return (
      <div className="prose prose-slate dark:prose-invert prose-sm max-w-none text-slate-700 dark:text-slate-300">
        <h4 className="text-slate-900 dark:text-white font-bold text-base mb-2">{doc.title}</h4>
        <div className="whitespace-pre-wrap text-xs leading-relaxed">{doc.body || 'See full policy text in content files.'}</div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              tab === t.id
                ? 'bg-cyan-100 border-cyan-500 text-cyan-900 dark:bg-cyan-500/20 dark:border-cyan-400 dark:text-cyan-200'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-5 space-y-4 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{c.aboutUs?.title || 'About TimeGovern'}</h3>
          <p className="text-slate-600 dark:text-slate-300">{c.aboutUs?.lead}</p>
          {(c.aboutUs?.paragraphs || []).map((p: string) => (
            <p key={p.slice(0, 40)} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{p}</p>
          ))}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/50">
              <p className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400">Mission</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{c.aboutUs?.mission}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/50">
              <p className="text-[10px] font-bold uppercase text-cyan-700 dark:text-cyan-400">Vision</p>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-1">{c.aboutUs?.vision}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'contact' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-5 space-y-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Contact
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">{c.hq?.fullAddress}</p>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Email:{' '}
            <a className="text-cyan-700 dark:text-cyan-400 font-semibold" href={`mailto:${c.hq?.email}`}>
              {c.hq?.email}
            </a>
          </p>
          {c.hq?.phone && (
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Phone: <span className="font-semibold">{c.hq.phone}</span>
            </p>
          )}
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-5 space-y-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Newsletters</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Weekly, monthly and yearly digests about global time tools.</p>
          <input
            type="email"
            value={nlEmail}
            onChange={(e) => setNlEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full max-w-sm text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white"
          />
          <div className="flex flex-wrap gap-2">
            {(['weekly', 'monthly', 'yearly'] as const).map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setNlCadence(x)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                  nlCadence === x
                    ? 'border-cyan-600 bg-cyan-50 text-cyan-900 dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-200'
                    : 'border-slate-300 text-slate-600 bg-white dark:border-slate-600 dark:text-slate-400 dark:bg-transparent'
                }`}
              >
                {x}
              </button>
            ))}
          </div>
          <a
            href={`mailto:${c.hq?.email}?subject=${encodeURIComponent('Newsletter subscribe — ' + nlCadence)}&body=${encodeURIComponent('Please subscribe ' + (nlEmail || '[your email]') + ' to the ' + nlCadence + ' newsletter.')}`}
            className="inline-flex text-xs font-bold text-cyan-700 dark:text-cyan-400 underline"
          >
            Subscribe via email
          </a>
        </div>
      )}

      {tab === 'podcast' && <PodcastPanel />}
      {tab === 'careers' && <CareersPanel />}
      {tab === 'feedback' && <ExperienceFeedbackPanel />}
      {tab === 'sitemap' && <SiteMapPanel onNavigatePillar={onNavigatePillar} />}

      {tab === 'trust' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-5 space-y-3 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Trust Centre
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Security posture, contacts, and how we handle trust on TimeGovern.</p>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {((L as any).trustCentre?.points || []).map((pt: { title: string; text: string }) => (
              <li key={pt.title}>
                <strong className="text-cyan-700 dark:text-cyan-300">{pt.title}:</strong> {pt.text}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'legal' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/80 p-5 space-y-4 text-sm text-slate-700 dark:text-slate-200 shadow-sm">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Legal
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {([
              { id: 'privacy' as const, label: 'Privacy Policy', blurb: 'Personal data & your rights' },
              { id: 'terms' as const, label: 'Terms & Conditions', blurb: 'Rules for using the site' },
              { id: 'disclaimer' as const, label: 'Disclaimer', blurb: 'Limits on reliance on data' },
              { id: 'linkpolicy' as const, label: 'Link policy', blurb: 'Linking to and from us' },
              { id: 'ads' as const, label: 'Advertising', blurb: 'Ad standards on TimeGovern' },
              { id: 'cookies' as const, label: 'Cookies', blurb: 'Storage & preferences' },
            ]).map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setLegalSection(x.id)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  legalSection === x.id
                    ? 'bg-cyan-50 border-cyan-500 dark:bg-cyan-500/15 dark:border-cyan-400'
                    : 'bg-white border-slate-200 hover:border-cyan-400 dark:bg-slate-900 dark:border-slate-600 dark:hover:border-cyan-500/40'
                }`}
              >
                <span className="block text-xs font-extrabold text-slate-900 dark:text-white">{x.label}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{x.blurb}</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/80 p-4">{renderLegalDoc()}</div>
        </div>
      )}

      <p className="text-[10px] text-center text-slate-500 dark:text-slate-600">
        © {c.legal?.year || new Date().getFullYear()} {c.legal?.copyrightName || c.legalName}. {c.hq?.city}, {c.hq?.country}.
      </p>
    </div>
  );
};

export default CompanyPillar;
