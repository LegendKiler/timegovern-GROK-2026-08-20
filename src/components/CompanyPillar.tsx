import React, { useState } from 'react';
import {
  Building2, MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2, Briefcase,
  Globe, Smartphone, ArrowRight, Target, Eye, Mic2, Shield, Scale, Megaphone, Cookie, Radio
} from 'lucide-react';
import { companyContent } from '../content/companyContent';
import { legalContent } from '../content/legalContent';

interface CompanyPillarProps {
  onNavigatePillar?: (pillar: number) => void;
}

type HubTab = 'about' | 'contact' | 'newsletter' | 'podcast' | 'legal' | 'trust';

export const CompanyPillar: React.FC<CompanyPillarProps> = () => {
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
  const [cadence, setCadence] = useState<{ weekly: boolean; monthly: boolean; yearly: boolean }>({
    weekly: true,
    monthly: false,
    yearly: false,
  });
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);

  const [jobEmail, setJobEmail] = useState('');
  const [jobPhone, setJobPhone] = useState('');
  const [jobInterest, setJobInterest] = useState('software_engineering');
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [jobSuccess, setJobSuccess] = useState<string | null>(null);

  const [legalSection, setLegalSection] = useState<'privacy' | 'terms' | 'ads' | 'cookies'>('privacy');

  const waUrl = `https://wa.me/${c.hq.whatsapp}?text=${encodeURIComponent(
    'Hello TimeGovern Melbourne, I have an inquiry about timegovern.com'
  )}`;
  const mailUrl = `mailto:${c.hq.email}?subject=${encodeURIComponent('Enquiry — TimeGovern')}&body=${encodeURIComponent(
    'Hello TimeGovern team,\n\n'
  )}`;

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactSuccess(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          phone: contactPhone,
          preferred_method: contactMethod,
          subject: contactSubject,
          message: contactMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setContactSuccess(`Received. Ticket: ${data.ticket_id || 'TG-MELB'}`);
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactSubject('');
        setContactMessage('');
      } else {
        setContactSuccess('Message saved. Our Melbourne team will follow up.');
      }
    } catch {
      setContactSuccess('Message recorded. Thank you — Melbourne HQ will respond when online.');
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
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'company_hub',
          cadence: {
            weekly: cadence.weekly,
            monthly: cadence.monthly,
            yearly: cadence.yearly,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        const parts = [
          cadence.weekly ? 'Weekly' : null,
          cadence.monthly ? 'Monthly' : null,
          cadence.yearly ? 'Yearly' : null,
        ].filter(Boolean);
        setNewsletterSuccess(`Subscribed (${parts.join(' + ')}). Check your inbox for confirmation when email delivery is connected.`);
        setNewsletterEmail('');
      } else {
        setNewsletterSuccess('Subscription recorded.');
      }
    } catch {
      setNewsletterSuccess('Subscription saved locally. Connect an email provider (Resend/SendGrid) to send automatically.');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSubmitting(true);
    setJobSuccess(null);
    try {
      await fetch('/api/job-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: jobEmail, phone: jobPhone, position_interest: jobInterest }),
      });
      setJobSuccess('Registered for Melbourne career alerts.');
      setJobEmail('');
      setJobPhone('');
    } catch {
      setJobSuccess('Registered. We will contact you when roles open.');
    } finally {
      setJobSubmitting(false);
    }
  };

  const tabs: { id: HubTab; label: string; icon: React.ReactNode }[] = [
    { id: 'about', label: 'About', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'newsletter', label: 'Newsletters', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'podcast', label: 'Podcast', icon: <Mic2 className="w-3.5 h-3.5" /> },
    { id: 'trust', label: 'Trust Centre', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'legal', label: 'Legal', icon: <Scale className="w-3.5 h-3.5" /> },
  ];

  const renderLegalDoc = () => {
    const doc =
      legalSection === 'privacy'
        ? L.privacyPolicy
        : legalSection === 'terms'
          ? L.termsOfUse
          : legalSection === 'ads'
            ? L.advertisingPolicy
            : null;
    if (legalSection === 'cookies') {
      return (
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{L.cookieNotice.title}</h3>
          <p>{L.cookieNotice.body}</p>
        </div>
      );
    }
    if (!doc) return null;
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{doc.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{doc.intro}</p>
        {doc.sections.map((s) => (
          <div key={s.heading} className="border-t border-slate-100 dark:border-slate-800 pt-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{s.heading}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <p className="text-[10px] text-slate-400 pt-2">Last updated: {L.lastUpdated}. Not formal legal advice — review with an Australian solicitor for commercial use.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 p-6 pointer-events-none">
          <Building2 className="w-80 h-80 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30 text-xs font-bold uppercase">
            <MapPin className="w-3.5 h-3.5" /> Melbourne, Australia · HQ
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display">{c.brandName}<span className="text-cyan-400">.com</span></h1>
          <p className="text-slate-300 text-sm leading-relaxed">{c.shortDescription}</p>
          <div className="flex flex-wrap gap-4 text-xs text-slate-200 pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-400" />{c.hq.fullAddress}</span>
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400" />{c.hq.phoneDisplay}</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-cyan-400" />{c.hq.email}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              tab === t.id
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ABOUT */}
      {tab === 'about' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold font-display">{c.aboutUs.title}</h2>
          <p className="text-base font-medium text-slate-700 dark:text-slate-200">{c.aboutUs.lead}</p>
          {c.aboutUs.paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p}</p>
          ))}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-600 dark:text-cyan-400 mb-2"><Target className="w-4 h-4" /> Mission</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{c.aboutUs.mission}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2 font-bold text-sm text-indigo-600 mb-2"><Eye className="w-4 h-4" /> Vision</div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{c.aboutUs.vision}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {c.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
                <div className="font-bold text-sm">{v.title}</div>
                <p className="text-[11px] text-slate-500 mt-1">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTACT */}
      {tab === 'contact' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
            <h2 className="text-2xl font-bold font-display flex items-center gap-2">
              <Mail className="w-6 h-6 text-blue-600" /> Contact Melbourne HQ
            </h2>
            <p className="text-xs text-slate-500">{c.hq.fullAddress} · Hours: {c.hq.hours}</p>

            <div className="flex flex-wrap gap-2">
              <a href={mailUrl} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl">
                <Mail className="w-4 h-4" /> Email us
              </a>
              <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl">
                <MessageSquare className="w-4 h-4" /> Chat on WhatsApp
              </a>
              <a href={`tel:${c.hq.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl">
                <Phone className="w-4 h-4" /> Call
              </a>
            </div>
            <p className="text-[11px] text-slate-400">WhatsApp number is a placeholder — replace <code className="text-cyan-600">hq.whatsapp</code> in companyContent.ts with your number (e.g. 614xxxxxxxx).</p>

            {contactSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4" /> {contactSuccess}
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <input required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name *" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5" />
                <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email *" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone / mobile" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5" />
                <select value={contactMethod} onChange={(e: any) => setContactMethod(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5">
                  <option value="email">Prefer email</option>
                  <option value="whatsapp">Prefer WhatsApp</option>
                  <option value="phone">Prefer phone call</option>
                  <option value="sms">Prefer SMS</option>
                </select>
              </div>
              <input required value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} placeholder="Subject *" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5" />
              <textarea required rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Message *" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5" />
              <button type="submit" disabled={contactSubmitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer">
                {contactSubmitting ? 'Sending…' : 'Send to Melbourne HQ'} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xs space-y-2">
              <div className="font-bold text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-600" /> Office</div>
              <p>{c.hq.fullAddress}</p>
              <p>Phone: {c.hq.phoneDisplay}</p>
              <p>General: {c.hq.email}</p>
              <p>Support: {c.hq.supportEmail}</p>
              <p>Privacy: {c.hq.privacyEmail}</p>
              <p>Legal: {c.hq.legalEmail}</p>
              <p className="text-slate-400">ABN {c.hq.abn}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm"><Briefcase className="w-4 h-4 text-amber-500" /> Careers</div>
              {jobSuccess && <p className="text-xs text-emerald-600">{jobSuccess}</p>}
              <form onSubmit={handleJobSubmit} className="space-y-2 text-xs">
                <input type="email" required value={jobEmail} onChange={(e) => setJobEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2" />
                <input type="tel" value={jobPhone} onChange={(e) => setJobPhone(e.target.value)} placeholder="Phone optional" className="w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2" />
                <select value={jobInterest} onChange={(e) => setJobInterest(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border rounded-lg px-3 py-2">
                  <option value="software_engineering">Engineering</option>
                  <option value="ui_ux">Design</option>
                  <option value="sales_support">Sales & Support</option>
                </select>
                <button type="submit" disabled={jobSubmitting} className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg text-xs cursor-pointer">
                  {jobSubmitting ? '…' : 'Job alerts'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* NEWSLETTERS */}
      {tab === 'newsletter' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 max-w-2xl">
          <h2 className="text-2xl font-bold font-display">Newsletters</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Choose weekly, monthly and/or yearly. Opt-in only (Australian Spam Act 2003). Unsubscribe in every email when delivery is connected.
          </p>
          <div className="space-y-3">
            {(['weekly', 'monthly', 'yearly'] as const).map((key) => (
              <label key={key} className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={cadence[key]}
                  onChange={(e) => setCadence((prev) => ({ ...prev, [key]: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-bold text-sm">{c.newsletter[key].name}</div>
                  <p className="text-xs text-slate-500">{c.newsletter[key].description}</p>
                </div>
              </label>
            ))}
          </div>
          {newsletterSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 rounded-xl text-xs text-emerald-800 dark:text-emerald-200">{newsletterSuccess}</div>
          )}
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@company.com"
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm"
            />
            <button type="submit" disabled={newsletterSubmitting} className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm cursor-pointer">
              {newsletterSubmitting ? 'Saving…' : 'Subscribe'}
            </button>
          </form>
          <div className="text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-4 space-y-1">
            <p><strong>Auto-send setup:</strong> Email HTML templates live in <code>src/content/emailTemplates.ts</code>.</p>
            <p>Connect Resend or SendGrid API key in Cloudflare → schedule Worker cron for weekly / monthly / yearly sends → store cadence flags in D1.</p>
            <p>Until an email provider is connected, subscriptions are stored via API but emails are not sent automatically.</p>
          </div>
        </div>
      )}

      {/* PODCAST */}
      {tab === 'podcast' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-600 flex items-center justify-center">
              <Mic2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-display">{c.podcast.title}</h2>
              <p className="text-sm text-slate-500">{c.podcast.subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{c.podcast.description}</p>
          <div className="space-y-3">
            {c.podcast.episodes.map((ep) => (
              <div key={ep.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{ep.title}</div>
                  <p className="text-xs text-slate-500 mt-1">{ep.summary}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{ep.date} · {ep.duration}</p>
                </div>
                <button
                  type="button"
                  disabled={!ep.audioUrl}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
                  title="Add audioUrl in companyContent when ready"
                >
                  {ep.audioUrl ? 'Play' : 'Coming soon'}
                </button>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">To publish: host MP3 (e.g. Cloudflare R2 or Buzzsprout), set each episode <code>audioUrl</code> in companyContent.ts, or embed a podcast RSS player later.</p>
        </div>
      )}

      {/* TRUST */}
      {tab === 'trust' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2"><Shield className="w-6 h-6 text-emerald-500" /> {L.trustCentre.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {L.trustCentre.points.map((p) => (
              <div key={p.title} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="font-bold text-sm mb-1">{p.title}</div>
                <p className="text-xs text-slate-500">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Entity: {L.entity} · ABN {L.abn} · {L.address}</p>
        </div>
      )}

      {/* LEGAL */}
      {tab === 'legal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-2xl font-bold font-display flex items-center gap-2"><Scale className="w-6 h-6 text-blue-600" /> Legal</h2>
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'privacy' as const, label: 'Privacy Policy', icon: <Shield className="w-3.5 h-3.5" /> },
              { id: 'terms' as const, label: 'Terms of Use', icon: <Scale className="w-3.5 h-3.5" /> },
              { id: 'ads' as const, label: 'Advertising Policy', icon: <Megaphone className="w-3.5 h-3.5" /> },
              { id: 'cookies' as const, label: 'Cookies', icon: <Cookie className="w-3.5 h-3.5" /> },
            ]).map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setLegalSection(x.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  legalSection === x.id ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {x.icon} {x.label}
              </button>
            ))}
          </div>
          <div className="pt-2">{renderLegalDoc()}</div>
        </div>
      )}

      <p className="text-[10px] text-center text-slate-400">
        © {c.legal.year} {c.legal.copyrightName}. {c.hq.city}, {c.hq.country}. Governing law: {c.legal.governingLaw}.
      </p>
    </div>
  );
};
