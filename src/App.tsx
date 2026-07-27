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

  const handleSelectCity = (city: City) => {
    setSelectedCityFromSearch(city);
    setActivePillar(1); // Jump to World Clock view for the searched city
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Header */}
      <Header
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        onSelectCity={handleSelectCity}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      {/* Ad Control & Quick Bar */}
      <div className="bg-[#0b101f]/80 border-b border-slate-800/80 text-xs py-2 px-4 backdrop-blur-md">
        <div className="max-w-[1550px] mx-auto flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Timegovern Commercial Ad Layout:</span>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              Google AdSense & Mediavine Ready
            </span>
          </div>

          <button
            onClick={() => setShowAds(!showAds)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-all cursor-pointer text-[11px] font-medium"
          >
            {showAds ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{showAds ? 'Hide Preview Ad Slots' : 'Show Preview Ad Slots'}</span>
          </button>
        </div>
      </div>

      {/* Top Leaderboard Ad Slot */}
      {showAds && (
        <div className="px-4 mt-2">
          <AdBanner type="leaderboard" />
        </div>
      )}

      {/* Main Content Area with Optional Left and Right Skyscraper Rails */}
      <div className="flex-1 max-w-[1550px] w-full mx-auto px-4 py-5">
        <div className="flex items-start gap-6 justify-center">
          {/* Left Skyscraper Ad Rail (Wide screens) */}
          {showAds && <AdBanner type="skyscraper-left" />}

          {/* Central Main Content across 8 Pillars */}
          <main className="flex-1 w-full max-w-7xl">
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
      <footer className="bg-[#05080f] text-slate-400 border-t border-slate-800/80 text-xs py-10 mt-16">
        <div className="max-w-[1550px] mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
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
              <li><button onClick={() => setActivePillar(1)} className="hover:text-cyan-400 transition-colors">World Clock & 5,000+ Global Cities</button></li>
              <li><button onClick={() => setActivePillar(1)} className="hover:text-cyan-400 transition-colors">Time Zone Converter & Meeting Planner</button></li>
              <li><button onClick={() => setActivePillar(2)} className="hover:text-cyan-400 transition-colors">Printable Calendar & Bank Holidays</button></li>
              <li><button onClick={() => setActivePillar(2)} className="hover:text-cyan-400 transition-colors">Business / Workday Date Calculators</button></li>
              <li><button onClick={() => setActivePillar(6)} className="hover:text-cyan-400 transition-colors">Live Global Tickers (Worldometers)</button></li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-3 font-display">Ephemeris & API Services</span>
            <ul className="space-y-2 text-[11px]">
              <li><button onClick={() => setActivePillar(3)} className="hover:text-cyan-400 transition-colors">Sunrise, Sunset & Twilight Ephemeris</button></li>
              <li><button onClick={() => setActivePillar(3)} className="hover:text-cyan-400 transition-colors">Moon Phase & Illumination Calendar</button></li>
              <li><button onClick={() => setActivePillar(4)} className="hover:text-cyan-400 transition-colors">14-Day Forecasts & Weather Archives</button></li>
              <li><button onClick={() => setActivePillar(7)} className="hover:text-cyan-400 transition-colors">Free Embeddable Web Widgets</button></li>
              <li><button onClick={() => setActivePillar(8)} className="hover:text-cyan-400 transition-colors">Commercial APIs & Developer Portal</button></li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block mb-3 font-display">Cloud Infrastructure</span>
            <div className="bg-[#0b101f] p-4 rounded-2xl border border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cloudflare Edge Active
              </div>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Distributed Edge Routing • IANA tzdata 2026a Pipeline • Meeus Astronomical Formulas
              </p>
              <button
                onClick={() => setIsArchModalOpen(true)}
                className="text-cyan-400 hover:underline text-[10px] flex items-center gap-1 font-bold mt-1"
              >
                <Database className="w-3.5 h-3.5" /> View System Architecture Specs
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[1550px] mx-auto px-4 mt-10 pt-5 border-t border-slate-800/80 text-center text-[11px] text-slate-500 font-mono">
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
    </div>
  );
}
