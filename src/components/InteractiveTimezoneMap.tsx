import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Globe,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
  MapPin,
  Clock,
  Layers,
  CheckCircle2,
  Compass,
  ArrowRight,
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
  SunMedium,
  MoonStar,
  Zap,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City } from '../types';
import { getTimezoneOffsetInfo, formatCityDateTime } from '../lib/timezoneUtils';

export interface InteractiveTimezoneMapProps {
  onSelectCity?: (city: City) => void;
  onSelectRegion?: (regionId: string) => void;
  selectedCityId?: string;
  isFullScreenMode?: boolean;
  onToggleFullScreen?: () => void;
}

// -------------------------------------------------------------
// Continental Regions & Primary Time Zones
// -------------------------------------------------------------
export interface TimezoneRegionInfo {
  id: string;
  name: string;
  shortLabel: string;
  primaryCityId: string;
  primaryTimezone: string;
  utcOffsetFormatted: string;
  subzones: { name: string; offset: string; cityId: string }[];
  description: string;
  // Bounding box in SVG coordinate space (800x400)
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
}

export const TIMEZONE_REGIONS: TimezoneRegionInfo[] = [
  {
    id: 'north-america-east',
    name: 'North America (Eastern & Central)',
    shortLabel: 'NA East/Central',
    primaryCityId: 'nyc',
    primaryTimezone: 'America/New_York',
    utcOffsetFormatted: 'UTC-5 / UTC-4 (DST)',
    subzones: [
      { name: 'Eastern Time (EST/EDT)', offset: 'UTC-5 / -4', cityId: 'nyc' },
      { name: 'Central Time (CST/CDT)', offset: 'UTC-6 / -5', cityId: 'chi' },
      { name: 'Atlantic Time (AST)', offset: 'UTC-4', cityId: 'tor' }
    ],
    description: 'Financial centers of New York, Toronto, Chicago & Eastern Seaboard.',
    bounds: { x: 180, y: 80, width: 110, height: 110 },
    color: '#3b82f6'
  },
  {
    id: 'north-america-west',
    name: 'North America (Pacific & Mountain)',
    shortLabel: 'NA West/Pacific',
    primaryCityId: 'lax',
    primaryTimezone: 'America/Los_Angeles',
    utcOffsetFormatted: 'UTC-8 / UTC-7 (DST)',
    subzones: [
      { name: 'Pacific Time (PST/PDT)', offset: 'UTC-8 / -7', cityId: 'lax' },
      { name: 'Mountain Time (MST/MDT)', offset: 'UTC-7 / -6', cityId: 'phx' },
      { name: 'Alaska Time (AKST)', offset: 'UTC-9 / -8', cityId: 'anc' },
      { name: 'Hawaii-Aleutian (HST)', offset: 'UTC-10', cityId: 'hnl' }
    ],
    description: 'Silicon Valley, Seattle, Los Angeles & Pacific Rim aerospace hubs.',
    bounds: { x: 90, y: 70, width: 100, height: 110 },
    color: '#06b6d4'
  },
  {
    id: 'south-america',
    name: 'South America & Caribbean',
    shortLabel: 'South America',
    primaryCityId: 'sao',
    primaryTimezone: 'America/Sao_Paulo',
    utcOffsetFormatted: 'UTC-3 / UTC-5',
    subzones: [
      { name: 'Brasília / Argentina Time (BRT/ART)', offset: 'UTC-3', cityId: 'sao' },
      { name: 'Colombia & Peru (COT/PET)', offset: 'UTC-5', cityId: 'bog' },
      { name: 'Chile & Venezuela (CLT/VET)', offset: 'UTC-4', cityId: 'scl' }
    ],
    description: 'São Paulo, Buenos Aires, Bogotá & Mercosur trading hubs.',
    bounds: { x: 230, y: 220, width: 100, height: 140 },
    color: '#10b981'
  },
  {
    id: 'europe-uk',
    name: 'Europe & United Kingdom',
    shortLabel: 'Europe / UK',
    primaryCityId: 'lon',
    primaryTimezone: 'Europe/London',
    utcOffsetFormatted: 'UTC+0 / UTC+1 (BST/CET)',
    subzones: [
      { name: 'Greenwich Mean Time (GMT/BST)', offset: 'UTC+0 / +1', cityId: 'lon' },
      { name: 'Central European Time (CET/CEST)', offset: 'UTC+1 / +2', cityId: 'par' },
      { name: 'Eastern European Time (EET)', offset: 'UTC+2 / +3', cityId: 'ath' },
      { name: 'Moscow Standard Time (MSK)', offset: 'UTC+3', cityId: 'mow' }
    ],
    description: 'London, Paris, Frankfurt, Zurich & Pan-European Single Market.',
    bounds: { x: 380, y: 70, width: 90, height: 80 },
    color: '#8b5cf6'
  },
  {
    id: 'middle-east-gulf',
    name: 'Middle East & Arabian Gulf',
    shortLabel: 'Middle East / Gulf',
    primaryCityId: 'dxb',
    primaryTimezone: 'Asia/Dubai',
    utcOffsetFormatted: 'UTC+3 / UTC+4',
    subzones: [
      { name: 'Gulf Standard Time (GST)', offset: 'UTC+4', cityId: 'dxb' },
      { name: 'Arabia Standard Time (AST)', offset: 'UTC+3', cityId: 'ruh' },
      { name: 'Iran Standard Time (IRST)', offset: 'UTC+3:30', cityId: 'thr' }
    ],
    description: 'Dubai, Riyadh, Doha, Istanbul & international transit corridors.',
    bounds: { x: 470, y: 130, width: 80, height: 80 },
    color: '#f59e0b'
  },
  {
    id: 'africa',
    name: 'Africa & Sub-Sahara',
    shortLabel: 'Africa / Sahara',
    primaryCityId: 'cai',
    primaryTimezone: 'Africa/Cairo',
    utcOffsetFormatted: 'UTC+1 / UTC+2 / UTC+3',
    subzones: [
      { name: 'Central Africa Time (CAT)', offset: 'UTC+2', cityId: 'jnb' },
      { name: 'West Africa Time (WAT)', offset: 'UTC+1', cityId: 'los' },
      { name: 'East Africa Time (EAT)', offset: 'UTC+3', cityId: 'nbo' },
      { name: 'North Africa Time (CET/WET)', offset: 'UTC+1 / +0', cityId: 'cas' }
    ],
    description: 'Cairo, Johannesburg, Lagos, Nairobi & continental growth markets.',
    bounds: { x: 380, y: 160, width: 95, height: 140 },
    color: '#ec4899'
  },
  {
    id: 'asia-east',
    name: 'East Asia & Far East',
    shortLabel: 'East Asia / Pacific',
    primaryCityId: 'tyo',
    primaryTimezone: 'Asia/Tokyo',
    utcOffsetFormatted: 'UTC+8 / UTC+9',
    subzones: [
      { name: 'Japan & Korea (JST/KST)', offset: 'UTC+9', cityId: 'tyo' },
      { name: 'China & Hong Kong (CST/HKT)', offset: 'UTC+8', cityId: 'bjg' },
      { name: 'Singapore & Malaysia (SGT/MYT)', offset: 'UTC+8', cityId: 'sin' },
      { name: 'Indochina & Thailand (ICT/WIB)', offset: 'UTC+7', cityId: 'bkk' }
    ],
    description: 'Tokyo, Shanghai, Singapore, Seoul & high-tech manufacturing giants.',
    bounds: { x: 600, y: 80, width: 140, height: 120 },
    color: '#ef4444'
  },
  {
    id: 'south-central-asia',
    name: 'South & Central Asia',
    shortLabel: 'South Asia (IST)',
    primaryCityId: 'del',
    primaryTimezone: 'Asia/Kolkata',
    utcOffsetFormatted: 'UTC+5 / UTC+5:30 / UTC+6',
    subzones: [
      { name: 'India Standard Time (IST)', offset: 'UTC+5:30', cityId: 'del' },
      { name: 'Pakistan Standard Time (PKT)', offset: 'UTC+5', cityId: 'khi' },
      { name: 'Bangladesh Time (BST)', offset: 'UTC+6', cityId: 'dha' },
      { name: 'Central Asia (UZT/KZT)', offset: 'UTC+5', cityId: 'tas' }
    ],
    description: 'New Delhi, Mumbai, Bengaluru, Dhaka & Indian Ocean economies.',
    bounds: { x: 540, y: 120, width: 80, height: 90 },
    color: '#eab308'
  },
  {
    id: 'australasia-oceania',
    name: 'Australasia & Oceania',
    shortLabel: 'Australia & Pacific',
    primaryCityId: 'syd',
    primaryTimezone: 'Australia/Sydney',
    utcOffsetFormatted: 'UTC+10 / UTC+12 (AEST/NZST)',
    subzones: [
      { name: 'Australian Eastern (AEST/AEDT)', offset: 'UTC+10 / +11', cityId: 'syd' },
      { name: 'New Zealand Standard (NZST)', offset: 'UTC+12 / +13', cityId: 'akl' },
      { name: 'Australian Western (AWST)', offset: 'UTC+8', cityId: 'per' },
      { name: 'Fiji & Pacific Islands (FJT)', offset: 'UTC+12', cityId: 'fji' }
    ],
    description: 'Sydney, Melbourne, Auckland, Brisbane & South Pacific island nations.',
    bounds: { x: 670, y: 240, width: 120, height: 120 },
    color: '#14b8a6'
  }
];

