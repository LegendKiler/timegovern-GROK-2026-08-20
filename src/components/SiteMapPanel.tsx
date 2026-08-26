import React from 'react';
import {
  Building2, Mail, MessageSquare, Briefcase, Globe, Mic2, Shield, Scale, Megaphone,
  Clock, Calendar, Sun, Cloud, Timer, LayoutGrid, Newspaper, Calculator, FileText,
  BookOpen, Lock, ArrowRight, Radio,
} from 'lucide-react';

type HubTab = 'about' | 'contact' | 'newsletter' | 'podcast' | 'legal' | 'trust' | 'feedback' | 'sitemap' | 'careers';
type LegalSection = 'privacy' | 'terms' | 'ads' | 'cookies' | 'disclaimer' | 'linkpolicy';

type Props = {
  onNavigatePillar?: (pillar: number) => void;
  onOpenTab: (tab: HubTab) => void;
  onOpenLegal: (section: LegalSection) => void;
};

/**
 * Graphic HTML-style site map for visitors (card grid by section).
 * Not an internal UX flowchart — clickable discovery of TimeGovern areas.
 */
export const SiteMapPanel: React.FC<Props> = ({ onNavigatePillar, onOpenTab, onOpenLegal }) => {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-5 space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" /> Site map
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Explore every major area of TimeGovern — tools first, then company and legal. Click a card to open that section.
          </p>
        </div>
        <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">timegovern.com</p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-gradient-to-r from-cyan-500/40 to-transparent" />
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-300 shrink-0">Tools</h4>
          <span className="h-px flex-1 bg-gradient-to-l from-cyan-500/40 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {([
            { label: 'World Clock', blurb: 'Live cities, offsets & meeting planner', p: 1, Icon: Clock, accent: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-300' },
            { label: 'Calendar', blurb: 'Months, week numbers & PDF schedules', p: 2, Icon: Calendar, accent: 'from-violet-500/20 to-purple-600/10 border-violet-500/30 text-violet-300' },
            { label: 'Sun & Moon', blurb: 'Sunrise, sunset, twilight & phases', p: 3, Icon: Sun, accent: 'from-amber-500/20 to-orange-600/10 border-amber-500/30 text-amber-300' },
            { label: 'Weather', blurb: 'Local conditions with time context', p: 4, Icon: Cloud, accent: 'from-sky-500/20 to-slate-600/10 border-sky-500/30 text-sky-300' },
            { label: 'Timers', blurb: 'Alarms, stopwatch & countdown', p: 5, Icon: Timer, accent: 'from-emerald-500/20 to-teal-600/10 border-emerald-500/30 text-emerald-300' },
            { label: 'Widgets', blurb: 'Embeddable clocks & calendars', p: 7, Icon: LayoutGrid, accent: 'from-fuchsia-500/20 to-pink-600/10 border-fuchsia-500/30 text-fuchsia-300' },
            { label: 'News', blurb: 'Live headlines near your clocks', p: 9, Icon: Newspaper, accent: 'from-rose-500/20 to-red-600/10 border-rose-500/30 text-rose-300' },
            { label: 'Calculators', blurb: 'Workdays, pay helpers & more', p: 10, Icon: Calculator, accent: 'from-lime-500/20 to-green-600/10 border-lime-500/30 text-lime-300' },
          ] as const).map(({ label, blurb, p, Icon, accent }) => (
            <button
              key={label}
              type="button"
              onClick={() => onNavigatePillar?.(p)}
              className={`group text-left rounded-2xl border bg-gradient-to-br p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-950/40 ${accent}`}
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-slate-950/60 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-white text-sm">{label}</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5 leading-snug">{blurb}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 ml-auto mt-1 shrink-0 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-gradient-to-r from-slate-500/40 to-transparent" />
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-slate-300 shrink-0">Company</h4>
          <span className="h-px flex-1 bg-gradient-to-l from-slate-500/40 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {([
            { label: 'About us', blurb: 'Mission, Melbourne HQ & values', tab: 'about' as HubTab, Icon: Building2 },
            { label: 'Contact', blurb: 'Message form, email & WhatsApp', tab: 'contact' as HubTab, Icon: Mail },
            { label: 'Careers', blurb: 'Roles and internships', tab: 'careers' as HubTab, Icon: Briefcase },
            { label: 'Newsletters', blurb: 'Weekly, monthly & yearly opt-in', tab: 'newsletter' as HubTab, Icon: Radio },
            { label: 'Podcast', blurb: 'Time, zones & sky briefings', tab: 'podcast' as HubTab, Icon: Mic2 },
            { label: 'Feedback', blurb: 'Public wall & moderation', tab: 'feedback' as HubTab, Icon: MessageSquare },
          ]).map(({ label, blurb, tab, Icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => onOpenTab(tab)}
              className="group text-left rounded-2xl border border-slate-600 bg-slate-900/80 p-3.5 transition-all hover:border-cyan-500/40 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center shrink-0 text-cyan-300">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-white text-sm">{label}</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">{blurb}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-300 ml-auto mt-1 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="h-px flex-1 bg-gradient-to-r from-emerald-500/30 to-transparent" />
          <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300/90 shrink-0">Trust &amp; legal</h4>
          <span className="h-px flex-1 bg-gradient-to-l from-emerald-500/30 to-transparent" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {([
            { label: 'Trust Centre', blurb: 'Security posture & contacts', kind: 'tab' as const, tab: 'trust' as HubTab, Icon: Shield },
            { label: 'Privacy Policy', blurb: 'How we handle personal data', kind: 'legal' as const, section: 'privacy' as LegalSection, Icon: Lock },
            { label: 'Terms & Conditions', blurb: 'Rules for using the site', kind: 'legal' as const, section: 'terms' as LegalSection, Icon: FileText },
            { label: 'Disclaimer', blurb: 'Limits on reliance on data', kind: 'legal' as const, section: 'disclaimer' as LegalSection, Icon: BookOpen },
            { label: 'Link policy', blurb: 'Linking to and from TimeGovern', kind: 'legal' as const, section: 'linkpolicy' as LegalSection, Icon: Globe },
            { label: 'Advertising', blurb: 'Ad standards on the site', kind: 'legal' as const, section: 'ads' as LegalSection, Icon: Megaphone },
          ]).map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                if (item.kind === 'tab') onOpenTab(item.tab);
                else onOpenLegal(item.section);
              }}
              className="group text-left rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-3.5 transition-all hover:border-emerald-400/40 hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-slate-950 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-300">
                  <item.Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-white text-sm">{item.label}</span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">{item.blurb}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-300 ml-auto mt-1 shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SiteMapPanel;
