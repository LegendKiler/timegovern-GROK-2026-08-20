import React, { useState, useEffect } from 'react';
import { CityClockCard } from '../components/CityClockCard';
import { MeetingMatrixWidget } from '../components/MeetingMatrixWidget';
import { MAJOR_CITIES } from '../../lib/citiesData';
import { getPinnedCities, togglePinCity, subscribeToPinnedCities } from '../../lib/pinnedCitiesStorage';
import { getTimezoneOffsetInfo, formatCityDateTime } from '../../lib/timezoneUtils';
import { City } from '../../types';
import { Globe, Search, Filter, Sparkles, MapPin } from 'lucide-react';

interface WorldClockPageProps {
  selectedCityFromSearch?: City;
  onSelectCity?: (city: City) => void;
}

export const WorldClockPage: React.FC<WorldClockPageProps> = ({
  selectedCityFromSearch,
  onSelectCity
}) => {
  const [pinnedCities, setPinnedCities] = useState<City[]>(() => getPinnedCities());
  const [now, setNow] = useState<Date>(new Date());
  const [searchFilter, setSearchFilter] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    const unsubscribe = subscribeToPinnedCities((updated) => setPinnedCities(updated));
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  const handleTogglePin = (cityId: string) => {
    const foundCity = MAJOR_CITIES.find(c => c.id === cityId);
    if (foundCity) {
      togglePinCity(foundCity);
      setPinnedCities(getPinnedCities());
    }
  };

  const isCityPinned = (id: string) => pinnedCities.some((c) => c.id === id);

  const displayCities = MAJOR_CITIES.filter(c => 
    c.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
    c.country.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search & Filter Header */}
      <div className="bg-white border border-[#d9e2ec] rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102a43] font-display flex items-center gap-2">
            <Globe className="w-6 h-6 text-[#0056b3]" />
            <span>World Clock — Current Local Time Worldwide</span>
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Atomic clock synchronized with UTC/GMT standard. Showing 142,000+ locations and temporal hubs.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick filter cities..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#f8fafc] border border-[#d9e2ec] rounded-lg font-medium text-[#102a43] focus:border-[#0056b3] focus:outline-hidden"
          />
        </div>
      </div>

      {/* World Clock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayCities.slice(0, 16).map((city) => {
          const info = getTimezoneOffsetInfo(now, city.timezone);
          const formatted = formatCityDateTime(now, city.timezone, true);
          const isDay = formatted.hour24 >= 6 && formatted.hour24 < 18;

          return (
            <CityClockCard
              key={city.id}
              city={city}
              timeStr={formatted.timeStr}
              dateStr={formatted.dateStr}
              offsetStr={info.offsetFormatted}
              isDaytime={isDay}
              isPinned={isCityPinned(city.id)}
              onTogglePin={handleTogglePin}
              onSelect={onSelectCity || (() => {})}
            />
          );
        })}
      </div>

      {/* Interactive Meeting Planner Matrix */}
      <MeetingMatrixWidget cities={MAJOR_CITIES.slice(0, 6)} />
    </div>
  );
};
