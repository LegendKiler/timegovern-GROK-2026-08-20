/** AS3 — live moon altitude + illuminated disc graphic */
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
  // CSS disc: dark sphere + light crescent via box-shadow trick on phaseFraction
  // phaseFraction 0 = new, 0.5 = full
  const isWaxing = pos.phaseFraction < 0.5 || pos.phaseName.includes('Waxing') || pos.phaseName.includes('First');
  // Shadow offset: full moon = no shadow; new = fully shadowed
  const shadowShift = (0.5 - illum) * 40; // px-ish via %

  return (
    <div className="rounded-2xl border border-indigo-200/80 dark:border-indigo-800/40 bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-900 dark:to-indigo-950/50 p-4 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-bold text-indigo-800 dark:text-indigo-200 mb-3">
        <Moon className="w-4 h-4" /> Live moon
        {cityName && <span className="text-[10px] font-normal text-slate-500">· {cityName}</span>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Disc */}
        <div className="relative w-28 h-28 shrink-0">
          <div
            className="w-28 h-28 rounded-full bg-slate-200 dark:bg-slate-700 shadow-inner overflow-hidden relative"
            style={{
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.35)',
            }}
            title={pos.phaseName}
          >
            {/* Lit face */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 30%, #f8fafc 0%, #cbd5e1 55%, #94a3b8 100%)',
              }}
            />
            {/* Shadow hemisphere */}
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  illum > 0.95
                    ? 'transparent'
                    : illum < 0.05
                      ? 'rgba(15,23,42,0.92)'
                      : `linear-gradient(${isWaxing ? '90deg' : '270deg'}, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.92) ${50 - illum * 50}%, transparent ${50 + illum * 20}%)`,
              }}
            />
          </div>
          <p className="text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-300 mt-2">
            {pos.phaseName}
          </p>
        </div>

        {/* Readouts */}
        <div className="flex-1 grid grid-cols-2 gap-3 text-xs w-full">
          <div className="rounded-xl bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-[10px] uppercase text-slate-500 font-bold">Altitude</p>
            <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
              {pos.altitude.toFixed(1)}°
            </p>
            <p className="text-[10px] text-slate-500">
              {pos.altitude > 0 ? 'Above horizon' : 'Below horizon'}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 p-3">
            <p className="text-[10px] uppercase text-slate-500 font-bold">Azimuth</p>
            <p className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">
              {pos.azimuth.toFixed(0)}°
            </p>
            <p className="text-[10px] text-slate-500">{azimuthToCompass(pos.azimuth)}</p>
          </div>
          <div className="rounded-xl bg-white/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700 p-3 col-span-2">
            <p className="text-[10px] uppercase text-slate-500 font-bold">Illumination</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${pos.illumination}%` }}
                />
              </div>
              <span className="font-mono font-bold text-sm">{pos.illumination.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[10px] text-slate-400 mt-3">
        Position is an approximate LIVE model for the UI (phase-offset from solar ephemeris). Phase name &
        illumination use the site lunar engine.
      </p>
    </div>
  );
};
