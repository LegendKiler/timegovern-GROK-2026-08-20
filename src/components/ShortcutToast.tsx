import React from 'react';
import { ShortcutFeedback } from '../hooks/useGlobalShortcuts';
import { Zap, Command } from 'lucide-react';

interface ShortcutToastProps {
  feedback: ShortcutFeedback | null;
}

export const ShortcutToast: React.FC<ShortcutToastProps> = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-150">
      <div className="bg-slate-950/95 border border-cyan-500/40 text-white px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-3 ring-1 ring-cyan-500/20">
        <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700 text-amber-400 font-mono text-xs font-black shadow-inner">
          <span>{feedback.key}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-semibold text-slate-200">{feedback.label}</span>
        </div>
      </div>
    </div>
  );
};
