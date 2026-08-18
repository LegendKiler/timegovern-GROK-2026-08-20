import React from 'react';
import { Sun, Moon, Compass, Globe, Sunrise, Sunset } from 'lucide-react';

export const AstronomyPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102a43] font-display flex items-center gap-2">
            <Sun className="w-6 h-6 text-amber-500" />
            <span>Sun, Moon & Celestial Ephemeris</span>
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Astronomical calculations for sunrise, sunset, solar noon, dawn/dusk twilight, and lunar phases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sun Calculator Card */}
        <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f4f8] pb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-[#102a43]">Solar Ephemeris</h3>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-[#fffbeb] border border-amber-200 rounded-lg p-3 text-center">
              <Sunrise className="w-5 h-5 text-amber-600 mx-auto mb-1" />
              <div className="text-[10px] text-amber-800 font-sans font-bold">SUNRISE</div>
              <div className="text-lg font-black text-amber-950">05:48 AM</div>
            </div>
            <div className="bg-[#fff7ed] border border-orange-200 rounded-lg p-3 text-center">
              <Sunset className="w-5 h-5 text-orange-600 mx-auto mb-1" />
              <div className="text-[10px] text-orange-800 font-sans font-bold">SUNSET</div>
              <div className="text-lg font-black text-orange-950">08:14 PM</div>
            </div>
          </div>

          <div className="text-xs text-[#627d98] space-y-1.5 pt-2">
            <div className="flex justify-between">
              <span>Day Length:</span>
              <span className="font-mono font-bold text-[#102a43]">14h 26m 12s</span>
            </div>
            <div className="flex justify-between">
              <span>Solar Noon:</span>
              <span className="font-mono font-bold text-[#102a43]">01:01 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Civil Twilight:</span>
              <span className="font-mono font-bold text-[#102a43]">05:14 AM – 08:48 PM</span>
            </div>
          </div>
        </div>

        {/* Moon Calculator Card */}
        <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f4f8] pb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-[#102a43]">Lunar Ephemeris</h3>
          </div>

          <div className="bg-[#f0f4f8] border border-[#d9e2ec] rounded-lg p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-slate-300 mx-auto mb-2 flex items-center justify-center text-white shadow-inner">
              <Moon className="w-8 h-8 text-amber-200" />
            </div>
            <div className="font-display font-bold text-base text-[#0f2942]">Waxing Crescent</div>
            <div className="text-xs font-mono text-[#0056b3] font-semibold mt-0.5">18.4% Illumination</div>
          </div>

          <div className="text-xs text-[#627d98] space-y-1.5 pt-2">
            <div className="flex justify-between">
              <span>Moonrise:</span>
              <span className="font-mono font-bold text-[#102a43]">09:12 AM</span>
            </div>
            <div className="flex justify-between">
              <span>Moonset:</span>
              <span className="font-mono font-bold text-[#102a43]">10:35 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Next Full Moon:</span>
              <span className="font-mono font-bold text-[#102a43]">Aug 28, 2026</span>
            </div>
          </div>
        </div>

        {/* Eclipses Card */}
        <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f4f8] pb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-[#102a43]">Eclipse Ephemeris</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#f8fafc] border border-slate-200 rounded-lg">
              <div className="font-bold text-[#0f2942]">Total Solar Eclipse</div>
              <div className="text-[11px] text-[#627d98]">Aug 12, 2026 — Greenland, Iceland, Spain</div>
            </div>
            <div className="p-3 bg-[#f8fafc] border border-slate-200 rounded-lg">
              <div className="font-bold text-[#0f2942]">Annular Solar Eclipse</div>
              <div className="text-[11px] text-[#627d98]">Feb 17, 2026 — Antarctica, South Ocean</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
