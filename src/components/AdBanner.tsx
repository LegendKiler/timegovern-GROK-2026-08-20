import React, { useState } from 'react';
import { ExternalLink, Info, EyeOff, Zap } from 'lucide-react';

interface AdBannerProps {
  type: 'leaderboard' | 'skyscraper-left' | 'skyscraper-right' | 'in-feed' | 'rectangle';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ type, className = '' }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  // Mock sponsored ad contents for realistic ad representation
  const adsData = {
    leaderboard: {
      sponsor: 'Cloudflare Enterprise',
      title: 'Accelerate Timegovern.com with Global Anycast CDN & Zero Trust DNS',
      cta: 'Deploy Cloudflare Free',
      bg: 'from-orange-950/40 via-slate-900 to-slate-950',
      border: 'border-orange-500/30',
      tag: 'Sponsored Ad 728x90',
    },
    'skyscraper-left': {
      sponsor: 'PostgreSQL Cloud Database',
      title: 'Scale Time Zone & Geospatial Data Globally with 99.999% Availability',
      cta: 'Start Free Trial',
      bg: 'from-indigo-950/50 to-slate-950',
      border: 'border-indigo-500/30',
      tag: 'AdSense Skyscraper 160x600',
    },
    'skyscraper-right': {
      sponsor: 'Global Calendar API',
      title: 'Sync Workday Schedules, Public Holidays & DST Rules in 150+ ISO Countries',
      cta: 'Get API Key',
      bg: 'from-emerald-950/50 to-slate-950',
      border: 'border-emerald-500/30',
      tag: 'AdSense Skyscraper 160x600',
    },
    'in-feed': {
      sponsor: 'World Time Sync Pro',
      title: 'Automate Team Meeting Scheduling Across Time Zones with Google Calendar Integration',
      cta: 'Try Workspace App',
      bg: 'from-blue-950/40 to-slate-900',
      border: 'border-blue-500/30',
      tag: 'Native In-Feed Unit',
    },
    rectangle: {
      sponsor: 'Flight & Weather Radar',
      title: 'Real-time Airport Delays, UTC Flight Timetables & Global Jet Stream Data',
      cta: 'View Live Radar',
      bg: 'from-cyan-950/40 to-slate-900',
      border: 'border-cyan-500/30',
      tag: 'Medium Rectangle 300x250',
    },
  };

  const ad = adsData[type];

  if (type === 'leaderboard') {
    return (
      <div className={`w-full max-w-7xl mx-auto my-3 ${className}`}>
        <div className={`bg-gradient-to-r ${ad.bg} border ${ad.border} rounded-xl p-3 shadow-md relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-3 text-xs`}>
          {/* Ad Label */}
          <div className="absolute top-1 left-2 text-[9px] uppercase tracking-wider font-mono text-slate-500 flex items-center gap-1">
            <span className="bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded text-[8px] font-bold">ADVERTISEMENT</span>
            <span>{ad.tag}</span>
          </div>

          <div className="pt-3 sm:pt-0 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/40 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs">{ad.sponsor}</span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 rounded">Ad</span>
              </div>
              <p className="text-slate-300 text-xs font-medium mt-0.5 line-clamp-1">
                {ad.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 cursor-pointer">
              <span>{ad.cta}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-300 p-1"
              title="Close Ad"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'skyscraper-left' || type === 'skyscraper-right') {
    return (
      <div className={`w-[160px] hidden xl:flex flex-col shrink-0 ${className}`}>
        <div className={`sticky top-20 bg-gradient-to-b ${ad.bg} border ${ad.border} rounded-xl p-3 h-[600px] flex flex-col justify-between text-xs shadow-lg`}>
          <div>
            <div className="text-[9px] uppercase tracking-wider font-mono text-slate-500 mb-2 flex items-center justify-between">
              <span className="bg-slate-800 text-slate-400 px-1 rounded text-[8px]">ADSENSE</span>
              <button onClick={() => setIsDismissed(true)} className="hover:text-slate-300">
                <EyeOff className="w-3 h-3" />
              </button>
            </div>

            <div className="my-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">{ad.sponsor}</span>
              <h4 className="font-bold text-white text-xs mt-2 leading-snug">{ad.title}</h4>
            </div>

            <p className="text-[11px] text-slate-400 text-center leading-relaxed mt-4">
              Monetization placement slot for Google AdSense / Mediavine 160x600 Vertical Banner.
            </p>
          </div>

          <div className="space-y-2">
            <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
              <span>{ad.cta}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-[8px] text-slate-600 text-center block font-mono">Ads by Google AdSense</span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'in-feed') {
    return (
      <div className={`my-4 bg-gradient-to-r ${ad.bg} border ${ad.border} rounded-xl p-4 shadow-sm relative ${className}`}>
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mb-2">
          <span className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-bold">SPONSORED NATIVE AD</span>
          <button onClick={() => setIsDismissed(true)} className="hover:text-slate-300">
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-blue-400 block">{ad.sponsor}</span>
            <p className="text-xs font-medium text-slate-200 mt-0.5">{ad.title}</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer">
            <span>{ad.cta}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs ${className}`}>
      <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">Advertisement</span>
      <p className="font-bold text-white">{ad.title}</p>
    </div>
  );
};
