import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2, Briefcase,
  Globe, Smartphone, ArrowRight, Target, Eye, Mic2, Shield, Scale, Megaphone, Cookie, Radio
} from 'lucide-react';
import { companyContent } from '../content/companyContent';
import { legalContent } from '../content/legalContent';
import { buildNewsletterEmail } from '../content/emailTemplates';
import { ExperienceFeedbackPanel } from './ExperienceFeedbackPanel';
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
  const [contactPhone, setContactPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'sms' | 'whatsapp'>('email');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [cadence, setCadence] = useState({ weekly: true, monthly: false, yearly: false });
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);
  const [newsletterPreview, setNewsletterPreview] = useState<{ subject: string; text: string } | null>(null);
  const [legalSection, setLegalSection] = useState<LegalSection>('privacy');

  useEffect(() => {
    const applyHash = (raw: string) => {
      const h = (raw || '').replace(/^#/, '').toLowerCase().trim();
      if (!h) return;
      const map: Record<string, HubTab> = {
        about: 'about', company: 'about', contact: 'contact', 'contact-details': 'contact',
        newsletter: 'newsletter', newsletters: 'newsletter', podcast: 'podcast',
        legal: 'legal', terms: 'legal', disclaimer: 'legal', 'link-policy': 'legal', linkpolicy: 'legal',
        advertising: 'legal', advertise: 'legal', ads: 'legal',
        privacy: 'legal', 'privacy-policy': 'legal',
        trust: 'trust', 'privacy-settings': 'trust', cookies: 'legal',
        careers: 'careers', jobs: 'careers', sitemap: 'sitemap',
        api: 'about', feedback: 'feedback', experience: 'feedback',
      };
      const next = map[h];
      if (!next) return;
      setTab(next);
      if (h === 'contact-details') setContactView('details');
      else if (h === 'contact') setContactView('form');
      if (h === 'advertising' || h === 'advertise' || h === 'ads') setLegalSection('ads');
      else if (h === 'disclaimer') setLegalSection('disclaimer');
      else if (h === 'link-policy' || h === 'linkpolicy') setLegalSection('linkpolicy');
      else if (h === 'terms') setLegalSection('terms');
      else if (h === 'privacy' || h === 'privacy-policy') setLegalSection('privacy');
      else if (h === 'cookies') setLegalSection('cookies');
      else if (h === 'legal') setLegalSection('privacy');
      window.setTimeout(() => {
        document.getElementById('company-hub')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    };
    applyHash(window.location.hash);
    const onHash = () => applyHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const waUrl = `https://wa.me/${c.hq.whatsapp}?text=${encodeURIComponent(c.contactTemplates.whatsappPrefill)}`;
  const mailUrl = `mailto:${c.hq.email}?subject=${encodeURIComponent(c.contactTemplates.emailSubject)}&body=${encodeURIComponent(c.contactTemplates.emailBody)}`;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactSuccess(null);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName, email: contactEmail, phone: contactPhone,
          preferred_method: contactMethod, subject: contactSubject, message: contactMessage,
        }),
      });
      setContactSuccess('Message recorded. Melbourne HQ will follow up.');
      setContactName(''); setContactEmail(''); setContactPhone(''); setContactSubject(''); setContactMessage('');
    } catch {
      setContactSuccess('Message recorded offline. We will respond when services are online.');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadence.weekly && !cadence.monthly && !cadence.yearly) {
      setNewsletterSuccess('Please select at least one frequency.');
      return;
    }
    setNewsletterSubmitting(true);
    setNewsletterSuccess(null);
    const primary = cadence.weekly ? 'weekly' : cadence.monthly ? 'monthly' : 'yearly';
    const built = buildNewsletterEmail({ cadence: primary as 'weekly' | 'monthly' | 'yearly', toEmail: newsletterEmail });
    setNewsletterPreview({ subject: built.subject, text: built.text });
    const parts = [cadence.weekly ? 'Weekly' : null, cadence.monthly ? 'Monthly' : null, cadence.yearly ? 'Yearly' : null].filter(Boolean);
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'company_hub',
          cadence: { weekly: cadence.weekly, monthly: cadence.monthly, yearly: cadence.yearly },
        }),
      });
    } catch { /* offline ok */ }
    setNewsletterSuccess(`Opt-in saved for ${parts.join(' + ')}. Preview below (Spam Act 2003).`);
    setNewsletterEmail('');
    setNewsletterSubmitting(false);
  };

  const tabs: { id: HubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'About', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'newsletter', label: 'Newsletters', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'podcast', label: 'Podcast', icon: <Mic2 className="w-3.5 h-3.5" /> },
    { id: 'careers', label: 'Careers', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { id: 'trust', label: 'Trust Centre', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'legal', label: 'Legal', icon: <Scale className="w-3.5 h-3.5" /> },
    { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'sitemap', label: 'Sitemap', icon: <Globe className="w-3.5 h-3.5" /> },
  ];

  const renderLegalDoc = () => {
    type Doc = { title: string; intro: string; sections: { heading: string; body: string }[] };
    let doc: Doc | null = null;
    if (legalSection === 'privacy') doc = L.privacyPolicy as Doc;
    else if (legalSection === 'terms') doc = L.termsOfUse as Doc;
    else if (legalSection === 'ads') doc = L.advertisingPolicy as Doc;
    else if (legalSection === 'disclaimer') doc = (L as { disclaimer?: Doc }).disclaimer || null;
    else if (legalSection === 'linkpolicy') doc = (L as { linkPolicy?: Doc }).linkPolicy || null;
    else if (legalSection === 'cookies') doc = (L as { cookieNotice?: Doc }).cookieNotice || null;

    if (!doc) {
      return (
        <div className="text-xs text-slate-300 space-y-2">
          <p>Essential storage for theme, pins and preferences. Contact {c.hq.privacyEmail || c.hq.email} for data requests.</p>
        </div>
      );
    }
    return (
      <div className="text-xs text-slate-200 space-y-4 max-h-[28rem] overflow-y-auto pr-1">
        <div>
          <h4 className="font-bold text-white text-sm">{doc.title}</h4>
          <p className="text-slate-400 mt-1 leading-relaxed">{doc.intro}</p>
          <p className="text-[10px] text-slate-500 mt-1">Last updated: {L.lastUpdated} · Policy text for the website — not a substitute for legal advice</p>
        </div>
        {doc.sections.map((s) => (
          <div key={s.heading}>
            <h5 className="font-semibold text-cyan-300 text-[11px] mb-1">{s.heading}</h5>
            <p className="text-slate-300 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div id="company-hub" className="space-y-6">
      <div className="rounded-2xl border-2 border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-950 to-cyan-950/20 p-4 sm:p-5 shadow-lg shadow-cyan-950/20">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-cyan-400">Company hub</p>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight mt-0.5">About, contact, legal & more</h2>
            <p className="text-[11px] text-slate-400 mt-1">Melbourne-based · policies, newsletters, and how to reach us</p>
          </div>
        </div>
        <div role="tablist" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition-all ${
                tab === t.id
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/25 scale-[1.02]'
                  : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-cyan-500/40 hover:text-white'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'about' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm text-slate-200">
          <h2 className="text-xl font-extrabold text-white tracking-tight">{c.aboutUs.title}</h2>
          <p className="text-slate-300">{c.aboutUs.lead}</p>
          {c.aboutUs.paragraphs.map((p, i) => (
            <p key={i} className="text-xs text-slate-400 leading-relaxed">{p}</p>
          ))}
          <div className="grid sm:grid-cols-3 gap-3">
            {c.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-slate-700 p-3">
                <p className="font-bold text-cyan-300 text-xs">{v.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">{v.text}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500"><MapPin className="w-3 h-3 inline" /> {c.hq.fullAddress}</p>
        </div>
      )}

      {tab === 'contact' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setContactView('form')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${contactView === 'form' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'border-slate-600 text-slate-200'}`}>Contact Us (message)</button>
            <button type="button" onClick={() => setContactView('details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${contactView === 'details' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'border-slate-600 text-slate-200'}`}>Contact Details (address)</button>
          </div>
          {contactView === 'details' && (
            <div className="rounded-xl border border-slate-600 bg-slate-900 p-4 space-y-2 text-xs text-slate-300">
              <h3 className="font-bold text-white text-sm">Registered details</h3>
              <p><strong className="text-white">{c.legalName}</strong>{c.hq.abn ? ` · ABN ${c.hq.abn}` : ''}</p>
              <p>{c.hq.fullAddress}</p>
              <p>Phone: {c.hq.phoneDisplay}</p>
              <p>Email: {c.hq.email}</p>
              <p>Privacy: {c.hq.privacyEmail || c.hq.email}</p>
              <p>Legal: {c.hq.legalEmail || c.hq.email}</p>
              <p className="text-slate-500">Address and identifiers only. Use Contact Us to send a message.</p>
            </div>
          )}
          {contactView === 'form' && (
            <>
              <h3 className="font-bold text-white text-lg">Contact Us — send a message</h3>
              <div className="flex flex-wrap gap-2 text-xs">
                <a href={mailUrl} className="px-3 py-2 rounded-lg bg-cyan-600 text-white font-bold">Email</a>
                <a href={waUrl} target="_blank" rel="noreferrer" className="px-3 py-2 rounded-lg bg-emerald-600 text-white font-bold">WhatsApp</a>
                <a href={`tel:${c.hq.phone.replace(/\s/g, '')}`} className="px-3 py-2 rounded-lg border border-slate-600 text-slate-200">{c.hq.phoneDisplay}</a>
              </div>
              <form onSubmit={handleContactSubmit} className="space-y-2">
                <input required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs" />
                <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs" />
                <input value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} placeholder="Subject" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs" />
                <textarea required rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Message" className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs" />
                <button type="submit" disabled={contactSubmitting} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">{contactSubmitting ? 'Sending…' : 'Send'}</button>
                {contactSuccess && <p className="text-xs text-emerald-400">{contactSuccess}</p>}
              </form>
            </>
          )}
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm text-slate-200">
          <h3 className="font-bold text-white text-lg flex items-center gap-2"><Radio className="w-5 h-5 text-cyan-400" /> Newsletters</h3>
          <p className="text-xs text-slate-400">Weekly · Monthly · Yearly. Express opt-in (Spam Act 2003).</p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-3">
            <input required type="email" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs" />
            <div className="flex flex-wrap gap-3 text-xs">
              {(['weekly', 'monthly', 'yearly'] as const).map((k) => (
                <label key={k} className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={cadence[k]} onChange={(e) => setCadence((p) => ({ ...p, [k]: e.target.checked }))} />
                  <span className="capitalize">{k}</span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={newsletterSubmitting} className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold">Subscribe</button>
            {newsletterSuccess && <p className="text-xs text-emerald-400">{newsletterSuccess}</p>}
          </form>
          {newsletterPreview && (
            <div className="rounded-xl border border-slate-600 bg-slate-900 p-3 text-xs space-y-1">
              <p className="font-bold text-cyan-300">Preview: {newsletterPreview.subject}</p>
              <pre className="whitespace-pre-wrap text-slate-400 font-sans">{newsletterPreview.text}</pre>
            </div>
          )}
        </div>
      )}

      {tab === 'podcast' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="font-bold text-white text-lg flex items-center gap-2"><Mic2 className="w-5 h-5 text-cyan-400" /> Podcast</h3>
          <p className="text-xs text-slate-400">Catalogue of time, calendar and sky topics (audio hosting can be connected later).</p>
          <ul className="space-y-2 text-xs">
            {((c as { podcast?: { episodes?: { id: string; title: string; date?: string; description?: string; summary?: string }[] } }).podcast?.episodes || []).slice(0, 12).map((ep) => (
              <li key={ep.id} className="rounded-lg border border-slate-700 p-2">
                <p className="font-semibold text-white">{ep.title}</p>
                <p className="text-slate-500">{ep.date} — {ep.summary || ep.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'careers' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-cyan-400" /> Careers / Jobs</h3>
          <p className="text-slate-400 text-xs">Melbourne-based · remote-friendly roles.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
            <li>Frontend engineer (React, performance, accessibility)</li>
            <li>Content & astronomy editor (part-time)</li>
            <li>Student internships</li>
          </ul>
          <button type="button" className="text-xs font-bold text-cyan-400 underline" onClick={() => setTab('contact')}>Go to Contact</button>
        </div>
      )}

      {tab === 'sitemap' && (
        <SiteMapPanel
          onNavigatePillar={onNavigatePillar}
          onOpenTab={setTab}
          onOpenLegal={(section) => {
            setTab('legal');
            setLegalSection(section);
          }}
        />
      )}

      {tab === 'feedback' && <ExperienceFeedbackPanel />}

      {tab === 'trust' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="font-extrabold text-white text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> Trust Centre</h3>
          <p className="text-xs text-slate-400">Security posture, contacts, and how we handle trust.</p>
          <ul className="space-y-2 text-xs text-slate-300">
            {(L.trustCentre?.points || []).map((pt) => (
              <li key={pt.title}><strong className="text-cyan-300">{pt.title}:</strong> {pt.text}</li>
            ))}
          </ul>
          <button type="button" className="text-xs font-bold text-cyan-400 underline" onClick={() => setTab('feedback')}>Moderate experience feedback</button>
        </div>
      )}

      {tab === 'legal' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm">
          <div>
            <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" /> Legal
            </h3>
            <p className="text-xs text-slate-400 mt-1">Choose a document. Full policy text appears below — same style as professional site policies.</p>
          </div>
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
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-950/30'
                    : 'bg-slate-900 border-slate-600 hover:border-cyan-500/40'
                }`}
              >
                <span className={`block text-xs font-extrabold ${legalSection === x.id ? 'text-cyan-300' : 'text-white'}`}>{x.label}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5">{x.blurb}</span>
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-slate-600 bg-slate-900/80 p-4">
            {renderLegalDoc()}
          </div>
        </div>
      )}

      <p className="text-[10px] text-center text-slate-600">© {c.legal.year} {c.legal.copyrightName}. {c.hq.city}, {c.hq.country}. Website policies — not formal legal advice.</p>
    </div>
  );
};

export default CompanyPillar;