// -------------------------------------------------------------
// UTC Meridian Offset Bands (25 longitudinal strips: -12 to +14)
// -------------------------------------------------------------
interface UtcBand {
  offset: number;
  label: string;
  name: string;
  centerLng: number;
  primaryCityId: string;
}

const UTC_BANDS: UtcBand[] = [
  { offset: -11, label: 'UTC-11', name: 'Samoa / Niue', centerLng: -165, primaryCityId: 'hnl' },
  { offset: -10, label: 'UTC-10', name: 'Hawaii (HST)', centerLng: -150, primaryCityId: 'hnl' },
  { offset: -9, label: 'UTC-9', name: 'Alaska (AKST)', centerLng: -135, primaryCityId: 'anc' },
  { offset: -8, label: 'UTC-8', name: 'Pacific (PST)', centerLng: -120, primaryCityId: 'lax' },
  { offset: -7, label: 'UTC-7', name: 'Mountain (MST)', centerLng: -105, primaryCityId: 'phx' },
  { offset: -6, label: 'UTC-6', name: 'Central (CST)', centerLng: -90, primaryCityId: 'chi' },
  { offset: -5, label: 'UTC-5', name: 'Eastern (EST)', centerLng: -75, primaryCityId: 'nyc' },
  { offset: -4, label: 'UTC-4', name: 'Atlantic (AST)', centerLng: -60, primaryCityId: 'scl' },
  { offset: -3, label: 'UTC-3', name: 'Brasília (BRT)', centerLng: -45, primaryCityId: 'sao' },
  { offset: -2, label: 'UTC-2', name: 'Mid-Atlantic', centerLng: -30, primaryCityId: 'sao' },
  { offset: -1, label: 'UTC-1', name: 'Azores / CV', centerLng: -15, primaryCityId: 'cas' },
  { offset: 0, label: 'UTC+0', name: 'Western (GMT)', centerLng: 0, primaryCityId: 'lon' },
  { offset: 1, label: 'UTC+1', name: 'Central Euro (CET)', centerLng: 15, primaryCityId: 'par' },
  { offset: 2, label: 'UTC+2', name: 'Eastern Euro (EET)', centerLng: 30, primaryCityId: 'cai' },
  { offset: 3, label: 'UTC+3', name: 'Moscow / Arabia (AST)', centerLng: 45, primaryCityId: 'mow' },
  { offset: 4, label: 'UTC+4', name: 'Gulf (GST)', centerLng: 60, primaryCityId: 'dxb' },
  { offset: 5, label: 'UTC+5', name: 'Pakistan / Uzbek', centerLng: 75, primaryCityId: 'khi' },
  { offset: 6, label: 'UTC+6', name: 'Bangladesh (BST)', centerLng: 90, primaryCityId: 'dha' },
  { offset: 7, label: 'UTC+7', name: 'Indochina (ICT)', centerLng: 105, primaryCityId: 'bkk' },
  { offset: 8, label: 'UTC+8', name: 'China / Singapore (CST)', centerLng: 120, primaryCityId: 'sin' },
  { offset: 9, label: 'UTC+9', name: 'Japan / Korea (JST)', centerLng: 135, primaryCityId: 'tyo' },
  { offset: 10, label: 'UTC+10', name: 'Eastern Aus (AEST)', centerLng: 150, primaryCityId: 'syd' },
  { offset: 11, label: 'UTC+11', name: 'Solomon / Vanuatu', centerLng: 165, primaryCityId: 'syd' },
  { offset: 12, label: 'UTC+12', name: 'New Zealand (NZST)', centerLng: 180, primaryCityId: 'akl' }
];

