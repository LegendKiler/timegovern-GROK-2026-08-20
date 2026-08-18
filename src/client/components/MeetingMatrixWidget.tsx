import React, { useState } from 'react';
import { City } from '../../types';
import { getTimezoneOffsetInfo } from '../../lib/timezoneUtils';

interface MeetingMatrixWidgetProps {
  cities: City[];
}

export const MeetingMatrixWidget: React.FC<MeetingMatrixWidgetProps> = ({ cities }) => {
  const [selectedHour, setSelectedHour] = useState<number>(14); // 2 PM UTC reference
  const now = new Date();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getStatusColor = (localHour: number) => {
    if (localHour >= 9 && localHour <= 17) {
      return 'bg-emerald-500 text-white font-bold'; // Ideal Office Hours
    }
    if ((localHour >= 7 && localHour < 9) || (localHour > 17 && localHour <= 21)) {
      return 'bg-amber-400 text-slate-900 font-medium'; // Shoulder Hours
    }
    return 'bg-slate-200 text-slate-500'; // Off Hours
  };

  return (
    <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs overflow-x-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display font-bold text-lg text-[#102a43]">Interactive Meeting Time Planner</h3>
          <p className="text-xs text-[#627d98]">Select or click any time slot to calculate global availability across all international offices.</p>
        </div>
        <div className="flex items-center gap-3 text-xs shrink-0">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span> Working (9–17)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400 inline-block"></span> Extended (7–9 / 17–21)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-200 inline-block"></span> Off-Hours</span>
        </div>
      </div>

      <div className="min-w-[760px] space-y-2">
        {cities.map((city) => {
          const offsetInfo = getTimezoneOffsetInfo(now, city.timezone);
          const offsetHours = Math.round(offsetInfo.offsetMinutes / 60);

          return (
            <div key={city.id} className="grid grid-cols-12 items-center gap-1 bg-[#f8fafc] p-2.5 rounded-lg border border-slate-200/60">
              <div className="col-span-3 pr-2">
                <div className="font-bold text-sm text-[#102a43] truncate">{city.name}</div>
                <div className="text-[11px] text-[#627d98] font-mono">{offsetInfo.offsetFormatted} · {offsetInfo.abbreviation}</div>
              </div>
              <div className="col-span-9 grid grid-cols-24 gap-0.5">
                {hours.map((h) => {
                  const localHour = (h + offsetHours + 24) % 24;
                  return (
                    <button
                      key={h}
                      onClick={() => setSelectedHour(h)}
                      className={`text-[10px] py-1.5 rounded transition-transform cursor-pointer text-center font-mono ${getStatusColor(localHour)} ${
                        selectedHour === h ? 'ring-2 ring-blue-700 ring-offset-1 scale-110 z-10' : 'hover:opacity-80'
                      }`}
                      title={`${city.name}: ${localHour.toString().padStart(2, '0')}:00`}
                    >
                      {localHour}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
