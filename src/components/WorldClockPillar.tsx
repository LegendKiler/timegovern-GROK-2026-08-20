import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  Clock,
  Calendar,
  Globe,
  Share2,
  Plus,
  Trash2,
  ArrowRight,
  Check,
  Sun,
  Moon,
  Sliders,
  MapPin,
  AlertTriangle,
  ExternalLink,
  Download,
  LayoutGrid,
  List,
  Users,
  Sparkles,
  Compass,
  ArrowRightLeft,
  SunMedium,
  MoonStar,
  Zap,
  CheckCircle2,
  Map,
  Star,
  Pin,
  Bookmark,
  RotateCcw,
  Filter
} from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import {
  getPinnedCities,
  isCityPinned,
  togglePinCity,
  pinCity,
  unpinCity,
  resetPinnedCities,
  subscribeToPinnedCities
} from '../lib/pinnedCitiesStorage';
import { City, TimezoneOffsetInfo } from '../types';
import {
  getTimezoneOffsetInfo,
  formatCityDateTime,
  getHourSuitability,
  encodeSharedEvent,
  decodeSharedEvent
} from '../lib/timezoneUtils';
import { AdBanner } from './AdBanner';
import { AnalogClock } from './AnalogClock';
import { AnimatedDigitalClock } from './AnimatedDigitalClock';
import { WorldMapCanvas } from './WorldMapCanvas';
import { InteractiveTimezoneMap } from './InteractiveTimezoneMap';
import { InteractiveGlobe3D } from './InteractiveGlobe3D';
import { MeetingPlanner } from './MeetingPlanner';
import { GlobalTimeOffsetConverter } from './GlobalTimeOffsetConverter';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../lib/icsGenerator';

interface WorldClockPillarProps {
  selectedCityFromSearch?: City;
}

// Quick Hub Switcher Cities
const QUICK_SWITCHER_CITIES = [
  'nyc',
  'lon',
  'par',
  'dxb',
  'tyo',
  'syd',
  'sin',
  'hkg',
  'lax',
  'sao',
  'cai',
  'ber',
  'del'
];

