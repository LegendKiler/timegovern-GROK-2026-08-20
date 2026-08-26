import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { SiteFooter } from './components/SiteFooter';
import { AdBanner } from './components/AdBanner';
import { AdSenseLoader } from './components/AdSenseLoader';
import { ShortcutToast } from './components/ShortcutToast';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import type { City } from './types';
import { Eye, EyeOff } from 'lucide-react';

const ArchitectureModal = lazy(() => import('./components/ArchitectureModal').then(m => ({ default: m.ArchitectureModal })));
const QrModal = lazy(() => import('./components/QrModal').then(m => ({ default: m.QrModal })));
const UserAccountModal = lazy(() => import('./components/UserAccountModal').then(m => ({ default: m.UserAccountModal })));
const SecurityTrustModal = lazy(() => import('./components/SecurityTrustModal').then(m => ({ default: m.SecurityTrustModal })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

const WorldClockPillar = lazy(() => import('./components/WorldClockPillar').then(m => ({ default: m.WorldClockPillar })));
const CalendarPillar = lazy(() => import('./components/CalendarPillar').then(m => ({ default: m.CalendarPillar })));
const AstronomyPillar = lazy(() => import('./components/AstronomyPillar').then(m => ({ default: m.AstronomyPillar })));
const WeatherPillar = lazy(() => import('./components/WeatherPillar').then(m => ({ default: m.WeatherPillar })));
const TimersPillar = lazy(() => import('./components/TimersPillar').then(m => ({ default: m.TimersPillar })));
const LiveDataPillar = lazy(() => import('./components/LiveDataPillar').then(m => ({ default: m.LiveDataPillar })));
const WidgetsPillar = lazy(() => import('./components/WidgetsPillar').then(m => ({ default: m.WidgetsPillar })));
const ApiPillar = lazy(() => import('./components/ApiPillar').then(m => ({ default: m.ApiPillar })));
const NewsPillar = lazy(() => import('./components/NewsPillar').then(m => ({ default: m.NewsPillar })));
const CalculatorsPillar = lazy(() => import('./components/CalculatorsPillar').then(m => ({ default: m.CalculatorsPillar })));
const CompanyPillar = lazy(() => import('./components/CompanyPillar').then(m => ({ default: m.CompanyPillar })));

function PillarLoader({ pillarNumber, isDarkMode }: { pillarNumber: number; isDarkMode: boolean }) {
  return (
    <div className={`rounded-2xl border p-8 text-center text-sm ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
      Loading section {pillarNumber}…
    </div>
  );
}

export default function App() {
  const [activePillar, setActivePillar] = useState(1);
  const [primaryCity, setPrimaryCity] = useState<City | undefined>();
  const [selectedCityFromSearch, setSelectedCityFromSearch] = useState<City | undefined>();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showAds, setShowAds] = useState(false);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountModalPanel, setAccountModalPanel] = useState<'account' | 'supporter'>('account');
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tg_dark');
      if (stored === '0') setIsDarkMode(false);
      if (stored === '1') setIsDarkMode(true);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('tg_dark', isDarkMode ? '1' : '0');
      document.documentElement.classList.toggle('dark', isDarkMode);
    } catch { /* ignore */ }
  }, [isDarkMode]);

  const { lastFeedback: shortcutFeedback, isMac } = useGlobalShortcuts({
    onSelectPillar: (pillarIndex: number) => setActivePillar(pillarIndex),
    onFocusSearch: () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const input = document.querySelector('input[placeholder*="Search global city"]') as HTMLInputElement;
      input?.focus();
    },
    onToggleDarkMode: () => setIsDarkMode((prev) => !prev),
    onCycleTheme: () => {},
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
        onOpenShortcutsModal={() => setIsShortcutsModalOpen(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div
        className={`${
          isDarkMode
            ? 'bg-[#0b101f]/95 border-slate-800/80 text-slate-200'
            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
        } border-b text-xs py-2 px-4`}
      >
        <div className="max-w-[1920px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] opacity-80">
            Precision time tools · Melbourne HQ · Not financial or legal advice
          </p>
          <button
            type="button"
            onClick={() => setShowAds((p) => !p)}
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            {showAds ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            {showAds ? 'Hide ads' : 'Show ads'}
          </button>
        </div>
      </div>

      {showAds && <AdBanner type="leaderboard-top" />}

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-4 py-4 flex gap-3">
        {showAds && <AdBanner type="skyscraper-left" />}
        <div className="flex-1 min-w-0">
          <Suspense fallback={<PillarLoader pillarNumber={activePillar} isDarkMode={isDarkMode} />}>
            {activePillar === 1 && (
              <WorldClockPillar
                isDarkMode={isDarkMode}
                primaryCity={primaryCity}
                selectedCityFromSearch={selectedCityFromSearch}
                onPrimaryCityChange={setPrimaryCity}
              />
            )}
            {activePillar === 2 && <CalendarPillar isDarkMode={isDarkMode} />}
            {activePillar === 3 && <AstronomyPillar isDarkMode={isDarkMode} primaryCity={primaryCity} />}
            {activePillar === 4 && <WeatherPillar isDarkMode={isDarkMode} primaryCity={primaryCity} />}
            {activePillar === 5 && <TimersPillar isDarkMode={isDarkMode} />}
            {activePillar === 6 && <LiveDataPillar isDarkMode={isDarkMode} />}
            {activePillar === 7 && <WidgetsPillar isDarkMode={isDarkMode} />}
            {activePillar === 8 && <ApiPillar isDarkMode={isDarkMode} />}
            {activePillar === 9 && <NewsPillar isDarkMode={isDarkMode} />}
            {activePillar === 10 && <CalculatorsPillar isDarkMode={isDarkMode} />}
            {activePillar === 11 && <CompanyPillar onNavigatePillar={setActivePillar} />}
          </Suspense>
        </div>
        {showAds && <AdBanner type="skyscraper-right" />}
      </main>

      <SiteFooter
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
