import React, { useEffect, useState } from 'react';

/** Graphic logo variants for lab preview */
export type LogoVariant = 'orbital' | 'chronosphere' | 'aurora';

const STORAGE_KEY = 'tg_logo_variant';

export function getStoredLogoVariant(): LogoVariant {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'orbital' || v === 'chronosphere' || v === 'aurora') return v;
    // migrate old keys
    if (v === 'meridian' || v === 'monogram' || v === 'ring') return 'orbital';
  } catch {
    /* ignore */
  }
  return 'orbital';
}

export function setStoredLogoVariant(v: LogoVariant) {
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
}

/** Graphic 1 — Orbital globe + time ring + glow */
export const LogoOrbital: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <radialGradient id="orb-glow" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.55" />
        <stop offset="55%" stopColor="#4f46e5" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="orb-sphere" x1="12" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818cf8" />
        <stop offset="0.45" stopColor="#312e81" />
        <stop offset="1" stopColor="#0ea5e9" />
      </linearGradient>
      <linearGradient id="orb-ring" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22d3ee" />
        <stop offset="0.5" stopColor="#a78bfa" />
        <stop offset="1" stopColor="#f472b6" />
      </linearGradient>
      <filter id="orb-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.2" />
      </filter>
    </defs>
    {/* soft outer glow */}
    <circle cx="24" cy="24" r="22" fill="url(#orb-glow)" />
    {/* tilted orbital ring */}
    <ellipse
      cx="24"
      cy="24"
      rx="20"
      ry="9"
      stroke="url(#orb-ring)"
      strokeWidth="2.2"
      fill="none"
      transform="rotate(-28 24 24)"
      opacity="0.95"
    />
    {/* sphere */}
    <circle cx="24" cy="24" r="13" fill="url(#orb-sphere)" />
    {/* latitude / meridian lines */}
    <ellipse cx="24" cy="24" rx="13" ry="5" stroke="#e0f2fe" strokeWidth="0.9" opacity="0.45" fill="none" />
    <path d="M24 11c3.5 4 3.5 18 0 26M24 11c-3.5 4-3.5 18 0 26" stroke="#e0f2fe" strokeWidth="0.85" opacity="0.4" />
    <path d="M11 24h26" stroke="#e0f2fe" strokeWidth="0.8" opacity="0.35" />
    {/* highlight */}
    <ellipse cx="19" cy="18" rx="4.5" ry="3" fill="#fff" opacity="0.28" filter="url(#orb-blur)" />
    {/* satellite “now” bead on ring */}
    <circle cx="40" cy="16" r="3.2" fill="#22d3ee" stroke="#ecfeff" strokeWidth="1.2" />
    <circle cx="40" cy="16" r="1.2" fill="#0f172a" />
  </svg>
);

/** Graphic 2 — Chronosphere: deep glass clock disc */
export const LogoChronosphere: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="chr-bg" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e1b4b" />
        <stop offset="1" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="chr-rim" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#67e8f9" />
        <stop offset="0.4" stopColor="#818cf8" />
        <stop offset="1" stopColor="#c084fc" />
      </linearGradient>
      <radialGradient id="chr-face" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#312e81" />
        <stop offset="100%" stopColor="#020617" />
      </radialGradient>
    </defs>
    <rect width="48" height="48" rx="14" fill="url(#chr-bg)" />
    {/* outer bevel ring */}
    <circle cx="24" cy="24" r="18" stroke="url(#chr-rim)" strokeWidth="3" fill="url(#chr-face)" />
    {/* hour ticks */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
      const r1 = 14.2;
      const r2 = deg % 90 === 0 ? 11.2 : 12.5;
      const a = ((deg - 90) * Math.PI) / 180;
      const x1 = 24 + r1 * Math.cos(a);
      const y1 = 24 + r1 * Math.sin(a);
      const x2 = 24 + r2 * Math.cos(a);
      const y2 = 24 + r2 * Math.sin(a);
      return (
        <line
          key={deg}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={deg % 90 === 0 ? '#22d3ee' : '#94a3b8'}
          strokeWidth={deg % 90 === 0 ? 1.8 : 1.1}
          strokeLinecap="round"
        />
      );
    })}
    {/* hands — fixed graphic 10:10 style */}
    <path d="M24 24 L24 13" stroke="#f8fafc" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M24 24 L32 18" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="24" cy="24" r="2.4" fill="#f8fafc" />
    <circle cx="24" cy="24" r="1.1" fill="#6366f1" />
    {/* sparkles */}
    <circle cx="38" cy="12" r="1.4" fill="#a5f3fc" />
    <circle cx="10" cy="36" r="1.1" fill="#c4b5fd" opacity="0.9" />
  </svg>
);

