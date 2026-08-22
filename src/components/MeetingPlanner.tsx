import React, { useState, useMemo } from 'react';
import {
  Users, Calendar, Clock, Sparkles, Plus, Trash2, Check, Share2,
  ExternalLink, Download, Copy, AlertCircle, Sun, Moon,
  Sliders, Star, Globe, Zap
} from 'lucide-react';
import { City } from '../types';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import { getTimezoneOffsetInfo, formatCityDateTime, encodeSharedEvent } from '../lib/timezoneUtils';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../lib/icsGenerator';
import { MeetingHourStrip } from './MeetingHourStrip';

interface MeetingPlannerProps {
  initialCities?: City[];
  onAddCityToWatchlist?: (city: City) => void;
}

interface TeamPreset {
  id: string;
  name: string;
  description: string;
  cityIds: string[];
}

const TEAM_PRESETS: TeamPreset[] = [
  { id: 'us-eu-bridge', name: 'US-Europe Sync', description: 'NYC, SF, London, Berlin', cityIds: ['nyc', 'sfo', 'lon', 'ber'] },
  { id: 'global-trio', name: 'Follow-the-Sun', description: 'SF, London, Tokyo, Sydney', cityIds: ['sfo', 'lon', 'tyo', 'syd'] },
  { id: 'apac-hub', name: 'APAC', description: 'Dubai, Singapore, Tokyo, Sydney', cityIds: ['dxb', 'sin', 'tyo', 'syd'] },
  { id: 'us-coast', name: 'US Coasts', description: 'NYC, Chicago, Denver, LA', cityIds: ['nyc', 'chi', 'den', 'lax'] },
];

