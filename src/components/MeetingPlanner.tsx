import React, { useState, useMemo } from 'react';
import { 
  Users, Calendar, Clock, Sparkles, Plus, Trash2, Check, Share2, 
  ExternalLink, Download, Copy, AlertCircle, Sun, Moon, ArrowRight, 
  Sliders, Star, Globe, RefreshCw, Zap, ShieldCheck, Info
} from 'lucide-react';
import { City, TimezoneOffsetInfo } from '../types';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import { getTimezoneOffsetInfo, formatCityDateTime, getHourSuitability, encodeSharedEvent } from '../lib/timezoneUtils';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../lib/icsGenerator';

interface MeetingPlannerProps {
  initialCities?: City[];
  onAddCityToWatchlist?: (city: City) => void;
}

// Preset multi-city team templates
interface TeamPreset {
  id: string;
  name: string;
  description: string;
  cityIds: string[];
}

const TEAM_PRESETS: TeamPreset[] = [
  {
    id: 'us-eu-bridge',
    name: '🇺🇸 ↔ 🇪🇺 US-Europe Sync',
    description: 'New York, San Francisco, London, Berlin',
    cityIds: ['nyc', 'sfo', 'lon', 'ber']
  },
  {
    id: 'global-trio',
    name: '🌐 Global Follow-the-Sun',
    description: 'San Francisco, London, Tokyo, Sydney',
    cityIds: ['sfo', 'lon', 'tyo', 'syd']
  },
  {
    id: 'apac-hub',
    name: '🌏 APAC & Middle East',
    description: 'Dubai, Mumbai, Singapore, Tokyo, Sydney',
    cityIds: ['dxb', 'mum', 'sin', 'tyo', 'syd']
  },
  {
    id: 'us-coast',
    name: '🗽 US Coast-to-Coast',
    description: 'New York, Chicago, Denver, Los Angeles',
    cityIds: ['nyc', 'chi', 'den', 'lax']
  }
];

