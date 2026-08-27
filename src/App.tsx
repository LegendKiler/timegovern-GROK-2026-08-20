import React, { useState, useEffect, Suspense, lazy } from 'react';
import { fetchBillingStatus } from './lib/billing';
import { Header } from './components/Header';
import { AdBanner } from './components/AdBanner';
import { AdSenseLoader } from './components/ads/AdSenseLoader';
import { ShortcutToast } from './components/ShortcutToast';
import { PillarLoader } from './components/PillarLoader';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { City } from './types';
import { Globe, Eye, EyeOff, Heart, Keyboard } from 'lucide-react';
import { companyContent } from './content/companyContent';
import { PillarErrorBoundary } from './components/PillarErrorBoundary';
import { SiteFooter } from './components/SiteFooter';
import { PillarChrome } from './components/PillarChrome';

const WorldClockPillar = lazy(() => import('./components/WorldClockPillar').then(m => ({ default: m.WorldClockPillar })));
const CalendarPillar = lazy(() => import('./components/CalendarPillar').then(m => ({ default: m.CalendarPillar })));
const AstronomyPillar = lazy(() => import('./components/AstronomyPillarLive').then(m => ({ default: m.AstronomyPillarLive || m.default })));
const WeatherPillar = lazy(() => import('./components/WeatherPillar').then(m => ({ default: m.WeatherPillar })));
const TimersPillar = lazy(() => import('./components/TimersPillar').then(m => ({ default: m.TimersPillar })));
const WorldometersPillar = lazy(() => import('./components/WorldometersPillar').then(m => ({ default: m.WorldometersPillar })));
const WidgetsPillar = lazy(() => import('./components/WidgetsPillar').then(m => ({ default: m.WidgetsPillar })));
const EnterpriseServicesPillar = lazy(() => import('./components/EnterpriseServicesPillar').then(m => ({ default: m.EnterpriseServicesPillar })));
const NewsPillar = lazy(() => import('./components/NewsPillar').then(m => ({ default: m.NewsPillar })));
const CalculatorsPillar = lazy(() => import('./components/CalculatorsPillar').then(m => ({ default: m.CalculatorsPillar })));
const CompanyPillar = lazy(() => import('./components/CompanyPillar').then(m => ({ default: m.CompanyPillar })));