/** Graphic 3 — Aurora: bold sun–moon eclipse mark */
export const LogoAurora: React.FC<{ className?: string }> = ({ className = 'h-9 w-9' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="au-sky" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#0c4a6e" />
        <stop offset="0.55" stopColor="#1e1b4b" />
        <stop offset="1" stopColor="#4c1d95" />
      </linearGradient>
      <linearGradient id="au-sun" x1="14" y1="12" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde68a" />
        <stop offset="0.5" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#ea580c" />
      </linearGradient>
      <linearGradient id="au-moon" x1="22" y1="14" x2="38" y2="36" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e2e8f0" />
        <stop offset="1" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="au-band" x1="6" y1="38" x2="42" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22d3ee" stopOpacity="0" />
        <stop offset="0.35" stopColor="#22d3ee" />
        <stop offset="0.65" stopColor="#a78bfa" />
        <stop offset="1" stopColor="#f472b6" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect width="48" height="48" rx="14" fill="url(#au-sky)" />
    {/* stars */}
    <circle cx="10" cy="11" r="1.2" fill="#e0f2fe" />
    <circle cx="40" cy="14" r="1" fill="#c4b5fd" />
    <circle cx="36" cy="8" r="0.8" fill="#fef9c3" />
    <circle cx="8" cy="28" r="0.9" fill="#a5f3fc" />
    {/* sun disc */}
    <circle cx="22" cy="23" r="11" fill="url(#au-sun)" />
    {/* moon eclipse cut */}
    <circle cx="28" cy="21" r="9.5" fill="url(#au-moon)" />
    <circle cx="31" cy="19" r="8.2" fill="url(#au-sky)" />
    {/* horizon aurora band */}
    <path
      d="M6 36c6-6 12-4 18-2s12 2 18-2"
      stroke="url(#au-band)"
      strokeWidth="3"
      strokeLinecap="round"
      fill="none"
    />
    {/* tiny live pip */}
    <circle cx="39" cy="33" r="2.2" fill="#22d3ee" stroke="#ecfeff" strokeWidth="1" />
  </svg>
);

const map = {
  orbital: LogoOrbital,
  chronosphere: LogoChronosphere,
  aurora: LogoAurora,
} as const;

export const BrandLogo: React.FC<{
  variant?: LogoVariant;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}> = ({
  variant: variantProp,
  className = 'h-9 w-9',
  showWordmark = true,
  wordmarkClassName = 'font-black tracking-tight text-white hidden xs:inline sm:inline',
}) => {
  const [variant, setVariant] = useState<LogoVariant>(variantProp ?? 'orbital');

  useEffect(() => {
    if (variantProp) {
      setVariant(variantProp);
      return;
    }
    setVariant(getStoredLogoVariant());
    const onStorage = () => setVariant(getStoredLogoVariant());
    window.addEventListener('storage', onStorage);
    window.addEventListener('tg-logo-variant', onStorage as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('tg-logo-variant', onStorage as EventListener);
    };
  }, [variantProp]);

  const Icon = map[variant] || LogoOrbital;

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="relative inline-flex shrink-0 rounded-2xl shadow-lg shadow-cyan-500/20 ring-1 ring-white/10">
        <Icon className={className} />
      </span>
      {showWordmark && <span className={wordmarkClassName}>TimeGovern</span>}
    </span>
  );
};

export const LogoVariantSwitcher: React.FC = () => {
  const [v, setV] = useState<LogoVariant>('orbital');

  useEffect(() => {
    setV(getStoredLogoVariant());
  }, []);

  const pick = (next: LogoVariant) => {
    setStoredLogoVariant(next);
    setV(next);
    window.dispatchEvent(new Event('tg-logo-variant'));
  };

  const opts: { id: LogoVariant; label: string }[] = [
    { id: 'orbital', label: 'Orbital' },
    { id: 'chronosphere', label: 'Chrono' },
    { id: 'aurora', label: 'Aurora' },
  ];

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-slate-700/80 bg-slate-900/80 p-0.5"
      title="Graphic logo preview (lab)"
      role="group"
      aria-label="Logo style"
    >
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => pick(o.id)}
          className={`px-1.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
            v === o.id
              ? 'bg-cyan-500/25 text-cyan-200'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
};

export default BrandLogo;