export const WorldClockPillar: React.FC<WorldClockPillarProps> = ({ selectedCityFromSearch }) => {
  const [subTab, setSubTab] = useState<'clock' | '3d-globe' | 'converter' | 'map' | 'announcer' | 'regions'>('clock');
  const [selectedRegion, setSelectedRegion] = useState<string>('africa');
  const [clockDisplayStyle, setClockDisplayStyle] = useState<'grid' | 'table'>('grid');
  const [digitAnimationMode, setDigitAnimationMode] = useState<'flip' | 'slide'>('flip');
  const [filterOnlyPinned, setFilterOnlyPinned] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  // Pinned cities state synced with localStorage
  const [pinnedCities, setPinnedCities] = useState<City[]>(() => getPinnedCities());

  // Watchlist cities for World Clock
  const [watchList, setWatchList] = useState<City[]>(() => {
    const saved = getPinnedCities();
    if (saved && saved.length > 0) return saved;
    return [
      MAJOR_CITIES.find((c) => c.id === 'nyc')!,
      MAJOR_CITIES.find((c) => c.id === 'lon')!,
      MAJOR_CITIES.find((c) => c.id === 'par')!,
      MAJOR_CITIES.find((c) => c.id === 'tyo')!,
      MAJOR_CITIES.find((c) => c.id === 'syd')!,
      MAJOR_CITIES.find((c) => c.id === 'dxb')!
    ];
  });

  // Active Focal City for hero preview & smooth timezone switching
  const [focalCity, setFocalCity] = useState<City>(() => {
    return selectedCityFromSearch || MAJOR_CITIES.find((c) => c.id === 'lon')! || MAJOR_CITIES[0];
  });

  const [addCityQuery, setAddCityQuery] = useState('');
  const [addCityResults, setAddCityResults] = useState<City[]>([]);

  // Meeting Planner cities
  const [plannerCities, setPlannerCities] = useState<City[]>([
    MAJOR_CITIES.find((c) => c.id === 'nyc')!,
    MAJOR_CITIES.find((c) => c.id === 'lon')!,
    MAJOR_CITIES.find((c) => c.id === 'tyo')!
  ]);
  const [scrubHour, setScrubHour] = useState<number>(new Date().getHours());

  // Event Announcer state
  const [eventTitle, setEventTitle] = useState('Global Tech Launch 2026');
  const [eventDateStr, setEventDateStr] = useState('2026-09-15');
  const [eventTimeStr, setEventTimeStr] = useState('14:00');
  const [eventOriginCity, setEventOriginCity] = useState<City>(MAJOR_CITIES[0]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareableUrl, setShareableUrl] = useState('');

  // DOM Refs for GSAP animations
  const tabContentRef = useRef<HTMLDivElement>(null);
  const focalCardRef = useRef<HTMLDivElement>(null);
  const focalTimeRef = useRef<HTMLDivElement>(null);
  const focalMetaRef = useRef<HTMLDivElement>(null);
  const focalAnalogRef = useRef<HTMLDivElement>(null);
  const matrixContainerRef = useRef<HTMLDivElement>(null);
  const regionGridRef = useRef<HTMLDivElement>(null);
  const quickPillContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to real-time localStorage pinned cities changes
  useEffect(() => {
    setPinnedCities(getPinnedCities());
    const unsubscribe = subscribeToPinnedCities((updated) => {
      setPinnedCities(updated);
    });
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleTogglePinCity = (city: City) => {
    const { isPinned, cities } = togglePinCity(city);
    setPinnedCities(cities);
    showToast(isPinned ? `★ Pinned "${city.name}" to Local Storage` : `Removed "${city.name}" from Pinned Cities`);
  };

  const handleResetPinnedDefaults = () => {
    const defaults = resetPinnedCities();
    setPinnedCities(defaults);
    // Also update watchlist with defaults
    setWatchList(defaults);
    showToast('Reset Pinned Cities to Global Hub Defaults (Saved in Local Storage)');
  };

  // Ticking clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update watchlist & focal city if parent search passes a city
  useEffect(() => {
    if (selectedCityFromSearch) {
      setFocalCity(selectedCityFromSearch);
      if (!watchList.some((c) => c.id === selectedCityFromSearch.id)) {
        setWatchList((prev) => [selectedCityFromSearch, ...prev]);
      }
      if (!plannerCities.some((c) => c.id === selectedCityFromSearch.id)) {
        setPlannerCities((prev) => [...prev, selectedCityFromSearch]);
      }
    }
  }, [selectedCityFromSearch]);

  // -------------------------------------------------------------
  // GSAP ANIMATION 1: Subtle transition when switching focal city timezone
  // -------------------------------------------------------------
  useEffect(() => {
    if (!focalCardRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Subtle elevation & glow pulse on focal card
      gsap.fromTo(
        focalCardRef.current,
        {
          opacity: 0.65,
          y: 8,
          scale: 0.985
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out'
        }
      );

      // 2. Staggered reveal of digital time digits & city header
      if (focalTimeRef.current) {
        gsap.fromTo(
          focalTimeRef.current.children,
          {
            opacity: 0,
            y: -10,
            scale: 0.96
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.35,
            stagger: 0.04,
            ease: 'back.out(1.4)'
          }
        );
      }

      // 3. Staggered slide of timezone metadata & badges
      if (focalMetaRef.current) {
        gsap.fromTo(
          focalMetaRef.current.children,
          {
            opacity: 0,
            x: 10
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            stagger: 0.03,
            ease: 'power2.out'
          }
        );
      }

      // 4. Smooth clock rotation micro-entrance
      if (focalAnalogRef.current) {
        gsap.fromTo(
          focalAnalogRef.current,
          {
            scale: 0.9,
            opacity: 0.5,
            rotation: -8
          },
          {
            scale: 1,
            opacity: 1,
            rotation: 0,
            duration: 0.45,
            ease: 'back.out(1.5)'
          }
        );
      }
    }, focalCardRef);

    return () => ctx.revert();
  }, [focalCity.id]);

  // -------------------------------------------------------------
  // GSAP ANIMATION 2: Transition when switching subTabs
  // -------------------------------------------------------------
  useEffect(() => {
    if (!tabContentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        tabContentRef.current,
        {
          opacity: 0,
          y: 10
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.32,
          ease: 'power2.out'
        }
      );
    }, tabContentRef);

    return () => ctx.revert();
  }, [subTab]);

  // -------------------------------------------------------------
  // GSAP ANIMATION 3: Staggered entrance for World Clock city cards
  // -------------------------------------------------------------
  useEffect(() => {
    if (!matrixContainerRef.current || subTab !== 'clock') return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.world-clock-city-card',
        {
          opacity: 0,
          y: 14,
          scale: 0.97
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.035,
          ease: 'power2.out'
        }
      );
    }, matrixContainerRef);

    return () => ctx.revert();
  }, [watchList.length, clockDisplayStyle, subTab]);

  // -------------------------------------------------------------
  // GSAP ANIMATION 4: Staggered entrance for Region Directory cards
  // -------------------------------------------------------------
  useEffect(() => {
    if (!regionGridRef.current || subTab !== 'regions') return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.region-city-card',
        {
          opacity: 0,
          y: 12,
          scale: 0.98
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          stagger: 0.025,
          ease: 'power2.out'
        }
      );
    }, regionGridRef);

    return () => ctx.revert();
  }, [selectedRegion, subTab]);

  // Handle focal city switch with micro-interaction
  const handleSelectFocalCity = (city: City) => {
    setFocalCity(city);
    // Ensure city is in watchlist
    if (!watchList.some((c) => c.id === city.id)) {
      setWatchList((prev) => [city, ...prev]);
    }
  };

  // Handle switching to Meeting Planner with a specific city
  const handlePlanMeetingWithCity = (city: City) => {
    if (!plannerCities.some(c => c.id === city.id)) {
      setPlannerCities(prev => [city, ...prev]);
    }
    setSubTab('converter');
  };

  const handleAddCityToWatchlist = (city: City) => {
    if (!watchList.some((c) => c.id === city.id)) {
      setWatchList([...watchList, city]);
    }
    setFocalCity(city);
    setAddCityQuery('');
    setAddCityResults([]);
  };

  const handleRemoveFromWatchlist = (id: string) => {
    const nextList = watchList.filter((c) => c.id !== id);
    setWatchList(nextList);
    if (focalCity.id === id && nextList.length > 0) {
      setFocalCity(nextList[0]);
    }
  };

  const handleGenerateEventLink = () => {
    const [h, m] = eventTimeStr.split(':').map(Number);
    const d = new Date(`${eventDateStr}T${eventTimeStr}:00`);
    const encoded = encodeSharedEvent(eventTitle, d.getTime(), eventOriginCity.id);
    const fullUrl = `${window.location.origin}${window.location.pathname}?event=${encoded}`;
    setShareableUrl(fullUrl);
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Focal City details
  const focalOffsetInfo = getTimezoneOffsetInfo(now, focalCity.timezone);
  const focalFormatted = formatCityDateTime(now, focalCity.timezone, true);
  const focalCityDate = new Date(now.toLocaleString('en-US', { timeZone: focalCity.timezone }));
  const focalHour = focalCityDate.getHours();
  const isDaytime = focalHour >= 6 && focalHour < 18;

  // Local user time vs Focal City offset difference
  const userLocalMinutes = -new Date().getTimezoneOffset();
  const focalOffsetMinutes = focalOffsetInfo.offsetMinutes;
  const diffMinutes = focalOffsetMinutes - userLocalMinutes;
  const diffHours = diffMinutes / 60;
  const diffFormatted =
    diffHours === 0
      ? 'Same time as your device'
      : diffHours > 0
      ? `+${diffHours.toFixed(diffHours % 1 === 0 ? 0 : 1)}h ahead of your device`
      : `${diffHours.toFixed(diffHours % 1 === 0 ? 0 : 1)}h behind your device`;

  return (
    <div className="space-y-6">
      {/* Pillar Header / Sub-tabs */}
      <div className="bg-white dark:bg-[#0b101f] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm dark:shadow-xl text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2.5">
              <Clock className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              1. World Clock & Global Time Zone Hub
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Real-time second-by-second updates for 5,000+ cities, DST shift calculators & meeting planner.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#070b14] p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setSubTab('clock')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                subTab === 'clock'
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              World Clock
            </button>
            <button
              onClick={() => setSubTab('3d-globe')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === '3d-globe'
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md ring-2 ring-amber-300/60'
                  : 'text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-500/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>3D Globe WebGL</span>
            </button>
            <button
              onClick={() => setSubTab('converter')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                subTab === 'converter'
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Meeting Planner & Overlap</span>
            </button>
            <button
              onClick={() => setSubTab('map')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                subTab === 'map'
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              Time Zone Map
            </button>
            <button
              onClick={() => setSubTab('announcer')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                subTab === 'announcer'
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              Event Announcer
            </button>
            <button
              onClick={() => setSubTab('regions')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                subTab === 'regions'
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              World Regions Directory
            </button>
          </div>
        </div>

        {/* GSAP Animated Tab Content Container */}
        <div ref={tabContentRef}>
          {/* ----------------- SUB TAB 1: WORLD CLOCK ----------------- */}
          {subTab === 'clock' && (
            <div className="mt-5 space-y-6">
              {/* 1. Global Pinned Cities & Quick Hub Switcher (Saved to Local Storage) */}
              <div className="space-y-2.5 bg-slate-100/70 dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                      <span>Pinned Cities Quick Hub:</span>
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                      {pinnedCities.length} Saved in Local Storage
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePinCity(focalCity)}
                      className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                      title="Pin currently focused city"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCityPinned(focalCity.id) ? 'Unpin Active City' : 'Pin Active City'}</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <button
                      type="button"
                      onClick={handleResetPinnedDefaults}
                      className="text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
                      title="Reset pinned list to default world hub cities"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset Defaults</span>
                    </button>
                  </div>
                </div>

                <div
                  ref={quickPillContainerRef}
                  className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
                >
                  {pinnedCities.map((city) => {
                    const offset = getTimezoneOffsetInfo(now, city.timezone);
                    const cityTime = formatCityDateTime(now, city.timezone);
                    const isSelected = focalCity.id === city.id;

                    return (
                      <div
                        key={city.id}
                        className={`group rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border shrink-0 pl-3 pr-2 py-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-cyan-500 dark:to-blue-600 text-white font-bold shadow-md ring-2 ring-blue-400/40 border-transparent scale-105'
                            : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                        onClick={() => handleSelectFocalCity(city)}
                      >
                        <Star className={`w-3 h-3 shrink-0 ${isSelected ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'}`} />
                        <span className="font-bold">{city.name}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                            isSelected
                              ? 'bg-black/30 text-cyan-200'
                              : 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400'
                          }`}
                        >
                          {cityTime.timeStr}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-1 rounded ${
                            isSelected
                              ? 'bg-white/20 text-white'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {offset.abbreviation}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePinCity(city);
                          }}
                          className={`p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer ml-0.5 ${
                            isSelected ? 'text-white/70 hover:text-white' : 'text-slate-400 hover:text-red-500'
                          }`}
                          title={`Unpin ${city.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Hero Focal Timezone Spotlight Card (GSAP Transitioned) */}
              <div
                ref={focalCardRef}
                className={`relative overflow-hidden rounded-2xl border transition-all shadow-md p-5 sm:p-6 ${
                  isDaytime
                    ? 'bg-gradient-to-br from-blue-50/80 via-white to-amber-50/40 dark:from-slate-900 dark:via-[#0c1427] dark:to-[#17233f] border-blue-200 dark:border-blue-500/40'
                    : 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-purple-950/30 border-indigo-500/40 dark:border-indigo-500/50'
                }`}
              >
                {/* Decorative Background Glow */}
                <div
                  className={`absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${
                    isDaytime ? 'bg-amber-400' : 'bg-blue-600'
                  }`}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  {/* Left Column: City & Digital Time Info */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600/10 dark:bg-cyan-500/20 text-blue-700 dark:text-cyan-300 border border-blue-500/30 text-xs font-extrabold flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5" />
                        <span>FOCAL TIME ZONE</span>
                      </span>

                      {isCityPinned(focalCity.id) && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] uppercase tracking-wide border border-amber-500/40 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>PINNED CITY</span>
                        </span>
                      )}

                      {focalCity.isCapital && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wide border border-amber-500/30">
                          National Capital
                        </span>
                      )}

                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {focalCity.timezone} ({focalOffsetInfo.offsetFormatted})
                      </span>
                    </div>

                    <div ref={focalTimeRef} className="space-y-1">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                          {focalCity.name}
                        </h2>
                        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                          {focalCity.country} ({focalCity.countryCode})
                        </span>
                      </div>

                      <div className="flex items-baseline gap-3 flex-wrap">
                        <AnimatedDigitalClock
                          timeStr={focalFormatted.timeStr}
                          animationStyle={digitAnimationMode}
                          className="text-4xl sm:text-5xl lg:text-6xl font-black font-mono tracking-tight text-blue-600 dark:text-cyan-400"
                          colonClassName="text-blue-400/80 dark:text-cyan-300/80"
                          amPmClassName="text-xl sm:text-2xl font-black text-blue-700 dark:text-cyan-300 ml-2"
                        />
                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          {focalFormatted.dateStr}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Badges & Comparison */}
                    <div ref={focalMetaRef} className="flex flex-wrap items-center gap-2 pt-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />
                        <span>{diffFormatted}</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {isDaytime ? (
                          <>
                            <SunMedium className="w-3.5 h-3.5 text-amber-500" />
                            <span>Daylight Hours (Solar Noon ~12:00)</span>
                          </>
                        ) : (
                          <>
                            <MoonStar className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Nighttime Hours</span>
                          </>
                        )}
                      </div>

                      {focalOffsetInfo.isDst ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                          <span>Daylight Saving Active (+1 hr)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                          <span>Standard Astronomical Time</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      {/* Quick Pin Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleTogglePinCity(focalCity)}
                        className={`px-4 py-2 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isCityPinned(focalCity.id)
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-500 shadow-amber-500/20'
                            : 'bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-300 dark:border-slate-700'
                        }`}
                        title={isCityPinned(focalCity.id) ? 'Saved in Local Storage (Click to unpin)' : 'Save to Local Storage for quick access'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isCityPinned(focalCity.id) ? 'fill-slate-950 text-slate-950' : 'text-amber-500'}`} />
                        <span>{isCityPinned(focalCity.id) ? '★ Pinned to Storage' : 'Pin to Storage (★)'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePlanMeetingWithCity(focalCity)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Plan Meeting with {focalCity.name}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSubTab('map');
                        }}
                        className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Map className="w-3.5 h-3.5 text-cyan-200" />
                        <span>Timezone Map</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSubTab('3d-globe');
                        }}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5 border border-slate-300 dark:border-slate-700"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-500" />
                        <span>3D Globe</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Hero Analog Clock Display */}
                  <div
                    ref={focalAnalogRef}
                    className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-white/60 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-xs"
                  >
                    <AnalogClock date={focalCityDate} size={140} cityName={focalCity.name} />
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-2">
                      Live Quartz Synchronization
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Quick Add City & Matrix View Toggle & Pinned Filter */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> Add City to Watchlist:
                </span>
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      value={addCityQuery}
                      onChange={(e) => {
                        setAddCityQuery(e.target.value);
                        setAddCityResults(searchCities(e.target.value, 6));
                      }}
                      placeholder="Type city name (e.g. Zurich, Singapore)..."
                      className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                    />
                    {addCityQuery && addCityResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {addCityResults.map((c) => {
                          const isPinned = isCityPinned(c.id);
                          return (
                            <div
                              key={c.id}
                              onClick={() => handleAddCityToWatchlist(c)}
                              className="px-3 py-2 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex justify-between items-center cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePinCity(c);
                                  }}
                                  className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                                  title={isPinned ? 'Unpin city' : 'Pin city to storage'}
                                >
                                  <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                                </button>
                                <span>{c.name}, {c.country}</span>
                              </div>
                              <span className="text-[10px] text-blue-500 dark:text-cyan-400">{c.timezone}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Filter Pinned Cities Only Toggle */}
                  <button
                    type="button"
                    onClick={() => setFilterOnlyPinned(!filterOnlyPinned)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                      filterOnlyPinned
                        ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Toggle filter to show only pinned cities"
                  >
                    <Star className={`w-3.5 h-3.5 ${filterOnlyPinned ? 'fill-slate-950 text-slate-950' : 'text-amber-500'}`} />
                    <span>{filterOnlyPinned ? 'Showing Pinned' : 'Only Pinned'}</span>
                  </button>

                  {/* Animation Style Mode Selector */}
                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-lg text-xs" title="Clock Digit Transition Style">
                    <button
                      onClick={() => setDigitAnimationMode('flip')}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        digitAnimationMode === 'flip'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      3D Flip
                    </button>
                    <button
                      onClick={() => setDigitAnimationMode('slide')}
                      className={`px-2 py-1 rounded text-[11px] font-bold cursor-pointer transition-all ${
                        digitAnimationMode === 'slide'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      Slide
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-lg text-xs">
                    <button
                      onClick={() => setClockDisplayStyle('grid')}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                        clockDisplayStyle === 'grid'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title="Analog & Digital Card Grid"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setClockDisplayStyle('table')}
                      className={`p-1.5 rounded-md cursor-pointer transition-colors ${
                        clockDisplayStyle === 'table'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                      title="Data Table View"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* 4. Watchlist Grid View with Staggered Entrance */}
              <div ref={matrixContainerRef}>
                {clockDisplayStyle === 'grid' && (
                  <div>
                    {watchList.filter((c) => !filterOnlyPinned || isCityPinned(c.id)).length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Star className="w-8 h-8 text-amber-400 fill-amber-400/20 mx-auto mb-2" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Pinned Cities in Current View</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                          Click the star (★) icon on any city card to save it to your local storage, or reset to global hubs.
                        </p>
                        <div className="mt-3 flex items-center justify-center gap-3">
                          <button
                            onClick={() => setFilterOnlyPinned(false)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Show All Cities
                          </button>
                          <button
                            onClick={handleResetPinnedDefaults}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Reset Defaults
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {watchList
                          .filter((c) => !filterOnlyPinned || isCityPinned(c.id))
                          .map((city) => {
                            const offsetInfo = getTimezoneOffsetInfo(now, city.timezone);
                            const formatted = formatCityDateTime(now, city.timezone, true);
                            const isFocal = focalCity.id === city.id;
                            const isPinned = isCityPinned(city.id);
                            const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));

                            return (
                              <div
                                key={city.id}
                                onClick={() => handleSelectFocalCity(city)}
                                className={`world-clock-city-card bg-white dark:bg-slate-900 border rounded-xl p-4 shadow-xs transition-all flex flex-col justify-between cursor-pointer ${
                                  isFocal
                                    ? 'border-blue-500 dark:border-cyan-400 ring-2 ring-blue-400/30 shadow-md'
                                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-400/50'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">{city.name}</h3>
                                      <span className="text-[10px] text-slate-500">({city.countryCode})</span>
                                      {isFocal && (
                                        <span className="text-[9px] font-bold bg-blue-500/20 text-blue-600 dark:text-cyan-300 px-1.5 py-0.2 rounded">
                                          ACTIVE
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-blue-500 dark:text-cyan-400 block mt-0.5">
                                      {offsetInfo.abbreviation} • {offsetInfo.offsetFormatted}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTogglePinCity(city);
                                      }}
                                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                        isPinned
                                          ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40'
                                          : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                      title={isPinned ? 'Unpin city from local storage' : 'Pin city to local storage'}
                                    >
                                      <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFromWatchlist(city.id);
                                      }}
                                      className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                      title="Remove from watchlist"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                <div className="my-3 flex items-center justify-around">
                                  <AnalogClock date={cityDate} size={88} />
                                  <div className="text-right">
                                    <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white block">
                                      <AnimatedDigitalClock
                                        timeStr={formatted.timeStr}
                                        animationStyle={digitAnimationMode}
                                        className="text-2xl font-extrabold"
                                        colonClassName="text-slate-400 dark:text-slate-500"
                                        amPmClassName="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1"
                                      />
                                    </div>
                                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                                      {formatted.dateStr}
                                    </span>
                                    <div className="mt-2 flex items-center justify-end gap-1">
                                      {isPinned && (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-300 dark:border-amber-700/60">
                                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Pinned
                                        </span>
                                      )}
                                      {offsetInfo.isDst ? (
                                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                                          <Sun className="w-3 h-3 text-amber-400" /> DST
                                        </span>
                                      ) : (
                                        <span className="text-[9px] text-slate-500">Standard</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlanMeetingWithCity(city);
                                    }}
                                    className="w-full text-center py-1.5 px-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-700 dark:text-cyan-300 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Plan Meeting with {city.name}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}

                {/* Live Data Table View */}
                {clockDisplayStyle === 'table' && (
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 w-8">Pin</th>
                          <th className="p-3">Location / City</th>
                          <th className="p-3">Country</th>
                          <th className="p-3">Local Time (Live)</th>
                          <th className="p-3">Timezone / Abbr</th>
                          <th className="p-3">UTC Offset</th>
                          <th className="p-3">DST Status</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {watchList
                          .filter((c) => !filterOnlyPinned || isCityPinned(c.id))
                          .map((city) => {
                            const offsetInfo = getTimezoneOffsetInfo(now, city.timezone);
                            const formatted = formatCityDateTime(now, city.timezone, true);
                            const isFocal = focalCity.id === city.id;
                            const isPinned = isCityPinned(city.id);

                            return (
                              <tr
                                key={city.id}
                                onClick={() => handleSelectFocalCity(city)}
                                className={`world-clock-city-card cursor-pointer transition-colors ${
                                  isFocal
                                    ? 'bg-blue-50/60 dark:bg-blue-950/30'
                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <td className="p-3">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePinCity(city);
                                    }}
                                    className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                                    title={isPinned ? 'Unpin from local storage' : 'Pin to local storage'}
                                  >
                                    <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                  </button>
                                </td>
                                <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                  <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                  <span>{city.name}</span>
                                  {city.isCapital && (
                                    <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1 py-0.2 rounded">
                                      CAPITAL
                                    </span>
                                  )}
                                </td>
                                <td className="p-3 text-slate-600 dark:text-slate-300">{city.country}</td>
                                <td className="p-3 font-mono font-bold text-slate-900 dark:text-cyan-300 text-sm">
                                  <AnimatedDigitalClock
                                    timeStr={formatted.timeStr}
                                    animationStyle={digitAnimationMode}
                                    className="text-sm font-bold text-slate-900 dark:text-cyan-300"
                                    colonClassName="text-blue-400/70 dark:text-cyan-400/70"
                                    amPmClassName="text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-1"
                                  />
                                  <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">
                                    {formatted.dateStr}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                    {offsetInfo.abbreviation}
                                  </span>
                                </td>
                                <td className="p-3 font-mono text-slate-600 dark:text-slate-400">
                                  {offsetInfo.offsetFormatted}
                                </td>
                                <td className="p-3">
                                  {offsetInfo.isDst ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                                      <Sun className="w-3 h-3" /> DST Active (+1h)
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Standard Time</span>
                                  )}
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handlePlanMeetingWithCity(city);
                                      }}
                                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900 text-blue-600 dark:text-cyan-300 text-[11px] font-bold rounded flex items-center gap-1 transition-colors cursor-pointer"
                                      title={`Plan Meeting with ${city.name}`}
                                    >
                                      <Users className="w-3 h-3" />
                                      <span>Plan</span>
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFromWatchlist(city.id);
                                      }}
                                      className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                                      title="Remove city"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* In-Feed Native Sponsored Unit */}
              <AdBanner type="in-feed" />
            </div>
          )}

        {/* ----------------- SUB TAB 2: MEETING PLANNER & DST ----------------- */}
        {subTab === 'converter' && (
          <div className="mt-4 space-y-6">
            {/* Global Atomic Time Offset Converter */}
            <GlobalTimeOffsetConverter />

            {/* Primary Meeting Planner Utility */}
            <MeetingPlanner 
              initialCities={plannerCities} 
              onAddCityToWatchlist={handleAddCityToWatchlist} 
            />

            {/* Upcoming DST Shifts Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-white">
              <h3 className="text-sm font-extrabold text-white mb-2 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Upcoming Daylight Saving Time (DST) Transitions (2026/2027)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Upcoming clock changes for major global time zones ("Spring Forward" / "Fall Back"). All timezone calculations in Meeting Planner automatically account for these shifts!
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3">Region / Timezone</th>
                      <th className="p-3">Next Transition Date</th>
                      <th className="p-3">Direction</th>
                      <th className="p-3">New Offset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-3 font-bold text-white">North America (US / Canada - Eastern Time)</td>
                      <td className="p-3 font-mono text-amber-400">Sunday, Nov 1, 2026 @ 02:00 AM</td>
                      <td className="p-3"><span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-800 font-bold">FALL BACK (-1h)</span></td>
                      <td className="p-3 font-mono">EST (UTC-5)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">United Kingdom (GMT / BST)</td>
                      <td className="p-3 font-mono text-amber-400">Sunday, Oct 25, 2026 @ 02:00 AM</td>
                      <td className="p-3"><span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-800 font-bold">FALL BACK (-1h)</span></td>
                      <td className="p-3 font-mono">GMT (UTC+0)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Central Europe (CET / CEST)</td>
                      <td className="p-3 font-mono text-amber-400">Sunday, Oct 25, 2026 @ 03:00 AM</td>
                      <td className="p-3"><span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-800 font-bold">FALL BACK (-1h)</span></td>
                      <td className="p-3 font-mono">CET (UTC+1)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Australia (AEST - Sydney/Melbourne)</td>
                      <td className="p-3 font-mono text-emerald-400">Sunday, Oct 4, 2026 @ 02:00 AM</td>
                      <td className="p-3"><span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800 font-bold">SPRING FORWARD (+1h)</span></td>
                      <td className="p-3 font-mono">AEDT (UTC+11)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- SUB TAB 2: 3D INTERACTIVE GLOBE ----------------- */}
        {subTab === '3d-globe' && (
          <div className="mt-4 space-y-4">
            <InteractiveGlobe3D
              onAddCityToWatchlist={(c) => handleAddCityToWatchlist(c)}
            />
          </div>
        )}

        {/* ----------------- SUB TAB 3: TIME ZONE MAP ----------------- */}
        {subTab === 'map' && (
          <div className="mt-4 space-y-4">
            <WorldMapCanvas
              onSelectCity={(c) => handleAddCityToWatchlist(c)}
              selectedCityId={watchList[0]?.id}
            />
          </div>
        )}

        {/* ----------------- SUB TAB 4: EVENT ANNOUNCER ----------------- */}
        {subTab === 'announcer' && (
          <div className="mt-4 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Share2 className="w-4 h-4 text-blue-600" /> Event Time Announcer Link Generator
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={eventDateStr}
                    onChange={(e) => setEventDateStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Local Time
                  </label>
                  <input
                    type="time"
                    value={eventTimeStr}
                    onChange={(e) => setEventTimeStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Reference City
                  </label>
                  <select
                    value={eventOriginCity.id}
                    onChange={(e) => {
                      const c = MAJOR_CITIES.find((x) => x.id === e.target.value);
                      if (c) setEventOriginCity(c);
                    }}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    {MAJOR_CITIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.country})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={handleGenerateEventLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copiedLink ? 'Link Copied to Clipboard!' : 'Generate Shareable Link'}
                </button>
              </div>

              {shareableUrl && (
                <div className="mt-3 p-2.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded font-mono text-xs text-blue-700 dark:text-blue-300 break-all">
                  {shareableUrl}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ----------------- SUB TAB 5: WORLD REGIONS DIRECTORY ----------------- */}
        {subTab === 'regions' && (
          <div className="mt-4 space-y-5">
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              {[
                { id: 'africa', label: 'Africa & Sub-Sahara' },
                { id: 'north-africa', label: 'North Africa & Maghreb' },
                { id: 'middle-east', label: 'Middle East & Levant' },
                { id: 'asia', label: 'Asia & Far East' },
                { id: 'europe', label: 'Europe & UK' },
                { id: 'north-america', label: 'North America' },
                { id: 'south-america', label: 'South America' },
                { id: 'australasia', label: 'Australasia & Oceania' }
              ].map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => setSelectedRegion(reg.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedRegion === reg.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {reg.label}
                </button>
              ))}
            </div>

            {/* Region City Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MAJOR_CITIES.filter((city) => {
                const tz = city.timezone;
                if (selectedRegion === 'africa') return tz.startsWith('Africa/') && !['Africa/Cairo', 'Africa/Casablanca', 'Africa/Algiers', 'Africa/Tunis'].includes(tz);
                if (selectedRegion === 'north-africa') return ['Africa/Cairo', 'Africa/Casablanca', 'Africa/Algiers', 'Africa/Tunis'].includes(tz);
                if (selectedRegion === 'middle-east') return ['Asia/Dubai', 'Asia/Riyadh', 'Asia/Qatar', 'Asia/Kuwait', 'Asia/Muscat', 'Asia/Tel_Aviv', 'Asia/Baghdad', 'Asia/Tehran'].includes(tz);
                if (selectedRegion === 'asia') return tz.startsWith('Asia/') && !['Asia/Dubai', 'Asia/Riyadh', 'Asia/Qatar', 'Asia/Kuwait', 'Asia/Muscat', 'Asia/Tel_Aviv', 'Asia/Baghdad', 'Asia/Tehran'].includes(tz);
                if (selectedRegion === 'europe') return tz.startsWith('Europe/');
                if (selectedRegion === 'north-america') return tz.startsWith('America/') && ['United States', 'Canada', 'Mexico'].includes(city.country);
                if (selectedRegion === 'south-america') return tz.startsWith('America/') && !['United States', 'Canada', 'Mexico'].includes(city.country);
                if (selectedRegion === 'australasia') return tz.startsWith('Australia/') || tz.startsWith('Pacific/');
                return true;
              }).map((city) => {
                const tzInfo = getTimezoneOffsetInfo(now, city.timezone);
                const cityTime = formatCityDateTime(now, city.timezone);
                const isPinned = isCityPinned(city.id);

                return (
                  <div key={city.id} className="region-city-card bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex items-center justify-between shadow-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePinCity(city)}
                          className="p-0.5 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer"
                          title={isPinned ? 'Unpin city' : 'Pin city to local storage'}
                        >
                          <Star className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-400 text-amber-400' : 'text-slate-400'}`} />
                        </button>
                        <span className="font-bold text-slate-900 dark:text-white text-sm">{city.name}</span>
                        {city.isCapital && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.2 rounded">
                            Capital
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 ml-5">{city.country}</p>
                      <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 block mt-1 ml-5">
                        {city.timezone} ({tzInfo.offsetFormatted})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold font-mono text-blue-700 dark:text-cyan-300">
                        <AnimatedDigitalClock
                          timeStr={cityTime.timeStr}
                          animationStyle={digitAnimationMode}
                          className="text-base font-extrabold text-blue-700 dark:text-cyan-300"
                          colonClassName="text-blue-400/80 dark:text-cyan-400/80"
                          amPmClassName="text-[10px] font-bold text-slate-600 dark:text-slate-300 ml-1"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 block">{cityTime.dateStr}</span>
                      <div className="flex items-center justify-end gap-2 mt-1">
                        <button
                          onClick={() => handleAddCityToWatchlist(city)}
                          className="text-[10px] font-bold text-blue-600 dark:text-cyan-400 hover:underline cursor-pointer"
                        >
                          + Add Clock
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Floating Toast Notification for Pinned Cities & System Actions */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-3 rounded-xl shadow-2xl border border-slate-700 dark:border-slate-200 text-xs font-bold animate-bounce">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
