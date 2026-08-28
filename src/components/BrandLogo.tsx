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
        {/* Hands cannot paint outside this radius */}
        <clipPath id="tg-face-clip">
          <circle cx="36" cy="36" r="24" />
        </clipPath>
        <filter id="tg-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6" />
        </filter>
      </defs>

      {/* Bezel + face */}
      <circle cx="36" cy="36" r="33" fill="url(#tg-bezel)" opacity="0.3" filter="url(#tg-soft)" />
      <circle cx="36" cy="36" r="31.5" stroke="url(#tg-bezel)" strokeWidth="2.5" fill="url(#tg-dial)" />
      <circle cx="36" cy="36" r="28.5" stroke="#334155" strokeWidth="1" fill="url(#tg-dial)" />
      <ellipse cx="30" cy="26" rx="14" ry="8" fill="#67e8f9" opacity="0.1" />

      {/* Seconds ticks — on the face ring */}
      {Array.from({ length: 60 }).map((_, i) => {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const major = i % 5 === 0;
        const r0 = major ? 25.5 : 26.5;
        const r1 = 27.6;
        return (
          <line
            key={i}
            x1={36 + r0 * Math.cos(a)}
            y1={36 + r0 * Math.sin(a)}
            x2={36 + r1 * Math.cos(a)}
            y2={36 + r1 * Math.sin(a)}
            stroke={major ? '#a5f3fc' : '#64748b'}
            strokeWidth={major ? 1.2 : 0.5}
            strokeLinecap="round"
            opacity={major ? 0.9 : 0.5}
          />
        );
      })}

      {/* Coloured arc — kept inside outer bezel */}
      {([-95, -65, -35, -5, 25, 55, 85] as const).map((deg, i) => {
        const colors = ['#22d3ee', '#2dd4bf', '#38bdf8', '#60a5fa', '#818cf8', '#a78bfa', '#c084fc'];
        const rad = (deg * Math.PI) / 180;
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

      {/* HANDS — clipped so tip/dot never leave the circle */}
      <g clipPath="url(#tg-face-clip)">
        {/* Hour: tip at y=24 → radius 12 */}
        <g transform={`rotate(${hour} 36 36)`}>
          <line x1="36" y1="36" x2="36" y2="24" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* Minute: tip at y=20 → radius 16 */}
        <g transform={`rotate(${minute} 36 36)`}>
          <line x1="36" y1="36" x2="36" y2="20" stroke="#7dd3fc" strokeWidth="2.1" strokeLinecap="round" />
        </g>

        {/* Second: tip at y=19 → radius 17, dot r=1.3 → still < 24 clip */}
        <g transform={`rotate(${second} 36 36)`}>
          <line
            x1="36"
            y1="38.5"
            x2="36"
            y2="19"
            stroke="#f472b6"
            strokeWidth="1.15"
            strokeLinecap="round"
          />
          <circle cx="36" cy="19" r="1.3" fill="#f9a8d4" stroke="#9d174d" strokeWidth="0.3" />
        </g>
      </g>

      {/* Hub on top */}
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
          className="font-display text-[1.2rem] sm:text-[1.4rem] font-bold tracking-tight text-slate-800 dark:text-white"
          style={{ fontFamily: '"Space Grotesk", Inter, system-ui, sans-serif' }}
        >
          Time
          <span className="text-indigo-600 dark:text-cyan-300">Govern</span>
        </span>
        <span
          className="mt-0.5 text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-500 dark:text-slate-400"
          style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
          Live local time
        </span>
      </span>
    )}
  </span>
);

export const LogoVariantSwitcher: React.FC = () => null;

export default BrandLogo;
