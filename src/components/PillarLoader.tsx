import React from 'react';
import { Loader2, Globe, Clock, Sparkles } from 'lucide-react';

interface PillarLoaderProps {
  title?: string;
  subtitle?: string;
  isDarkMode?: boolean;
}

export const PillarLoader: React.FC<PillarLoaderProps> = ({
  title = 'Synchronizing Temporal Engine',
  subtitle = 'Fetching atomic clock offsets, astronomical ephemeris & edge datasets...',
  isDarkMode = false,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`min-h-[480px] w-full flex flex-col items-center justify-center p-8 transition-colors duration-300 ${
        isDarkMode ? 'bg-[#080d1a] text-slate-200' : 'bg-slate-50 text-slate-800'
      }`}
    >
      <div
        className={`relative flex flex-col items-center text-center max-w-md w-full p-8 rounded-2xl border shadow-xl backdrop-blur-md ${
          isDarkMode
            ? 'bg-slate-900/80 border-slate-800 shadow-cyan-950/20'
            : 'bg-white/90 border-slate-200 shadow-slate-200/50'
        }`}
      >
        {/* Animated Rings Icon */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full border-2 border-cyan-500/20 animate-ping opacity-75" />
          <div className="absolute w-16 h-16 rounded-full border-2 border-dashed border-cyan-400 animate-spin" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 text-white">
            <Globe className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold tracking-tight mb-2 flex items-center gap-2">
          <span>{title}</span>
          <Sparkles className="w-4 h-4 text-cyan-400 animate-bounce" />
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-slate-400 font-mono mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Skeleton Progress Indicator */}
        <div className="w-full space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 font-semibold px-1">
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Streaming Chunk Module</span>
            </span>
            <span>Cloudflare Edge (D1)</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 rounded-full animate-[shimmer_1.5s_infinite] w-full" />
          </div>
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> IANA tzdata 2026a
            </span>
            <span>TLS 1.3 Strict</span>
          </div>
        </div>
      </div>
    </div>
  );
};
