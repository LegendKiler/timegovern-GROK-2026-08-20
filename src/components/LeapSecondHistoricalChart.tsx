import React, { useState, useMemo, useEffect } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
  ReferenceArea
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Zap,
  Info,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
  Maximize2,
  Search,
  X,
  Compass,
  Radio,
  Flame,
  Wind,
  Cpu,
  Snowflake,
  ExternalLink,
  Filter,
  MapPin,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Bookmark,
  MousePointerClick,
  RefreshCw,
  Bell,
  Mail
} from 'lucide-react';
import {
  HistoricalTimelinePoint,
  getHistoricalTimelineProgression,
  DECADE_LEAP_STATS,
  HISTORICAL_LEAP_SECONDS,
  CURRENT_TAI_UTC_OFFSET,
  CURRENT_GPS_UTC_OFFSET,
  GEOPHYSICAL_ROTATION_EVENTS,
  GeophysicalRotationEvent
} from '../lib/leapSecondData';
import {
  TIME_SYNC_WARNING_PRESETS,
  TimeSyncWarningPreset,
  formatMicroseconds,
  evaluateDriftExceedance
} from '../lib/timeSyncTolerance';
import { TimeSyncWarningZoneDrawer } from './TimeSyncWarningZoneDrawer';
import { DriftAlertConfigModal } from './DriftAlertConfigModal';

const KEY_MILESTONE_IDS = [
  'genesis-1972-01-01',
  'leap-1972-06-30',
  'gps-1980-01-06',
  'leap-1995-12-31',
  'leap-2005-12-31',
  'leap-2012-06-30',
  'leap-2016-12-31',
  'abolition-2035-01-01'
];

