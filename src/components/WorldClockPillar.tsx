import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Globe, Share2, Plus, Trash2, ArrowRight, Check, Sun, Moon, Sliders, MapPin, AlertTriangle, ExternalLink, Download, LayoutGrid, List } from 'lucide-react';
import { MAJOR_CITIES, searchCities } from '../lib/citiesData';
import { City, TimezoneOffsetInfo } from '../types';
import { getTimezoneOffsetInfo, formatCityDateTime, getHourSuitability, encodeSharedEvent, decodeSharedEvent } from '../lib/timezoneUtils';
import { AdBanner } from './AdBanner';
import { AnalogClock } from './AnalogClock';
import { WorldMapCanvas } from './WorldMapCanvas';
import { generateGoogleCalendarUrl, downloadIcsFile } from '../lib/icsGenerator';

interface WorldClockPillarProps {
  selectedCityFromSearch?: City;
}

export const WorldClockPillar: React.FC<WorldClockPillarProps> = ({ selectedCityFromSearch }) => {
  const [subTab, setSubTab] = useState<'clock' | 'converter' | 'map' | 'announcer'>('clock');
  const [clockDisplayStyle, setClockDisplayStyle] = useState<'grid' | 'table'>('grid');
  const [now, setNow] = useState<Date>(new Date());

  // Watchlist cities for World Clock
  const [watchList, setWatchList] = useState<City[]>([
    MAJOR_CITIES.find((c) => c.id === 'nyc')!,
    MAJOR_CITIES.find((c) => c.id === 'lon')!,
    MAJOR_CITIES.find((c) => c.id === 'par')!,
    MAJOR_CITIES.find((c) => c.id === 'tyo')!,
    MAJOR_CITIES.find((c) => c.id === 'syd')!,
    MAJOR_CITIES.find((c) => c.id === 'dxb')!
  ]);

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

  // Ticking clock effect
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Update watchlist if parent search passes a city
  useEffect(() => {
    if (selectedCityFromSearch) {
      if (!watchList.some((c) => c.id === selectedCityFromSearch.id)) {
        setWatchList((prev) => [selectedCityFromSearch, ...prev]);
      }
      if (!plannerCities.some((c) => c.id === selectedCityFromSearch.id)) {
        setPlannerCities((prev) => [...prev, selectedCityFromSearch]);
      }
    }
  }, [selectedCityFromSearch]);

  const handleAddCityToWatchlist = (city: City) => {
    if (!watchList.some((c) => c.id === city.id)) {
      setWatchList([...watchList, city]);
    }
    setAddCityQuery('');
    setAddCityResults([]);
  };

  const handleRemoveFromWatchlist = (id: string) => {
    setWatchList(watchList.filter((c) => c.id !== id));
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
              onClick={() => setSubTab('converter')}
              className={`px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
                subTab === 'converter'
                  ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800/50'
              }`}
            >
              Meeting Planner & DST
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
          </div>
        </div>

        {/* ----------------- SUB TAB 1: WORLD CLOCK ----------------- */}
        {subTab === 'clock' && (
          <div className="mt-4 space-y-4">
            {/* Quick Add City & View Toggle */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" /> Add City to Custom World Clock Matrix:
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <input
                    type="text"
                    value={addCityQuery}
                    onChange={(e) => {
                      setAddCityQuery(e.target.value);
                      setAddCityResults(searchCities(e.target.value, 5));
                    }}
                    placeholder="Type city name..."
                    className="w-full bg-white dark:bg-slate-900 text-xs px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100"
                  />
                  {addCityQuery && addCityResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-30 overflow-hidden">
                      {addCityResults.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => handleAddCityToWatchlist(c)}
                          className="w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 flex justify-between items-center"
                        >
                          <span>{c.name}, {c.country}</span>
                          <span className="text-[10px] text-blue-500">{c.timezone}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-900 p-1 rounded-md text-xs">
                  <button
                    onClick={() => setClockDisplayStyle('grid')}
                    className={`p-1.5 rounded ${clockDisplayStyle === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    title="Analog & Digital Card Grid"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setClockDisplayStyle('table')}
                    className={`p-1.5 rounded ${clockDisplayStyle === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                    title="Data Table View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid View with Analog Clocks */}
            {clockDisplayStyle === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {watchList.map((city) => {
                  const offsetInfo = getTimezoneOffsetInfo(now, city.timezone);
                  const formatted = formatCityDateTime(now, city.timezone, true);

                  // Local date instance for analog clock
                  const cityDate = new Date(now.toLocaleString('en-US', { timeZone: city.timezone }));

                  return (
                    <div
                      key={city.id}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-500/50 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{city.name}</h3>
                            <span className="text-[10px] text-slate-500">({city.countryCode})</span>
                          </div>
                          <span className="text-[10px] font-mono text-blue-500 dark:text-blue-400 block mt-0.5">
                            {offsetInfo.abbreviation} • {offsetInfo.offsetFormatted}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFromWatchlist(city.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="my-3 flex items-center justify-around">
                        <AnalogClock date={cityDate} size={90} />
                        <div className="text-right">
                          <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white block">
                            {formatted.timeStr}
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block mt-0.5">
                            {formatted.dateStr}
                          </span>
                          <div className="mt-2">
                            {offsetInfo.isDst ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                                <Sun className="w-3 h-3 text-amber-400" /> DST Active
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-500">Standard Time</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Data-Dense Table */}
            {clockDisplayStyle === 'table' && (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <tr>
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
                    {watchList.map((city) => {
                      const offsetInfo = getTimezoneOffsetInfo(now, city.timezone);
                      const formatted = formatCityDateTime(now, city.timezone, true);

                      return (
                        <tr key={city.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{city.name}</span>
                            {city.isCapital && (
                              <span className="text-[9px] bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold px-1 py-0.2 rounded">CAPITAL</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-300">{city.country}</td>
                          <td className="p-3 font-mono font-bold text-slate-900 dark:text-blue-300 text-sm">
                            {formatted.timeStr}
                            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">{formatted.dateStr}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                              {offsetInfo.abbreviation}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{offsetInfo.offsetFormatted}</td>
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
                            <button
                              onClick={() => handleRemoveFromWatchlist(city.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                              title="Remove city"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* In-Feed Native Sponsored Unit */}
            <AdBanner type="in-feed" />
          </div>
        )}

        {/* ----------------- SUB TAB 2: MEETING PLANNER & DST ----------------- */}
        {subTab === 'converter' && (
          <div className="mt-4 space-y-6">
            {/* Interactive Hour Scrubber */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" /> Time Scrubber (Drag slider to test meeting times):
                </label>
                <div className="flex items-center gap-4 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block"></span> Work (08:00-18:00)</span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full inline-block"></span> Shoulder (07-08 / 18-22)</span>
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><span className="w-2.5 h-2.5 bg-red-500 rounded-full inline-block"></span> Night / Sleep</span>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="23"
                value={scrubHour}
                onChange={(e) => setScrubHour(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00 (Noon)</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>

            {/* Export & Share Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
              <div>
                <span className="text-xs font-bold text-blue-400 block">Export Selected Meeting Slot ({scrubHour.toString().padStart(2, '0')}:00 UTC)</span>
                <span className="text-[11px] text-slate-400">Sync meeting time directly to Google Calendar or export as an .ics file for Outlook & Apple Calendar.</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={generateGoogleCalendarUrl(`Global Team Meeting (${scrubHour}:00 UTC)`, new Date().toISOString(), 60, `Cities: ${plannerCities.map(c => c.name).join(', ')}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Google Calendar
                </a>
                <button
                  onClick={() => downloadIcsFile(`Global Team Meeting (${scrubHour}:00 UTC)`, new Date().toISOString(), 60, `Cities: ${plannerCities.map(c => c.name).join(', ')}`)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Download .ICS File
                </button>
              </div>
            </div>

            {/* Overlapping Hours Visual Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Selected Cities Hour-by-Hour Alignment
              </h3>

              {plannerCities.map((city) => {
                const offsetInfo = getTimezoneOffsetInfo(now, city.timezone);
                const cityBaseDate = new Date(now);
                cityBaseDate.setHours(scrubHour, 0, 0, 0);

                return (
                  <div key={city.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{city.name}</span>
                        <span className="text-[10px] text-slate-500">({city.country})</span>
                        <span className="text-[10px] font-mono bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                          {offsetInfo.offsetFormatted}
                        </span>
                      </div>
                    </div>

                    {/* 24 hour bar */}
                    <div className="grid grid-cols-24 gap-1">
                      {Array.from({ length: 24 }).map((_, h) => {
                        const localDate = new Date(now);
                        localDate.setUTCHours(h + (offsetInfo.offsetMinutes / 60));
                        const localH = (localDate.getUTCHours() + 24) % 24;
                        const suitability = getHourSuitability(localH);

                        const colorMap = {
                          WORK_HOURS: 'bg-emerald-500 text-white font-bold',
                          SHOULDER_HOURS: 'bg-amber-400 dark:bg-amber-500 text-slate-900 font-medium',
                          SLEEP_HOURS: 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                        };

                        return (
                          <div
                            key={h}
                            onClick={() => setScrubHour(localH)}
                            className={`p-1 text-center rounded text-[9px] font-mono cursor-pointer transition-transform hover:scale-110 ${colorMap[suitability]} ${
                              localH === scrubHour ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                            }`}
                            title={`${city.name}: ${localH.toString().padStart(2, '0')}:00 - ${suitability}`}
                          >
                            {localH.toString().padStart(2, '0')}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Upcoming DST Shifts Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> Upcoming Daylight Saving Time (DST) Transitions (2026/2027)
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Upcoming clock changes for major global time zones ("Spring Forward" / "Fall Back").
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-300 uppercase text-[10px] tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-2.5">Region / Timezone</th>
                      <th className="p-2.5">Next Transition Date</th>
                      <th className="p-2.5">Direction</th>
                      <th className="p-2.5">New Offset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold text-white">North America (US / Canada - Eastern Time)</td>
                      <td className="p-2.5 font-mono text-amber-400">Sunday, Nov 1, 2026 @ 02:00 AM</td>
                      <td className="p-2.5"><span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-800 font-bold">FALL BACK (-1h)</span></td>
                      <td className="p-2.5 font-mono">EST (UTC-5)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">United Kingdom (GMT / BST)</td>
                      <td className="p-2.5 font-mono text-amber-400">Sunday, Oct 25, 2026 @ 02:00 AM</td>
                      <td className="p-2.5"><span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-800 font-bold">FALL BACK (-1h)</span></td>
                      <td className="p-2.5 font-mono">GMT (UTC+0)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Central Europe (CET / CEST)</td>
                      <td className="p-2.5 font-mono text-amber-400">Sunday, Oct 25, 2026 @ 03:00 AM</td>
                      <td className="p-2.5"><span className="bg-blue-950 text-blue-400 text-[10px] px-2 py-0.5 rounded border border-blue-800 font-bold">FALL BACK (-1h)</span></td>
                      <td className="p-2.5 font-mono">CET (UTC+1)</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-white">Australia (AEST - Sydney/Melbourne)</td>
                      <td className="p-2.5 font-mono text-emerald-400">Sunday, Oct 4, 2026 @ 02:00 AM</td>
                      <td className="p-2.5"><span className="bg-emerald-950 text-emerald-400 text-[10px] px-2 py-0.5 rounded border border-emerald-800 font-bold">SPRING FORWARD (+1h)</span></td>
                      <td className="p-2.5 font-mono">AEDT (UTC+11)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
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
      </div>
    </div>
  );
};
