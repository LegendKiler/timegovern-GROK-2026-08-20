import React from 'react';
import { Pin, Sun, Moon, ArrowUpRight } from 'lucide-react';
import { City } from '../types';

interface CityClockCardProps {
  city: City;
  timeStr: string;
  dateStr: string;
  offsetStr: string;
  isDaytime: boolean;
  isPinned: boolean;
  onTogglePin: (cityId: string) => void;
  onSelect: (city: City) => void;
}

export const CityClockCard: React.FC<CityClockCardProps> = ({
  city,
  timeStr,
  dateStr,
  offsetStr,
  isDaytime,
  isPinned,
  onTogglePin,
  onSelect,
}) => {
  return (
    <div className="bg-white border border-[#d9e2ec] hover:border-[#0056b3] rounded-lg p-4 shadow-xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
      <div className="flex items-start justify-between gap-2">
        <div>
          <button
            onClick={() => onSelect(city)}
            className="text-left font-display font-bold text-[#102a43] group-hover:text-[#0056b3] text-base leading-tight flex items-center gap-1.5 cursor-pointer"
          >
            <span>{city.name}</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#0056b3]" />
          </button>
          <div className="text-xs text-[#627d98] font-medium">{city.country}</div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(city.id);
          }}
          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
            isPinned 
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title={isPinned ? 'Unpin city' : 'Pin to top'}
        >
          <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-amber-600 text-amber-600' : ''}`} />
        </button>
      </div>

      <div className="my-3 py-2 border-y border-[#f0f4f8] flex items-baseline justify-between">
        <div className="font-mono text-2xl font-black text-[#0f2942] tracking-tight">
          {timeStr}
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
          {isDaytime ? <Sun className="w-3 h-3 text-amber-500" /> : <Moon className="w-3 h-3 text-blue-500" />}
          <span>{isDaytime ? 'Day' : 'Night'}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#627d98]">
        <span>{dateStr}</span>
        <span className="font-mono font-bold bg-[#f2f5f8] text-[#102a43] px-2 py-0.5 rounded border border-[#d9e2ec]">
          {offsetStr}
        </span>
      </div>
    </div>
  );
};
