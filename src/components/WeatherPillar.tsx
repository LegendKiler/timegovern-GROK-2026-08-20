import React, { useState } from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets, Gauge, Eye, History, MapPin, Search } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City, WeatherCondition } from '../types';
import { getCurrentWeatherForCity, get14DayForecast, getHistoricalWeather } from '../lib/weatherEngine';

export const WeatherPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'current' | 'forecast' | 'history'>('current');
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES[0]); // NYC
  const [histDate, setHistDate] = useState<string>('2020-07-26');

  const currentWeather = getCurrentWeatherForCity(selectedCity.lat, selectedCity.name);
  const forecast14Days = get14DayForecast(selectedCity.lat, selectedCity.name);
  const histWeather = getHistoricalWeather(selectedCity.name, selectedCity.lat, histDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-500" />
              4. Global Weather & Environment
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Local conditions, 14-day meteorological forecasts & historical weather lookup.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSubTab('current')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'current' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Current Conditions
            </button>
            <button
              onClick={() => setSubTab('forecast')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'forecast' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              14-Day Forecast
            </button>
            <button
              onClick={() => setSubTab('history')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'history' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Historical Weather Archive
            </button>
          </div>
        </div>

        {/* Global City Picker */}
        <div className="mt-4 flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
            <MapPin className="w-4 h-4 text-blue-500" /> Select City:
            <select
              value={selectedCity.id}
              onChange={(e) => {
                const c = MAJOR_CITIES.find((x) => x.id === e.target.value);
                if (c) setSelectedCity(c);
              }}
              className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs px-2.5 py-1 text-slate-800 dark:text-slate-100"
            >
              {MAJOR_CITIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.country}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ---------------- SUB TAB 1: CURRENT CONDITIONS ---------------- */}
        {subTab === 'current' && (
          <div className="mt-4 space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold opacity-80">Weather in {selectedCity.name}, {selectedCity.country}</span>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-5xl font-extrabold font-mono">{currentWeather.tempC}°C</span>
                  <span className="text-2xl font-mono text-blue-200">/ {currentWeather.tempF}°F</span>
                </div>
                <span className="text-sm font-semibold mt-1 block">{currentWeather.condition}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-200" />
                  <div>
                    <span className="block text-[10px] opacity-75">Humidity</span>
                    <span className="font-bold">{currentWeather.humidityPercent}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-blue-200" />
                  <div>
                    <span className="block text-[10px] opacity-75">Wind Speed</span>
                    <span className="font-bold">{currentWeather.windSpeedKmh} km/h ({currentWeather.windDirection})</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-blue-200" />
                  <div>
                    <span className="block text-[10px] opacity-75">Pressure</span>
                    <span className="font-bold">{currentWeather.pressureHpa} hPa</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-200" />
                  <div>
                    <span className="block text-[10px] opacity-75">UV Index</span>
                    <span className="font-bold">{currentWeather.uvIndex} / 11</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 2: 14-DAY FORECAST ---------------- */}
        {subTab === 'forecast' && (
          <div className="mt-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              14-Day Meteorological Outlook for {selectedCity.name}
            </h3>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3">Date</th>
                    <th className="p-3">Condition</th>
                    <th className="p-3">High / Low</th>
                    <th className="p-3">Humidity</th>
                    <th className="p-3">Wind</th>
                    <th className="p-3">UV Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {forecast14Days.map((day, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold text-slate-900 dark:text-white font-mono">{day.date}</td>
                      <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{day.condition}</td>
                      <td className="p-3 font-mono font-bold text-slate-900 dark:text-blue-300">
                        {day.tempMaxC}° / <span className="text-slate-500">{day.tempMinC}°C</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{day.humidityPercent}%</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{day.windSpeedKmh} km/h {day.windDirection}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">{day.uvIndex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 3: HISTORICAL ARCHIVE ---------------- */}
        {subTab === 'history' && (
          <div className="mt-4 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-blue-600" /> Weather Archive Lookup (1970 - Present)
              </h3>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Select Historical Date
                  </label>
                  <input
                    type="date"
                    value={histDate}
                    onChange={(e) => setHistDate(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Historical Output Card */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Weather Record</span>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                {selectedCity.name}, {selectedCity.country} on {histDate}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500 block">Temperature</span>
                  <span className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">{histWeather.tempC}°C ({histWeather.tempF}°F)</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500 block">Condition</span>
                  <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{histWeather.condition}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <span className="text-slate-500 block">Wind & Pressure</span>
                  <span className="text-sm font-semibold font-mono text-slate-700 dark:text-slate-300">{histWeather.windSpeedKmh} km/h | {histWeather.pressureHpa} hPa</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
