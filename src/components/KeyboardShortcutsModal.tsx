import React from 'react';
import { 
  X, Keyboard, Search, Moon, Sun, Layers, ShieldCheck, QrCode, 
  User, Database, Eye, Globe, Clock, Calendar, CloudRain, Timer, 
  Activity, Code, Newspaper, Calculator, Sparkles, ArrowRight, Check
} from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPillar: (pillarIndex: number) => void;
  onFocusSearch?: () => void;
  onToggleDarkMode?: () => void;
  onCycleTheme?: () => void;
  onOpenSecurityModal?: () => void;
  onOpenQrModal?: () => void;
  onOpenAccountModal?: () => void;
  onOpenArchModal?: () => void;
  onToggleAds?: () => void;
  isMac?: boolean;
  activePillar?: number;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  onSelectPillar,
  onFocusSearch,
  onToggleDarkMode,
  onCycleTheme,
  onOpenSecurityModal,
  onOpenQrModal,
  onOpenAccountModal,
  onOpenArchModal,
  onToggleAds,
  isMac = false,
  activePillar = 1,
}) => {
  if (!isOpen) return null;

  const pillarShortcuts = [
    { key: '1', name: 'World Clock & Regions', icon: <Clock className="w-4 h-4 text-cyan-400" />, pillar: 1 },
    { key: '2', name: 'Calendar & Holidays', icon: <Calendar className="w-4 h-4 text-indigo-400" />, pillar: 2 },
    { key: '3', name: 'Sun, Moon & Astronomy', icon: <Sun className="w-4 h-4 text-amber-400" />, pillar: 3 },
    { key: '4', name: 'Weather Forecasts', icon: <CloudRain className="w-4 h-4 text-sky-400" />, pillar: 4 },
    { key: '5', name: 'Timers & Stopwatch', icon: <Timer className="w-4 h-4 text-emerald-400" />, pillar: 5 },
    { key: '6', name: 'Live Tickers (Worldometers)', icon: <Activity className="w-4 h-4 text-rose-400" />, pillar: 6 },
    { key: '7', name: 'Embed Widgets', icon: <Code className="w-4 h-4 text-teal-400" />, pillar: 7 },
    { key: '8', name: 'API & Dev Portal', icon: <Layers className="w-4 h-4 text-purple-400" />, pillar: 8 },
    { key: '9', name: 'News & Articles', icon: <Newspaper className="w-4 h-4 text-cyan-400" />, pillar: 9 },
    { key: '0', name: 'Calculators & Converters', icon: <Calculator className="w-4 h-4 text-rose-400" />, pillar: 10 },
  ];

  const actionShortcuts = [
    {
      keys: isMac ? ['⌘', 'K'] : ['Ctrl', 'K'],
      altKey: '/',
      label: 'Focus Global Search & Timezone Picker',
      desc: 'Quickly query 150+ international capitals, offsets, and set primary time zone.',
      action: () => {
        onClose();
        onFocusSearch?.();
      },
      icon: <Search className="w-4 h-4 text-amber-400" />,
    },
    {
      keys: ['D'],
      label: 'Toggle Dark / Light Theme',
      desc: 'Instantly toggle between high-contrast Dark Mode and Swiss Light Mode.',
      action: () => {
        onToggleDarkMode?.();
      },
      icon: <Moon className="w-4 h-4 text-cyan-400" />,
    },
    {
      keys: ['T'],
      label: 'Cycle Layout Template Theme',
      desc: 'Rotate between Swiss Quartz, Stripe Corporate, Emerald Mint, and Editorial Classic.',
      action: () => {
        onCycleTheme?.();
      },
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
    },
    {
      keys: ['S'],
      label: 'Open SSL & Trust Center',
      desc: 'Inspect Cloudflare Edge TLS 1.3 certificate status and security validation.',
      action: () => {
        onClose();
        onOpenSecurityModal?.();
      },
      icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    },
    {
      keys: ['Q'],
      label: 'Mobile App & QR Code',
      desc: 'Show QR code to sync TimeGovern with mobile devices.',
      action: () => {
        onClose();
        onOpenQrModal?.();
      },
      icon: <QrCode className="w-4 h-4 text-blue-400" />,
    },
    {
      keys: ['A'],
      label: 'User Account & Cloud Sync',
      desc: 'Manage cloud favorites, supporter tier, and edge sync preferences.',
      action: () => {
        onClose();
        onOpenAccountModal?.();
      },
      icon: <User className="w-4 h-4 text-emerald-400" />,
    },
    {
      keys: ['M'],
      label: 'Cloudflare Architecture Specs',
      desc: 'View edge server latency, IANA tzdata 2026a, and Worker topology.',
      action: () => {
        onClose();
        onOpenArchModal?.();
      },
      icon: <Database className="w-4 h-4 text-indigo-400" />,
    },
    {
      keys: ['B'],
      label: 'Toggle Commercial Ad Slots',
      desc: 'Show or hide leaderboard and skyscraper advertising banner rails.',
      action: () => {
        onToggleAds?.();
      },
      icon: <Eye className="w-4 h-4 text-rose-400" />,
    },
    {
      keys: ['?'],
      label: 'Open Keyboard Shortcuts HUD',
      desc: 'Display this professional shortcut reference guide at any time.',
      action: () => {},
      icon: <Keyboard className="w-4 h-4 text-amber-400" />,
    },
    {
      keys: ['Esc'],
      label: 'Close Active Modal / Dropdown',
      desc: 'Dismiss search suggestions, configuration dialogs, or popups.',
      action: () => {
        onClose();
      },
      icon: <X className="w-4 h-4 text-slate-400" />,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
              <Keyboard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  POWER USER ACCELERATORS
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isMac ? 'macOS Config (⌘)' : 'Windows / Linux Config (Ctrl)'}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Global Keyboard Shortcuts
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs divide-y divide-slate-800/80">
          {/* Section 1: Instant Pillar Navigation (1-9 & 0) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Pillar Fast-Switching</span>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800">
                    Keys 1–9, 0
                  </span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Press any number key to switch immediately between TimeGovern temporal pillars from anywhere in the application.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {pillarShortcuts.map((item) => {
                const isActive = activePillar === item.pillar;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      onSelectPillar(item.pillar);
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-blue-600/25 border-cyan-500/60 text-white shadow-sm ring-1 ring-cyan-400/40'
                        : 'bg-slate-950/70 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                        {item.icon}
                      </div>
                      <span className="font-semibold truncate text-xs">{item.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isActive && (
                        <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                          Active
                        </span>
                      )}
                      <kbd className="px-2.5 py-1 bg-slate-800 text-amber-300 font-mono text-xs font-bold rounded-lg border border-slate-700 shadow-inner">
                        {item.key}
                      </kbd>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Global Search, Appearance & Modals */}
          <div className="space-y-3 pt-6">
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>Search, Theme & System Modals</span>
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Single-key triggers for rapid global searches, dark mode switching, and auxiliary diagnostic consoles.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {actionShortcuts.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={item.action}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:bg-slate-800/80 hover:border-slate-700 transition-all cursor-pointer flex items-start justify-between gap-3 text-left group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="p-1 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                        {item.icon}
                      </div>
                      <span className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors truncate">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 mt-0.5">
                    {item.keys.map((k, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-1 bg-slate-800 text-cyan-300 font-mono text-xs font-bold rounded-lg border border-slate-700 shadow-inner"
                      >
                        {k}
                      </kbd>
                    ))}
                    {item.altKey && (
                      <>
                        <span className="text-slate-500 font-mono text-[10px]">or</span>
                        <kbd className="px-2 py-1 bg-slate-800 text-cyan-300 font-mono text-xs font-bold rounded-lg border border-slate-700 shadow-inner">
                          {item.altKey}
                        </kbd>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Shortcuts are active across all views when not editing text inputs.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