export const MeetingPlanner: React.FC<MeetingPlannerProps> = ({ initialCities, onAddCityToWatchlist }) => {
  const [selectedCities, setSelectedCities] = useState<City[]>(() => {
    if (initialCities && initialCities.length >= 2) return initialCities;
    return [
      MAJOR_CITIES.find((c) => c.id === 'nyc') || MAJOR_CITIES[0],
      MAJOR_CITIES.find((c) => c.id === 'lon') || MAJOR_CITIES[1],
      MAJOR_CITIES.find((c) => c.id === 'tyo') || MAJOR_CITIES[3],
      MAJOR_CITIES.find((c) => c.id === 'syd') || MAJOR_CITIES[4],
    ];
  });
  const [hostCityId, setHostCityId] = useState(selectedCities[0]?.id || 'nyc');
  const [meetingTitle, setMeetingTitle] = useState('Global Team Alignment');
  const [meetingDateStr, setMeetingDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [meetingDurationMins, setMeetingDurationMins] = useState(60);
  const [workStartHour, setWorkStartHour] = useState(9);
  const [workEndHour, setWorkEndHour] = useState(17);
  const [selectedUtcHour, setSelectedUtcHour] = useState(14);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleAddCity = (city: City) => {
    if (!selectedCities.some((c) => c.id === city.id)) setSelectedCities((p) => [...p, city]);
    setCitySearchQuery('');
    setSearchResults([]);
  };
  const handleRemoveCity = (cityId: string) => {
    if (selectedCities.length <= 1) return;
    const next = selectedCities.filter((c) => c.id !== cityId);
    setSelectedCities(next);
    if (hostCityId === cityId && next[0]) setHostCityId(next[0].id);
  };
  const handleApplyPreset = (preset: TeamPreset) => {
    const cities = preset.cityIds.map((id) => MAJOR_CITIES.find((c) => c.id === id)).filter(Boolean) as City[];
    if (cities.length) {
      setSelectedCities(cities);
      setHostCityId(cities[0].id);
    }
  };

  const getCityMeetingDetails = (city: City, utcHour: number) => {
    const [year, month, day] = meetingDateStr.split('-').map(Number);
    const dateUtc = new Date(Date.UTC(year, month - 1, day, utcHour, 0, 0));
    const offsetInfo = getTimezoneOffsetInfo(dateUtc, city.timezone);
    const formatted = formatCityDateTime(dateUtc, city.timezone, false);
    const localHour = formatted.hour24;
    let suitability: 'WORK_HOURS' | 'SHOULDER_HOURS' | 'SLEEP_HOURS' = 'SLEEP_HOURS';
    if (localHour >= workStartHour && localHour < workEndHour) suitability = 'WORK_HOURS';
    else if (
      (localHour >= Math.max(0, workStartHour - 2) && localHour < workStartHour) ||
      (localHour >= workEndHour && localHour < Math.min(24, workEndHour + 4))
    )
      suitability = 'SHOULDER_HOURS';
    const cityDateLocal = new Date(dateUtc.toLocaleString('en-US', { timeZone: city.timezone }));
    const refDateLocal = new Date(dateUtc.toLocaleString('en-US', { timeZone: 'UTC' }));
    let dayDiff = 0;
    if (cityDateLocal.getDate() > refDateLocal.getDate()) dayDiff = 1;
    else if (cityDateLocal.getDate() < refDateLocal.getDate()) dayDiff = -1;
    return { dateUtc, offsetInfo, formatted, localHour, suitability, dayDiff };
  };

  const hourScores = useMemo(() => {
    return Array.from({ length: 24 }).map((_, utcH) => {
      let greenCount = 0,
        yellowCount = 0,
        redCount = 0;
      selectedCities.forEach((city) => {
        const d = getCityMeetingDetails(city, utcH);
        if (d.suitability === 'WORK_HOURS') greenCount++;
        else if (d.suitability === 'SHOULDER_HOURS') yellowCount++;
        else redCount++;
      });
      const total = selectedCities.length || 1;
      const score = Math.round(((greenCount * 1 + yellowCount * 0.5) / total) * 100);
      let status: 'perfect' | 'good' | 'fair' | 'poor' = 'poor';
      if (greenCount === total) status = 'perfect';
      else if (redCount === 0) status = 'good';
      else if (greenCount >= 1 && redCount <= 1) status = 'fair';
      return { utcHour: utcH, score, greenCount, yellowCount, redCount, status };
    });
  }, [selectedCities, meetingDateStr, workStartHour, workEndHour]);

  const handleAutoFindBestSlot = () => {
    let best = hourScores[0];
    hourScores.forEach((s) => {
      if (s.score > best.score) best = s;
    });
    setSelectedUtcHour(best.utcHour);
  };

  const activeMeetingDetails = useMemo(() => {
    const [year, month, day] = meetingDateStr.split('-').map(Number);
    const startUtcDate = new Date(Date.UTC(year, month - 1, day, selectedUtcHour, 0, 0));
    return {
      startUtcDate,
      startUtcIso: startUtcDate.toISOString(),
      cities: selectedCities.map((city) => ({
        city,
        isHost: city.id === hostCityId,
        ...getCityMeetingDetails(city, selectedUtcHour),
      })),
    };
  }, [selectedCities, hostCityId, meetingDateStr, selectedUtcHour, workStartHour, workEndHour]);

  const handleCopyFormattedSchedule = () => {
    const lines = [`${meetingTitle}`, `Date: ${meetingDateStr} · ${meetingDurationMins} min`, '---'];
    activeMeetingDetails.cities.forEach((item) => {
      lines.push(
        `${item.city.name}: ${item.formatted.timeStr} ${item.offsetInfo.abbreviation}${item.isHost ? ' (Host)' : ''}`
      );
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  const handleGenerateShareLink = () => {
    const encoded = encodeSharedEvent(meetingTitle, activeMeetingDetails.startUtcDate.getTime(), hostCityId);
    const fullUrl = `${window.location.origin}${window.location.pathname}?meeting=${encoded}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border border-blue-800/60 rounded-2xl p-5 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold flex items-center gap-2">
              <Globe className="w-6 h-6 text-cyan-400" /> Global Meeting Planner
            </h2>
            <p className="text-xs text-slate-300 mt-1">Working-hours overlap · WTB-style strip · heatmap</p>
          </div>
          <button
            type="button"
            onClick={handleAutoFindBestSlot}
            className="px-4 py-2.5 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Auto-Find Best Slot
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEAM_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="px-2.5 py-1 bg-white/10 text-[11px] rounded-lg border border-white/10"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <MeetingHourStrip cities={selectedCities} selectedUtcHour={selectedUtcHour} onSelectUtcHour={setSelectedUtcHour} />

      <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
            className="border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950"
            placeholder="Meeting title"
          />
          <input
            type="date"
            value={meetingDateStr}
            onChange={(e) => setMeetingDateStr(e.target.value)}
            className="border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950 font-mono"
          />
          <select
            value={meetingDurationMins}
            onChange={(e) => setMeetingDurationMins(Number(e.target.value))}
            className="border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-950"
          >
            {[15, 30, 45, 60, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </select>
          <div className="flex gap-1 items-center">
            <select value={workStartHour} onChange={(e) => setWorkStartHour(Number(e.target.value))} className="border rounded-xl px-2 py-2 flex-1">
              {[8, 9, 10].map((h) => (
                <option key={h} value={h}>
                  {h}:00
                </option>
              ))}
            </select>
            <span>to</span>
            <select value={workEndHour} onChange={(e) => setWorkEndHour(Number(e.target.value))} className="border rounded-xl px-2 py-2 flex-1">
              {[17, 18, 19].map((h) => (
                <option key={h} value={h}>
                  {h}:00
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="relative max-w-md">
          <input
            value={citySearchQuery}
            onChange={(e) => {
              setCitySearchQuery(e.target.value);
              setSearchResults(searchCities(e.target.value, 6));
            }}
            placeholder="Add city..."
            className="w-full border rounded-xl px-3 py-2"
          />
          {searchResults.length > 0 && (
            <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border rounded-xl shadow-lg">
              {searchResults.map((c) => (
                <button key={c.id} type="button" className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => handleAddCity(c)}>
                  {c.name}, {c.country}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedCities.map((city) => (
            <span key={city.id} className="px-2 py-1 rounded-lg border text-[11px] flex items-center gap-1">
              <button type="button" onClick={() => setHostCityId(city.id)}>
                <Star className={`w-3 h-3 ${city.id === hostCityId ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
              {city.name}
              {selectedCities.length > 1 && (
                <button type="button" onClick={() => handleRemoveCity(city.id)}>
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border rounded-2xl p-4 overflow-x-auto text-[10px]">
        <p className="font-bold text-xs mb-2">24h heatmap · selected {String(selectedUtcHour).padStart(2, '0')}:00 UTC</p>
        <div className="min-w-[720px] space-y-1">
          <div className="grid grid-cols-[120px_repeat(24,1fr)] gap-0.5">
            <div className="font-bold">Score</div>
            {hourScores.map((h) => (
              <button
                key={h.utcHour}
                type="button"
                onClick={() => setSelectedUtcHour(h.utcHour)}
                className={`py-1 rounded ${h.utcHour === selectedUtcHour ? 'ring-2 ring-cyan-400' : ''} ${
                  h.status === 'perfect' ? 'bg-emerald-500 text-white' : h.status === 'good' ? 'bg-emerald-400' : h.status === 'fair' ? 'bg-amber-400' : 'bg-slate-200 dark:bg-slate-800'
                }`}
              >
                {h.score}
              </button>
            ))}
          </div>
          {selectedCities.map((city) => (
            <div key={city.id} className="grid grid-cols-[120px_repeat(24,1fr)] gap-0.5 items-center">
              <div className="font-semibold truncate">{city.name}</div>
              {Array.from({ length: 24 }).map((_, utcH) => {
                const d = getCityMeetingDetails(city, utcH);
                const bg =
                  d.suitability === 'WORK_HOURS'
                    ? 'bg-emerald-500 text-white'
                    : d.suitability === 'SHOULDER_HOURS'
                      ? 'bg-amber-400'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500';
                return (
                  <button
                    key={utcH}
                    type="button"
                    onClick={() => setSelectedUtcHour(utcH)}
                    className={`h-8 rounded ${bg} ${utcH === selectedUtcHour ? 'ring-2 ring-cyan-400' : ''}`}
                  >
                    {d.localHour}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3">
        <h3 className="font-bold">{meetingTitle}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {activeMeetingDetails.cities.map((item) => (
            <div key={item.city.id} className="border border-slate-700 rounded-xl p-3">
              <p className="font-bold text-sm">{item.city.name}{item.isHost ? ' · HOST' : ''}</p>
              <p className="font-mono text-cyan-300 text-lg">{item.formatted.timeStr}</p>
              <p className="text-[10px] text-slate-400">{item.suitability}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={generateGoogleCalendarUrl(
              meetingTitle,
              activeMeetingDetails.startUtcIso,
              meetingDurationMins,
              'TimeGovern meeting'
            )}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-2 bg-blue-600 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Google Calendar
          </a>
          <button
            type="button"
            onClick={() =>
              downloadIcsFile(meetingTitle, activeMeetingDetails.startUtcIso, meetingDurationMins, 'TimeGovern')
            }
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" /> ICS
          </button>
          <button type="button" onClick={handleCopyFormattedSchedule} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1">
            <Copy className="w-3.5 h-3.5" /> {copiedSummary ? 'Copied!' : 'Copy'}
          </button>
          <button type="button" onClick={handleGenerateShareLink} className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" /> {copiedLink ? 'Link copied!' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
};
