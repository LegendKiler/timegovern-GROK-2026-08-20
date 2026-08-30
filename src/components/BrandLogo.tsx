import React, { useEffect, useState } from 'react';

/**
 * Live logo dial — hands from local PC time.
 * Second tip is clipped inside the face (cannot draw outside the circle).
 */

function useLocalClock(enabled: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!enabled) return;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const ms = reduce ? 1000 : 250;
    const id = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}

function handAngles(d: Date) {
  const s = d.getSeconds() + d.getMilliseconds() / 1000;
  const m = d.getMinutes() + s / 60;
  const h = (d.getHours() % 12) + m / 60;
  return { second: s * 6, minute: m * 6, hour: h * 30 };
}

export const LogoMarkLive: React.FC<{ className?: string; live?: boolean }> = ({
  className = 'h-14 w-14',
  live = true,
}) => {
  const now = useLocalClock(live);
  const { hour, minute, second } = handAngles(now);

  return (
    <svg
      className={className}
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`Local time ${now.toLocaleTimeString()}`}
    >
      <defs>
        <radialGradient id="tg-dial" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="55%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>
        <linearGradient id="tg-bezel" x1="8" y1="8" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67e8f9" />
          <stop offset="0.35" stopColor="#6366f1" />
          <stop offset="0.7" stopColor="#a855f7" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <clipPath id="tg-face-clip">
          <circle cx="36" cy="36" r="24" />
        </clipPath>
        <filter id="tg-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      <circle cx="36" cy="36" r="33" fill="url(#tg-bezel)" opacity="0.3" filter="url(#tg-soft)" />
      <circle cx="36" cy="36" r="31.5" stroke="url(#tg-bezel)" strokeWidth="2.5" fill="url(#tg-dial)" />
      <circle cx="36" cy="36" r="28.5" stroke="#334155" strokeWidth="1" fill="url(#tg-dial)" />
      <ellipse cx="30" cy="26" rx="14" ry="8" fill="#67e8f9" opacity="0.12" />

      {Array.from({ length: 12 }).map((_, i) => {
        const deg = i * 30;
        const rad = ((deg - 90) * Math.PI) / 180;
        const x1 = 36 + 22 * Math.cos(rad);
        const y1 = 36 + 22 * Math.sin(rad);
        const x2 = 36 + 26 * Math.cos(rad);
        const y2 = 36 + 26 * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 3 === 0 ? '#a5b4fc' : '#475569'}
            strokeWidth={i % 3 === 0 ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}

      {Array.from({ length: 12 }).map((_, i) => {
        const colors = ['#22d3ee', '#818cf8', '#c084fc', '#f472b6', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#a78bfa', '#e879f9', '#f9a8d4'];
        const deg = i * 30;
        const rad = ((deg - 90) * Math.PI) / 180;
        const cx = 36 + 17 * Math.cos(rad);
        const cy = 36 + 17 * Math.sin(rad);
        return (
          <rect
            key={i}
            x={cx - 1.8}
            y={cy - 4.2}
            width={3.6}
            height={8.4}
            rx={1.8}
            fill={colors[i]}
            transform={`rotate(${deg + 90} ${cx} ${cy})`}
            opacity={0.92}
          />
        );
      })}

      <g clipPath="url(#tg-face-clip)">
        <g transform={`rotate(${hour} 36 36)`}>
          <line x1="36" y1="36" x2="36" y2="24" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${minute} 36 36)`}>
          <line x1="36" y1="36" x2="36" y2="20" stroke="#7dd3fc" strokeWidth="2.1" strokeLinecap="round" />
        </g>
        <g transform={`rotate(${second} 36 36)`}>
          <line x1="36" y1="38.5" x2="36" y2="19" stroke="#f472b6" strokeWidth="1.15" strokeLinecap="round" />
          <circle cx="36" cy="19" r="1.3" fill="#f9a8d4" stroke="#9d174d" strokeWidth="0.3" />
        </g>
      </g>

      <circle cx="36" cy="36" r="3.8" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="1.4" />
      <circle cx="36" cy="36" r="1.5" fill="#f8fafc" />
    </svg>
  );
};

export type BrandLogoProps = {
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  live?: boolean;
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = 'h-12 w-12 sm:h-14 sm:w-14',
  showWordmark = true,
  wordmarkClassName,
  live = true,
}) => (
  <span className="inline-flex items-center gap-3 select-none">
    <LogoMarkLive className={className} live={live} />
    {showWordmark && (
      <span className={wordmarkClassName || 'flex flex-col justify-center leading-none'}>
        <span
          className="font-display text-[1.35rem] sm:text-[1.55rem] font-bold tracking-tight text-slate-800 dark:text-white"
          style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
        >
          Time
          <span className="text-indigo-600 dark:text-cyan-300">Govern</span>
        </span>
        <span
          className="mt-0.5 text-[10px] sm:text-[11px] font-semibold tracking-[0.18em] uppercase text-slate-500 dark:text-slate-400"
          style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}
        >
          Live local time
        </span>
      </span>
    )}
  </span>
);

export const LogoVariantSwitcher: React.FC = () => null;

export default BrandLogo;