const ArchitectureModal = lazy(() => import('./components/ArchitectureModal').then(m => ({ default: m.ArchitectureModal })));
const QrModal = lazy(() => import('./components/QrModal').then(m => ({ default: m.QrModal })));
const UserAccountModal = lazy(() => import('./components/UserAccountModal').then(m => ({ default: m.UserAccountModal })));
const SecurityTrustModal = lazy(() => import('./components/SecurityTrustModal').then(m => ({ default: m.SecurityTrustModal })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

export default function App() {
  const [activePillar, setActivePillar] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showAds, setShowAds] = useState(true);
  const [primaryCity, setPrimaryCity] = useState<City | undefined>();
  const [selectedCityFromSearch, setSelectedCityFromSearch] = useState<City | undefined>();
  const [showArchModal, setShowArchModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountModalPanel, setAccountModalPanel] = useState<'account' | 'supporter' | undefined>();
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [shortcutToast, setShortcutToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tg_dark');
      if (stored === '0') setIsDarkMode(false);
      if (stored === '1') setIsDarkMode(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    try {
      localStorage.setItem('tg_dark', isDarkMode ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [isDarkMode]);

  useEffect(() => {
    fetchBillingStatus().catch(() => undefined);
  }, []);

  useGlobalShortcuts({
    setActivePillar,
    setIsDarkMode,
    setShowAds,
    onOpenShortcuts: () => setShowShortcutsModal(true),
    onToast: setShortcutToast,
  });

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-100">
      <AdSenseLoader />
      <Header
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        onSelectCity={(c) => {
          setSelectedCityFromSearch(c);
          setPrimaryCity(c);
          setActivePillar(1);
        }}
        primaryCity={primaryCity}
        onOpenArchModal={() => setShowArchModal(true)}
        onOpenQrModal={() => setShowQrModal(true)}
        onOpenAccountModal={() => {
          setAccountModalPanel('account');
          setShowAccountModal(true);
        }}
        onOpenSecurityModal={() => setShowSecurityModal(true)}
        onOpenShortcutsModal={() => setShowShortcutsModal(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="border-b border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 truncate">
            <Globe className="w-3 h-3 text-indigo-400" />
            {(companyContent as { tagline?: string })?.tagline || 'Global time, calendars & tools'}
          </span>
          <button
            type="button"
            onClick={() => setShowAds((p) => !p)}
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
          >
            {showAds ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
            {showAds ? 'Hide ads' : 'Show ads'}
          </button>
        </div>
      </div>

      {showAds && <AdBanner type="leaderboard" />}

      <main className="flex-1 w-full max-w-[1920px] mx-auto px-3 sm:px-4 py-4 flex gap-3">
        {showAds && <AdBanner type="skyscraper-left" />}
        <div className="flex-1 min-w-0">
          <PillarErrorBoundary>
            <Suspense fallback={<PillarLoader pillarNumber={activePillar} isDarkMode={isDarkMode} />}>
              {activePillar === 1 && (
                <PillarChrome pillarId={1}>
                  <WorldClockPillar
                    selectedCityFromSearch={selectedCityFromSearch}
                    onPrimaryCityChange={setPrimaryCity}
                  />
                </PillarChrome>
              )}
              {activePillar === 2 && (
                <PillarChrome pillarId={2}>
                  <CalendarPillar isDarkMode={isDarkMode} />
                </PillarChrome>
              )}
              {activePillar === 3 && (
                <PillarChrome pillarId={3}>
                  <AstronomyPillar isDarkMode={isDarkMode} primaryCity={primaryCity} />
                </PillarChrome>
              )}
              {activePillar === 4 && (
                <PillarChrome pillarId={4}>
                  <WeatherPillar isDarkMode={isDarkMode} primaryCity={primaryCity} />
                </PillarChrome>
              )}
              {activePillar === 5 && (
                <PillarChrome pillarId={5}>
                  <TimersPillar isDarkMode={isDarkMode} />
                </PillarChrome>
              )}
              {activePillar === 6 && (
                <PillarChrome pillarId={6}>
                  <WorldometersPillar isDarkMode={isDarkMode} />
                </PillarChrome>
              )}
              {activePillar === 7 && (
                <PillarChrome pillarId={7}>
                  <WidgetsPillar isDarkMode={isDarkMode} />
                </PillarChrome>
              )}
              {activePillar === 8 && (
                <PillarChrome pillarId={8}>
                  <EnterpriseServicesPillar />
                </PillarChrome>
              )}
              {activePillar === 9 && (
                <PillarChrome pillarId={9}>
                  <NewsPillar isDarkMode={isDarkMode} />
                </PillarChrome>
              )}
              {activePillar === 10 && (
                <PillarChrome pillarId={10}>
                  <CalculatorsPillar isDarkMode={isDarkMode} />
                </PillarChrome>
              )}
              {activePillar === 11 && (
                <PillarChrome pillarId={11}>
                  <CompanyPillar onNavigatePillar={setActivePillar} />
                </PillarChrome>
              )}
            </Suspense>
          </PillarErrorBoundary>
        </div>
        {showAds && <AdBanner type="skyscraper-right" />}
      </main>

      <SiteFooter
        onNavigatePillar={setActivePillar}
        onOpenSupporter={() => {
          setAccountModalPanel('supporter');
          setShowAccountModal(true);
        }}
      />

      <Suspense fallback={null}>
        {showArchModal && <ArchitectureModal onClose={() => setShowArchModal(false)} />}
        {showQrModal && <QrModal onClose={() => setShowQrModal(false)} />}
        {showAccountModal && (
          <UserAccountModal
            onClose={() => setShowAccountModal(false)}
            initialPanel={accountModalPanel}
          />
        )}
        {showSecurityModal && <SecurityTrustModal onClose={() => setShowSecurityModal(false)} />}
        {showShortcutsModal && (
          <KeyboardShortcutsModal onClose={() => setShowShortcutsModal(false)} />
        )}
      </Suspense>

      {shortcutToast && (
        <ShortcutToast message={shortcutToast} onDone={() => setShortcutToast(null)} />
      )}
    </div>
  );
}
