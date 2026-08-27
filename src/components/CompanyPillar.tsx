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
  const [contactView, setContactView] = useState<'form' | 'details'>('form');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [legalSection, setLegalSection] = useState<LegalSection>('privacy');
  const [nlEmail, setNlEmail] = useState('');
  const [nlCadence, setNlCadence] = useState<'weekly' | 'monthly' | 'yearly'>('weekly');

  useEffect(() => {
    const onHash = () => {
      const h = (window.location.hash || '').replace(/^#/, '').toLowerCase();
      if (!h) return;
      const map: Record<string, HubTab> = {
        about: 'about', company: 'about', contact: 'contact', 'contact-details': 'contact',
        newsletter: 'newsletter', podcast: 'podcast', legal: 'legal', trust: 'trust',
        privacy: 'legal', terms: 'legal', careers: 'careers', jobs: 'careers', sitemap: 'sitemap',
        feedback: 'feedback', experience: 'feedback',
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
    const doc = (L as any)[legalSection] || L.privacy;
    return (
      <div className="prose prose-invert prose-sm max-w-none text-slate-300">
        <h4 className="text-white font-bold text-base mb-2">{doc?.title || legalSection}</h4>
        {(doc?.sections || []).map((s: { heading: string; body: string }) => (
          <div key={s.heading} className="mb-3">
            <h5 className="text-cyan-300 font-semibold text-xs uppercase tracking-wide">{s.heading}</h5>
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{s.body}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-900/80 border border-slate-700">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
              tab === t.id
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm text-slate-200">
          <h3 className="text-lg font-bold text-white">{c.aboutUs.title}</h3>
          <p className="text-slate-300">{c.aboutUs.lead}</p>
          {c.aboutUs.paragraphs.map((p) => (
            <p key={p.slice(0, 40)} className="text-xs text-slate-400 leading-relaxed">{p}</p>
          ))}
          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-700 p-3">
              <p className="text-[10px] font-bold uppercase text-cyan-400">Mission</p>
              <p className="text-xs text-slate-300 mt-1">{c.aboutUs.mission}</p>
            </div>
            <div className="rounded-xl border border-slate-700 p-3">
              <p className="text-[10px] font-bold uppercase text-cyan-400">Vision</p>
              <p className="text-xs text-slate-300 mt-1">{c.aboutUs.vision}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'contact' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Mail className="w-5 h-5 text-cyan-400" /> Contact</h3>
          <p className="text-xs text-slate-400">{c.hq.fullAddress}</p>
          <p className="text-xs text-slate-300">
            Email:{' '}
            <a className="text-cyan-400 font-semibold" href={`mailto:${c.hq.email}`}>{c.hq.email}</a>
            {' · '}Phone: {c.hq.phoneDisplay}
          </p>
          <p className="text-[11px] text-slate-500">{c.hq.hours}</p>
          <button type="button" className="text-xs font-bold text-cyan-400 underline" onClick={() => setTab('careers')}>
            View open roles
          </button>
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="text-lg font-bold text-white">Newsletters</h3>
          <p className="text-xs text-slate-400">Weekly, monthly and yearly digests about global time tools.</p>
          <input
            type="email"
            value={nlEmail}
            onChange={(e) => setNlEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full max-w-sm text-xs rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"
          />
          <div className="flex flex-wrap gap-2">
            {(['weekly', 'monthly', 'yearly'] as const).map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setNlCadence(x)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                  nlCadence === x ? 'border-cyan-400 text-cyan-200' : 'border-slate-600 text-slate-400'
                }`}
              >
                {x}
              </button>
            ))}
          </div>
          <a
            href={`mailto:${c.hq.email}?subject=${encodeURIComponent('Newsletter subscribe — ' + nlCadence)}&body=${encodeURIComponent('Please subscribe ' + nlEmail + ' to ' + nlCadence)}`}
            className="inline-flex text-xs font-bold text-cyan-400 underline"
          >
            Subscribe via email
          </a>
        </div>
      )}

      {tab === 'podcast' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-2 text-sm text-slate-200">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Mic2 className="w-5 h-5 text-cyan-400" /> Podcast</h3>
          <p className="text-xs text-slate-400">Weekly and monthly shows on time, calendars and the sky — scripts published on this page; audio hosting can be linked when ready.</p>
        </div>
      )}

      {tab === 'careers' && <CareersPanel />}

      {tab === 'sitemap' && (
        <SiteMapPanel
          onNavigatePillar={onNavigatePillar}
          onOpenTab={setTab}
          onOpenLegal={(section) => {
            setTab('legal');
            setLegalSection(section as LegalSection);
          }}
        />
      )}

      {tab === 'feedback' && <ExperienceFeedbackPanel />}

      {tab === 'trust' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> Trust Centre</h3>
          <p className="text-xs text-slate-400">Security posture, contacts, and how we handle trust.</p>
          <ul className="space-y-2 text-xs text-slate-300">
            {((L as any).trustCentre?.points || []).map((pt: { title: string; text: string }) => (
              <li key={pt.title}><strong className="text-cyan-300">{pt.title}:</strong> {pt.text}</li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'legal' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-cyan-400" /> Legal
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
                    ? 'bg-cyan-500/15 border-cyan-400'
                    : 'bg-slate-900 border-slate-600 hover:border-cyan-500/40'
                }`}
              >
                <span className="block text-xs font-extrabold text-white">{x.label}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">{x.blurb}</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-4">{renderLegalDoc()}</div>
        </div>
      )}

      <p className="text-[10px] text-center text-slate-600">
        © {c.legal?.year || new Date().getFullYear()} {c.legal?.copyrightName || c.legalName}. {c.hq.city}, {c.hq.country}.
      </p>
    </div>
  );
};

export default CompanyPillar;
