import React, { useState, useEffect, Suspense, lazy } from 'react';
import { fetchBillingStatus } from './lib/billing';
import { Header } from './components/Header';
import { AdBanner } from './components/AdBanner';
import { AdSenseLoader } from './components/ads/AdSenseLoader';
import { ShortcutToast } from './components/ShortcutToast';
import { PillarLoader } from './components/PillarLoader';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { City } from './types';
import type { TemplateTheme } from './components/TemplateGalleryModal';
import { Globe, Eye, EyeOff, Heart, Keyboard } from 'lucide-react';
import { companyContent } from './content/companyContent';
import { PillarErrorBoundary } from './components/PillarErrorBoundary';
import { SiteFooter } from './components/SiteFooter';

const WorldClockPillar = lazy(() => import('./components/WorldClockPillar').then(m => ({ default: m.WorldClockPillar })));
const CalendarPillar = lazy(() => import('./components/CalendarPillar').then(m => ({ default: m.CalendarPillar })));
const AstronomyPillar = lazy(() => import('./components/AstronomyPillarLive').then(m => ({ default: m.AstronomyPillarLive })));
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
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalPanel, setAccountModalPanel] = useState<'account' | 'supporter'>('account');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isTemplateGalleryOpen, setIsTemplateGalleryOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [showAds, setShowAds] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Phase 3: hide ads when Supporter entitlement is active (cloud or lab-mock)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const st = await fetchBillingStatus();
        if (cancelled) return;
        if (st.supporter) setShowAds(false);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
      document.body.style.background = '#0b1120';
      document.body.style.backgroundImage = 'none';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      document.body.style.background = '#e8eef5';
      document.body.style.backgroundImage = 'none';
    }
  }, [isDarkMode]);

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
      setTemplateTheme((current) => themes[(themes.indexOf(current) + 1) % themes.length]);
    },
    onOpenShortcutsModal: () => setIsShortcutsModalOpen(true),
    onOpenSecurityModal: () => setIsSecurityModalOpen(true),
    onOpenQrModal: () => setIsQrModalOpen(true),
    onOpenAccountModal: () => { setAccountModalPanel('account'); setIsAccountModalOpen(true); },
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

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}
      style={{
        minHeight: '100vh',
        background: isDarkMode ? '#0b1120' : '#e8eef5',
      }}
    >
      <AdSenseLoader />
      <Header
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        onSelectCity={handleSelectCity}
        primaryCity={primaryCity}
        onOpenArchModal={() => setIsArchModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onOpenAccountModal={() => { setAccountModalPanel('account'); setIsAccountModalOpen(true); }}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenTemplateGallery={() => setIsTemplateGalleryOpen(true)}
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        templateTheme={templateTheme}
        setTemplateTheme={setTemplateTheme}
      />

      <div
        className={`${
          isDarkMode
            ? 'bg-[#0b101f]/95 border-slate-800/80 text-slate-200'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        } border-b text-xs py-2 px-4`}
      >
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-[11px]">
          <span className="font-semibold">Commercial AdSlots · House placeholders · AdSense env-gated</span>
          <button
            type="button"
            onClick={() => setShowAds(!showAds)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border cursor-pointer ${
              isDarkMode ? 'border-slate-600 bg-slate-800' : 'border-slate-300 bg-white'
            }`}
          >
            {showAds ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            {showAds ? 'Hide ads' : 'Show ads'}
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
          <main className="flex-1 w-full min-w-0 text-slate-900 dark:text-slate-100">
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
                <PillarErrorBoundary label="Company">
                  <CompanyPillarAdvertiseBridge>
                    <CompanyPillar onNavigatePillar={setActivePillar} />
                  </CompanyPillarAdvertiseBridge>
                </PillarErrorBoundary>
              )}
            </Suspense>
          </main>
          {showAds && <AdBanner type="skyscraper-right" />}
        </div>
      </div>

      {/* Compact Supporter strip — full detail is in SiteFooter + plans modal */}
      <div className="max-w-[1200px] mx-auto w-full px-4 my-6">
        <div className="rounded-2xl border border-pink-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-b from-pink-500 to-rose-700 flex items-center justify-center text-white">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">Love Our Site? Become a Supporter</h3>
              <ul className="mt-1.5 text-[12px] text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-4">
                <li>Browse advert free</li>
                <li>Sun & Moon times precise to the second</li>
                <li>Exclusive PDF calendar templates</li>
              </ul>
              <p className="text-[11px] text-slate-500 mt-1">From <strong>A$29.99/year</strong> · Not a tax-deductible donation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setAccountModalPanel('supporter');
              setIsAccountModalOpen(true);
            }}
            className="shrink-0 px-5 py-3 bg-[#0b6aa2] hover:bg-[#095a8a] text-white font-bold text-xs rounded-xl shadow-md"
          >
            Become a Supporter
          </button>
        </div>
      </div>

      <SiteFooter
        isDarkMode={isDarkMode}
        onNavigatePillar={setActivePillar}
        onOpenSupporter={() => {
          setAccountModalPanel('supporter');
          setIsAccountModalOpen(true);
        }}
        onOpenAccount={() => {
          setAccountModalPanel('account');
          setIsAccountModalOpen(true);
        }}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
      />

      <Suspense fallback={null}>
        {isArchModalOpen && <ArchitectureModal isOpen={isArchModalOpen} onClose={() => setIsArchModalOpen(false)} />}
        {isQrModalOpen && <QrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />}
        {isAccountModalOpen && (
          <UserAccountModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            initialPanel={accountModalPanel}
          />
        )}
        {isSecurityModalOpen && <SecurityTrustModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />}
        {isTemplateGalleryOpen && (
          <TemplateGalleryModal
            isOpen={isTemplateGalleryOpen}
            onClose={() => setIsTemplateGalleryOpen(false)}
            currentTheme={templateTheme}
            onSelectTheme={(t) => {
              setTemplateTheme(t);
              setIsTemplateGalleryOpen(false);
            }}
          />
        )}
        {isShortcutsModalOpen && (
          <KeyboardShortcutsModal
            isOpen={isShortcutsModalOpen}
            onClose={() => setIsShortcutsModalOpen(false)}
            onSelectPillar={(p) => {
              setActivePillar(p);
              setIsShortcutsModalOpen(false);
            }}
            onFocusSearch={() => {}}
            onToggleDarkMode={() => setIsDarkMode((p) => !p)}
            onCycleTheme={() => {}}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            onOpenQrModal={() => setIsQrModalOpen(true)}
            onOpenAccountModal={() => { setAccountModalPanel('account'); setIsAccountModalOpen(true); }}
            onOpenArchModal={() => setIsArchModalOpen(true)}
            onToggleAds={() => setShowAds((p) => !p)}
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
