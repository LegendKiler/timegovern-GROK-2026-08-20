import React from 'react';
import { X, Check, Palette, Sparkles, Monitor, ShieldCheck, LayoutGrid } from 'lucide-react';

export type TemplateTheme = 'swiss-quartz' | 'bloomberg-dark' | 'emerald-precision' | 'editorial-classic';

interface TemplateOption {
  id: TemplateTheme;
  title: string;
  subtitle: string;
  tag: string;
  fontFamily: string;
  colors: {
    bg: string;
    cardBg: string;
    text: string;
    accent: string;
    border: string;
  };
  features: string[];
  description: string;
  badge: string;
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'swiss-quartz',
    title: 'Swiss Quartz Clean',
    subtitle: 'Standard Modern Utility (TimeAndDate Classic)',
    tag: 'DEFAULT',
    fontFamily: 'Inter / Plus Jakarta Sans (Clean Modern Sans)',
    colors: {
      bg: '#eef2f7',
      cardBg: '#ffffff',
      text: '#1e293b',
      accent: '#2563eb',
      border: '#cbd5e1'
    },
    features: [
      'High contrast, bright slate background for maximum daytime clarity',
      'Structured 11-pillar navigation tabs with distinct blue active indicators',
      'Spacious grid layout optimized for multi-city clock comparisons',
      'Responsive, clean corporate styling suitable for all audience types'
    ],
    description: 'The premier choice for daily world clocks, timezone meeting planning, and daylight saving research.',
    badge: 'Most Popular'
  },
  {
    id: 'bloomberg-dark',
    title: 'Bloomberg Terminal Dark',
    subtitle: 'High-Density Financial & Data Trading Canvas',
    tag: 'FINANCIAL',
    fontFamily: 'JetBrains Mono / Fira Code (Monospace)',
    colors: {
      bg: '#040812',
      cardBg: '#091122',
      text: '#cff4fc',
      accent: '#06b6d4',
      border: '#1e293b'
    },
    features: [
      'Deep obsidian canvas with glowing cyan & amber status indicators',
      'Strict monospace typography for aligned UTC timestamp tables',
      'Real-time market tickers, UTC leap-second counters, and latency logs',
      'High-contrast night mode designed for ICT network engineers & traders'
    ],
    description: 'Engineered for financial analysts, global trade operators, and server infrastructure monitors.',
    badge: 'Pro Trader'
  },
  {
    id: 'emerald-precision',
    title: 'Emerald Observatory',
    subtitle: 'Astronomical, Lunar & Scientific Observatory Theme',
    tag: 'SCIENTIFIC',
    fontFamily: 'Plus Jakarta Sans (Scientific Precision)',
    colors: {
      bg: '#030c0a',
      cardBg: '#071815',
      text: '#d1fae5',
      accent: '#10b981',
      border: '#064e3b'
    },
    features: [
      'Night-sky deep emerald background with glowing mint green highlights',
      'Specialized visual cards for Solar declination, Perseid meteor showers & eclipse paths',
      'Dark room eye-safe contrast for stargazers and telescope operators',
      'Clean vector gauges for UV index, moon phase calculations, and tides'
    ],
    description: 'Designed for astronomy enthusiasts, eclipse chasers, and space weather researchers.',
    badge: 'Observatory Grade'
  },
  {
    id: 'editorial-classic',
    title: 'Editorial Newspaper',
    subtitle: 'Broadsheet Journal & Global News Publication',
    tag: 'BROADSHEET',
    fontFamily: 'Playfair Display / Serif Elegance',
    colors: {
      bg: '#fcfaf7',
      cardBg: '#ffffff',
      text: '#0f172a',
      accent: '#d97706',
      border: '#e2e8f0'
    },
    features: [
      'Warm parchment background inspired by classic international broadsheets',
      'Serif typography for rich article reading, DST history & time zone trivia',
      'High-density column dividers resembling traditional news layouts',
      'Elegant amber and dark ink contrast for effortless long-form reading'
    ],
    description: 'Ideal for reading time zone policy updates, daylight saving news, and historical archives.',
    badge: 'Classic News'
  }
];

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: TemplateTheme;
  onSelectTheme: (theme: TemplateTheme) => void;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl my-8 relative">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Choose Website Layout & Design Template
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Select Your Preferred Template Theme
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Switch the layout design and typography instantly across all 11 TimeGovern website sections with 1-click.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {TEMPLATE_OPTIONS.map((tpl) => {
            const isSelected = currentTheme === tpl.id;

            return (
              <div
                key={tpl.id}
                onClick={() => onSelectTheme(tpl.id)}
                className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-400 bg-slate-800/90 shadow-xl shadow-cyan-500/10 ring-2 ring-cyan-400/30'
                    : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  {/* Top Bar inside card */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-slate-800 text-slate-300 border border-slate-700">
                      {tpl.badge}
                    </span>

                    {isSelected ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-full border border-cyan-500/40">
                        <Check className="w-3.5 h-3.5" /> Active Template
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                        Click to preview
                      </span>
                    )}
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-extrabold text-white font-display mb-0.5">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-cyan-300/80 mb-3 font-mono">
                    {tpl.subtitle}
                  </p>

                  {/* Visual Color Preview Bar */}
                  <div className="p-3 rounded-xl border mb-4" style={{ backgroundColor: tpl.colors.bg, borderColor: tpl.colors.border }}>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-2" style={{ color: tpl.colors.text }}>
                      <span>Preview Header Bar</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold text-white" style={{ backgroundColor: tpl.colors.accent }}>
                        {tpl.tag}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg border shadow-sm" style={{ backgroundColor: tpl.colors.cardBg, borderColor: tpl.colors.border }}>
                      <div className="text-[11px] font-semibold mb-1" style={{ color: tpl.colors.text }}>
                        12:45:00 UTC • Melbourne Australia
                      </div>
                      <div className="text-[10px]" style={{ color: tpl.colors.accent }}>
                        Font: {tpl.fontFamily}
                      </div>
                    </div>
                  </div>

                  {/* Features Bullet List */}
                  <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                    {tpl.description}
                  </p>

                  <ul className="space-y-1.5 mb-4">
                    {tpl.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-400">
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Apply Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTheme(tpl.id);
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-4 h-4" /> Currently Applied
                    </>
                  ) : (
                    <>
                      <Palette className="w-4 h-4 text-cyan-400" /> Apply This Template
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-800 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Templates are applied instantly without losing your selected cities, search queries, or calculations.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
