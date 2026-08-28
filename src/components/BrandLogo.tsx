import React, { useEffect, useState } from 'react';

/** Logo variants for A/B in lab — default meridian tick */
export type LogoVariant = 'meridian' | 'monogram' | 'ring';

const STORAGE_KEY = 'tg_logo_variant';

export function getStoredLogoVariant(): LogoVariant {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'meridian' || v === 'monogram' || v === 'ring') return v;
  } catch {
    /* ignore */
  }
  return 'meridian';
}

export function setStoredLogoVariant(v: LogoVariant) {
  try {
    localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* ignore */
  }
}

/** Meridian tick — recommended default */
export const LogoMeridian: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <svg
    className={className}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="40" height="40" rx="10" className="fill-slate-800" />
    {/* day arc */}
    <path
      d="M8 26c4-10 20-10 24 0"
      stroke="url(#tg-arc)"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    {/* meridian stem (T) */}
    <path d="M20 10v20" stroke="#f1f5f9" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M13 16h14" stroke="#f1f5f9" strokeWidth="2.4" strokeLinecap="round" />
    {/* live now dot */}
    <circle cx="28" cy="12" r="2.6" fill="#22d3ee" />
    <defs>
      <linearGradient id="tg-arc" x1="8" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
  </svg>
);

/** TG interlocking monogram */
export const LogoMonogram: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <svg
    className={className}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="40" height="40" rx="10" className="fill-slate-800" />
    {/* T */}
    <path
      d="M11 12h18M20 12v18"
      stroke="#f1f5f9"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* G curve */}
    <path
      d="M29 15.5c0-2.8-2.4-5-5.5-5S18 12.7 18 15.5v9c0 2.8 2.4 5 5.5 5 2.2 0 4.1-1.1 5-2.8"
      stroke="#22d3ee"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M24 22h5.5" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

/** Open 24h ring with now gap */
export const LogoRing: React.FC<{ className?: string }> = ({ className = 'h-8 w-8' }) => (
  <svg
    className={className}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect width="40" height="40" rx="10" className="fill-slate-800" />
    <circle
      cx="20"
      cy="20"
      r="11"
      stroke="#64748b"
      strokeWidth="2"
      strokeDasharray="52 18"
      strokeLinecap="round"
      transform="rotate(-90 20 20)"
    />
    <circle
      cx="20"
      cy="20"
      r="11"
      stroke="url(#tg-ring)"
      strokeWidth="2.4"
      strokeDasharray="40 30"
      strokeLinecap="round"
      transform="rotate(-90 20 20)"
    />
    {/* hour hand suggestion */}
    <path d="M20 20v-7" stroke="#f1f5f9" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M20 20l5 3" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="20" r="2" fill="#f1f5f9" />
    <defs>
      <linearGradient id="tg-ring" x1="8" y1="8" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366f1" />
        <stop offset="1" stopColor="#22d3ee" />
      </linearGradient>
    </defs>
  </svg>
);

const map = {
  meridian: LogoMeridian,
  monogram: LogoMonogram,
  ring: LogoRing,
} as const;

export const BrandLogo: React.FC<{
  variant?: LogoVariant;
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
}> = ({
  variant: variantProp,
  className = 'h-8 w-8',
  showWordmark = true,
  wordmarkClassName = 'font-black tracking-tight text-white hidden xs:inline sm:inline',
}) => {
  const [variant, setVariant] = useState<LogoVariant>(variantProp ?? 'meridian');

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

  const Icon = map[variant] || LogoMeridian;

  return (
    <span className="inline-flex items-center gap-2">
      <Icon className={className} />
      {showWordmark && <span className={wordmarkClassName}>TimeGovern</span>}
    </span>
  );
};

/** Lab-only switcher — 3 options side by side */
export const LogoVariantSwitcher: React.FC = () => {
  const [v, setV] = useState<LogoVariant>('meridian');

  useEffect(() => {
    setV(getStoredLogoVariant());
  }, []);

  const pick = (next: LogoVariant) => {
    setStoredLogoVariant(next);
    setV(next);
    window.dispatchEvent(new Event('tg-logo-variant'));
  };

  const opts: { id: LogoVariant; label: string }[] = [
    { id: 'meridian', label: 'Meridian' },
    { id: 'monogram', label: 'TG' },
    { id: 'ring', label: '24h' },
  ];

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-slate-700/80 bg-slate-900/80 p-0.5"
      title="Logo preview (lab)"
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
              ? 'bg-indigo-500/30 text-indigo-200'
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
