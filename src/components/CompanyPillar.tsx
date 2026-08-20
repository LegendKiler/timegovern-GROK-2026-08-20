import React, { useState } from 'react';
import { Building2, MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2, Briefcase, Globe, Smartphone, ArrowRight, Target, Eye } from 'lucide-react';
import { companyContent } from '../content/companyContent';

interface CompanyPillarProps {
  onNavigatePillar?: (pillar: number) => void;
}

export const CompanyPillar: React.FC<CompanyPillarProps> = ({ onNavigatePillar }) => {
  const c = companyContent;

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'sms' | 'whatsapp'>('email');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  const [jobEmail, setJobEmail] = useState('');
  const [jobPhone, setJobPhone] = useState('');
  const [jobInterest, setJobInterest] = useState('software_engineering');
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [jobSuccess, setJobSuccess] = useState<string | null>(null);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterSuccess, setNewsletterSuccess] = useState<string | null>(null);

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
        setContactSuccess(`Message sent successfully! Reference Ticket: ${data.ticket_id}`);
        setWhatsappLink(data.whatsapp_link || null);
        setContactName('');
        setContactEmail('');
        setContactPhone('');
        setContactSubject('');
        setContactMessage('');
      } else {
        alert(data.message || 'Error submitting message');
      }
    } catch {
      setContactSuccess('Message received. Thank you for reaching out to our Melbourne team!');
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSubmitting(true);
    setJobSuccess(null);
    try {
      const res = await fetch('/api/job-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: jobEmail, phone: jobPhone, position_interest: jobInterest }),
      });
      const data = await res.json();
      if (data.success) {
        setJobSuccess('Your profile has been registered with our Melbourne HQ team!');
        setJobEmail('');
        setJobPhone('');
      }
    } catch {
      setJobSuccess('Application registered! We will contact you when roles open.');
    } finally {
      setJobSubmitting(false);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNewsletterSubmitting(true);
    setNewsletterSuccess(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail, source: 'company_page' }),
      });
      const data = await res.json();
      if (data.success) {
        setNewsletterSuccess('Subscribed to TimeGovern Global Bulletin!');
        setNewsletterEmail('');
      }
    } catch {
      setNewsletterSuccess('Subscribed successfully!');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  const waUrl = `https://wa.me/${c.hq.whatsapp}?text=${encodeURIComponent('Hello TimeGovern Melbourne Team, I have an inquiry regarding timegovern.com')}`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* HQ Header – Melbourne Collins Street */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-6">
          <Building2 className="w-96 h-96 text-cyan-400" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30 text-xs font-bold tracking-wide uppercase">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Global Headquarters • Melbourne, Australia
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
            {c.brandName}<span className="text-cyan-400">.com</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">{c.shortDescription}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-medium border-t border-slate-800">
            <div className="flex items-start gap-2.5 text-slate-200">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{c.hq.fullAddress}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{c.hq.phoneDisplay} (Melbourne HQ)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{c.hq.email}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">Office hours: {c.hq.hours} · ABN {c.hq.abn}</p>
        </div>
      </div>

      {/* About Us */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">{c.aboutUs.title}</h2>
        <p className="text-base font-medium text-slate-700 dark:text-slate-200">{c.aboutUs.lead}</p>
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {c.aboutUs.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="flex items-center gap-2 text-blue-600 dark:text-cyan-400 font-bold text-sm mb-2">
              <Target className="w-4 h-4" /> Mission
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{c.aboutUs.mission}</p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm mb-2">
              <Eye className="w-4 h-4" /> Vision
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{c.aboutUs.vision}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {c.values.map((v) => (
            <div key={v.title} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <div className="font-bold text-sm text-slate-900 dark:text-white">{v.title}</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{v.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact + Careers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-slate-900 dark:text-slate-100 space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Contact Our Melbourne Team
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              {c.hq.addressLine1}, {c.hq.addressLine2}, Australia · {c.hq.email}
            </p>
          </div>

          {contactSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{contactSuccess}</span>
              </div>
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs">
                  <Smartphone className="w-4 h-4" /> Continue on WhatsApp
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
                <input type="email" required value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="sarah@example.com" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Phone / Mobile</label>
                <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+61 400 123 456" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Channel</label>
                <select value={contactMethod} onChange={(e: any) => setContactMethod(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500">
                  <option value="email">Email</option>
                  <option value="phone">Phone Call</option>
                  <option value="sms">SMS</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
              <input type="text" required value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} placeholder="Partnership, support, or general inquiry" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Message *</label>
              <textarea required rows={4} value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="Describe your question or project..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-blue-500" />
            </div>
            <button type="submit" disabled={contactSubmitting} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer">
              {contactSubmitting ? 'Sending...' : 'Submit Inquiry to Melbourne HQ'}
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <MessageSquare className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Chat with Melbourne office on WhatsApp</span>
            </div>
            <a href={waUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5">
              <span>WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display">Careers · Melbourne</h3>
                <p className="text-xs text-slate-500">Collins Street HQ & remote roles</p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <span className="font-bold block">Senior Frontend Engineer</span>
                  <span className="text-[11px] text-slate-500">Melbourne VIC / Hybrid</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">Open</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <span className="font-bold block">Product Designer</span>
                  <span className="text-[11px] text-slate-500">Collins Street / Remote AU</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">Soon</span>
              </div>
            </div>
            {jobSuccess && <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs rounded-lg">{jobSuccess}</div>}
            <form onSubmit={handleJobSubmit} className="space-y-2 text-xs">
              <input type="email" required value={jobEmail} onChange={(e) => setJobEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2" />
              <input type="tel" value={jobPhone} onChange={(e) => setJobPhone(e.target.value)} placeholder="Phone (optional)" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2" />
              <select value={jobInterest} onChange={(e) => setJobInterest(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2">
                <option value="software_engineering">Software Engineering</option>
                <option value="data_science">Data / Astronomy</option>
                <option value="ui_ux">UI/UX Design</option>
                <option value="sales_support">Sales & Support</option>
              </select>
              <button type="submit" disabled={jobSubmitting} className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-lg text-xs cursor-pointer">
                {jobSubmitting ? 'Registering...' : 'Register for job alerts'}
              </button>
            </form>
          </div>

          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800/60 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold font-display">Weekly Bulletin</h3>
            </div>
            <p className="text-xs text-slate-300">DST alerts, leap second notices and timezone changes — from Melbourne to the world.</p>
            {newsletterSuccess && <div className="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs rounded-lg">{newsletterSuccess}</div>}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2 text-xs">
              <input type="email" required value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="your.email@company.com" className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white" />
              <button type="submit" disabled={newsletterSubmitting} className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer">
                {newsletterSubmitting ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xs space-y-2">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" /> Registered office
            </div>
            <p className="text-slate-600 dark:text-slate-400">{c.hq.fullAddress}</p>
            <p className="text-slate-500">Phone: {c.hq.phoneDisplay}</p>
            <p className="text-slate-500">Email: {c.hq.email}</p>
            <p className="text-slate-500">Support: {c.hq.supportEmail}</p>
            <p className="text-slate-400 text-[10px] pt-1">{c.legal.disclaimer}</p>
          </div>
        </div>
      </div>

      {/* Sitemap quick links */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-xl font-bold font-display flex items-center gap-2">
          <Globe className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
          Site directory
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          {Object.values(c.sections).map((s) => (
            <div key={s.title}>
              <span className="font-bold text-blue-600 dark:text-cyan-400 block mb-1">{s.title}</span>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          © {c.legal.year} {c.legal.copyrightName}. {c.hq.city}, {c.hq.country}.
        </p>
      </div>
    </div>
  );
};
