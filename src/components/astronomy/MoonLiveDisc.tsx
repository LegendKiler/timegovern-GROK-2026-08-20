/** AS3 + C — live moon altitude + enhanced illuminated disc graphic */
import React from 'react';
import { Moon } from 'lucide-react';
import { approximateMoonPosition, azimuthToCompass } from '../../lib/liveAstronomy';

interface MoonLiveDiscProps {
  lat: number;
  lng: number;
  now: Date;
  cityName?: string;
}

export const MoonLiveDisc: React.FC<MoonLiveDiscProps> = ({ lat, lng, now, cityName }) => {
  const pos = approximateMoonPosition(lat, lng, now);
  const illum = Math.max(0, Math.min(100, pos.illumination)) / 100;
  const isWaxing =
    pos.phaseFraction < 0.5 ||
    pos.phaseName.includes('Waxing') ||
    pos.phaseName.includes('First');
  const aboveHorizon = pos.altitude > 0;

  return (
    <div className="rounded-2xl border border-indigo-400/30 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-4 sm:p-5 shadow-md overflow-hidden relative">
      {/* Star field */}
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="absolute top-4 left-6 w-1 h-1 rounded-full bg-white" />
        <div className="absolute top-10 right-10 w-0.5 h-0.5 rounded-full bg-white" />
        <div className="absolute bottom-16 left-12 w-0.5 h-0.5 rounded-full bg-indigo-200" />
        <div className="absolute top-16 left-1/3 w-1 h-1 rounded-full bg-white/80" />
        <div className="absolute bottom-10 right-16 w-0.5 h-0.5 rounded-full bg-white" />
      </div>

      <div className="relative flex items-center gap-2 text-sm font-bold text-indigo-200 mb-4">
        <Moon className="w-4 h-4" /> Live moon
        {cityName && <span className="text-[10px] font-normal text-slate-400">· {cityName}</span>}
        <span
          className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            aboveHorizon
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
          }`}
        >
          {aboveHorizon ? 'Above horizon' : 'Below horizon'}
        </span>
      </div>

      <div className="relative flex flex-col sm:flex-row items-center gap-6">
        {/* Enhanced disc */}
        <div className="relative w-36 h-36 shrink-0">
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-50"
            style={{
              background: aboveHorizon
                ? 'radial-gradient(circle, rgba(199,210,254,0.5) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
            }}
          />
          <div
            className="relative w-36 h-36 rounded-full overflow-hidden shadow-2xl"
            style={{
              boxShadow: 'inset 0 0 24px rgba(0,0,0,0.45), 0 0 30px rgba(99,102,241,0.25)',
            }}
            title={pos.phaseName}
          >
            {/* Lit lunar surface */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'radial-gradient(circle at 32% 28%, #f8fafc 0%, #e2e8f0 35%, #94a3b8 70%, #64748b 100%)',
              }}
            />
            {/* Subtle craters */}
            <div className="absolute top-[28%] left-[40%] w-3 h-3 rounded-full bg-slate-400/30" />
            <div className="absolute top-[48%] left-[55%] w-2 h-2 rounded-full bg-slate-500/25" />
            <div className="absolute top-[55%] left-[30%] w-4 h-4 rounded-full bg-slate-400/20" />

            {/* Phase shadow */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  illum > 0.95
                    ? 'transparent'
                    : illum < 0.05
                      ? 'rgba(15,23,42,0.94)'
                      : `linear-gradient(${isWaxing ? '90deg' : '270deg'}, rgba(15,23,42,0.94) 0%, rgba(15,23,42,0.94) ${50 - illum * 50}%, transparent ${50 - illum * 50 + 8}%)`,
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
          <p className="text-lg font-black text-white">{pos.phaseName}</p>
          <p className="text-sm text-indigo-200 font-mono">
            Illumination <span className="text-white font-bold">{(illum * 100).toFixed(0)}%</span>
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-slate-400 uppercase tracking-wide text-[9px] font-bold">Altitude</p>
              <p className="font-mono text-white text-sm">{pos.altitude.toFixed(1)}°</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-slate-400 uppercase tracking-wide text-[9px] font-bold">Azimuth</p>
              <p className="font-mono text-white text-sm">
                {pos.azimuth.toFixed(0)}° {azimuthToCompass(pos.azimuth)}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-1">
            Phase fraction {pos.phaseFraction.toFixed(3)} · updates with LIVE clock
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoonLiveDisc;