export const LeapSecondHistoricalChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<'cumulative' | 'frequency' | 'intervals'>('cumulative');
  const [timeRange, setTimeRange] = useState<'all' | 'early' | 'modern' | 'horizon'>('all');
  
  // Search and Geophysical Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'seismic' | 'atmospheric' | 'core_mantle' | 'cryosphere'>('all');
  const [selectedDecade, setSelectedDecade] = useState<string>('all');
  const [selectedGeoEventId, setSelectedGeoEventId] = useState<string | null>(null);

  // User-Configurable Time-Sync Drift Warning Zone State
  const [showWarningZone, setShowWarningZone] = useState<boolean>(true);
  const [warningThresholdMicros, setWarningThresholdMicros] = useState<number>(100); // Default 100 µs (MiFID II / 5G / PTP boundary)
  const [showWarningDrawer, setShowWarningDrawer] = useState<boolean>(false);

  // Live Data Polling State for /api/time/tai-utc (60s interval)
  const [isLiveDataPolling, setIsLiveDataPolling] = useState<boolean>(false);
  const [liveTaiUtcOffset, setLiveTaiUtcOffset] = useState<number>(CURRENT_TAI_UTC_OFFSET);
  const [liveGpsUtcOffset, setLiveGpsUtcOffset] = useState<number>(CURRENT_GPS_UTC_OFFSET);
  const [pollCountdown, setPollCountdown] = useState<number>(60);
  const [isPollingApi, setIsPollingApi] = useState<boolean>(false);
  const [lastPolledAt, setLastPolledAt] = useState<Date | null>(null);

  // Poll /api/time/tai-utc function
  const pollTaiUtcApi = async () => {
    setIsPollingApi(true);
    try {
      const res = await fetch(`/api/time/tai-utc?echo=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.offsets?.tai_minus_utc_seconds) {
          setLiveTaiUtcOffset(data.offsets.tai_minus_utc_seconds);
        } else if (data?.atomic_sync?.tai_utc_offset_seconds) {
          setLiveTaiUtcOffset(data.atomic_sync.tai_utc_offset_seconds);
        }
        if (data?.offsets?.gps_minus_utc_seconds) {
          setLiveGpsUtcOffset(data.offsets.gps_minus_utc_seconds);
        } else if (data?.atomic_sync?.gps_utc_offset_seconds) {
          setLiveGpsUtcOffset(data.atomic_sync.gps_utc_offset_seconds);
        }
        setLastPolledAt(new Date());
        setPollCountdown(60);
      }
    } catch (err) {
      console.warn('Live poll error in LeapSecondHistoricalChart:', err);
    } finally {
      setIsPollingApi(false);
    }
  };

  // 60-second polling interval effect
  useEffect(() => {
    if (!isLiveDataPolling) return;

    pollTaiUtcApi();

    const interval = setInterval(() => {
      setPollCountdown(prev => {
        if (prev <= 1) {
          pollTaiUtcApi();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveDataPolling]);

  // Series visibility toggles for cumulative view
  const [showTai, setShowTai] = useState<boolean>(true);
  const [showGps, setShowGps] = useState<boolean>(true);
  const [showTt, setShowTt] = useState<boolean>(false);
  const [showMilestones, setShowMilestones] = useState<boolean>(true);
  const [showGeoMarkers, setShowGeoMarkers] = useState<boolean>(true);

  // Raw dataset
  const fullTimeline = useMemo(() => getHistoricalTimelineProgression(), []);

  // Visible Leap Second Markers State
  const [isDriftAlertModalOpen, setIsDriftAlertModalOpen] = useState<boolean>(false);
  const [showLeapMarkers, setShowLeapMarkers] = useState<boolean>(true);
  const [selectedEventMarkerIds, setSelectedEventMarkerIds] = useState<string[]>(() => {
    return fullTimeline.map(p => p.id);
  });
  const [selectedInspectEvent, setSelectedInspectEvent] = useState<HistoricalTimelinePoint | null>(null);
  const [showEventDrawer, setShowEventDrawer] = useState<boolean>(false);
  const [eventPickerSearch, setEventPickerSearch] = useState<string>('');
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  // Keyboard navigation for popup inspection modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedInspectEvent) return;
      if (e.key === 'Escape') {
        setSelectedInspectEvent(null);
      } else if (e.key === 'ArrowRight') {
        handleNextEvent();
      } else if (e.key === 'ArrowLeft') {
        handlePrevEvent();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedInspectEvent, fullTimeline]);

  // Toggle single event marker on chart
  const toggleEventMarker = (id: string) => {
    setSelectedEventMarkerIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Preset Marker Actions
  const handleSelectAllMarkers = () => {
    setSelectedEventMarkerIds(fullTimeline.map(p => p.id));
    setShowLeapMarkers(true);
  };

  const handleSelectMilestonesOnly = () => {
    setSelectedEventMarkerIds(KEY_MILESTONE_IDS);
    setShowLeapMarkers(true);
  };

  const handleClearAllMarkers = () => {
    setSelectedEventMarkerIds([]);
  };

  const handleToggleDecadeMarkers = (decadeYear: number) => {
    const decadeIds = fullTimeline
      .filter(p => Math.floor(p.year / 10) * 10 === decadeYear)
      .map(p => p.id);

    const allSelected = decadeIds.every(id => selectedEventMarkerIds.includes(id));
    if (allSelected) {
      // Unselect this decade
      setSelectedEventMarkerIds(prev => prev.filter(id => !decadeIds.includes(id)));
    } else {
      // Select all in this decade
      setSelectedEventMarkerIds(prev => Array.from(new Set([...prev, ...decadeIds])));
      setShowLeapMarkers(true);
    }
  };

  // Step through events in inspector popup
  const handleNextEvent = () => {
    if (!selectedInspectEvent) return;
    const currentIndex = fullTimeline.findIndex(p => p.id === selectedInspectEvent.id);
    if (currentIndex >= 0 && currentIndex < fullTimeline.length - 1) {
      setSelectedInspectEvent(fullTimeline[currentIndex + 1]);
    } else {
      setSelectedInspectEvent(fullTimeline[0]); // Loop around
    }
  };

  const handlePrevEvent = () => {
    if (!selectedInspectEvent) return;
    const currentIndex = fullTimeline.findIndex(p => p.id === selectedInspectEvent.id);
    if (currentIndex > 0) {
      setSelectedInspectEvent(fullTimeline[currentIndex - 1]);
    } else {
      setSelectedInspectEvent(fullTimeline[fullTimeline.length - 1]); // Loop around
    }
  };

  // Copy event details to clipboard
  const handleCopyEventDetails = (point: HistoricalTimelinePoint) => {
    const citation = `[TimeGovern Leap Second Registry]
Event: ${point.eventTitle} (${point.displayDate})
TAI - UTC Offset: ${point.cumulativeTaiFormatted}
GPS - UTC Offset: ${point.cumulativeGpsFormatted}
Transition: ${point.utcSequenceStr}
Authority: ${point.iersAuthority}
Interval: ${point.daysSinceLastLeap} days
Technical Summary: ${point.extendedTechnicalDescription}
Systems Impact: ${point.systemsImpactSummary}`;

    navigator.clipboard.writeText(citation).then(() => {
      setCopiedEventId(point.id);
      setTimeout(() => setCopiedEventId(null), 2500);
    });
  };

  // Filtered dataset based on selected time range, search query, category, and decade
  const filteredTimeline = useMemo(() => {
    let result = fullTimeline;

    // 1. Time range filter
    switch (timeRange) {
      case 'early':
        result = result.filter(p => p.year <= 1999);
        break;
      case 'modern':
        result = result.filter(p => p.year >= 2000 && !p.projected);
        break;
      case 'horizon':
        result = result.filter(p => p.year >= 2016);
        break;
      case 'all':
      default:
        break;
    }

    // 2. Decade filter
    if (selectedDecade !== 'all') {
      const decadeNum = parseInt(selectedDecade, 10);
      if (!isNaN(decadeNum)) {
        result = result.filter(p => Math.floor(p.year / 10) * 10 === decadeNum);
      }
    }

    // 3. Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.geophysicalEvent?.category === selectedCategory);
    }

    // 4. Search query filter
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(p => {
        const yearStr = p.year.toString();
        const displayDate = p.displayDate.toLowerCase();
        const eventTitle = p.eventTitle.toLowerCase();
        const notes = p.notes.toLowerCase();
        const geoName = p.geophysicalEvent?.name.toLowerCase() || '';
        const geoShort = p.geophysicalEvent?.shortName.toLowerCase() || '';
        const geoMagnitude = p.geophysicalEvent?.magnitude.toLowerCase() || '';
        const geoDesc = p.geophysicalEvent?.description.toLowerCase() || '';
        const tags = (p.geophysicalTags || []).map(t => t.toLowerCase());

        // Check decade match like '1980s' or '80s'
        const decadeMatch = query.includes('s') && (
          `${Math.floor(p.year / 10) * 10}s`.includes(query) ||
          `${Math.floor(p.year / 10) * 10}`.slice(2).concat('s').includes(query)
        );

        return (
          yearStr.includes(query) ||
          displayDate.includes(query) ||
          eventTitle.includes(query) ||
          notes.includes(query) ||
          geoName.includes(query) ||
          geoShort.includes(query) ||
          geoMagnitude.includes(query) ||
          geoDesc.includes(query) ||
          tags.some(t => t.includes(query)) ||
          decadeMatch
        );
      });
    }

    return result;
  }, [fullTimeline, timeRange, selectedDecade, selectedCategory, searchQuery]);

  // Filtered list for the Event Picker Drawer
  const pickerEvents = useMemo(() => {
    const q = eventPickerSearch.trim().toLowerCase();
    if (!q) return fullTimeline;
    return fullTimeline.filter(p => 
      p.displayDate.toLowerCase().includes(q) ||
      p.eventTitle.toLowerCase().includes(q) ||
      p.notes.toLowerCase().includes(q) ||
      p.year.toString().includes(q) ||
      (p.leapSequenceLabel && p.leapSequenceLabel.toLowerCase().includes(q))
    );
  }, [fullTimeline, eventPickerSearch]);

  // Selected geophysical event details
  const activeGeoEvent = useMemo(() => {
    if (selectedGeoEventId) {
      return GEOPHYSICAL_ROTATION_EVENTS.find(e => e.id === selectedGeoEventId) || null;
    }
    // If search matched points with geo events, find the most prominent one
    if (searchQuery.trim() && filteredTimeline.length > 0) {
      const match = filteredTimeline.find(p => p.geophysicalEvent);
      if (match?.geophysicalEvent) return match.geophysicalEvent;
    }
    return null;
  }, [selectedGeoEventId, searchQuery, filteredTimeline]);

  // Interval chart data (days between each leap second)
  const intervalData = useMemo(() => {
    return HISTORICAL_LEAP_SECONDS.map(item => ({
      date: item.dateStr,
      year: item.year,
      label: `${item.month.slice(0, 3)} ${item.year}`,
      days: item.daysSinceLast,
      taiOffset: item.cumulativeTaiMinusUtc,
      notes: item.notes
    }));
  }, []);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedDecade('all');
    setSelectedGeoEventId(null);
    setTimeRange('all');
  };

  const handleSelectGeoEvent = (event: GeophysicalRotationEvent) => {
    if (selectedGeoEventId === event.id) {
      setSelectedGeoEventId(null);
    } else {
      setSelectedGeoEventId(event.id);
      if (timeRange !== 'all') {
        setTimeRange('all');
      }
    }
  };

  const isFiltered = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedDecade !== 'all' || timeRange !== 'all' || selectedGeoEventId !== null;

  return (
    <div id="historical-progression-chart" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-5">
      {/* 1. Header & Navigation Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              50-Year Historical TAI-UTC Offset Progression (1972–2026+)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> 27 Leap Events Cataloged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Visualizing the step-function divergence between pure atomic time (<strong className="text-cyan-300">TAI</strong>), satellite navigation time (<strong className="text-amber-300">GPS</strong>), and civil astronomical time (<strong className="text-slate-200">UTC</strong>) from 1972 through the 2035 abolition horizon. Click any visible marker for an in-depth event description popup.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold self-start lg:self-center">
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'cumulative'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Cumulative Offsets</span>
          </button>

          <button
            onClick={() => setViewMode('frequency')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'frequency'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Decade Rates</span>
          </button>

          <button
            onClick={() => setViewMode('intervals')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'intervals'
                ? 'bg-cyan-600 text-white font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Interval Gaps (Days)</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Search & Geophysical Filtering Toolbar */}
      <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by decade (e.g. '1980s', '2000s'), year, or geophysical event ('Sumatra', 'Tōhoku', 'El Niño', 'Seismic')..."
              className="w-full bg-slate-900 border border-slate-700/80 hover:border-slate-600 focus:border-cyan-500 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Decade & Category Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Decade Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <select
                value={selectedDecade}
                onChange={(e) => setSelectedDecade(e.target.value)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-slate-900 text-white">All Decades</option>
                <option value="1970" className="bg-slate-900 text-white">1970s (1972–1979)</option>
                <option value="1980" className="bg-slate-900 text-white">1980s (1980–1989)</option>
                <option value="1990" className="bg-slate-900 text-white">1990s (1990–1999)</option>
                <option value="2000" className="bg-slate-900 text-white">2000s (2000–2009)</option>
                <option value="2010" className="bg-slate-900 text-white">2010s (2010–2019)</option>
                <option value="2020" className="bg-slate-900 text-white">2020s (2020–2029)</option>
                <option value="2030" className="bg-slate-900 text-white">2030s Horizon</option>
              </select>
            </div>

            {/* Geophysical Category Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-xs">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
              >
                <option value="all" className="bg-slate-900 text-white">All Geophysical Categories</option>
                <option value="seismic" className="bg-slate-900 text-rose-300">🌋 Seismic Megathrusts (Earthquakes)</option>
                <option value="atmospheric" className="bg-slate-900 text-amber-300">🌪️ Atmospheric Winds & El Niño</option>
                <option value="core_mantle" className="bg-slate-900 text-purple-300">🧲 Core-Mantle Dynamics</option>
                <option value="cryosphere" className="bg-slate-900 text-cyan-300">❄️ Polar Cryosphere & Ice Mass</option>
              </select>
            </div>

            {/* Clear All Filters Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Major Geophysical Event Presets Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60 text-[11px]">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Key Rotation Events:
          </span>

          {GEOPHYSICAL_ROTATION_EVENTS.map((event) => {
            const isSelected = selectedGeoEventId === event.id;
            const categoryBadgeColor = 
              event.category === 'seismic' ? 'border-rose-500/40 text-rose-300 hover:bg-rose-950/60' :
              event.category === 'atmospheric' ? 'border-amber-500/40 text-amber-300 hover:bg-amber-950/60' :
              event.category === 'core_mantle' ? 'border-purple-500/40 text-purple-300 hover:bg-purple-950/60' :
              'border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/60';

            const activeColor = 
              event.category === 'seismic' ? 'bg-rose-600 text-white font-bold border-rose-400' :
              event.category === 'atmospheric' ? 'bg-amber-600 text-white font-bold border-amber-400' :
              event.category === 'core_mantle' ? 'bg-purple-600 text-white font-bold border-purple-400' :
              'bg-cyan-600 text-white font-bold border-cyan-400';

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => handleSelectGeoEvent(event)}
                className={`px-2 py-0.5 rounded-md border text-[10px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  isSelected ? activeColor : `bg-slate-900/90 ${categoryBadgeColor}`
                }`}
                title={`${event.name} (${event.displayDate}) - Impact: ${event.lodImpactMicros > 0 ? '+' : ''}${event.lodImpactMicros}µs/day`}
              >
                <span>
                  {event.category === 'seismic' ? '🌋' : event.category === 'atmospheric' ? '🌪️' : event.category === 'core_mantle' ? '🧲' : '❄️'}
                </span>
                <span>{event.shortName}</span>
                <span className="font-mono text-[9px] opacity-75">
                  ({event.lodImpactMicros > 0 ? '+' : ''}{event.lodImpactMicros}µs)
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Counter & Search Status */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5 font-mono">
          <span>
            Showing <strong className="text-cyan-300">{filteredTimeline.length}</strong> of {fullTimeline.length} timeline milestones
          </span>
          {searchQuery && (
            <span className="text-amber-300 text-[10px]">
              Filtering for "{searchQuery}"
            </span>
          )}
        </div>
      </div>

      {/* 3. Sub-Toolbar: Range Selectors & Series Visibility Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Time Range Filter */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Range:</span>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            All (1972–2035)
          </button>
          <button
            onClick={() => setTimeRange('early')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'early' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            1972–1999 (High Frequency)
          </button>
          <button
            onClick={() => setTimeRange('modern')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'modern' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2000–2026 (Stabilization)
          </button>
          <button
            onClick={() => setTimeRange('horizon')}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
              timeRange === 'horizon' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            2016–2035 (Abolition)
          </button>
        </div>

        {/* Series Visibility Toggles (when in Cumulative Mode) */}
        {viewMode === 'cumulative' && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Data Telemetry 60s Polling Toggle */}
            <button
              onClick={() => {
                const nextVal = !isLiveDataPolling;
                setIsLiveDataPolling(nextVal);
                if (nextVal) {
                  pollTaiUtcApi();
                }
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                isLiveDataPolling
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60 shadow-xs'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title="Toggle automatic 60-second polling of /api/time/tai-utc"
            >
              <div className="relative flex items-center justify-center">
                <Radio className={`w-3 h-3 ${isLiveDataPolling ? 'text-emerald-400' : 'text-slate-500'}`} />
                {isLiveDataPolling && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                )}
              </div>
              <span>Live Poll: {isLiveDataPolling ? 'ON' : 'OFF'}</span>
              {isLiveDataPolling && (
                <span className="font-mono text-[10px] bg-emerald-950 px-1 py-0.2 rounded border border-emerald-500/40 text-emerald-300">
                  {pollCountdown}s
                </span>
              )}
            </button>

            {isLiveDataPolling && (
              <button
                onClick={() => pollTaiUtcApi()}
                disabled={isPollingApi}
                className="p-1 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 cursor-pointer"
                title="Poll /api/time/tai-utc immediately"
              >
                <RefreshCw className={`w-3 h-3 ${isPollingApi ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
              </button>
            )}

            <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mr-1 hidden sm:inline">Legend:</span>
            <button
              onClick={() => setShowTai(!showTai)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showTai
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
              }`}
              title="Toggle TAI - UTC offset line"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${showTai ? 'bg-cyan-400' : 'bg-slate-600'} inline-block`}></span>
              <span>TAI - UTC (+{liveTaiUtcOffset}s)</span>
            </button>

            <button
              onClick={() => setShowGps(!showGps)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showGps
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
              }`}
              title="Toggle GPS - UTC offset line"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${showGps ? 'bg-amber-400' : 'bg-slate-600'} inline-block`}></span>
              <span>GPS - UTC (+{liveGpsUtcOffset}s)</span>
            </button>

            <button
              onClick={() => setShowTt(!showTt)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showTt
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
              }`}
              title="Toggle Terrestrial Time (TT) line"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${showTt ? 'bg-purple-400' : 'bg-slate-600'} inline-block`}></span>
              <span>TT - UTC (+69.184s)</span>
            </button>

            {/* Leap Second Markers Master Toggle */}
            <button
              onClick={() => setShowLeapMarkers(!showLeapMarkers)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showLeapMarkers
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
              }`}
              title="Toggle Visible Leap Second Event Markers on Chart"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Leap Markers ({selectedEventMarkerIds.length}/{fullTimeline.length})
              </span>
            </button>

            <button
              onClick={() => setShowGeoMarkers(!showGeoMarkers)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showGeoMarkers
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
              }`}
              title="Toggle Geophysical Rotation Event Markers"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${showGeoMarkers ? 'bg-rose-400' : 'bg-slate-600'} inline-block`}></span>
              <span>Geophysical Markers</span>
            </button>

            <button
              onClick={() => setShowMilestones(!showMilestones)}
              className={`px-2 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                showMilestones
                  ? 'bg-slate-800 text-slate-200 border-slate-700'
                  : 'bg-slate-950 text-slate-500 border-slate-800'
              }`}
              title="Toggle Milestone Reference Lines"
            >
              {showMilestones ? 'Milestones: On' : 'Milestones: Off'}
            </button>

            {/* Time-Sync Warning Zone Master Toggle */}
            <button
              onClick={() => setShowWarningZone(!showWarningZone)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showWarningZone
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs'
                  : 'bg-slate-950 text-slate-500 border-slate-800 opacity-60 hover:opacity-100'
              }`}
              title="Toggle Critical Time-Synchronization Drift Warning Zone"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Warning Zone: {showWarningZone ? formatMicroseconds(warningThresholdMicros) : 'Off'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3.1 Dedicated Leap Second Markers & Warning Zone Control Bar (Visible in Cumulative Mode) */}
      {viewMode === 'cumulative' && (
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 mr-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Historical Leap Markers:
            </span>

            <button
              type="button"
              onClick={handleSelectAllMarkers}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                selectedEventMarkerIds.length === fullTimeline.length && showLeapMarkers
                  ? 'bg-emerald-600 text-white font-bold border-emerald-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>All 27 Leaps</span>
            </button>

            <button
              type="button"
              onClick={handleSelectMilestonesOnly}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                selectedEventMarkerIds.length === KEY_MILESTONE_IDS.length && KEY_MILESTONE_IDS.every(id => selectedEventMarkerIds.includes(id)) && showLeapMarkers
                  ? 'bg-cyan-600 text-white font-bold border-cyan-400'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>Key Milestones ({KEY_MILESTONE_IDS.length})</span>
            </button>

            {/* Decade Quick Selectors */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-900/90 border border-slate-800 px-1.5 py-0.5 rounded-lg text-[10px]">
              <span className="text-slate-500 font-mono text-[9px] uppercase font-bold mr-0.5">Decades:</span>
              {[1970, 1980, 1990, 2000, 2010].map(decade => {
                const decadeIds = fullTimeline
                  .filter(p => Math.floor(p.year / 10) * 10 === decade)
                  .map(p => p.id);
                const isAllSelected = decadeIds.length > 0 && decadeIds.every(id => selectedEventMarkerIds.includes(id));
                return (
                  <button
                    key={decade}
                    type="button"
                    onClick={() => handleToggleDecadeMarkers(decade)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                      isAllSelected && showLeapMarkers
                        ? 'bg-cyan-500/30 text-cyan-200 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={`Toggle ${decade}s leap markers`}
                  >
                    {decade}s
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleClearAllMarkers}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-[11px] transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
            {/* Warning Zone Drawer Trigger Button */}
            <button
              type="button"
              onClick={() => setShowWarningDrawer(!showWarningDrawer)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showWarningDrawer
                  ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                  : 'bg-slate-900 border-slate-700 text-amber-300 hover:bg-slate-800'
              }`}
              title="Configure microsecond drift warning thresholds and industry presets"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>{showWarningDrawer ? 'Close Warning Config' : `Warning Config (${formatMicroseconds(warningThresholdMicros)})`}</span>
            </button>

            {/* Custom Email Alerts Button */}
            <button
              type="button"
              id="historical-drift-email-alert-btn"
              onClick={() => setIsDriftAlertModalOpen(true)}
              className="px-2.5 py-1 rounded-lg border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Configure automated email notifications for TAI-UTC drift breaches"
            >
              <Bell className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Drift Email Alerts</span>
            </button>

            {/* Event Picker Drawer Trigger */}
            <button
              type="button"
              onClick={() => setShowEventDrawer(!showEventDrawer)}
              className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                showEventDrawer
                  ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                  : 'bg-slate-900 border-slate-700 text-cyan-300 hover:bg-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showEventDrawer ? 'Close Event Picker' : 'Pick Specific Events...'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3.2 User-Configurable Time-Sync Drift Warning Zone Drawer */}
      {showWarningDrawer && viewMode === 'cumulative' && (
        <TimeSyncWarningZoneDrawer
          showWarningZone={showWarningZone}
          onToggleWarningZone={setShowWarningZone}
          thresholdMicros={warningThresholdMicros}
          onChangeThresholdMicros={setWarningThresholdMicros}
          timeline={fullTimeline}
          onClose={() => setShowWarningDrawer(false)}
        />
      )}

      {/* 3.2 Expandable Specific Leap Second Event Picker Drawer */}
      {showEventDrawer && (
        <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-4 space-y-3 animate-fadeIn text-xs shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                <MapPin className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-slate-100 text-xs">
                  Specific Historical Leap Second Markers Selector ({fullTimeline.length} Events Catalog)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Select specific leap second insertion dates to display marker pins on the cumulative drift curve.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllMarkers}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-600 text-[10px] text-slate-300 cursor-pointer"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAllMarkers}
                className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-600 text-[10px] text-slate-300 cursor-pointer"
              >
                Deselect All
              </button>
              <button
                type="button"
                onClick={() => setShowEventDrawer(false)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick search inside picker */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={eventPickerSearch}
              onChange={(e) => setEventPickerSearch(e.target.value)}
              placeholder="Filter leap events in picker by year, title, or keywords (e.g. '2012', 'GPS', 'June', 'outage')..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Grid of Toggleable Event Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto pr-1">
            {pickerEvents.map(event => {
              const isSelected = selectedEventMarkerIds.includes(event.id);
              const isMilestone = KEY_MILESTONE_IDS.includes(event.id);
              
              return (
                <div
                  key={event.id}
                  className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleEventMarker(event.id)}
                      className="rounded border-slate-700 text-cyan-600 focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <div className="font-mono font-bold text-[11px] truncate flex items-center gap-1">
                        <span className={isSelected ? 'text-white' : 'text-slate-300'}>
                          {event.displayDate}
                        </span>
                        {isMilestone && (
                          <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            ★
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        TAI-UTC: <strong className="text-cyan-300">+{event.taiMinusUtc}s</strong> • {event.eventCategory === 'gps_launch' ? 'GPS Epoch' : event.leapInserted > 0 ? '+1s' : '0s'}
                      </div>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => setSelectedInspectEvent(event)}
                    className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Inspect event details popup"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Primary Interactive Chart Viewport */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 relative overflow-hidden">
        {viewMode === 'cumulative' && (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={filteredTimeline}
                margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="taiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ttGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="warningZoneGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.24} />
                    <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.14} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.03} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />

                <XAxis
                  dataKey="year"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#334155' }}
                  label={{
                    value: 'Year (Epoch Calendar)',
                    position: 'insideBottom',
                    offset: -12,
                    fill: '#64748b',
                    fontSize: 11
                  }}
                />

                <YAxis
                  domain={showTt ? [0, 75] : [0, 42]}
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickLine={{ stroke: '#334155' }}
                  label={{
                    value: 'Offset from UTC (Seconds)',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 5
                  }}
                />

                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as HistoricalTimelinePoint;
                      const geo = data.geophysicalEvent;
                      return (
                        <div className="bg-slate-900/98 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-4 shadow-2xl text-xs text-white max-w-sm sm:max-w-md space-y-3 z-50 animate-fadeIn">
                          {/* 1. Header: Epoch Date & Category Badge */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]"></span>
                              <span className="font-bold font-mono text-cyan-200 text-sm">{data.displayDate}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              data.projected
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : data.leapInserted > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : data.eventCategory === 'genesis'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}>
                              {data.leapSequenceLabel || (data.leapInserted > 0 ? `Leap Second (+1s)` : 'Epoch Baseline')}
                            </span>
                          </div>

                          {/* 2. Primary Highlight: Exact TAI - UTC Offset Hero */}
                          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div className="space-y-0.5">
                              <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 block">Exact TAI - UTC Offset</span>
                              <span className="text-xl font-extrabold font-mono text-cyan-200 block drop-shadow-sm">
                                {data.cumulativeTaiFormatted || `+${data.taiMinusUtc}.000000 s`}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                Civil UTC lags International Atomic Time by exactly <strong className="text-cyan-300">{data.taiMinusUtc}s</strong>
                              </span>
                            </div>
                            <div className="text-right border-l border-cyan-900/60 pl-3 space-y-1 font-mono text-[11px]">
                              <div>
                                <span className="text-slate-500 text-[10px] block">GPS - UTC</span>
                                <span className="text-amber-400 font-bold">{data.cumulativeGpsFormatted || (data.gpsMinusUtc !== null ? `+${data.gpsMinusUtc}.000000 s` : 'N/A')}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 text-[10px] block">TT - UTC</span>
                                <span className="text-purple-400 font-bold">{data.cumulativeTtFormatted || `+${data.ttMinusUtc} s`}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2.5 Time-Sync Warning Zone Evaluation Banner */}
                          {showWarningZone && (
                            <div className={`p-2.5 rounded-xl border space-y-1.5 ${
                              (data.taiMinusUtc * 1_000_000) > warningThresholdMicros
                                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                            }`}>
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="flex items-center gap-1.5 font-sans text-slate-200">
                                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                                  Sync vs. {formatMicroseconds(warningThresholdMicros)} Limit:
                                </span>
                                <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                                  (data.taiMinusUtc * 1_000_000) > warningThresholdMicros
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}>
                                  {(data.taiMinusUtc * 1_000_000) > warningThresholdMicros ? '⚠️ DRIFT EXCEEDED' : '✓ WITHIN TOLERANCE'}
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-300 font-mono flex items-center justify-between">
                                <span>Point Drift: +{(data.taiMinusUtc * 1_000_000).toLocaleString()} µs</span>
                                <span className="font-bold text-amber-300">
                                  {(data.taiMinusUtc * 1_000_000) > warningThresholdMicros
                                    ? `+${((data.taiMinusUtc * 1_000_000) - warningThresholdMicros).toLocaleString()} µs excess (${((data.taiMinusUtc * 1_000_000) / warningThresholdMicros).toFixed(1)}×)`
                                    : 'Compliant'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* 3. Metrological Transition & Sequence Bar (for leap seconds) */}
                          <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-2.5 space-y-1.5 font-mono text-[11px]">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">Transition Sequence:</span>
                              <span className="text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-[10px]">
                                {data.utcSequenceStr || (data.leapInserted > 0 ? '23:59:59 → 23:59:60 → 00:00:00 UTC' : 'Continuous UTC')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">Authority Bulletin:</span>
                              <span className="text-slate-200 font-bold">{data.iersAuthority || 'IERS Bulletin C'}</span>
                            </div>
                            {data.daysSinceLastLeap > 0 && (
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">Interval Since Prior Leap:</span>
                                <span className="text-amber-300 font-bold">{data.daysSinceLastLeap} days ({((data.daysSinceLastLeap) / 365.25).toFixed(1)} yrs)</span>
                              </div>
                            )}
                            {data.dut1Formatted && (
                              <div className="flex items-center justify-between text-slate-300">
                                <span className="text-slate-400 text-[10px] uppercase font-sans font-bold">Estimated UT1 - UTC:</span>
                                <span className="text-cyan-300 font-bold">{data.dut1Formatted}</span>
                              </div>
                            )}
                          </div>

                          {/* 4. Event Description & Detailed Impact */}
                          <div className="space-y-1 pt-1">
                            <h5 className="font-bold text-slate-100 text-xs flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                              {data.eventTitle}
                            </h5>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                              {data.extendedTechnicalDescription || data.notes}
                            </p>
                            {data.systemsImpactSummary && (
                              <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800/80">
                                <strong className="text-slate-300 not-italic font-semibold">Systems Note:</strong> {data.systemsImpactSummary}
                              </p>
                            )}
                          </div>

                          {/* Action Pill to Open Full Dedicated Inspector Modal */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedInspectEvent(data);
                              }}
                              className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <MousePointerClick className="w-3.5 h-3.5" />
                              <span>Open Full Event Details Popup</span>
                            </button>
                          </div>

                          {/* 5. Geophysical Event Highlight in Tooltip */}
                          {geo && (
                            <div 
                              onClick={() => handleSelectGeoEvent(geo)}
                              className="bg-slate-950 border border-rose-500/40 rounded-xl p-2.5 space-y-1.5 text-[11px] hover:border-rose-400 transition-colors cursor-pointer"
                              title="Click to inspect this Geophysical Event below"
                            >
                              <div className="flex items-center justify-between text-rose-300 font-bold">
                                <span className="flex items-center gap-1">
                                  🌋 {geo.name}
                                </span>
                                <span className="font-mono px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/30 text-[10px]">
                                  {geo.lodImpactMicros > 0 ? '+' : ''}{geo.lodImpactMicros} µs/day
                                </span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                Impact: <strong className="text-slate-200">{geo.magnitude}</strong> • Polar Shift: <strong className="text-slate-200">{geo.axisShiftCm} cm</strong>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-2">
                                {geo.description}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Milestone Reference Lines & Annotations */}
                {showMilestones && (
                  <>
                    <ReferenceLine
                      x={1972}
                      stroke="#06b6d4"
                      strokeDasharray="4 4"
                      label={{
                        value: '1972: UTC (+10s)',
                        position: 'insideTopLeft',
                        fill: '#06b6d4',
                        fontSize: 10
                      }}
                    />
                    <ReferenceLine
                      x={1980}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        value: '1980: GPS Epoch',
                        position: 'insideTopLeft',
                        fill: '#f59e0b',
                        fontSize: 10
                      }}
                    />
                    <ReferenceLine
                      x={2016}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{
                        value: '2016: Last Leap (+37s)',
                        position: 'insideTopLeft',
                        fill: '#10b981',
                        fontSize: 10
                      }}
                    />
                    <ReferenceLine
                      x={2035}
                      stroke="#a855f7"
                      strokeDasharray="4 4"
                      label={{
                        value: '2035: CGPM Abolition',
                        position: 'insideTopLeft',
                        fill: '#a855f7',
                        fontSize: 10
                      }}
                    />
                    {/* Projected Phase Area */}
                    <ReferenceArea
                      x1={2026}
                      x2={2035}
                      fill="#8b5cf6"
                      fillOpacity={0.06}
                    />
                  </>
                )}

                {/* User-Configurable Time-Synchronization Warning Zone */}
                {showWarningZone && (
                  <>
                    {/* Visual Shaded Warning Band */}
                    <ReferenceArea
                      y1={Math.max(0.000001, warningThresholdMicros / 1_000_000)}
                      y2={showTt ? 75 : 42}
                      fill="url(#warningZoneGradient)"
                      fillOpacity={1}
                      stroke="#f43f5e"
                      strokeDasharray="4 4"
                      strokeOpacity={0.4}
                    />

                    {/* Warning Threshold Boundary Line */}
                    <ReferenceLine
                      y={Math.max(0.000001, warningThresholdMicros / 1_000_000)}
                      stroke="#f43f5e"
                      strokeWidth={1.8}
                      strokeDasharray="4 4"
                      label={{
                        value: `⚠️ Critical Sync Boundary: > ${formatMicroseconds(warningThresholdMicros)}`,
                        position: warningThresholdMicros >= 1000000 ? 'insideBottomLeft' : 'insideTopLeft',
                        fill: '#fb7185',
                        fontSize: 10,
                        fontWeight: 'bold'
                      }}
                    />
                  </>
                )}

                {/* Visible Leap Second Event Markers (ReferenceDots) on Drift Curve */}
                {showLeapMarkers && filteredTimeline.map(point => {
                  if (!selectedEventMarkerIds.includes(point.id)) return null;

                  const isInspected = selectedInspectEvent?.id === point.id;
                  const is2012Outage = point.date === '2012-06-30';
                  const isGpsLaunch = point.id === 'gps-1980-01-06';
                  const isGenesis = point.id === 'genesis-1972-01-01';
                  const isAbolition = point.id === 'abolition-2035-01-01';
                  const isLastLeap = point.date === '2016-12-31';
                  const isExceedingWarning = showWarningZone && (point.taiMinusUtc * 1_000_000) > warningThresholdMicros;

                  const dotFill = 
                    isInspected ? '#38bdf8' :
                    is2012Outage ? '#f43f5e' :
                    isGpsLaunch ? '#f59e0b' :
                    isGenesis ? '#06b6d4' :
                    isAbolition ? '#a855f7' :
                    isLastLeap ? '#10b981' :
                    isExceedingWarning ? '#f59e0b' :
                    '#10b981';

                  return (
                    <ReferenceDot
                      key={point.id}
                      x={point.year}
                      y={point.taiMinusUtc}
                      r={isInspected ? 7 : is2012Outage || isLastLeap || isGpsLaunch ? 5.5 : 4}
                      fill={dotFill}
                      stroke={isExceedingWarning && !isInspected ? '#f43f5e' : '#ffffff'}
                      strokeWidth={isInspected ? 2.5 : isExceedingWarning ? 2 : 1.2}
                      onClick={() => setSelectedInspectEvent(point)}
                      className="cursor-pointer transition-all hover:scale-125"
                    />
                  );
                })}

                {/* Geophysical Event Reference Dots */}
                {showGeoMarkers && GEOPHYSICAL_ROTATION_EVENTS.map(event => {
                  const matchingPoint = filteredTimeline.find(p => p.year === event.year);
                  if (!matchingPoint) return null;
                  const dotColor = 
                    event.category === 'seismic' ? '#f43f5e' :
                    event.category === 'atmospheric' ? '#f59e0b' :
                    event.category === 'core_mantle' ? '#a855f7' : '#06b6d4';

                  const isSelected = selectedGeoEventId === event.id;

                  return (
                    <ReferenceDot
                      key={event.id}
                      x={event.year}
                      y={matchingPoint.taiMinusUtc}
                      r={isSelected ? 6 : 4}
                      fill={dotColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2 : 1}
                      onClick={() => handleSelectGeoEvent(event)}
                    />
                  );
                })}

                {/* TAI - UTC Curve (Step function) */}
                {showTai && (
                  <Area
                    type="stepAfter"
                    dataKey="taiMinusUtc"
                    name="TAI - UTC"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fill="url(#taiGradient)"
                    dot={{ stroke: '#06b6d4', strokeWidth: 1.5, r: 2, fill: '#0891b2' }}
                    activeDot={{ r: 5, stroke: '#67e8f9', strokeWidth: 2, fill: '#06b6d4' }}
                  />
                )}

                {/* GPS - UTC Curve (Step function) */}
                {showGps && (
                  <Area
                    type="stepAfter"
                    dataKey="gpsMinusUtc"
                    name="GPS - UTC"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#gpsGradient)"
                    dot={{ stroke: '#f59e0b', strokeWidth: 1.5, r: 2, fill: '#d97706' }}
                    activeDot={{ r: 5, stroke: '#fcd34d', strokeWidth: 2, fill: '#f59e0b' }}
                  />
                )}

                {/* TT - UTC Curve (Step function) */}
                {showTt && (
                  <Area
                    type="stepAfter"
                    dataKey="ttMinusUtc"
                    name="TT - UTC"
                    stroke="#a855f7"
                    strokeWidth={1.8}
                    fill="url(#ttGradient)"
                    dot={false}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'frequency' && (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={DECADE_LEAP_STATS}
                margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="decade"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{
                    value: 'Leap Seconds Inserted',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 10
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as (typeof DECADE_LEAP_STATS)[0];
                      return (
                        <div className="bg-slate-900/98 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-4 shadow-2xl text-xs text-white max-w-sm space-y-3 z-50 animate-fadeIn">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                              <span className="font-bold font-mono text-cyan-200 text-sm">{data.decade}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              {data.insertions} Leap Seconds
                            </span>
                          </div>

                          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 space-y-1.5 font-mono text-[11px]">
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="text-slate-400 font-sans">TAI-UTC Offset Span:</span>
                              <span className="text-white font-extrabold">+{data.startOffset}.000s → +{data.endOffset}.000s</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="text-slate-400 font-sans">Insertion Velocity:</span>
                              <span className="text-cyan-300 font-bold">{data.annualRate} leap sec / yr</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300">
                              <span className="text-slate-400 font-sans">Average Interval:</span>
                              <span className="text-amber-300 font-bold">{data.avgIntervalDays} days (~{(data.avgIntervalDays / 365.25).toFixed(1)} yrs)</span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Geophysical & Rotational Dynamics:</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                              {data.rotationTrend}
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="insertions"
                  name="Leap Seconds"
                  fill="#06b6d4"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {viewMode === 'intervals' && (
          <div className="h-80 sm:h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={intervalData}
                margin={{ top: 20, right: 30, left: 15, bottom: 35 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="label"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={1}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  label={{
                    value: 'Days Since Previous Leap Second',
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#64748b',
                    fontSize: 11,
                    offset: 5
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as (typeof intervalData)[0];
                      return (
                        <div className="bg-slate-900/98 backdrop-blur-xl border border-emerald-500/50 rounded-2xl p-4 shadow-2xl text-xs text-white max-w-sm space-y-3 z-50 animate-fadeIn">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                              <span className="font-bold font-mono text-emerald-300 text-sm">{data.date}</span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              TAI - UTC: +{data.taiOffset}.000s
                            </span>
                          </div>

                          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 space-y-1 font-mono">
                            <div className="flex justify-between items-center text-slate-300 text-[11px]">
                              <span className="text-slate-400 font-sans">Elapsed Gap:</span>
                              <span className="text-white font-extrabold text-sm">{data.days} days ({((data.days || 1) / 365.25).toFixed(2)} years)</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-300 text-[11px]">
                              <span className="text-slate-400 font-sans">Relative Magnitude:</span>
                              <span className={`font-bold ${data.days >= 1000 ? 'text-rose-300' : 'text-emerald-300'}`}>
                                {data.days >= 2000 ? 'Historic Multi-Year Pause' : data.days >= 1000 ? 'Extended Rotation Plateau' : 'Standard Decadal Rhythm'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1 pt-1">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Event Details:</span>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{data.notes}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={2557}
                  stroke="#f43f5e"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Max Gap: 2,557 Days (7.0 Years, 1998-2005)',
                    position: 'insideTopRight',
                    fill: '#f43f5e',
                    fontSize: 10
                  }}
                />
                <Bar
                  dataKey="days"
                  name="Days Gap"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 5. POPUP DESCRIPTION MODAL / DIALOG for Specific Historical Leap Second Events */}
      {selectedInspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-white relative">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">
                      {selectedInspectEvent.eventTitle}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      selectedInspectEvent.projected
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                        : selectedInspectEvent.leapInserted > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    }`}>
                      {selectedInspectEvent.leapSequenceLabel || 'Epoch Milestone'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    Official Date: <strong className="text-slate-200">{selectedInspectEvent.displayDate}</strong> ({selectedInspectEvent.exactTimestampUtc})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleEventMarker(selectedInspectEvent.id)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    selectedEventMarkerIds.includes(selectedInspectEvent.id)
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle marker visibility on chart"
                >
                  {selectedEventMarkerIds.includes(selectedInspectEvent.id) ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Marker: Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Marker: Hidden</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInspectEvent(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close popup (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Transition Step Sequence Simulator */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 font-sans">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" /> Metrological Timecode Transition
                </span>
                <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                  {selectedInspectEvent.iersAuthority}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-3 flex items-center justify-center text-center">
                <span className="font-mono text-sm sm:text-base font-bold text-emerald-400 tracking-wider">
                  {selectedInspectEvent.utcSequenceStr}
                </span>
              </div>
            </div>

            {/* Exact Offsets Metrology Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-cyan-950/30 border border-cyan-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block font-sans">TAI - UTC Offset</span>
                <span className="text-base font-extrabold text-cyan-200 block mt-1">
                  {selectedInspectEvent.cumulativeTaiFormatted}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                  Atomic standard lag
                </span>
              </div>

              <div className="bg-amber-950/30 border border-amber-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-400 block font-sans">GPS - UTC Offset</span>
                <span className="text-base font-extrabold text-amber-200 block mt-1">
                  {selectedInspectEvent.cumulativeGpsFormatted}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                  Locked to TAI-19s
                </span>
              </div>

              <div className="bg-purple-950/30 border border-purple-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-purple-400 block font-sans">TT - UTC Offset</span>
                <span className="text-base font-extrabold text-purple-200 block mt-1">
                  {selectedInspectEvent.cumulativeTtFormatted}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                  Terrestrial Time
                </span>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block font-sans">Elapsed Gap</span>
                <span className="text-base font-extrabold text-emerald-200 block mt-1">
                  {selectedInspectEvent.daysSinceLastLeap > 0 ? `${selectedInspectEvent.daysSinceLastLeap}d` : 'Baseline'}
                </span>
                <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
                  {selectedInspectEvent.daysSinceLastLeap > 0 ? `~${(selectedInspectEvent.daysSinceLastLeap / 365.25).toFixed(1)} yrs since prior` : 'Initial Epoch'}
                </span>
              </div>
            </div>

            {/* Extended Scientific & Operational Impact Descriptions */}
            <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <h5 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Rotational Context & Historical Significance
                </h5>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {selectedInspectEvent.extendedTechnicalDescription}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <h5 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  Systems, Telemetry & Infrastructure Impact
                </h5>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  {selectedInspectEvent.systemsImpactSummary}
                </p>
              </div>
            </div>

            {/* Linked Geophysical Event Link (if any) */}
            {selectedInspectEvent.geophysicalEvent && (
              <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <span>Associated Geophysical Event: {selectedInspectEvent.geophysicalEvent.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Rotational ΔLOD: <strong className="text-slate-200">{selectedInspectEvent.geophysicalEvent.lodImpactMicros > 0 ? '+' : ''}{selectedInspectEvent.geophysicalEvent.lodImpactMicros}µs/day</strong> • Shift: <strong className="text-slate-200">{selectedInspectEvent.geophysicalEvent.axisShiftCm}cm</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedInspectEvent.geophysicalEvent) {
                      handleSelectGeoEvent(selectedInspectEvent.geophysicalEvent);
                      setSelectedInspectEvent(null);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] transition-colors cursor-pointer self-start sm:self-center shrink-0"
                >
                  View Geophysical Impact
                </button>
              </div>
            )}

            {/* Modal Footer Controls (Stepper & Citation Copy) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-800 pt-4 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevEvent}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous Event</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextEvent}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                >
                  <span>Next Event</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyEventDetails(selectedInspectEvent)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-[11px]"
                >
                  {copiedEventId === selectedInspectEvent.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Citation Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Citation</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInspectEvent(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors cursor-pointer text-[11px]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Geophysical Event Inspector Drawer / Card (Active when event selected or found) */}
      {activeGeoEvent && (
        <div className="bg-slate-950 border border-rose-500/40 rounded-xl p-4 text-xs space-y-3 shadow-lg transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {activeGeoEvent.category === 'seismic' ? <Flame className="w-4 h-4" /> :
                 activeGeoEvent.category === 'atmospheric' ? <Wind className="w-4 h-4" /> :
                 activeGeoEvent.category === 'core_mantle' ? <Cpu className="w-4 h-4" /> :
                 <Snowflake className="w-4 h-4" />}
              </span>
              <div>
                <h4 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
                  {activeGeoEvent.name}
                  <span className="text-[10px] font-mono font-normal px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                    {activeGeoEvent.displayDate}
                  </span>
                </h4>
                <p className="text-[11px] text-slate-400">{activeGeoEvent.significance}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {activeGeoEvent.magnitude}
              </span>
              <button
                type="button"
                onClick={() => setSelectedGeoEventId(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 cursor-pointer"
                title="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Length of Day (ΔLOD)</span>
              <span className={`text-base font-extrabold block mt-0.5 ${activeGeoEvent.lodImpactMicros < 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                {activeGeoEvent.lodImpactMicros > 0 ? '+' : ''}{activeGeoEvent.lodImpactMicros} µs/day
              </span>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">
                {activeGeoEvent.lodImpactMicros < 0 ? 'Earth rotation sped up' : 'Earth rotation slowed down'}
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Mean Polar Axis Shift</span>
              <span className="text-base font-extrabold text-purple-400 block mt-0.5">
                {activeGeoEvent.axisShiftCm} cm
              </span>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">
                Figure axis displacement
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Epoch TAI - UTC Offset</span>
              <span className="text-base font-extrabold text-cyan-300 block mt-0.5">
                +{activeGeoEvent.taiUtcOffsetAtEpoch}s
              </span>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">
                Offset at time of event
              </span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">Nearest Leap Second</span>
              <span className="text-xs font-extrabold text-emerald-400 block mt-1 font-sans truncate">
                {activeGeoEvent.nearestLeapDate || 'None (Stabilization)'}
              </span>
              <span className="text-[10px] text-slate-500 block font-sans mt-0.5">
                IERS correlation
              </span>
            </div>
          </div>

          <div className="space-y-1 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" /> Geophysical & Rotational Dynamics Mechanism
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {activeGeoEvent.scientificImpact}
            </p>
          </div>
        </div>
      )}

      {/* 7. Statistical Summary Badges & Decadal Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Leap Seconds</span>
          <span className="text-xl font-extrabold font-mono text-cyan-400 mt-1 block">27</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">1972–Present</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">50-Yr Accumulated Drift</span>
          <span className="text-xl font-extrabold font-mono text-emerald-400 mt-1 block">+27.0s</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">TAI-UTC: +10s → +37s</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">GPS Offset Growth</span>
          <span className="text-xl font-extrabold font-mono text-amber-400 mt-1 block">+18.0s</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">0s in 1980 → +18s in 2026</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Longest Leap Drought</span>
          <span className="text-xl font-extrabold font-mono text-rose-400 mt-1 block">7.0 Years</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">2,557 days (1998–2005)</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Plateau</span>
          <span className="text-xl font-extrabold font-mono text-blue-400 mt-1 block">9.6+ Years</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Since Dec 31, 2016</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">CGPM Phase-Out</span>
          <span className="text-xl font-extrabold font-mono text-purple-400 mt-1 block">2035</span>
          <span className="text-[10px] text-slate-500 mt-0.5 block">Resolution 4 Effective</span>
        </div>
      </div>

      {/* 8. Key Historical Takeaways & Physical Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>The 1970s–1990s Acceleration vs. Modern 2000s Slowdown</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Between 1972 and 1999, leap seconds were inserted almost annually (<strong>22 leap seconds in 27 years</strong>) due to steady core-mantle tidal deceleration. In contrast, since 2000, only <strong>5 leap seconds</strong> have been needed because Earth's rotational speed intermittently accelerated from core turbulence, megathrust earthquakes (Sumatra, Tōhoku), and glacial mass redistribution.
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-purple-300 font-bold">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>Why the Plateau Reaches the 2035 Horizon</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Because UT1 - UTC has remained near <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">+0.038s</code>, no leap seconds are anticipated in the near term. When BIPM CGPM Resolution 4 activates in <strong>2035</strong>, the requirement to keep UT1 - UTC within ±0.9s will be lifted, rendering the TAI - UTC offset continuous and permanent for the century ahead.
          </p>
        </div>
      </div>

      {/* Global Drift Alert Configuration Modal */}
      <DriftAlertConfigModal
        isOpen={isDriftAlertModalOpen}
        onClose={() => setIsDriftAlertModalOpen(false)}
        initialThresholdMicros={warningThresholdMicros}
      />
    </div>
  );
};
