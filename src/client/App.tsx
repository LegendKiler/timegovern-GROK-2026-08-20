import React, { useState } from 'react';
import { WorldClockPage } from './pages/WorldClockPage';
import { CalendarPage } from './pages/CalendarPage';
import { AstronomyPage } from './pages/AstronomyPage';
import { WeatherPage } from './pages/WeatherPage';
import { TimersPage } from './pages/TimersPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { Globe, Clock, Calendar, Sun, CloudRain, Timer, Calculator, Search, Pin, Heart } from 'lucide-react';
import { City } from '../types';

export default function ClientApp() {
  const [activeTab, setActiveTab] = useState<'worldclock' | 'calendar' | 'astronomy' | 'weather' | 'timers' | 'calculators'>('worldclock');
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);

  const navItems = [
    { id: 'worldclock', label: 'World Clock', icon: Clock },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'astronomy', label: 'Sun & Moon', icon: Sun },
    { id: 'weather', label: 'Weather', icon: CloudRain },
    { id: 'timers', label: 'Timers', icon: Timer },
    { id: 'calculators', label: 'Calculators', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-[#f2f5f8] text-[#102a43] flex flex-col font-sans">
      {/* Deep Navy Classic Header */}
      <header className="bg-[#0f2942] text-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shrink-0">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="font-display font-extrabold text-xl tracking-tight">
                timegovern<span className="text-cyan-400">.com</span>
              </div>
              <div className="text-[10px] text-slate-300 font-mono">The World's High-Precision Temporal Authority</div>
            </div>
          </div>

          {/* Quick Search */}
          <div className="flex items-center w-full md:w-auto max-w-md">
            <input
              type="text"
              placeholder="Search city, country or timezone..."
              className="w-full md:w-80 px-4 py-2 text-xs bg-white text-[#102a43] rounded-l-lg border-y border-l border-white focus:outline-hidden font-medium"
            />
            <button className="tad-btn-search px-5 py-2 rounded-r-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </div>
        </div>

        {/* Mega Navigation Bar */}
        <nav className="bg-[#0b1f32] border-t border-slate-700/60">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 flex items-center overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                    isActive
                      ? 'border-[#f9a825] text-white bg-[#153453]'
                      : 'border-transparent text-slate-300 hover:text-white hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'worldclock' && <WorldClockPage selectedCityFromSearch={selectedCity} onSelectCity={setSelectedCity} />}
        {activeTab === 'calendar' && <CalendarPage />}
        {activeTab === 'astronomy' && <AstronomyPage />}
        {activeTab === 'weather' && <WeatherPage />}
        {activeTab === 'timers' && <TimersPage />}
        {activeTab === 'calculators' && <CalculatorsPage />}
      </main>

      {/* Supporter Banner */}
      <div className="max-w-[1920px] mx-auto w-full px-4 sm:px-6 my-4">
        <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-pink-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-[#102a43]">Love Our Site? Support High-Precision Time</h4>
              <p className="text-xs text-[#627d98]">Browse advert-free with microsecond ephemeris and PDF calendar exports.</p>
            </div>
          </div>
          <button className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
            Create Supporter Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#0f2942] text-slate-300 border-t border-slate-800 text-xs py-8">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 text-center text-slate-400">
          © TimeGovern AS 1995–2026. High-Precision Global Temporal & Astronomical Engine. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
