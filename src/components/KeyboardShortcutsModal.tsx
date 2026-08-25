import React from 'react';
import { Keyboard, X } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

/**
 * Keyboard shortcuts help — product-facing copy (no hosting vendor names).
 */
const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: '?', desc: 'Open this keyboard shortcuts panel.' },
  { keys: '1–9', desc: 'Jump to main pillars (World Clock, Calendar, Sun & Moon, and more).' },
  { keys: 'T', desc: 'Toggle light / dark appearance where available.' },
  { keys: 'S', desc: 'Open the Security & Trust Centre (connection and privacy summary).' },
  { keys: 'Esc', desc: 'Close the active modal or panel.' },
];

const PANELS: { label: string; desc: string }[] = [
  { label: 'Security & Trust', desc: 'Connection check, HTTPS explanation, privacy contacts.' },
  { label: 'Platform architecture', desc: 'How TimeGovern builds and updates time data pipelines.' },
  { label: 'Account / Supporter', desc: 'Free account and paid benefits when those panels are open.' },
];

export const KeyboardShortcutsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-sm font-bold flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-cyan-400" /> Keyboard shortcuts
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4 text-xs">
          <ul className="space-y-2">
            {SHORTCUTS.map((s) => (
              <li key={s.keys} className="flex gap-3">
                <kbd className="shrink-0 px-2 py-0.5 rounded bg-slate-800 border border-slate-600 font-mono text-[10px] text-cyan-300">
                  {s.keys}
                </kbd>
                <span className="text-slate-300">{s.desc}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-800 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-2">Related panels</p>
            <ul className="space-y-1.5 text-slate-400">
              {PANELS.map((p) => (
                <li key={p.label}>
                  <strong className="text-slate-200">{p.label}</strong> — {p.desc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
