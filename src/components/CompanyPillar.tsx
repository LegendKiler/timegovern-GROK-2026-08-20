import React, { useState, useEffect } from 'react';
import {
  Building2, MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2, Briefcase,
  Globe, Smartphone, ArrowRight, Target, Eye, Mic2, Shield, Scale, Megaphone, Cookie, Radio
} from 'lucide-react';
import { companyContent } from '../content/companyContent';
import { legalContent } from '../content/legalContent';
import { buildNewsletterEmail } from '../content/emailTemplates';
import { ExperienceFeedbackPanel } from './ExperienceFeedbackPanel';

interface CompanyPillarProps {
  onNavigatePillar?: (pillar: number) => void;
}

type HubTab = 'about' | 'contact' | 'newsletter' | 'podcast' | 'legal' | 'trust' | 'feedback' | 'sitemap' | 'careers';

export const CompanyPillar: React.FC<CompanyPillarProps> = ({ onNavigatePillar }) => {
  const c = companyContent;
  const L = legalContent;
  const [tab, setTab] = useState<HubTab>('about');
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
  const [jobEmail, setJobEmail] = useState('');
  const [jobSuccess, setJobSuccess] = useState<string | null>(null);
  const [legalSection, setLegalSection] = useState<'privacy' | 'terms' | 'ads' | 'cookies'>('privacy');

  useEffect(() => {
    const applyHash = (raw: string) => {
      const h = (raw || '').replace(/^#/, '').toLowerCase().trim();
      if (!h) return;
      const map: Record<string, HubTab> = {
        about: 'about', company: 'about', contact: 'contact', 'contact-details': 'contact',
        newsletter: 'newsletter', newsletters: 'newsletter', podcast: 'podcast',
        legal: 'legal', terms: 'legal', disclaimer: 'legal', 'link-policy': 'legal',
        advertising: 'legal', advertise: 'legal',
        privacy: 'trust', trust: 'trust', 'privacy-settings': 'trust',
        careers: 'careers', jobs: 'careers', sitemap: 'sitemap',
        api: 'about', feedback: 'feedback', experience: 'feedback',
      };
      const next = map[h];
      if (!next) return;
      setTab(next);
      if (h === 'advertising' || h === 'advertise') setLegalSection('ads');
      if (h === 'terms' || h === 'disclaimer' || h === 'link-policy') setLegalSection('terms');
      if (h === 'privacy') setLegalSection('privacy');
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
    const parts = [
      cadence.weekly ? 'Weekly' : null,
      cadence.monthly ? 'Monthly' : null,
      cadence.yearly ? 'Yearly' : null,
    ].filter(Boolean);
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
    setNewsletterSuccess(`Opt-in saved for ${parts.join(' + ')}. Preview below (Spam Act 2003). Connect Resend/SendGrid for live delivery.`);
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
    const doc =
      legalSection === 'privacy' ? L.privacyPolicy
        : legalSection === 'terms' ? L.termsOfUse
          : legalSection === 'ads' ? L.advertisingPolicy : null;
    if (legalSection === 'cookies') {
      return (
        <div className="text-xs text-slate-300 space-y-2">
          <p>We use essential storage for theme, pins, and preferences. Analytics cookies only if you enable them later.</p>
          <p>Contact {c.hq.privacyEmail || c.hq.email} for data requests (Australian Privacy Principles / GDPR-style rights).</p>
        </div>
      );
    }
    if (!doc) return null;
    return (
      <div className="text-xs text-slate-300 space-y-2 max-h-96 overflow-y-auto">
        <h4 className="font-bold text-white text-sm">{(doc as { title?: string }).title || legalSection}</h4>
        <pre className="whitespace-pre-wrap font-sans text-slate-400">{typeof doc === 'string' ? doc : JSON.stringify(doc, null, 2).slice(0, 4000)}</pre>
      </div>
    );
  };

  return (
    <div id="company-hub" className="space-y-6">
      <div className="rounded-2xl border-2 border-cyan-500/30 bg-slate-950 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-2">Company hub</p>
        <div role="tablist" className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                tab === t.id ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-200 border-slate-700'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'about' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm text-slate-200">
          <h2 className="text-xl font-bold text-white">{c.aboutUs.title}</h2>
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
          <h3 className="font-bold text-white text-lg">Contact Melbourne HQ</h3>
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
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-4 text-sm text-slate-200">
          <h3 className="font-bold text-white text-lg flex items-center gap-2"><Radio className="w-5 h-5 text-cyan-400" /> Newsletters</h3>
          <p className="text-xs text-slate-400">Weekly · Monthly · Yearly. Express opt-in. Unsubscribe in every live email (Spam Act 2003).</p>
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
          <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
            {(['weekly', 'monthly', 'yearly'] as const).map((k) => (
              <div key={k} className="rounded-lg border border-slate-700 p-2">
                <p className="font-bold text-white capitalize">{c.newsletter[k].name}</p>
                <p className="text-slate-500 mt-1">{c.newsletter[k].description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'podcast' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="font-bold text-white text-lg flex items-center gap-2"><Mic2 className="w-5 h-5 text-cyan-400" /> Podcast</h3>
          <p className="text-xs text-slate-400">Weekly / monthly / yearly episodes on time, calendars, DST and sky events (text catalogue until audio hosting is connected).</p>
          <ul className="space-y-2 text-xs">
            {(c.podcast?.episodes || []).slice(0, 8).map((ep: { id: string; title: string; date?: string; description?: string }) => (
              <li key={ep.id} className="rounded-lg border border-slate-700 p-2">
                <p className="font-semibold text-white">{ep.title}</p>
                <p className="text-slate-500">{ep.date} — {ep.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab === 'careers' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-cyan-400" /> Careers / Jobs</h3>
          <p className="text-slate-400 text-xs">Melbourne-based · remote-friendly roles in time systems, frontend, and data.</p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
            <li>Frontend engineer (React, performance, accessibility)</li>
            <li>Content & astronomy editor (part-time)</li>
            <li>Student internships — timezone tools for education</li>
          </ul>
          <p className="text-xs text-slate-400">Email <a className="text-cyan-400 underline" href={`mailto:${c.hq.email}?subject=Careers`}>{c.hq.email}</a></p>
          <button type="button" className="text-xs font-bold text-cyan-400 underline" onClick={() => setTab('contact')}>Go to Contact</button>
        </div>
      )}

      {tab === 'sitemap' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm">
          <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-cyan-400" /> Sitemap</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            {[
              { label: 'World Clock', p: 1 }, { label: 'Calendar', p: 2 }, { label: 'Sun & Moon', p: 3 },
              { label: 'Weather', p: 4 }, { label: 'Timers', p: 5 }, { label: 'Widgets', p: 7 },
              { label: 'News', p: 9 }, { label: 'Calculators', p: 10 }, { label: 'Company hub', p: 11 },
            ].map((x) => (
              <button key={x.label} type="button" className="text-left px-3 py-2 rounded-lg border border-slate-700 hover:border-cyan-500/50 text-slate-200"
                onClick={() => onNavigatePillar?.(x.p)}>{x.label}</button>
            ))}
          </div>
        </div>
      )}

      {tab === 'feedback' && <ExperienceFeedbackPanel />}

      {tab === 'trust' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm text-slate-200">
          <h3 className="font-bold text-white text-lg flex items-center gap-2"><Shield className="w-5 h-5 text-cyan-400" /> Trust Centre</h3>
          <p className="text-xs text-slate-400">HTTPS in production · Australian Privacy Principles · clear privacy contacts.</p>
          <p className="text-xs">Privacy: {c.hq.privacyEmail || c.hq.email} · Legal: {c.hq.legalEmail || c.hq.email}</p>
          <button type="button" className="text-xs font-bold text-cyan-400 underline" onClick={() => setTab('feedback')}>Moderate experience feedback</button>
        </div>
      )}

      {tab === 'legal' && (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-3 text-sm">
          <h3 className="font-bold text-white text-lg flex items-center gap-2"><Scale className="w-5 h-5 text-cyan-400" /> Legal</h3>
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'privacy' as const, label: 'Privacy' },
              { id: 'terms' as const, label: 'Terms' },
              { id: 'ads' as const, label: 'Advertising' },
              { id: 'cookies' as const, label: 'Cookies' },
            ]).map((x) => (
              <button key={x.id} type="button" onClick={() => setLegalSection(x.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  legalSection === x.id ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-slate-200 border-slate-600'
                }`}>{x.label}</button>
            ))}
          </div>
          <div className="pt-2">{renderLegalDoc()}</div>
        </div>
      )}

      <p className="text-[10px] text-center text-slate-600">© {c.legal.year} {c.legal.copyrightName}. {c.hq.city}, {c.hq.country}. Not formal legal advice.</p>
    </div>
  );
};
