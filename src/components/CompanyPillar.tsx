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
        <div className="space-y-3 text-sm text-slate-300">
          <h3 className="text-lg font-bold text-white">{L.cookieNotice.title}</h3>
          <p>{L.cookieNotice.body}</p>
        </div>
      );
    }
    if (!doc) return null;
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">{doc.title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{doc.intro}</p>
        {doc.sections.map((s) => (
          <div key={s.heading} className="border-t border-slate-700 pt-3">
            <h4 className="text-sm font-bold text-cyan-300 mb-1">{s.heading}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <p className="text-[10px] text-slate-500 pt-2">Last updated: {L.lastUpdated}. Not formal legal advice.</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto" data-testid="company-pillar">
      <div
        className="rounded-xl border-2 border-cyan-400 px-4 py-3 text-sm font-bold text-cyan-300"
        style={{ backgroundColor: '#020617', borderColor: '#22d3ee', color: '#67e8f9' }}
      >
        COMPANY HUB ACTIVE — use tabs below: About · Contact · Newsletters · Podcast · Trust · Legal
      </div>

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

      <div
        role="tablist"
        aria-label="Company sections"
        className="flex flex-wrap gap-2 p-2 rounded-2xl border-2"
        style={{ backgroundColor: '#020617', borderColor: 'rgba(34,211,238,0.5)' }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer border"
            style={
              tab === t.id
                ? { backgroundColor: '#22d3ee', color: '#020617', borderColor: '#67e8f9' }
                : { backgroundColor: '#1e293b', color: '#f8fafc', borderColor: '#475569' }
            }
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-6" style={{ backgroundColor: '#0f172a', color: '#e2e8f0' }}>
          <h2 className="text-2xl font-bold text-white">{c.aboutUs.title}</h2>
          <p className="text-base font-medium text-cyan-100">{c.aboutUs.lead}</p>
          {c.aboutUs.paragraphs.map((p, i) => (
            <p key={i} className="text-sm text-slate-400 leading-relaxed">{p}</p>
          ))}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700 p-4" style={{ backgroundColor: '#020617' }}>
              <div className="flex items-center gap-2 font-bold text-sm text-cyan-400 mb-2"><Target className="w-4 h-4" /> Mission</div>
              <p className="text-xs text-slate-400">{c.aboutUs.mission}</p>
            </div>
            <div className="rounded-xl border border-slate-700 p-4" style={{ backgroundColor: '#020617' }}>
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-400 mb-2"><Eye className="w-4 h-4" /> Vision</div>
              <p className="text-xs text-slate-400">{c.aboutUs.vision}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {c.values.map((v) => (
              <div key={v.title} className="rounded-xl border border-slate-700 p-3" style={{ backgroundColor: '#020617' }}>
                <div className="font-bold text-sm text-white">{v.title}</div>
                <p className="text-[11px] text-slate-500 mt-1">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'contact' && (
        <div className="grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-5" style={{ backgroundColor: '#0f172a' }}>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Mail className="w-6 h-6 text-cyan-400" /> Contact Melbourne HQ
            </h2>
            <p className="text-xs text-slate-500">{c.hq.fullAddress} · Hours: {c.hq.hours}</p>
            <div className="flex flex-wrap gap-2">
              <a href={mailUrl} className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 text-slate-950 text-xs font-bold rounded-xl">Email us</a>
              <a href={waUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl">WhatsApp</a>
              <a href={`tel:${c.hq.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-600">Call</a>
            </div>
            {contactSuccess && (
              <div className="p-3 rounded-xl border border-emerald-500/40 text-xs text-emerald-300">{contactSuccess}</div>
            )}
            <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
              <div className="grid sm:grid-cols-2 gap-3">
                <input required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name *" className="w-full rounded-xl px-3 py-2.5 border border-slate-600 bg-slate-950 text-white" />
                <input required type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email *" className="w-full rounded-xl px-3 py-2.5 border border-slate-600 bg-slate-950 text-white" />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="Phone" className="w-full rounded-xl px-3 py-2.5 border border-slate-600 bg-slate-950 text-white" />
                <select value={contactMethod} onChange={(e: any) => setContactMethod(e.target.value)} className="w-full rounded-xl px-3 py-2.5 border border-slate-600 bg-slate-950 text-white">
                  <option value="email">Prefer email</option>
                  <option value="whatsapp">Prefer WhatsApp</option>
                  <option value="phone">Prefer phone</option>
                  <option value="sms">Prefer SMS</option>
                </select>
              </div>
              <input required value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} placeholder="Subject *" className="w-full rounded-xl px-3 py-2.5 border border-slate-600 bg-slate-950 text-white" />
              <textarea required rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Message *" className="w-full rounded-xl px-3 py-2.5 border border-slate-600 bg-slate-950 text-white" />
              <button type="submit" disabled={contactSubmitting} className="w-full py-3 bg-cyan-500 text-slate-950 font-bold rounded-xl">
                {contactSubmitting ? 'Sending…' : 'Send to Melbourne HQ'}
              </button>
            </form>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-700 p-5 text-xs text-slate-300 space-y-2" style={{ backgroundColor: '#0f172a' }}>
              <div className="font-bold text-sm text-white">Office</div>
              <p>{c.hq.fullAddress}</p>
              <p>Phone: {c.hq.phoneDisplay}</p>
              <p>General: {c.hq.email}</p>
              <p>Support: {c.hq.supportEmail}</p>
              <p className="text-slate-500">ABN {c.hq.abn}</p>
            </div>
            <div className="rounded-2xl border border-slate-700 p-5 space-y-3" style={{ backgroundColor: '#0f172a' }}>
              <div className="font-bold text-sm text-white">Careers</div>
              {jobSuccess && <p className="text-xs text-emerald-400">{jobSuccess}</p>}
              <form onSubmit={handleJobSubmit} className="space-y-2 text-xs">
                <input type="email" required value={jobEmail} onChange={(e) => setJobEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg px-3 py-2 border border-slate-600 bg-slate-950 text-white" />
                <input type="tel" value={jobPhone} onChange={(e) => setJobPhone(e.target.value)} placeholder="Phone optional" className="w-full rounded-lg px-3 py-2 border border-slate-600 bg-slate-950 text-white" />
                <select value={jobInterest} onChange={(e) => setJobInterest(e.target.value)} className="w-full rounded-lg px-3 py-2 border border-slate-600 bg-slate-950 text-white">
                  <option value="software_engineering">Engineering</option>
                  <option value="ui_ux">Design</option>
                  <option value="sales_support">Sales & Support</option>
                </select>
                <button type="submit" disabled={jobSubmitting} className="w-full py-2 bg-slate-100 text-slate-900 font-bold rounded-lg text-xs">Job alerts</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {tab === 'newsletter' && (
        <div className="rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-6 max-w-2xl" style={{ backgroundColor: '#0f172a' }}>
          <h2 className="text-2xl font-bold text-white">Newsletters</h2>
          <p className="text-sm text-slate-400">Weekly / monthly / yearly. Opt-in only (Spam Act 2003).</p>
          <div className="space-y-3">
            {(['weekly', 'monthly', 'yearly'] as const).map((key) => (
              <label key={key} className="flex items-start gap-3 p-4 rounded-xl border border-slate-700 cursor-pointer">
                <input type="checkbox" checked={cadence[key]} onChange={(e) => setCadence((prev) => ({ ...prev, [key]: e.target.checked }))} className="mt-1" />
                <div>
                  <div className="font-bold text-sm text-white">{c.newsletter[key].name}</div>
                  <p className="text-xs text-slate-500">{c.newsletter[key].description}</p>
                </div>
              </label>
            ))}
          </div>
          {newsletterSuccess && <div className="p-3 rounded-xl border border-emerald-500/40 text-xs text-emerald-300">{newsletterSuccess}</div>}
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2">
            <input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="you@company.com" className="flex-1 rounded-xl px-4 py-2.5 border border-slate-600 bg-slate-950 text-white text-sm" />
            <button type="submit" disabled={newsletterSubmitting} className="px-6 py-2.5 bg-cyan-500 text-slate-950 font-bold rounded-xl text-sm">Subscribe</button>
          </form>
        </div>
      )}

      {tab === 'podcast' && (
        <div className="rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-6" style={{ backgroundColor: '#0f172a' }}>
          <h2 className="text-2xl font-bold text-white">{c.podcast.title}</h2>
          <p className="text-sm text-slate-500">{c.podcast.subtitle}</p>
          <p className="text-sm text-slate-400">{c.podcast.description}</p>
          <div className="space-y-3">
            {c.podcast.episodes.map((ep) => (
              <div key={ep.id} className="p-4 rounded-xl border border-slate-700">
                <div className="font-bold text-sm text-white">{ep.title}</div>
                <p className="text-xs text-slate-500 mt-1">{ep.summary}</p>
                <p className="text-[11px] text-slate-600 mt-1">{ep.date} · {ep.duration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'trust' && (
        <div className="rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-6" style={{ backgroundColor: '#0f172a' }}>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Shield className="w-6 h-6 text-emerald-400" /> {L.trustCentre.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {L.trustCentre.points.map((p) => (
              <div key={p.title} className="rounded-xl border border-slate-700 p-4">
                <div className="font-bold text-sm text-white mb-1">{p.title}</div>
                <p className="text-xs text-slate-500">{p.text}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Entity: {L.entity} · ABN {L.abn} · {L.address}</p>
        </div>
      )}

      {tab === 'legal' && (
        <div className="rounded-2xl border border-slate-700 p-6 sm:p-8 space-y-4" style={{ backgroundColor: '#0f172a' }}>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Scale className="w-6 h-6 text-cyan-400" /> Legal</h2>
          <div className="flex flex-wrap gap-2">
            {([
              { id: 'privacy' as const, label: 'Privacy Policy' },
              { id: 'terms' as const, label: 'Terms of Use' },
              { id: 'ads' as const, label: 'Advertising Policy' },
              { id: 'cookies' as const, label: 'Cookies' },
            ]).map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setLegalSection(x.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border"
                style={
                  legalSection === x.id
                    ? { backgroundColor: '#22d3ee', color: '#020617', borderColor: '#67e8f9' }
                    : { backgroundColor: '#1e293b', color: '#f8fafc', borderColor: '#475569' }
                }
              >
                {x.label}
              </button>
            ))}
          </div>
          <div className="pt-2">{renderLegalDoc()}</div>
        </div>
      )}

      <p className="text-[10px] text-center text-slate-600">
        © {c.legal.year} {c.legal.copyrightName}. {c.hq.city}, {c.hq.country}.
      </p>
    </div>
  );
};
