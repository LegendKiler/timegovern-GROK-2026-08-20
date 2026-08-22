import React, { useState, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { AdBanner } from './components/AdBanner';
import { AdSenseLoader } from './components/ads/AdSenseLoader';
import { ShortcutToast } from './components/ShortcutToast';
import { PillarLoader } from './components/PillarLoader';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { City } from './types';
import type { TemplateTheme } from './components/TemplateGalleryModal';
import { Globe, Database, ShieldCheck, Eye, EyeOff, Heart, Mail, Share2, Facebook, Twitter, Linkedin, Instagram, Youtube, Keyboard } from 'lucide-react';

const WorldClockPillar = lazy(() => import('./components/WorldClockPillar').then(m => ({ default: m.WorldClockPillar })));
const CalendarPillar = lazy(() => import('./components/CalendarPillar').then(m => ({ default: m.CalendarPillar })));
const AstronomyPillar = lazy(() => import('./components/AstronomyPillar').then(m => ({ default: m.AstronomyPillar })));
const WeatherPillar = lazy(() => import('./components/WeatherPillar').then(m => ({ default: m.WeatherPillar })));
const TimersPillar = lazy(() => import('./components/TimersPillar').then(m => ({ default: m.TimersPillar })));
const WorldometersPillar = lazy(() => import('./components/WorldometersPillar').then(m => ({ default: m.WorldometersPillar })));
const WidgetsPillar = lazy(() => import('./components/WidgetsPillar').then(m => ({ default: m.WidgetsPillar })));
const EnterpriseServicesPillar = lazy(() => import('./components/EnterpriseServicesPillar').then(m => ({ default: m.EnterpriseServicesPillar })));
const NewsPillar = lazy(() => import('./components/NewsPillar').then(m => ({ default: m.NewsPillar })));
const CalculatorsPillar = lazy(() => import('./components/CalculatorsPillar').then(m => ({ default: m.CalculatorsPillar })));
const CompanyPillar = lazy(() => import('./components/CompanyPillar').then(m => ({ default: m.CompanyPillar })));
const CompanyPillarAdvertiseBridge = lazy(() => import('./components/CompanyPillarAdvertiseBridge').then(m => ({ default: m.CompanyPillarAdvertiseBridge })));

const ArchitectureModal = lazy(() => import('./components/ArchitectureModal').then(m => ({ default: m.ArchitectureModal })));
const QrModal = lazy(() => import('./components/QrModal').then(m => ({ default: m.QrModal })));
const UserAccountModal = lazy(() => import('./components/UserAccountModal').then(m => ({ default: m.UserAccountModal })));
const SecurityTrustModal = lazy(() => import('./components/SecurityTrustModal').then(m => ({ default: m.SecurityTrustModal })));
const TemplateGalleryModal = lazy(() => import('./components/TemplateGalleryModal').then(m => ({ default: m.TemplateGalleryModal })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

export default function App() {
  const [activePillar, setActivePillar] = useState<number>(1);
  const [selectedCityFromSearch, setSelectedCityFromSearch] = useState<City | undefined>(undefined);
  const [primaryCity, setPrimaryCity] = useState<City | undefined>(undefined);
  const [isArchModalOpen, setIsArchModalOpen] = useState<boolean>(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState<boolean>(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState<boolean>(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [showAds, setShowAds] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [templateTheme, setTemplateTheme] = useState<TemplateTheme>('swiss-quartz');

  const { lastFeedback: shortcutFeedback, isMac } = useGlobalShortcuts({
    onSelectPillar: (pillarIndex: number) => setActivePillar(pillarIndex),
    onFocusSearch: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const input = document.querySelector('input[placeholder*="Search global city"]') as HTMLInputElement;
      input?.focus();
    },
    onToggleDarkMode: () => setIsDarkMode((prev) => !prev),
    onCycleTheme: () => {
      const themes: TemplateTheme[] = ['swiss-quartz', 'stripe-corporate', 'emerald-precision', 'editorial-classic'];
      setTemplateTheme((current) => {
        const nextIdx = (themes.indexOf(current) + 1) % themes.length;
        return themes[nextIdx];
      });
    },
    onOpenShortcutsModal: () => setIsShortcutsModalOpen(true),
    onOpenSecurityModal: () => setIsSecurityModalOpen(true),
    onOpenQrModal: () => setIsQrModalOpen(true),
    onOpenAccountModal: () => setIsAccountModalOpen(true),
    onOpenArchModal: () => setIsArchModalOpen(true),
    onToggleAds: () => setShowAds((prev) => !prev),
    onCloseModals: () => {
      setIsArchModalOpen(false);
      setIsQrModalOpen(false);
      setIsAccountModalOpen(false);
      setIsSecurityModalOpen(false);
      setIsTemplateGalleryOpen(false);
      setIsShortcutsModalOpen(false);
    },
  });

  const handleSelectCity = (city: City) => {
    setSelectedCityFromSearch(city);
    setPrimaryCity(city);
    setActivePillar(1);
  };

  const getThemeWrapperClass = () => {
    if (isDarkMode) {
      return 'bg-[#070b14] text-slate-100 font-sans selection:bg-blue-600 selection:text-white';
    }
    switch (templateTheme) {
      case 'stripe-corporate':
        return 'bg-[#f1f5f9] text-indigo-950 font-sans selection:bg-indigo-600 selection:text-white';
      case 'emerald-precision':
        return 'bg-[#f0fdf4] text-emerald-950 font-sans selection:bg-emerald-600 selection:text-white';
      case 'editorial-classic':
        return 'bg-[#fffbeb] text-slate-900 font-serif selection:bg-amber-300 selection:text-amber-950';
      case 'swiss-quartz':
      default:
        return 'bg-[#f0f4f8] text-slate-900 font-sans selection:bg-blue-600 selection:text-white';
    }
  };

  return (
    <div className={`min-h-screen ${getThemeWrapperClass()} flex flex-col transition-colors duration-300`}>
      <AdSenseLoader />
      <Header
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        onSelectCity={handleSelectCity}
        primaryCity={primaryCity}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenTemplateGallery={() => setIsTemplateGalleryOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        templateTheme={templateTheme}
        setTemplateTheme={setTemplateTheme}
      />

      <div className={`${isDarkMode ? 'bg-[#0b101f]/90 border-slate-800/80' : 'bg-white/90 border-slate-200 text-slate-700 shadow-xs'} border-b text-xs py-2 px-4 backdrop-blur-md`}>
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Commercial AdSlots:</span>
            <span className="bg-emerald-600/10 text-emerald-700 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold">
              House placeholders · AdSense env-gated
            </span>
          </div>
          <button
            onClick={() => setShowAds(!showAds)}
            className={`flex items-center gap-1.5 px-3 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'} rounded-lg border transition-all cursor-pointer text-[11px] font-medium`}
          >
            {showAds ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{showAds ? 'Hide Ad Banner Slots' : 'Show Ad BannerSlots'}</span>
          </button>
        </div>
      </div>

      {showAds && (
        <div className="px-4 mt-2 max-w-[1920px] mx-auto w-full">
          <AdBanner type="leaderboard" />
        </div>
      )}

      <div className="flex-1 max-w-[1920px] w-full mx-auto px-2 sm:px-4 md:px-6 py-5">
        <div className="flex items-start gap-4 lg:gap-6 justify-center">
          {showAds && <AdBanner type="skyscraper-left" />}
          <main className="flex-1 w-full min-w-0">
            <Suspense fallback={<PillarLoader pillarNumber={activePillar} isDarkMode={isDarkMode} />}>
              {activePillar === 1 && (
                <WorldClockPillar
                  selectedCityFromSearch={selectedCityFromSearch}
                  onPrimaryCityChange={(city) => setPrimaryCity(city)}
                />
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
              {activePillar === 11 && (
                <CompanyPillarAdvertiseBridge>
                  <CompanyPillar onNavigatePillar={setActivePillar} />
                </CompanyPillarAdvertiseBridge>
              )}
            </Suspense>
          </main>
          {showAds && <AdBanner type="skyscraper-right" />}
        </div>
      </div>

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
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Browse our site <strong className="text-slate-900 dark:text-slate-100">advert free</strong>.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Sun & Moon times <strong className="text-slate-900 dark:text-slate-100">precise to the second</strong>.
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
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

      <footer className={`${isDarkMode ? 'bg-[#05080f] text-slate-400 border-slate-800' : 'bg-slate-900 text-slate-300 border-slate-800'} border-t text-xs py-10`}>
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="font-display font-extrabold text-white text-lg tracking-tight">
                timegovern<span className="text-cyan-400">.com</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              High-precision global time, temporal governance, astronomical ephemeris, meeting planner, and Cloudflare Edge commercial APIs.
            </p>
            <p className="text-[10px] text-slate-500">© TimeGovern. All rights reserved.</p>
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Company</span>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button
                  onClick={() => {
                    setActivePillar(11);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  About us (Melb HQ)
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePillar(11);
                    window.location.hash = 'advertise';
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Advertise / Media kit
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActivePillar(11);
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="hover:text-cyan-400 transition-colors cursor-pointer text-left"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Legal & Trust</span>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button onClick={() => setIsSecurityModalOpen(true)} className="text-emerald-400 font-bold hover:text-emerald-300 cursor-pointer text-left">
                  SSL & Security Center
                </button>
              </li>
              <li>
                <button onClick={() => setIsSecurityModalOpen(true)} className="hover:text-cyan-400 cursor-pointer text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => setIsSecurityModalOpen(true)} className="hover:text-cyan-400 cursor-pointer text-left">
                  Advertising Policy
                </button>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Services</span>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>
                <button onClick={() => setActivePillar(1)} className="hover:text-cyan-400 cursor-pointer">
                  World Clock & Cities
                </button>
              </li>
              <li>
                <button onClick={() => setActivePillar(2)} className="hover:text-cyan-400 cursor-pointer">
                  Calendar & Holidays
                </button>
              </li>
              <li>
                <button onClick={() => setActivePillar(10)} className="hover:text-cyan-400 cursor-pointer">
                  Calculators
                </button>
              </li>
            </ul>
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-display">Sites & Social</span>
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg">
                <Facebook className="w-4 h-4" />
              </span>
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg">
                <Twitter className="w-4 h-4" />
              </span>
              <span className="hover:text-cyan-400 cursor-pointer p-1.5 bg-slate-800 rounded-lg">
                <Linkedin className="w-4 h-4" />
              </span>
            </div>
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 text-xs font-bold cursor-pointer"
            >
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>Keyboard Shortcuts</span>
            </button>
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        {isArchModalOpen && <ArchitectureModal isOpen={isArchModalOpen} onClose={() => setIsArchModalOpen(false)} />}
        {isQrModalOpen && <QrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />}
        {isAccountModalOpen && <UserAccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} />}
        {isSecurityModalOpen && <SecurityTrustModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />}
        {isTemplateGalleryOpen && (
          <TemplateGalleryModal
            isOpen={isTemplateGalleryOpen}
            onClose={() => setIsTemplateGalleryOpen(false)}
            currentTheme={templateTheme}
            onSelectTheme={(theme) => {
              setTemplateTheme(theme);
              setIsTemplateGalleryOpen(false);
            }}
          />
        )}
        {isShortcutsModalOpen && (
          <KeyboardShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
            onSelectPillar={(pillar) => {
              setActivePillar(pillar);
              setIsShortcutsModalOpen(false);
            }}
            onFocusSearch={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              const input = document.querySelector('input[placeholder*="Search global city"]') as HTMLInputElement;
              input?.focus();
            }}
            onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
            onCycleTheme={() => {
              const themes: TemplateTheme[] = ['swiss-quartz', 'stripe-corporate', 'emerald-precision', 'editorial-classic'];
              setTemplateTheme((current) => {
                const nextIdx = (themes.indexOf(current) + 1) % themes.length;
                return themes[nextIdx];
              });
            }}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            onOpenAccountModal={() => setIsAccountModalOpen(true)}
            onOpenArchModal={() => setIsArchModalOpen(true)}
            onToggleAds={() => setShowAds((prev) => !prev)}
            isMac={isMac}
            activePillar={activePillar}
          />
        )}
      </Suspense>

      <ShortcutToast feedback={shortcutFeedback} />
      {showAds && <AdBanner type="anchor-bottom" />}
    </div>
  );
}
