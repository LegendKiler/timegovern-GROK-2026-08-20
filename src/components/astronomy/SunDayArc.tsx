/**
 * C — Graphic sun path for the current day (sunrise → noon → sunset).
 * Pure visual; uses existing sun times + elevation from liveAstronomy.
 */
import React, { useMemo } from 'react';

interface SunDayArcProps {
  now: Date;
  sunrise: Date | null;
  sunset: Date | null;
  solarElevation: number;
  className?: string;
}

export const SunDayArc: React.FC<SunDayArcProps> = ({
  now,
  sunrise,
  sunset,
  solarElevation,
  className = '',
}) => {
  const { progress, isUp } = useMemo(() => {
    const elev = solarElevation;
    const up = elev > -0.833;
    if (sunrise && sunset) {
      const t0 = sunrise.getTime();
      const t1 = sunset.getTime();
      if (t1 > t0) {
        const p = (now.getTime() - t0) / (t1 - t0);
        return { progress: Math.max(0, Math.min(1, p)), isUp: up };
      }
    }
    // Fallback from elevation roughly
    const p = Math.max(0, Math.min(1, (elev + 18) / 60));
    return { progress: p, isUp: up };
  }, [now, sunrise, sunset, solarElevation]);

  // Semicircle path in viewBox 0 0 200 100
  const W = 200;
  const H = 100;
  const cx = 100;
  const cy = 95;
  const R = 80;

  // progress 0 = left (sunrise), 1 = right (sunset); angle from π to 0
  const angle = Math.PI * (1 - progress);
  const sunX = cx + R * Math.cos(angle);
  const sunY = cy - R * Math.sin(angle);

  return (
    <div className={`relative ${className}`} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto max-h-[120px]">
        <defs>
          <linearGradient id="tg-sky-day" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="tg-sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde68a" stopOpacity="1" />
            <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky wash */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy} L ${cx + R} ${H} L ${cx - R} ${H} Z`}
          fill="url(#tg-sky-day)"
        />

        {/* Horizon line */}
        <line
          x1={cx - R - 8}
          y1={cy}
          x2={cx + R + 8}
          y2={cy}
          stroke="currentColor"
          className="text-slate-500"
          strokeWidth={1}
          strokeDasharray="4 3"
          opacity={0.5}
        />

        {/* Arc track */}
        <path
          d={`M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`}
          fill="none"
          stroke="currentColor"
          className="text-amber-500/40"
          strokeWidth={2}
        />

        {/* Progress arc (sunrise → now) */}
        {progress > 0.01 && (
          <path
            d={describeArc(cx, cy, R, 180, 180 - progress * 180)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.85}
          />
        )}

        {/* Sunrise / sunset ticks */}
        <circle cx={cx - R} cy={cy} r={3} className="fill-amber-400" />
        <circle cx={cx + R} cy={cy} r={3} className="fill-orange-500" />
        <circle cx={cx} cy={cy - R} r={2.5} className="fill-yellow-300" opacity={0.8} />

        {/* Sun marker */}
        <g transform={`translate(${sunX}, ${sunY})`}>
          <circle r={14} fill="url(#tg-sun-glow)" opacity={isUp ? 1 : 0.35} />
          <circle r={6} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5} opacity={isUp ? 1 : 0.4} />
        </g>

        {/* Labels */}
        <text x={cx - R} y={H - 2} textAnchor="middle" className="fill-slate-400" fontSize={8}>
          Rise
        </text>
        <text x={cx} y={18} textAnchor="middle" className="fill-amber-300/80" fontSize={8}>
          Noon
        </text>
        <text x={cx + R} y={H - 2} textAnchor="middle" className="fill-slate-400" fontSize={8}>
          Set
        </text>
      </svg>
    </div>
  );
};

/** Degrees: 0 = east, 180 = west along upper semicircle from left */
function describeArc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const toXY = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy - r * Math.sin(rad),
    };
  };
  const s = toXY(startDeg);
  const e = toXY(endDeg);
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  const sweep = endDeg < startDeg ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} ${sweep} ${e.x} ${e.y}`;
}

export default SunDayArc;