export const MeetingPlanner: React.FC<MeetingPlannerProps> = ({ 
  initialCities,
  onAddCityToWatchlist 
}) => {
  // Cities participating in the meeting
  const [selectedCities, setSelectedCities] = useState<City[]>(() => {
    if (initialCities && initialCities.length >= 2) {
      return initialCities;
    }
    return [
      MAJOR_CITIES.find(c => c.id === 'nyc') || MAJOR_CITIES[0],
      MAJOR_CITIES.find(c => c.id === 'lon') || MAJOR_CITIES[1],
      MAJOR_CITIES.find(c => c.id === 'tyo') || MAJOR_CITIES[3],
      MAJOR_CITIES.find(c => c.id === 'syd') || MAJOR_CITIES[4],
    ];
  });

  // Host / Anchor City
  const [hostCityId, setHostCityId] = useState<string>(() => selectedCities[0]?.id || 'nyc');

  // Meeting parameters
  const [meetingTitle, setMeetingTitle] = useState<string>('Global Team Alignment & Sync');
  const [meetingDateStr, setMeetingDateStr] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [meetingDurationMins, setMeetingDurationMins] = useState<number>(60);
  
  // Custom work hours window configuration
  const [workStartHour, setWorkStartHour] = useState<number>(9); // 09:00
  const [workEndHour, setWorkEndHour] = useState<number>(17); // 17:00

  // Reference scrub hour in UTC (0 to 23)
  const [selectedUtcHour, setSelectedUtcHour] = useState<number>(14); // 14:00 UTC (10am NY, 3pm Lon)

  // Search input state for adding cities
  const [citySearchQuery, setCitySearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<City[]>([]);

  // Feedback states
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [shareUrl, setShareUrl] = useState<string>('');

  // Host city object
  const hostCity = useMemo(() => {
    return selectedCities.find(c => c.id === hostCityId) || selectedCities[0] || MAJOR_CITIES[0];
  }, [selectedCities, hostCityId]);

  // Handle adding a city
  const handleAddCity = (city: City) => {
    if (!selectedCities.some(c => c.id === city.id)) {
      setSelectedCities(prev => [...prev, city]);
    }
    setCitySearchQuery('');
    setSearchResults([]);
  };

  // Handle removing a city
  const handleRemoveCity = (cityId: string) => {
    if (selectedCities.length <= 1) return; // Keep at least 1
    const next = selectedCities.filter(c => c.id !== cityId);
    setSelectedCities(next);
    if (hostCityId === cityId && next.length > 0) {
      setHostCityId(next[0].id);
    }
  };

  // Handle applying a team preset
  const handleApplyPreset = (preset: TeamPreset) => {
    const cities = preset.cityIds
      .map(id => MAJOR_CITIES.find(c => c.id === id))
      .filter((c): c is City => Boolean(c));
    if (cities.length > 0) {
      setSelectedCities(cities);
      setHostCityId(cities[0].id);
    }
  };

  // Calculate local meeting date & time for a given city and UTC hour
  const getCityMeetingDetails = (city: City, utcHour: number) => {
    // Construct Date object in UTC based on selected meeting date and UTC hour
    const [year, month, day] = meetingDateStr.split('-').map(Number);
    const dateUtc = new Date(Date.UTC(year, month - 1, day, utcHour, 0, 0));

    const offsetInfo = getTimezoneOffsetInfo(dateUtc, city.timezone);
    const formatted = formatCityDateTime(dateUtc, city.timezone, false);

    // Determine local hour (0-23)
    const localHour = formatted.hour24;

    // Determine suitability
    let suitability: 'WORK_HOURS' | 'SHOULDER_HOURS' | 'SLEEP_HOURS' = 'SLEEP_HOURS';
    if (localHour >= workStartHour && localHour < workEndHour) {
      suitability = 'WORK_HOURS';
    } else if (
      (localHour >= Math.max(0, workStartHour - 2) && localHour < workStartHour) ||
      (localHour >= workEndHour && localHour < Math.min(24, workEndHour + 4))
    ) {
      suitability = 'SHOULDER_HOURS';
    } else {
      suitability = 'SLEEP_HOURS';
    }

    // Check day offset compared to the selected meeting date
    const cityDateLocal = new Date(dateUtc.toLocaleString('en-US', { timeZone: city.timezone }));
    const refDateLocal = new Date(dateUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
    
    let dayDiff = 0;
    if (cityDateLocal.getDate() > refDateLocal.getDate()) dayDiff = 1;
    else if (cityDateLocal.getDate() < refDateLocal.getDate()) dayDiff = -1;

    return {
      dateUtc,
      offsetInfo,
      formatted,
      localHour,
      suitability,
      dayDiff
    };
  };

  // Compute 24-hour overlap matrix scores (for all 24 UTC hours)
  const hourScores = useMemo(() => {
    return Array.from({ length: 24 }).map((_, utcH) => {
      let greenCount = 0;
      let yellowCount = 0;
      let redCount = 0;

      selectedCities.forEach(city => {
        const details = getCityMeetingDetails(city, utcH);
        if (details.suitability === 'WORK_HOURS') greenCount++;
        else if (details.suitability === 'SHOULDER_HOURS') yellowCount++;
        else redCount++;
      });

      const total = selectedCities.length;
      // Score calculation: 100% if all green, reduced for yellow/red
      const score = Math.round(((greenCount * 1.0 + yellowCount * 0.5) / total) * 100);

      let status: 'perfect' | 'good' | 'fair' | 'poor' = 'poor';
      if (greenCount === total) status = 'perfect';
      else if (redCount === 0) status = 'good';
      else if (greenCount >= 1 && redCount <= 1) status = 'fair';
      else status = 'poor';

      return {
        utcHour: utcH,
        score,
        greenCount,
        yellowCount,
        redCount,
        status
      };
    });
  }, [selectedCities, meetingDateStr, workStartHour, workEndHour]);

  // Auto-Find Best Time Slot
  const handleAutoFindBestSlot = () => {
    // Sort hours by score descending, prefer daytime over nighttime
    let bestSlot = hourScores[0];
    let maxScore = -1;

    hourScores.forEach(slot => {
      if (slot.score > maxScore) {
        maxScore = slot.score;
        bestSlot = slot;
      }
    });

    setSelectedUtcHour(bestSlot.utcHour);
  };

  // Active meeting slot details for all cities
  const activeMeetingDetails = useMemo(() => {
    const [year, month, day] = meetingDateStr.split('-').map(Number);
    const startUtcDate = new Date(Date.UTC(year, month - 1, day, selectedUtcHour, 0, 0));

    return {
      startUtcDate,
      startUtcIso: startUtcDate.toISOString(),
      cities: selectedCities.map(city => ({
        city,
        isHost: city.id === hostCityId,
        ...getCityMeetingDetails(city, selectedUtcHour)
      }))
    };
  }, [selectedCities, hostCityId, meetingDateStr, selectedUtcHour, workStartHour, workEndHour]);

  // Generate plain-text meeting schedule for Slack/Email clipboard
  const handleCopyFormattedSchedule = () => {
    const lines = [
      `📅 ${meetingTitle}`,
      `🕒 Date: ${meetingDateStr} • Duration: ${meetingDurationMins} minutes`,
      `----------------------------------------`
    ];

    activeMeetingDetails.cities.forEach(item => {
      const flag = item.city.countryCode;
      const hostTag = item.isHost ? ' (Host)' : '';
      const dayTag = item.dayDiff > 0 ? ' (+1 day)' : item.dayDiff < 0 ? ' (-1 day)' : '';
      lines.push(`${flag} ${item.city.name}: ${item.formatted.timeStr} ${item.offsetInfo.abbreviation}${dayTag}${hostTag}`);
    });

    lines.push(`----------------------------------------`);
    lines.push(`🌐 UTC Time: ${selectedUtcHour.toString().padStart(2, '0')}:00 UTC`);
    lines.push(`⚡ Scheduled via Timegovern.com Meeting Planner`);

    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  // Generate Shareable Link
  const handleGenerateShareLink = () => {
    const encoded = encodeSharedEvent(meetingTitle, activeMeetingDetails.startUtcDate.getTime(), hostCityId);
    const fullUrl = `${window.location.origin}${window.location.pathname}?meeting=${encoded}`;
    setShareUrl(fullUrl);
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // Check if any location has day boundary crossing
  const hasDateBoundaryCross = activeMeetingDetails.cities.some(c => c.dayDiff !== 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Meeting Planner Description */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800/60 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <Users className="w-3 h-3 text-slate-950" /> Working Hours Overlap Matrix
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                IANA tzdata Compliant
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-display flex items-center gap-2 text-white">
              <Globe className="w-6 h-6 text-cyan-400" />
              Global Meeting Planner & Cross-Timezone Scheduler
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Compare working hours across multiple world cities simultaneously. Eliminate timezone math, avoid midnight sleep disturbances, and auto-detect optimal meeting overlap slots.
            </p>
          </div>

          {/* Quick Action Button: Auto-Find Best Time */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoFindBestSlot}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg hover:shadow-amber-400/20 transition-all cursor-pointer flex items-center gap-2"
              title="Automatically calculate the slot with the highest overlap score"
            >
              <Zap className="w-4 h-4 text-slate-950" />
              <span>Auto-Find Best Time Slot</span>
            </button>
          </div>
        </div>

        {/* Quick Team Presets Bar */}
        <div className="mt-4 pt-3 border-t border-blue-800/40 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-300 text-[11px] font-semibold flex items-center gap-1 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Team Presets:
          </span>
          {TEAM_PRESETS.map(preset => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-100 rounded-lg text-[11px] font-medium border border-white/10 transition-all cursor-pointer"
              title={preset.description}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Configuration Bar (Title, Date, Duration, Work Hours) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm text-slate-800 dark:text-slate-100">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Meeting Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Meeting Title
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold"
              placeholder="e.g. Sprint Planning, Client Demo"
            />
          </div>

          {/* Meeting Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Meeting Date
            </label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={meetingDateStr}
                onChange={(e) => setMeetingDateStr(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono font-semibold"
              />
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setMeetingDateStr(today);
                }}
                className="px-2 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap cursor-pointer"
                title="Set to Today"
              >
                Today
              </button>
            </div>
          </div>

          {/* Meeting Duration */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Duration
            </label>
            <select
              value={meetingDurationMins}
              onChange={(e) => setMeetingDurationMins(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-semibold cursor-pointer"
            >
              <option value={15}>15 Minutes</option>
              <option value={30}>30 Minutes</option>
              <option value={45}>45 Minutes</option>
              <option value={60}>60 Minutes (1 hour)</option>
              <option value={90}>90 Minutes (1.5 hours)</option>
              <option value={120}>120 Minutes (2 hours)</option>
            </select>
          </div>

          {/* Working Hours Definition */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              Work Window
            </label>
            <div className="flex items-center gap-1 text-xs">
              <select
                value={workStartHour}
                onChange={(e) => setWorkStartHour(Number(e.target.value))}
                className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <option value={8}>08:00 AM</option>
                <option value={9}>09:00 AM</option>
                <option value={10}>10:00 AM</option>
              </select>
              <span className="text-slate-400 text-xs font-bold">to</span>
              <select
                value={workEndHour}
                onChange={(e) => setWorkEndHour(Number(e.target.value))}
                className="flex-1 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-2 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
              >
                <option value={17}>05:00 PM</option>
                <option value={18}>06:00 PM</option>
                <option value={19}>07:00 PM</option>
              </select>
            </div>
          </div>
        </div>

        {/* Add Location Search Bar & Participant Badges */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* City Autocomplete Input */}
            <div className="relative flex-1 max-w-md">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(e) => {
                    setCitySearchQuery(e.target.value);
                    setSearchResults(searchCities(e.target.value, 6));
                  }}
                  placeholder="Type city or country (e.g. Zurich, Tokyo, San Francisco)..."
                  className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 placeholder-slate-400 font-medium"
                />
                <button
                  onClick={() => {
                    if (citySearchQuery.trim()) {
                      const matches = searchCities(citySearchQuery, 1);
                      if (matches.length > 0) handleAddCity(matches[0]);
                    }
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" /> Add City
                </button>
              </div>

              {/* Autocomplete Dropdown */}
              {citySearchQuery && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-40 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                  {searchResults.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleAddCity(c)}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-blue-50 dark:hover:bg-slate-800 flex justify-between items-center transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">{c.name}</span>
                        <span className="text-slate-500 text-[11px]">({c.country})</span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-cyan-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {c.timezone}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suitability Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></span>
                <span>Work Hours ({workStartHour}:00 - {workEndHour}:00)</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-800">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></span>
                <span>Shoulder / Early / Evening</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                <span>Night / Sleep</span>
              </div>
            </div>
          </div>

          {/* Active Selected Location Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Active Locations ({selectedCities.length}):
            </span>
            {selectedCities.map(city => {
              const isHost = city.id === hostCityId;
              const offsetInfo = getTimezoneOffsetInfo(new Date(), city.timezone);

              return (
                <div
                  key={city.id}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                    isHost
                      ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-400 dark:border-blue-600 text-blue-900 dark:text-blue-200 font-bold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <button
                    onClick={() => setHostCityId(city.id)}
                    className="cursor-pointer hover:scale-110 transition-transform"
                    title={isHost ? 'Host / Anchor Location' : 'Click to make Host Location'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isHost ? 'fill-amber-400 text-amber-400' : 'text-slate-400 hover:text-amber-400'}`} />
                  </button>

                  <div className="text-xs">
                    <span className="font-extrabold">{city.name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-1">({city.countryCode})</span>
                    <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 ml-1.5">
                      {offsetInfo.offsetFormatted}
                    </span>
                  </div>

                  {selectedCities.length > 1 && (
                    <button
                      onClick={() => handleRemoveCity(city.id)}
                      className="text-slate-400 hover:text-red-500 p-0.5 transition-colors cursor-pointer"
                      title={`Remove ${city.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. 24-Hour Overlap Heatmap Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-md overflow-hidden space-y-3 text-slate-800 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              24-Hour Global Alignment Heatmap ({meetingDateStr})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Click any hour cell or score badge to set the meeting time. Highlighted column shows currently selected meeting slot.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-2">
            <span>Selected UTC Slot:</span>
            <span className="text-blue-600 dark:text-cyan-400 font-extrabold text-sm">{selectedUtcHour.toString().padStart(2, '0')}:00 UTC</span>
          </div>
        </div>

        {/* Global Overlap Score Summary Row */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[760px] space-y-2">
            {/* Header: Global Score Bar */}
            <div className="grid grid-cols-[160px_repeat(24,1fr)] gap-1 items-center bg-slate-100 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Overlap Rating:</span>
              </div>
              {hourScores.map((h) => {
                const isSelected = h.utcHour === selectedUtcHour;
                
                const scoreColors = {
                  perfect: 'bg-emerald-500 text-white font-black ring-1 ring-emerald-600',
                  good: 'bg-emerald-400 dark:bg-emerald-600 text-white font-bold',
                  fair: 'bg-amber-400 dark:bg-amber-500 text-slate-950 font-bold',
                  poor: 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                };

                return (
                  <button
                    key={h.utcHour}
                    onClick={() => setSelectedUtcHour(h.utcHour)}
                    className={`py-1 text-center rounded text-[10px] font-mono cursor-pointer transition-all ${scoreColors[h.status]} ${
                      isSelected ? 'ring-2 ring-blue-600 dark:ring-cyan-400 ring-offset-2 scale-105 z-10' : 'hover:opacity-80'
                    }`}
                    title={`${h.utcHour}:00 UTC - Overlap Score: ${h.score}% (${h.greenCount} green, ${h.yellowCount} yellow, ${h.redCount} red)`}
                  >
                    {h.score}%
                  </button>
                );
              })}
            </div>

            {/* City Row Overlap Bars */}
            {selectedCities.map((city) => {
              const isHost = city.id === hostCityId;
              const offsetInfo = getTimezoneOffsetInfo(new Date(), city.timezone);

              return (
                <div 
                  key={city.id} 
                  className={`grid grid-cols-[160px_repeat(24,1fr)] gap-1 items-center p-2 rounded-xl border transition-all ${
                    isHost 
                      ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* City Label */}
                  <div className="pr-2 flex flex-col justify-center">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                        {city.name}
                      </span>
                      {isHost && (
                        <span className="text-[9px] bg-blue-600 text-white font-extrabold px-1 rounded">
                          HOST
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{offsetInfo.abbreviation}</span>
                      <span>•</span>
                      <span>{offsetInfo.offsetFormatted}</span>
                    </div>
                  </div>

                  {/* 24 Hour Blocks */}
                  {Array.from({ length: 24 }).map((_, utcH) => {
                    const details = getCityMeetingDetails(city, utcH);
                    const isSelected = utcH === selectedUtcHour;
                    const localH = details.localHour;
                    const isNight = localH < 6 || localH >= 22;

                    const colorClass = {
                      WORK_HOURS: 'bg-emerald-500 text-white font-bold',
                      SHOULDER_HOURS: 'bg-amber-400 dark:bg-amber-500 text-slate-950 font-bold',
                      SLEEP_HOURS: isNight 
                        ? 'bg-slate-800 text-slate-500 border border-slate-700' 
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }[details.suitability];

                    return (
                      <button
                        key={utcH}
                        onClick={() => setSelectedUtcHour(utcH)}
                        className={`p-1 h-9 flex flex-col items-center justify-center rounded text-[9px] font-mono cursor-pointer transition-all relative ${colorClass} ${
                          isSelected 
                            ? 'ring-2 ring-blue-600 dark:ring-cyan-400 ring-offset-2 scale-105 z-10 shadow-lg' 
                            : 'hover:scale-105 hover:z-10'
                        }`}
                        title={`${city.name}: ${details.formatted.timeStr} (${details.suitability})`}
                      >
                        <span className="leading-none">{localH.toString().padStart(2, '0')}</span>
                        {isNight && (
                          <Moon className="w-2.5 h-2.5 text-slate-400 opacity-60 mt-0.5" />
                        )}
                        {details.dayDiff !== 0 && (
                          <span className="text-[7px] font-bold text-amber-950 dark:text-amber-300 leading-none">
                            {details.dayDiff > 0 ? '+1d' : '-1d'}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}

            {/* UTC Timeline Ruler Bar */}
            <div className="grid grid-cols-[160px_repeat(24,1fr)] gap-1 items-center px-2 text-[10px] font-mono text-slate-400">
              <div className="font-bold text-slate-500">UTC Reference:</div>
              {Array.from({ length: 24 }).map((_, utcH) => (
                <div 
                  key={utcH} 
                  className={`text-center cursor-pointer ${utcH === selectedUtcHour ? 'text-blue-600 dark:text-cyan-400 font-extrabold' : ''}`}
                  onClick={() => setSelectedUtcHour(utcH)}
                >
                  {utcH.toString().padStart(2, '0')}h
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Slot Breakdown & Synchronized Participant Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Synchronized Meeting Time Summary
              </span>
              {hasDateBoundaryCross && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-400" />
                  Crosses International Date Line Boundary
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white font-display mt-0.5">
              {meetingTitle} • {activeMeetingDetails.startUtcDate.toUTCString().replace(':00 GMT', ' UTC')}
            </h3>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Meeting Duration</span>
            <span className="text-sm font-extrabold font-mono text-amber-400">{meetingDurationMins} minutes</span>
          </div>
        </div>

        {/* City Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {activeMeetingDetails.cities.map(item => {
            const isWork = item.suitability === 'WORK_HOURS';
            const isShoulder = item.suitability === 'SHOULDER_HOURS';

            return (
              <div
                key={item.city.id}
                className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                  item.isHost
                    ? 'bg-blue-950/60 border-blue-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-sm">{item.city.name}</span>
                      <span className="text-[10px] text-slate-400">({item.city.countryCode})</span>
                    </div>
                    {item.isHost && (
                      <span className="text-[9px] bg-blue-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                        HOST
                      </span>
                    )}
                  </div>

                  <div className="text-xl font-mono font-extrabold text-cyan-300 mt-1 flex items-baseline gap-1.5">
                    <span>{item.formatted.timeStr}</span>
                    <span className="text-xs text-slate-400 font-normal">{item.offsetInfo.abbreviation}</span>
                  </div>

                  <div className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5">
                    <span>{item.formatted.dateStr}</span>
                    {item.dayDiff !== 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        item.dayDiff > 0 ? 'bg-amber-500 text-slate-950' : 'bg-purple-500 text-white'
                      }`}>
                        {item.dayDiff > 0 ? 'Next Day (+1)' : 'Prev Day (-1)'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isWork
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : isShoulder
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                  }`}>
                    {isWork ? <Sun className="w-2.5 h-2.5 text-emerald-400" /> : isShoulder ? <Clock className="w-2.5 h-2.5 text-amber-400" /> : <Moon className="w-2.5 h-2.5 text-red-400" />}
                    <span>{isWork ? 'Business Hours' : isShoulder ? 'Shoulder Hours' : 'Night / Sleep'}</span>
                  </span>

                  <span className="text-[10px] font-mono text-slate-400">
                    {item.offsetInfo.offsetFormatted}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5. Calendar Export & Social Sharing Action Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 block">Export & Distribute Meeting Time</span>
            <span className="text-[11px] text-slate-400">
              One-click calendar sync with pre-formatted timezone tables and clipboard snippets.
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Google Calendar Link */}
            <a
              href={generateGoogleCalendarUrl(
                meetingTitle,
                activeMeetingDetails.startUtcIso,
                meetingDurationMins,
                `Scheduled with Timegovern Meeting Planner\n\nParticipants:\n${activeMeetingDetails.cities.map(c => `${c.city.name} (${c.city.country}): ${c.formatted.timeStr} ${c.offsetInfo.abbreviation}`).join('\n')}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Calendar</span>
            </a>

            {/* ICS File Download */}
            <button
              onClick={() => downloadIcsFile(
                meetingTitle,
                activeMeetingDetails.startUtcIso,
                meetingDurationMins,
                `Scheduled with Timegovern Meeting Planner\n\nParticipants:\n${activeMeetingDetails.cities.map(c => `${c.city.name} (${c.city.country}): ${c.formatted.timeStr} ${c.offsetInfo.abbreviation}`).join('\n')}`
              )}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .ICS</span>
            </button>

            {/* Copy Slack/Email Formatted Schedule */}
            <button
              onClick={handleCopyFormattedSchedule}
              className={`font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedSummary
                  ? 'bg-emerald-500 text-slate-950 font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700'
              }`}
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy for Slack/Email'}</span>
            </button>

            {/* Shareable Link */}
            <button
              onClick={handleGenerateShareLink}
              className={`font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                copiedLink
                  ? 'bg-emerald-500 text-slate-950 font-extrabold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
