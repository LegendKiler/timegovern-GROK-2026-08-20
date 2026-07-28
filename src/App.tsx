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
import { NewsPillar } from './components/NewsPillar';
import { CalculatorsPillar } from './components/CalculatorsPillar';
import { ArchitectureModal } from './components/ArchitectureModal';
import { QrModal } from './components/QrModal';
import { UserAccountModal } from './components/UserAccountModal';
import { AdBanner } from './components/AdBanner';
import { City } from './types';
import { Globe, Database, ShieldCheck, Eye, EyeOff, Heart, Mail, Share2, Facebook, Twitter, Linkedin, Instagram, Youtube } from 'lucide-react';

export default function App() {
  const [activePillar, setActivePillar] = useState<number>(1);
  const [selectedCityFromSearch, setSelectedCityFromSearch] = useState<City | undefined>(undefined);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [showAds, setShowAds] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false); // Light mode default matching TimeAndDate.com

  const handleSelectCity = (city: City) => {
    setSelectedCityFromSearch(city);
    setActivePillar(1); // Jump to World Clock view for searched city
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070b14] text-slate-100' : 'bg-[#eef2f7] text-slate-800'} flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200`}>
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
            <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Commercial Ad Slots:</span>
            <span className="bg-emerald-600/10 text-emerald-700 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              Google AdSense & Mediavine Ready
            </span>
          </div>

          <button
            onClick={() => setShowAds(!showAds)}
            className={`flex items-center gap-1.5 px-3 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'} rounded-lg border transition-all cursor-pointer text-[11px] font-medium`}
          >
            {showAds ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{showAds ? 'Hide Ad Banner Slots' : 'Show Ad Banner Slots'}</span>
          </button>
        </div>
      </div>

      {/* Top Leaderboard Ad Slot */}
      {showAds && (
        <div className="px-4 mt-2 max-w-[1920px] mx-auto w-full">
          <AdBanner type="leaderboard" />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto px-2 sm:px-4 md:px-6 py-5">
        <div className="flex items-start gap-4 lg:gap-6 justify-center">
          {/* Left Skyscraper Ad Rail */}
          {showAds && <AdBanner type="skyscraper-left" />}

          {/* Central Main Content across Pillars */}
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
            {activePillar === 9 && <NewsPillar />}
            {activePillar === 10 && <CalculatorsPillar />}
          </main>

          {/* Right Skyscraper Ad Rail */}
          {showAds && <AdBanner type="skyscraper-right" />}
        </div>
      </div>

      {/* Supporter Shield Banner matching TimeAndDate.com styling */}
      <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 my-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Heart className="w-8 h-8 fill-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                Love Our Site? Become a Supporter
              </h3>
              <ul className="mt-1.5 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  Browse our site <strong className="text-slate-900 dark:text-slate-100">advert free</strong>.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  Sun & Moon times <strong className="text-slate-900 dark:text-slate-100">precise to the second</strong>.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
                  Exclusive calendar & PDF schedule export templates.
                </li>
              </ul>
            </div>
          </div>

          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
          >
            Create Supporter Account
          </button>
        </div>
      </div>

      {/* TimeAndDate.com Style Full Footer with Company, Legal, Services */}
      <footer className={`${isDarkMode ? 'bg-[#05080f] text-slate-400 border-slate-800' : 'bg-slate-900 text-slate-300 border-slate-800'} border-t text-xs py-10`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand & Supporter */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-extrabold text-white text-lg tracking-tight">timegovern<span className="text-cyan-400">.com</span></span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              High-precision global time, temporal governance, astronomical ephemeris, meeting planner, and Cloudflare Edge commercial APIs.
            </p>
            <p className="text-[10px] text-slate-500">
              © TimeGovern AS 1995–2026. All rights reserved.
            </p>
          </div>

          {/* Col 2: Company */}
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Company</span>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li><a href="#about" className="hover:text-cyan-400 transition-colors">About us</a></li>
              <li><a href="#careers" className="hover:text-cyan-400 transition-colors">Careers / Jobs</a></li>
              <li><a href="#contact" className="hover:text-cyan-400 transition-colors">Contact Us</a></li>
              <li><a href="#sitemap" className="hover:text-cyan-400 transition-colors">Sitemap</a></li>
              <li><a href="#newsletter" className="hover:text-cyan-400 transition-colors">Newsletter</a></li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Legal</span>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li><a href="#link-policy" className="hover:text-cyan-400 transition-colors">Link policy</a></li>
              <li><a href="#advertising" className="hover:text-cyan-400 transition-colors">Advertising</a></li>
              <li><a href="#disclaimer" className="hover:text-cyan-400 transition-colors">Disclaimer</a></li>
              <li><a href="#terms" className="hover:text-cyan-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#privacy" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Services</span>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li><button onClick={() => setActivePillar(1)} className="hover:text-cyan-400 transition-colors cursor-pointer">World Clock & Cities</button></li>
              <li><button onClick={() => setActivePillar(1)} className="hover:text-cyan-400 transition-colors cursor-pointer">Time Zones & DST</button></li>
              <li><button onClick={() => setActivePillar(2)} className="hover:text-cyan-400 transition-colors cursor-pointer">Calendar & Holidays</button></li>
              <li><button onClick={() => setActivePillar(4)} className="hover:text-cyan-400 transition-colors cursor-pointer">Weather Forecasts</button></li>
              <li><button onClick={() => setActivePillar(3)} className="hover:text-cyan-400 transition-colors cursor-pointer">Sun & Moon Ephemeris</button></li>
              <li><button onClick={() => setActivePillar(10)} className="hover:text-cyan-400 transition-colors cursor-pointer">Calculators & Converters</button></li>
            </ul>
          </div>

          {/* Col 5: Sites & Social */}
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Sites & Social</span>
            <ul className="space-y-2 text-[11px] text-slate-400 mb-4">
              <li><span className="text-slate-300 font-semibold">timegovern.no</span> (Norwegian)</li>
              <li><span className="text-slate-300 font-semibold">timegovern.de</span> (German)</li>
            </ul>
            <div className="flex items-center gap-2 text-slate-400">
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg"><Facebook className="w-4 h-4" /></span>
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg"><Twitter className="w-4 h-4" /></span>
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg"><Linkedin className="w-4 h-4" /></span>
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg"><Instagram className="w-4 h-4" /></span>
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg"><Youtube className="w-4 h-4" /></span>
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