export const InteractiveTimezoneMap: React.FC<InteractiveTimezoneMapProps> = ({
  onSelectCity,
  onSelectRegion,
  selectedCityId = 'lon',
  isFullScreenMode = false,
  onToggleFullScreen
}) => {
  // Map Dimension Constants
  const mapWidth = 800;
  const mapHeight = 400;

  // View state
  const [internalFullScreen, setInternalFullScreen] = useState<boolean>(false);
  const isFullScreen = isFullScreenMode || internalFullScreen;

  const [activeTabMode, setActiveTabMode] = useState<'regions' | 'bands' | 'cities'>('regions');
  const [hoveredRegion, setHoveredRegion] = useState<TimezoneRegionInfo | null>(null);
  const [hoveredBand, setHoveredBand] = useState<UtcBand | null>(null);
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('europe-uk');
  
  // Layer toggles
  const [showDayNight, setShowDayNight] = useState<boolean>(true);
  const [showBands, setShowBands] = useState<boolean>(true);
  const [showCityPins, setShowCityPins] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Confirmation banner state
  const [switchFeedback, setSwitchFeedback] = useState<{ cityName: string; timezone: string; offset: string } | null>(null);

  // Live ticking date
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard navigation (Esc to exit fullscreen)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        if (onToggleFullScreen) onToggleFullScreen();
        else setInternalFullScreen(false);
      }
      if ((e.key === 'f' || e.key === 'F') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        if (onToggleFullScreen) onToggleFullScreen();
        else setInternalFullScreen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, onToggleFullScreen]);

  // Coordinate Projection Helper (Equirectangular)
  const latLngToCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  // Calculate Astronomical Solar Declination & Subsolar Point for Day/Night curve
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10)); // degrees
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
  const subsolarLng = (12 - utcHours) * 15; // longitude where sun is directly overhead

  // Generate day/night terminator curve path
  const terminatorPoints = useMemo(() => {
    const points: { x: number; y: number }[] = [];
    for (let x = 0; x <= mapWidth; x += 8) {
      const lng = (x / mapWidth) * 360 - 180;
      const radDecl = (declination * Math.PI) / 180;
      const radLngDiff = ((lng - subsolarLng) * Math.PI) / 180;
      let lat = (Math.atan(-Math.cos(radLngDiff) / Math.tan(radDecl || 0.0001)) * 180) / Math.PI;
      if (isNaN(lat)) lat = 0;
      const { y } = latLngToCoords(lat, lng);
      points.push({ x, y });
    }
    return points;
  }, [declination, subsolarLng]);

  // Construct night polygon path
  const nightPolygonPath = useMemo(() => {
    const coords = terminatorPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ');
    if (declination >= 0) {
      return `M 0,${mapHeight} L ${coords} L ${mapWidth},${mapHeight} Z`;
    } else {
      return `M 0,0 L ${coords} L ${mapWidth},0 Z`;
    }
  }, [terminatorPoints, declination]);

  // Handle City Selection & Feedback
  const handleCityClick = (city: City) => {
    const tzInfo = getTimezoneOffsetInfo(now, city.timezone);
    setSwitchFeedback({
      cityName: city.name,
      timezone: city.timezone,
      offset: tzInfo.offsetFormatted
    });

    if (onSelectCity) {
      onSelectCity(city);
    }

    setTimeout(() => {
      setSwitchFeedback(null);
    }, 4000);
  };

  // Handle Region Selection & Switch to Primary Hub City
  const handleRegionClick = (region: TimezoneRegionInfo) => {
    setSelectedRegionId(region.id);
    const primaryCity = MAJOR_CITIES.find((c) => c.id === region.primaryCityId);
    if (primaryCity) {
      handleCityClick(primaryCity);
    }
    if (onSelectRegion) {
      onSelectRegion(region.id);
    }
  };

  // Handle UTC Band Click
  const handleBandClick = (band: UtcBand) => {
    const city = MAJOR_CITIES.find((c) => c.id === band.primaryCityId);
    if (city) {
      handleCityClick(city);
    }
  };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const sunCoords = latLngToCoords(declination, subsolarLng);

  // Active highlighted city (either selected or hovered)
  const activeFocusCity = hoveredCity || MAJOR_CITIES.find((c) => c.id === selectedCityId) || MAJOR_CITIES[0];
  const activeFocusTz = getTimezoneOffsetInfo(now, activeFocusCity.timezone);
  const activeFocusTime = formatCityDateTime(now, activeFocusCity.timezone, true);

  return (
    <div
      id="interactive-timezone-map-root"
      className={`transition-all duration-300 ${
        isFullScreen
          ? 'fixed inset-0 z-50 bg-[#070b14] p-3 sm:p-6 flex flex-col justify-between overflow-y-auto'
          : 'bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden relative'
      }`}
    >
      {/* ----------------- TOP TOOLBAR ----------------- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-1 rounded-lg bg-blue-500/20 text-cyan-300 border border-blue-500/40 text-xs font-black flex items-center gap-1.5 shadow-xs">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>INTERACTIVE TIME ZONE CARTOGRAPHY</span>
            </span>

            <span className="text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded-md border border-slate-800 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>UTC Live: {now.toUTCString().slice(17, 25)}</span>
            </span>

            {isFullScreen && (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                FULL-SCREEN MODE (Press ESC or F to exit)
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
            <span>Global Time Zones & Live Day/Night Meridian Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Click any continental region, UTC band, or city pin to instantly switch the WorldClockPillar spotlight.
          </p>
        </div>

        {/* Action Controls & Layer Toggles */}
        <div className="flex items-center gap-2 flex-wrap self-start md:self-auto">
          {/* Mode Selector */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTabMode('regions')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabMode === 'regions'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Regions
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('bands')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabMode === 'bands'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              UTC Bands
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('cities')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTabMode === 'cities'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              50+ Cities
            </button>
          </div>

          {/* Layer toggles */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setShowDayNight(!showDayNight)}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                showDayNight ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Day/Night Terminator Shadow"
            >
              <SunMedium className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowBands(!showBands)}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                showBands ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Meridian Grid Bands"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowCityPins(!showCityPins)}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                showCityPins ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle Major City Beacons"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 3))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 1))}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            {zoomLevel > 1 && (
              <button
                type="button"
                onClick={handleResetView}
                className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
                title="Reset Zoom & Pan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Full Screen Toggle Button */}
          <button
            type="button"
            id="timezone-map-fullscreen-toggle-btn"
            onClick={() => {
              if (onToggleFullScreen) onToggleFullScreen();
              else setInternalFullScreen((prev) => !prev);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isFullScreen
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md'
            }`}
            title={isFullScreen ? 'Exit Full Screen (ESC)' : 'Expand to Full Screen Interactive Canvas (F)'}
          >
            {isFullScreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full-Screen Map</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ----------------- CONFIRMATION SWITCH TOAST ----------------- */}
      {switchFeedback && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white px-5 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-blue-300/40 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <span className="text-xs font-extrabold tracking-wide">
            WorldClockPillar Switched to {switchFeedback.cityName} ({switchFeedback.timezone} • {switchFeedback.offset})
          </span>
        </div>
      )}

      {/* ----------------- MAIN INTERACTIVE MAP CANVAS ----------------- */}
      <div
        className={`relative my-4 rounded-2xl overflow-hidden border border-slate-800 bg-[#080d1a] shadow-inner select-none ${
          isFullScreen ? 'flex-1 min-h-[480px]' : 'w-full aspect-[2/1] min-h-[320px]'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ cursor: zoomLevel > 1 ? (isPanning ? 'grabbing' : 'grab') : 'default' }}
      >
        <svg
          viewBox={`0 0 ${mapWidth} ${mapHeight}`}
          className="w-full h-full"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.25s ease-out'
          }}
        >
          <defs>
            {/* Ambient map ocean gradient */}
            <radialGradient id="oceanGlow" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="#0d182e" />
              <stop offset="100%" stopColor="#060a14" />
            </radialGradient>

            {/* Day / Night terminator gradient */}
            <linearGradient id="nightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(5, 10, 24, 0.85)" />
              <stop offset="100%" stopColor="rgba(2, 5, 15, 0.92)" />
            </linearGradient>

            {/* Pulse filter for selected pins */}
            <filter id="glowPin" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" />
            </filter>
          </defs>

          {/* Ocean Base */}
          <rect width={mapWidth} height={mapHeight} fill="url(#oceanGlow)" />

          {/* ----------------- 1. UTC TIMEZONE BAND MERIDIANS (-12 to +14) ----------------- */}
          {showBands && (
            <g id="timezone-bands-group">
              {UTC_BANDS.map((band, idx) => {
                const bandWidth = mapWidth / 24;
                const bandX = ((band.centerLng + 180) / 360) * mapWidth - bandWidth / 2;
                const isHovered = hoveredBand?.offset === band.offset;

                return (
                  <g
                    key={`band-${band.offset}`}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredBand(band)}
                    onMouseLeave={() => setHoveredBand(null)}
                    onClick={() => handleBandClick(band)}
                  >
                    <rect
                      x={bandX}
                      y={0}
                      width={bandWidth}
                      height={mapHeight}
                      fill={
                        isHovered
                          ? 'rgba(56, 189, 248, 0.18)'
                          : idx % 2 === 0
                          ? 'rgba(255, 255, 255, 0.015)'
                          : 'rgba(0, 0, 0, 0.03)'
                      }
                      stroke={isHovered ? '#38bdf8' : 'rgba(148, 163, 184, 0.07)'}
                      strokeWidth={isHovered ? 1.5 : 0.6}
                      strokeDasharray={isHovered ? undefined : '2 3'}
                    />

                    {/* Band Header Label at top of map */}
                    <text
                      x={bandX + bandWidth / 2}
                      y="14"
                      textAnchor="middle"
                      fill={isHovered ? '#38bdf8' : '#64748b'}
                      fontSize="7.5"
                      fontFamily="monospace"
                      fontWeight="bold"
                      className="transition-colors pointer-events-none select-none"
                    >
                      {band.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* ----------------- 2. LATITUDE & LONGITUDE GRID LINES ----------------- */}
          {showGrid && (
            <g id="grid-lines-group" opacity={0.4} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.7">
              {/* Equator */}
              <line x1={0} y1={mapHeight / 2} x2={mapWidth} y2={mapHeight / 2} stroke="#334155" strokeWidth="1.2" />
              {/* Tropic of Cancer (23.5° N) */}
              <line x1={0} y1={latLngToCoords(23.44, 0).y} x2={mapWidth} y2={latLngToCoords(23.44, 0).y} stroke="#f59e0b" strokeDasharray="2 4" opacity={0.6} />
              {/* Tropic of Capricorn (23.5° S) */}
              <line x1={0} y1={latLngToCoords(-23.44, 0).y} x2={mapWidth} y2={latLngToCoords(-23.44, 0).y} stroke="#38bdf8" strokeDasharray="2 4" opacity={0.6} />
              {/* Prime Meridian */}
              <line x1={mapWidth / 2} y1={0} x2={mapWidth / 2} y2={mapHeight} stroke="#38bdf8" strokeWidth="1" opacity={0.7} />
            </g>
          )}

          {/* ----------------- 3. SIMPLIFIED CONTINENTAL MASS POLIES ----------------- */}
          <g id="continents-landmass" fill="#132238" stroke="#1e3a5f" strokeWidth="0.8" opacity={0.85}>
            {/* North America */}
            <path d="M 60,60 L 110,40 L 190,40 L 220,70 L 200,120 L 170,160 L 140,160 L 120,130 L 70,110 Z" />
            {/* Central America & Caribbean */}
            <path d="M 140,160 L 175,175 L 185,190 L 175,200 L 160,185 Z" />
            {/* South America */}
            <path d="M 180,200 L 235,195 L 265,220 L 260,280 L 220,340 L 195,310 L 180,240 Z" />
            {/* Greenland */}
            <path d="M 230,25 L 285,20 L 295,45 L 260,65 L 230,45 Z" />
            {/* Europe */}
            <path d="M 360,70 L 410,50 L 450,55 L 455,95 L 410,110 L 370,105 L 360,85 Z" />
            {/* United Kingdom & Ireland */}
            <path d="M 355,75 L 370,65 L 375,80 L 360,88 Z" />
            {/* Africa */}
            <path d="M 360,125 L 435,120 L 460,170 L 440,240 L 420,290 L 390,290 L 365,220 L 350,150 Z" />
            {/* Madagascar */}
            <path d="M 465,240 L 475,245 L 470,270 L 460,265 Z" />
            {/* Asia & Eurasia */}
            <path d="M 455,55 L 680,45 L 720,80 L 700,140 L 640,160 L 590,140 L 520,150 L 465,110 Z" />
            {/* India Subcontinent */}
            <path d="M 525,140 L 565,145 L 560,195 L 535,210 L 515,165 Z" />
            {/* Japan Archipelago */}
            <path d="M 685,95 L 705,85 L 710,120 L 690,125 Z" />
            {/* Southeast Asia & Indonesia */}
            <path d="M 600,165 L 640,170 L 670,200 L 630,225 L 590,200 Z" />
            {/* Australia */}
            <path d="M 640,240 L 720,240 L 735,280 L 700,325 L 640,305 L 630,265 Z" />
            {/* New Zealand */}
            <path d="M 760,300 L 775,295 L 770,335 L 755,330 Z" />
          </g>

          {/* ----------------- 4. DAY / NIGHT SOLAR TERMINATOR SHADOW ----------------- */}
          {showDayNight && (
            <g id="day-night-layer" className="pointer-events-none">
              {/* Translucent Dark Night Hemisphere */}
              <path d={nightPolygonPath} fill="url(#nightGradient)" />

              {/* Glowing Terminator Boundary Line */}
              <path
                d={`M ${terminatorPoints.map((p) => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                opacity={0.7}
              />

              {/* Subsolar Point (Pulsing Solar Noon Center) */}
              <g transform={`translate(${sunCoords.x}, ${sunCoords.y})`}>
                <circle r="16" fill="rgba(251, 191, 36, 0.15)" className="animate-ping" />
                <circle r="9" fill="rgba(251, 191, 36, 0.4)" />
                <circle r="5" fill="#fbbf24" stroke="#ffffff" strokeWidth="1" />
              </g>
            </g>
          )}

          {/* ----------------- 5. CONTINENTAL REGION INTERACTIVE OVERLAYS ----------------- */}
          {activeTabMode === 'regions' && (
            <g id="interactive-regions-group">
              {TIMEZONE_REGIONS.map((region) => {
                const isSelected = selectedRegionId === region.id;
                const isHovered = hoveredRegion?.id === region.id;

                return (
                  <g
                    key={region.id}
                    className="cursor-pointer transition-all"
                    onClick={() => handleRegionClick(region)}
                    onMouseEnter={() => setHoveredRegion(region)}
                    onMouseLeave={() => setHoveredRegion(null)}
                  >
                    {/* Region boundary bounding box */}
                    <rect
                      x={region.bounds.x}
                      y={region.bounds.y}
                      width={region.bounds.width}
                      height={region.bounds.height}
                      rx="8"
                      fill={
                        isSelected
                          ? `${region.color}25`
                          : isHovered
                          ? `${region.color}15`
                          : `${region.color}08`
                      }
                      stroke={isSelected ? region.color : isHovered ? region.color : `${region.color}40`}
                      strokeWidth={isSelected ? 2 : isHovered ? 1.5 : 0.8}
                      strokeDasharray={isSelected ? undefined : '3 2'}
                    />

                    {/* Region Title Tag */}
                    <g transform={`translate(${region.bounds.x + 6}, ${region.bounds.y + 14})`}>
                      <rect
                        x="-2"
                        y="-8"
                        width={region.shortLabel.length * 6 + 14}
                        height="13"
                        rx="3"
                        fill="#0b1324"
                        stroke={isSelected ? region.color : '#334155'}
                        strokeWidth="0.8"
                      />
                      <circle cx="3" cy="-1.5" r="2.5" fill={region.color} />
                      <text
                        x="9"
                        y="1"
                        fill={isSelected ? '#ffffff' : '#cbd5e1'}
                        fontSize="7"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {region.shortLabel}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}

          {/* ----------------- 6. MAJOR CITY BEACONS & HOTSPOTS ----------------- */}
          {showCityPins && (
            <g id="major-city-pins-group">
              {MAJOR_CITIES.map((city) => {
                const { x, y } = latLngToCoords(city.lat, city.lng);
                const isSelected = selectedCityId === city.id;
                const isHovered = hoveredCity?.id === city.id;

                // Determine if city is in daylight or nighttime
                const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));
                const hour = cityDate.getHours();
                const isCityDay = hour >= 6 && hour < 18;

                return (
                  <g
                    key={city.id}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer group"
                    onClick={() => handleCityClick(city)}
                    onMouseEnter={() => setHoveredCity(city)}
                    onMouseLeave={() => setHoveredCity(null)}
                  >
                    {/* Selected Radar Halo */}
                    {isSelected && (
                      <circle
                        r="12"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        className="animate-ping opacity-75"
                      />
                    )}

                    {/* Outer Pin Circle */}
                    <circle
                      r={isSelected ? 6.5 : isHovered ? 5.5 : 3.5}
                      fill={
                        isSelected
                          ? '#38bdf8'
                          : isCityDay
                          ? '#fbbf24'
                          : '#818cf8'
                      }
                      stroke={isSelected ? '#ffffff' : '#070b14'}
                      strokeWidth={isSelected ? 2 : 1}
                      filter={isSelected ? 'url(#glowPin)' : undefined}
                      className="transition-all duration-200"
                    />

                    {/* Center Core dot */}
                    <circle
                      r={isSelected ? 2.5 : 1.5}
                      fill={isSelected ? '#0369a1' : '#ffffff'}
                    />

                    {/* City Hover Tooltip Label */}
                    <g
                      className={`transition-opacity duration-150 pointer-events-none ${
                        isHovered || isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      transform="translate(8, -6)"
                    >
                      <rect
                        x="-3"
                        y="-9"
                        width={city.name.length * 6 + 46}
                        height="16"
                        rx="4"
                        fill="#070b14"
                        stroke={isSelected ? '#38bdf8' : '#334155'}
                        strokeWidth="1"
                        className="drop-shadow-lg"
                      />
                      <text
                        x="4"
                        y="2"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {city.name}
                      </text>
                      <text
                        x={city.name.length * 6 + 10}
                        y="2"
                        fill={isCityDay ? '#fbbf24' : '#818cf8'}
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {cityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {/* ----------------- FLOATING MAP HUD & INSPECTOR ----------------- */}
        <div className="absolute bottom-3 left-3 right-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pointer-events-none">
          {/* Active Focal Inspector Card */}
          <div className="pointer-events-auto bg-[#070b14]/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-700/80 text-white shadow-xl flex items-center gap-3.5 max-w-md">
            <div className="p-2 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Compass className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">{activeFocusCity.name}</span>
                <span className="text-[10px] text-slate-400 font-medium">({activeFocusCity.country})</span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800">
                  {activeFocusTz.offsetFormatted}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-300">
                <span className="font-bold text-amber-400">{activeFocusTime.timeStr}</span>
                <span>•</span>
                <span className="text-slate-400">{activeFocusTime.dateStr}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCityClick(activeFocusCity)}
              className="ml-auto px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-extrabold rounded-lg transition-all cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
              title="Apply this timezone to WorldClockPillar"
            >
              <span>Switch Pillar</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Subsolar & Legend Info Overlay */}
          <div className="hidden sm:flex items-center gap-3 bg-[#070b14]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Subsolar: {declination.toFixed(1)}°N, {subsolarLng.toFixed(1)}°E</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Sun className="w-3 h-3 text-amber-400" /> Day
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Moon className="w-3 h-3 text-indigo-400" /> Night
            </span>
          </div>
        </div>
      </div>

      {/* ----------------- BOTTOM REGIONAL HUBS GRID / UTC CAROUSEL ----------------- */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Instant Regional Time Zone Hubs (Click to Switch):</span>
          </span>

          <span className="text-[11px] text-slate-400">
            {TIMEZONE_REGIONS.length} Primary Continental Zones
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {TIMEZONE_REGIONS.map((reg) => {
            const isSelected = selectedRegionId === reg.id;
            const primaryCity = MAJOR_CITIES.find((c) => c.id === reg.primaryCityId);
            const cityDate = primaryCity
              ? new Date(now.toLocaleString('en-US', { timeZone: primaryCity.timezone }))
              : new Date();
            const timeStr = cityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <button
                key={reg.id}
                type="button"
                onClick={() => handleRegionClick(reg)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-900/40 border-cyan-400 shadow-md ring-1 ring-cyan-400/40'
                    : 'bg-slate-900/80 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-xs font-bold text-white truncate">{reg.shortLabel}</span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: reg.color }}
                  />
                </div>

                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-sm font-black font-mono text-cyan-300">{timeStr}</span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">
                    {reg.utcOffsetFormatted.split('/')[0]}
                  </span>
                </div>

                <span className="text-[10px] text-slate-400 truncate mt-1">
                  Hub: {primaryCity?.name || 'Primary Hub'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
