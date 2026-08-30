import React, { useState, useEffect, Suspense, lazy } from 'react';
import { fetchBillingStatus, getLocalEntitlements } from './lib/billing';
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
import { LIGHT_MODE_ENABLED } from './lib/themeFlags';

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
const QrModal = lazy(() => import('./components/QrModal').then(m => ({ default: m.QrModal || m.default })));
const UserAccountModal = lazy(() => import('./components/UserAccountModal').then(m => ({ default: m.UserAccountModal || m.default })));
const SecurityTrustModal = lazy(() => import('./components/SecurityTrustModal').then(m => ({ default: m.SecurityTrustModal || m.default })));
const KeyboardShortcutsModal = lazy(() => import('./components/KeyboardShortcutsModal').then(m => ({ default: m.KeyboardShortcutsModal })));

export default function App() {
  const [activePillar, setActivePillar] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true); // light mode gated by LIGHT_MODE_ENABLED
  const [showAds, setShowAds] = useState(true);
  const [isSupporter, setIsSupporter] = useState(() => getLocalEntitlements().supporter);
  const [primaryCity, setPrimaryCity] = useState<City | undefined>();
  const [selectedCityFromSearch, setSelectedCityFromSearch] = useState<City | undefined>();
  const [showArchModal, setShowArchModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [accountModalPanel, setAccountModalPanel] = useState<'account' | 'supporter'>('account');
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [shortcutToast, setShortcutToast] = useState<string | null>(null);

  useEffect(() => {
    // Light mode disabled product-side: always force dark when flag is false
    const dark = LIGHT_MODE_ENABLED ? isDarkMode : true;
    if (!LIGHT_MODE_ENABLED && !isDarkMode) setIsDarkMode(true);
    document.documentElement.classList.toggle('dark', dark);
  }, [isDarkMode]);

  useEffect(() => {
    fetchBillingStatus().then((s) => {
      if (s?.supporter) setIsSupporter(true);
    }).catch(() => {});
  }, []);

  useGlobalShortcuts({
    setActivePillar,
    setShowShortcutsModal,
    setShortcutToast,
  });

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-slate-100">
      <AdSenseLoader />
      <Header
        activePillar={activePillar}
        setActivePillar={setActivePillar}
        onOpenArch={() => setShowArchModal(true)}
        onOpenQr={() => setShowQrModal(true)}
        onOpenAccount={() => {
          setAccountModalPanel('account');
          setShowAccountModal(true);
        }}
        onOpenSecurity={() => setShowSecurityModal(true)}
        onOpenShortcutsModal={() => setShowShortcutsModal(true)}
        onSearchSelectCity={(c) => {
          setSelectedCityFromSearch(c);
          setPrimaryCity(c);
          setActivePillar(1);
        }}
        isDarkMode={isDarkMode}
        setIsDarkMode={LIGHT_MODE_ENABLED ? setIsDarkMode : undefined}
        showAds={showAds}
        setShowAds={setShowAds}
        isSupporter={isSupporter}
      />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-3 sm:px-4 py-3 flex gap-3">
        {showAds && !isSupporter && <AdBanner type="skyscraper-left" />}
        <div className="flex-1 min-w-0">
          {showAds && !isSupporter && <AdBanner type="leaderboard" />}
          <PillarErrorBoundary>
            <Suspense fallback={<PillarLoader />}>
              {activePillar === 1 && (
                <PillarChrome pillarId={1}>
                  <WorldClockPillar
                    isDarkMode={isDarkMode}
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
        {showAds && !isSupporter && <AdBanner type="skyscraper-right" />}
      </main>

      <SiteFooter
        onNavigatePillar={setActivePillar}
        onOpenSupporter={() => {
          setAccountModalPanel('supporter');
          setShowAccountModal(true);
        }}
        onOpenAccount={() => {
          setAccountModalPanel('account');
          setShowAccountModal(true);
        }}
        onOpenSecurity={() => setShowSecurityModal(true)}
      />

      <Suspense fallback={null}>
        {showArchModal && (
          <ArchitectureModal isOpen={showArchModal} onClose={() => setShowArchModal(false)} />
        )}
        {showQrModal && <QrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />}
        {showAccountModal && (
          <UserAccountModal
            isOpen={showAccountModal}
            onClose={() => setShowAccountModal(false)}
            initialPanel={accountModalPanel}
          />
        )}
        {showSecurityModal && (
          <SecurityTrustModal isOpen={showSecurityModal} onClose={() => setShowSecurityModal(false)} />
        )}
        {showShortcutsModal && (
          <KeyboardShortcutsModal
            isOpen={showShortcutsModal}
            onClose={() => setShowShortcutsModal(false)}
          />
        )}
      </Suspense>

      {shortcutToast && (
        <ShortcutToast message={shortcutToast} onDone={() => setShortcutToast(null)} />
      )}
    </div>
  );
}
