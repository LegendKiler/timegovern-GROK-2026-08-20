import React from 'react';

/**
 * TimeGovern brand mark — Concept A2
 * Coloured meridian arc (timeanddate-inspired, original) +
 * outer micro-tick ring = seconds precision + dual hands.
 */
export const LogoMarkA2: React.FC<{ className?: string }> = ({
  className = 'h-10 w-10',
}) => (
  <svg
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <defs>
      <linearGradient id="tg-a2-arc" x1="8" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22d3ee" />
        <stop offset="0.35" stopColor="#38bdf8" />
        <stop offset="0.65" stopColor="#6366f1" />
        <stop offset="1" stopColor="#a855f7" />
      </linearGradient>
    </defs>

    {/* Outer seconds ring — fine ticks (unique vs plain clock logos) */}
    {Array.from({ length: 60 }).map((_, i) => {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
      const major = i % 5 === 0;
      const r0 = major ? 29.2 : 30.2;
      const r1 = 31.6;
      const x0 = 32 + r0 * Math.cos(a);
      const y0 = 32 + r0 * Math.sin(a);
      const x1 = 32 + r1 * Math.cos(a);
      const y1 = 32 + r1 * Math.sin(a);
      return (
        <line
          key={i}
          x1={x0}
          y1={y0}
          x2={x1}
          y2={y1}
          stroke={major ? '#67e8f9' : '#a5f3fc'}
          strokeWidth={major ? 1.1 : 0.55}
          strokeLinecap="round"
          opacity={major ? 0.9 : 0.45}
        />
      );
    })}

    {/* Meridian arc — 7 rounded bars (open semicircle) */}
    {(
      [
        { a: -110, c: '#22d3ee' },
        { a: -80, c: '#2dd4bf' },
        { a: -50, c: '#38bdf8' },
        { a: -20, c: '#60a5fa' },
        { a: 10, c: '#818cf8' },
        { a: 40, c: '#8b5cf6' },
        { a: 70, c: '#a855f7' },
      ] as const
    ).map((seg, i) => {
      const rad = (seg.a * Math.PI) / 180;
      const cx = 32 + 20 * Math.cos(rad);
      const cy = 32 + 20 * Math.sin(rad);
      return (
        <rect
          key={i}
          x={cx - 2.2}
          y={cy - 5.5}
          width={4.4}
          height={11}
          rx={2.2}
          fill={seg.c}
          transform={`rotate(${seg.a + 90} ${cx} ${cy})`}
        />
      );
    })}

    {/* Hands */}
    <line
      x1="32"
      y1="32"
      x2="32"
      y2="18"
      stroke="#1d4ed8"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="32"
      x2="42"
      y2="38"
      stroke="#2563eb"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Hub */}
    <circle cx="32" cy="32" r="3.2" fill="#1e3a8a" stroke="#67e8f9" strokeWidth="1.2" />
    <circle cx="32" cy="32" r="1.2" fill="#e0f2fe" />
  </svg>
);

export type BrandLogoProps = {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-11 w-11 sm:h-12 sm:w-12',
  showWordmark = true,
  wordmarkClassName = 'text-lg sm:text-xl font-extrabold tracking-tight text-slate-800 dark:text-white',
}) => (
  <span className="inline-flex items-center gap-2.5 select-none">
    <LogoMarkA2 className={className} />
    {showWordmark && (
      <span className={wordmarkClassName}>
        Time<span className="text-indigo-600 dark:text-cyan-300">Govern</span>
      </span>
    )}
  </span>
);

/** Kept so old Header imports do not break; A2 is the only live mark. */
export const LogoVariantSwitcher: React.FC = () => null;

export default BrandLogo;
