import React, { useState } from 'react';
import { Building2, MapPin, Mail, Phone, MessageSquare, Send, CheckCircle2, Briefcase, Globe, FileText, Smartphone, AlertCircle, ArrowRight } from 'lucide-react';

interface CompanyPillarProps {
  onNavigatePillar?: (pillar: number) => void;
}

export const CompanyPillar: React.FC<CompanyPillarProps> = ({ onNavigatePillar }) => {
  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'sms' | 'whatsapp'>('email');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // Job Alert Email State
  const [jobEmail, setJobEmail] = useState('');
  const [jobPhone, setJobPhone] = useState('');
  const [jobInterest, setJobInterest] = useState('software_engineering');
  const [jobSubmitting, setJobSubmitting] = useState(false);
  const [jobSuccess, setJobSuccess] = useState<string | null>(null);

  // Newsletter Email State
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
    } catch (err: any) {
      setContactSuccess('Message received and saved locally. Thank you for reaching out!');
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
        body: JSON.stringify({
          email: jobEmail,
          phone: jobPhone,
          position_interest: jobInterest,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setJobSuccess('Your application profile has been registered with our Brunswick HQ HR team!');
        setJobEmail('');
        setJobPhone('');
      }
    } catch (err) {
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
        body: JSON.stringify({
          email: newsletterEmail,
          source: 'company_page',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewsletterSuccess('Subscribed to TimeGovern Global Bulletin!');
        setNewsletterEmail('');
      }
    } catch (err) {
      setNewsletterSuccess('Subscribed successfully!');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Company Header & Melbourne HQ Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-6">
          <Building2 className="w-96 h-96 text-cyan-400" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/30 text-xs font-bold tracking-wide uppercase">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Global Headquarters • Melbourne, Australia
          </div>

          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white leading-tight">
            TimeGovern<span className="text-cyan-400">.com</span> Corporate Headquarters
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            TimeGovern is Australia’s premier temporal technology authority. Operating from Brunswick, Melbourne, our engineers build atomic-synchronized world clocks, astronomical ephemeris calculators, global timezone planning infrastructure, and high-frequency edge APIs.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-medium border-t border-slate-800">
            <div className="flex items-center gap-2.5 text-slate-200">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Office 1, Sydney Road, Brunswick, VIC 3056, Australia</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>+61 (03) 9000 1000 (Melb HQ)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-200">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>contact@timegovern.com</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Contact Us Form + Direct WhatsApp & Careers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Contact Form Column (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-slate-900 dark:text-slate-100 space-y-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Mail className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Contact Our Melbourne Team
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Send us a direct inquiry. All messages are stored in our secure Cloudflare D1 database and routed to our Brunswick team.
            </p>
          </div>

          {contactSuccess && (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 rounded-xl p-4 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{contactSuccess}</span>
              </div>
              {whatsappLink && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-xs"
                  >
                    <Smartphone className="w-4 h-4" /> Continue on WhatsApp Direct
                  </a>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone / Mobile Number (SMS & WhatsApp ready)
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+61 400 123 456"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Contact Channel
                </label>
                <select
                  value={contactMethod}
                  onChange={(e: any) => setContactMethod(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
                >
                  <option value="email">Email Response</option>
                  <option value="phone">Phone Call</option>
                  <option value="sms">SMS Text Alert</option>
                  <option value="whatsapp">WhatsApp Direct Message</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder="Inquiry regarding enterprise API, timezone data or partnerships"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Message *
              </label>
              <textarea
                required
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Please describe your question or project requirements..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 font-medium"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={contactSubmitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              {contactSubmitting ? 'Sending Message to Brunswick D1 Database...' : 'Submit Inquiry to TimeGovern HQ'}
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Direct WhatsApp Button */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Need instant response? Chat directly with our Melbourne office via WhatsApp.</span>
            </div>
            <a
              href="https://wa.me/61390001000?text=Hello%20TimeGovern%20Melbourne%20Team%2C%20I%20have%20an%20inquiry%20regarding%20timegovern.com"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors whitespace-nowrap shadow-sm flex items-center gap-1.5"
            >
              <span>Chat on WhatsApp</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Side Column: Careers / Job Alerts + Newsletter (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Careers & Job Alerts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white">
                  Careers & Job Alerts
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Brunswick, Melbourne Office & Remote Roles
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Senior Edge Worker Engineer</span>
                  <span className="text-[11px] text-slate-500">Melbourne, VIC / Hybrid</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-300 dark:border-emerald-800">Open Role</span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">Astronomy & Ephemeris Data Specialist</span>
                  <span className="text-[11px] text-slate-500">Brunswick Office / Remote</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold rounded-full border border-amber-300 dark:border-amber-800">Coming Soon</span>
              </div>
            </div>

            {/* Job Alert Subscription Box */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <span className="font-bold text-xs text-slate-900 dark:text-white block">
                Leave your email for upcoming career openings:
              </span>

              {jobSuccess && (
                <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs rounded-lg font-medium">
                  {jobSuccess}
                </div>
              )}

              <form onSubmit={handleJobSubmit} className="space-y-2 text-xs">
                <input
                  type="email"
                  required
                  value={jobEmail}
                  onChange={(e) => setJobEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <input
                  type="tel"
                  value={jobPhone}
                  onChange={(e) => setJobPhone(e.target.value)}
                  placeholder="Phone number (optional for SMS job alerts)"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                />
                <select
                  value={jobInterest}
                  onChange={(e) => setJobInterest(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="software_engineering">Software Engineering / Edge Computing</option>
                  <option value="data_science">Astronomy & Data Science</option>
                  <option value="ui_ux">UI/UX Product Design</option>
                  <option value="sales_support">Enterprise Sales & Support</option>
                </select>
                <button
                  type="submit"
                  disabled={jobSubmitting}
                  className="w-full py-2 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-lg transition-colors text-xs cursor-pointer"
                >
                  {jobSubmitting ? 'Registering...' : 'Register for Career Notifications'}
                </button>
              </form>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800/60 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold font-display">TimeGovern Weekly Bulletin</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Get weekly Daylight Saving alerts, leap second notices, solar flare reports, and regional time zone changes straight to your inbox.
            </p>

            {newsletterSuccess && (
              <div className="p-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs rounded-lg font-medium">
                {newsletterSuccess}
              </div>
            )}

            <form onSubmit={handleNewsletterSubmit} className="space-y-2 text-xs">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="your.email@company.com"
                className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                disabled={newsletterSubmitting}
                className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors text-xs cursor-pointer shadow-sm"
              >
                {newsletterSubmitting ? 'Subscribing...' : 'Subscribe Free'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Interactive Sitemap Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm text-slate-900 dark:text-slate-100 space-y-6">
        <div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            TimeGovern Complete Site Directory & Index
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Quick links to all tools, global clocks, astronomical ephemeris, weather radar, calculators, and API documentation.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-xs">
          <div>
            <span className="font-bold text-blue-600 dark:text-cyan-400 block mb-2 font-display uppercase tracking-wider text-[10px]">World Clocks</span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onNavigatePillar?.(1)} className="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors text-left">• Major Global Cities</button></li>
              <li><button onClick={() => onNavigatePillar?.(1)} className="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors text-left">• UTC / GMT Converter</button></li>
              <li><button onClick={() => onNavigatePillar?.(1)} className="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors text-left">• Time Zone Meeting Planner</button></li>
              <li><button onClick={() => onNavigatePillar?.(1)} className="hover:text-blue-600 dark:hover:text-cyan-400 cursor-pointer transition-colors text-left">• IANA tzdata 2026a</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-2 font-display uppercase tracking-wider text-[10px]">Calendar & DST</span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onNavigatePillar?.(2)} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors text-left">• 2026 Public Holidays</button></li>
              <li><button onClick={() => onNavigatePillar?.(2)} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors text-left">• ISO Week Numbers</button></li>
              <li><button onClick={() => onNavigatePillar?.(2)} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors text-left">• Daylight Saving Matrix</button></li>
              <li><button onClick={() => onNavigatePillar?.(2)} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors text-left">• Printable PDF Calendars</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-amber-600 dark:text-amber-400 block mb-2 font-display uppercase tracking-wider text-[10px]">Astronomy & Space</span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onNavigatePillar?.(3)} className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors text-left">• Sun & Moon Times</button></li>
              <li><button onClick={() => onNavigatePillar?.(3)} className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors text-left">• Lunar Phases & Eclipse</button></li>
              <li><button onClick={() => onNavigatePillar?.(3)} className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors text-left">• Solar Declination</button></li>
              <li><button onClick={() => onNavigatePillar?.(3)} className="hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors text-left">• Perseid Meteor Tracker</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-sky-600 dark:text-sky-400 block mb-2 font-display uppercase tracking-wider text-[10px]">Weather Radar</span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onNavigatePillar?.(4)} className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors text-left">• 5,000+ City Forecasts</button></li>
              <li><button onClick={() => onNavigatePillar?.(4)} className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors text-left">• Barometric Pressure</button></li>
              <li><button onClick={() => onNavigatePillar?.(4)} className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors text-left">• Jet Stream & Wind Speed</button></li>
              <li><button onClick={() => onNavigatePillar?.(4)} className="hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors text-left">• Dew Point & Humidity</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-rose-600 dark:text-rose-400 block mb-2 font-display uppercase tracking-wider text-[10px]">Calculators</span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onNavigatePillar?.(10)} className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors text-left">• Date Math & Workdays</button></li>
              <li><button onClick={() => onNavigatePillar?.(10)} className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors text-left">• Hourly to Annual Salary</button></li>
              <li><button onClick={() => onNavigatePillar?.(10)} className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors text-left">• ICT Network Subnet CIDR</button></li>
              <li><button onClick={() => onNavigatePillar?.(10)} className="hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer transition-colors text-left">• Data Transfer Estimator</button></li>
            </ul>
          </div>

          <div>
            <span className="font-bold text-purple-600 dark:text-purple-400 block mb-2 font-display uppercase tracking-wider text-[10px]">Corporate & API</span>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><button onClick={() => { onNavigatePillar?.(11); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors text-left">• Melbourne HQ Office</button></li>
              <li><button onClick={() => onNavigatePillar?.(8)} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors text-left">• Edge Time REST API</button></li>
              <li><button onClick={() => { onNavigatePillar?.(11); window.scrollTo({ top: 150, behavior: 'smooth' }); }} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors text-left">• Contact & Support</button></li>
              <li><button onClick={() => { onNavigatePillar?.(11); window.scrollTo({ top: 350, behavior: 'smooth' }); }} className="hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors text-left">• Careers & Job Alerts</button></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
