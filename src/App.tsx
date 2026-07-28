import React, { useState } from 'react';
import { Header } from './components/Header';
import { WorldClockPillar } from './components/WorldClockPillar';
import { CalendarPillar } from './components/CalendarPillar';
import { AstronomyPillar } from './components/AstronomyPillar';
import { WeatherPillar } from './components/WeatherPillar';
import { TimersPillar } from './components/TimersPillar';
import { WorldometersPillar } from './components/WorldometersPillar';
import { WidgetsPillar } from './components/WidgetsPillar';
import { EnterpriseServicesPillar } from './components/EnterpriseServicesPillar';
import { ArchitectureModal } from './components/ArchitectureModal';
import { QrModal } from './components/QrModal';
import { UserAccountModal } from './components/UserAccountModal';
import { AdBanner } from './components/AdBanner';
import { City } from './types';
import { Globe, Database, ShieldCheck, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [activePillar, setActivePillar] = useState<number>(1);
  const [selectedCityFromSearch, setSelectedCityFromSearch] = useState<City | undefined>(undefined);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [showAds, setShowAds] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Light mode default for TimeAndDate style

  const handleSelectCity = (city: City) => {
    setSelectedCityFromSearch(city);
    setActivePillar(1); // Jump to World Clock view for the searched city
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070b14] text-slate-100' : 'bg-[#f1f5f9] text-slate-800'} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
      {/* Header */}
      <Header
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        onSelectCity={handleSelectCity}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Ad Control & Quick Bar */}
      <div className={`${isDarkMode ? 'bg-[#0b101f]/90 border-slate-800/80' : 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'} border-b text-xs py-2 px-4 backdrop-blur-md`}>
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Timegovern Commercial Ad Layout:</span>
            <span className="bg-emerald-600/10 text-emerald-700 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              Google AdSense & Mediavine Ready
            </span>
          </div>

          <button
            onClick={() => setShowAds(!showAds)}
            className={`flex items-center gap-1.5 px-3 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'} rounded-lg border transition-all cursor-pointer text-[11px] font-medium`}
          >
            {showAds ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{showAds ? 'Hide Preview Ad Slots' : 'Show Preview Ad Slots'}</span>
          </button>
        </div>
      </div>

      {/* Top Leaderboard Ad Slot */}
      {showAds && (
        <div className="px-4 mt-2 max-w-[1920px] mx-auto w-full">
          <AdBanner type="leaderboard" />
        </div>
      )}

      {/* Main Content Area with Optional Left and Right Skyscraper Rails */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto px-2 sm:px-4 md:px-6 py-5">
        <div className="flex items-start gap-4 lg:gap-6 justify-center">
          {/* Left Skyscraper Ad Rail (Wide screens) */}
          {showAds && <AdBanner type="skyscraper-left" />}

          {/* Central Main Content across 8 Pillars */}
          <main className="flex-1 w-full min-w-0">
            {activePillar === 1 && (
              <WorldClockPillar selectedCityFromSearch={selectedCityFromSearch} />
            )}
            {activePillar === 2 && <CalendarPillar />}
            {activePillar === 3 && <AstronomyPillar />}
            {activePillar === 4 && <WeatherPillar />}
            {activePillar === 5 && <TimersPillar />}
            {activePillar === 6 && <WorldometersPillar />}
            {activePillar === 7 && <WidgetsPillar />}
            {activePillar === 8 && <EnterpriseServicesPillar />}
          </main>

          {/* Right Skyscraper Ad Rail (Wide screens) */}
          {showAds && <AdBanner type="skyscraper-right" />}
        </div>
      </div>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-[#05080f] text-slate-400 border-slate-800' : 'bg-slate-900 text-slate-300 border-slate-800'} border-t text-xs py-10 mt-16`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-extrabold text-white text-lg tracking-tight">Timegovern<span className="text-cyan-400">.com</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              High-precision global time, temporal governance, astronomical ephemeris, meeting converter, live worldometers tickers, embeddable web widgets, and Cloudflare Edge commercial APIs.
            </p>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-3 font-display">Core Temporal Utilities</span>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => setActivePillar(1)} className="hover:text-cyan-400 transition-colors cursor-pointer">World Clock & 5,000+ Global Cities</button></li>
              <li><button onClick={() => setActivePillar(1)} className="hover:text-cyan-400 transition-colors cursor-pointer">Time Zone Converter & Meeting Planner</button></li>
              <li><button onClick={() => setActivePillar(2)} className="hover:text-cyan-400 transition-colors cursor-pointer">Printable Calendar & Bank Holidays</button></li>
              <li><button onClick={() => setActivePillar(2)} className="hover:text-cyan-400 transition-colors cursor-pointer">Business / Workday Date Calculators</button></li>
              <li><button onClick={() => setActivePillar(6)} className="hover:text-cyan-400 transition-colors cursor-pointer">Live Global Tickers (Worldometers)</button></li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-3 font-display">Ephemeris & API Services</span>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => setActivePillar(3)} className="hover:text-cyan-400 transition-colors cursor-pointer">Sunrise, Sunset & Twilight Ephemeris</button></li>
              <li><button onClick={() => setActivePillar(3)} className="hover:text-cyan-400 transition-colors cursor-pointer">Moon Phase & Illumination Calendar</button></li>
              <li><button onClick={() => setActivePillar(4)} className="hover:text-cyan-400 transition-colors cursor-pointer">14-Day Forecasts & Weather Archives</button></li>
              <li><button onClick={() => setActivePillar(7)} className="hover:text-cyan-400 transition-colors cursor-pointer">Free Embeddable Web Widgets</button></li>
              <li><button onClick={() => setActivePillar(8)} className="hover:text-cyan-400 transition-colors cursor-pointer">Commercial APIs & Developer Portal</button></li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-3 font-display">Cloud Infrastructure</span>
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cloudflare Edge Active
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Distributed Edge Routing • IANA tzdata 2026a Pipeline • Meeus Astronomical Formulas
              </p>
              <button
                onClick={() => setIsArchModalOpen(true)}
                className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1 font-bold mt-1 cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" /> View System Architecture Specs
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 mt-10 pt-5 border-t border-slate-800/80 text-center text-[11px] text-slate-400 font-mono">
          © {new Date().getFullYear()} Timegovern.com. All rights reserved. Precision atomic clock synchronization & global temporal governance.
        </div>
      </footer>

      {/* Architecture Documentation Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Mobile QR Code Modal */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* User Account & Cloud Sync Modal */}
      <UserAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      {/* Bottom Sticky Anchor Ad Slot */}
      {showAds && <AdBanner type="anchor-bottom" />}
    </div>
  );
}
