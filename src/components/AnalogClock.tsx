import React from 'react';

interface AnalogClockProps {
  date: Date;
  size?: number;
  cityName?: string;
}

export const AnalogClock: React.FC<AnalogClockProps> = ({ date, size = 110, cityName }) => {
  const seconds = date.getSeconds();
  const minutes = date.getMinutes();
  const hours = date.getHours();

  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative bg-slate-900 border-2 border-slate-700 rounded-full shadow-inner flex items-center justify-center shrink-0"
        style={{ width: size, height: size }}
      >
        {/* Hour markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 * Math.PI) / 180;
          const radius = size / 2 - 8;
          const x = radius * Math.sin(angle);
          const y = -radius * Math.cos(angle);
          return (
            <div
              key={i}
              className={`absolute rounded-full ${i % 3 === 0 ? 'w-1.5 h-1.5 bg-blue-400' : 'w-1 h-1 bg-slate-500'}`}
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            />
          );
        })}

        {/* Hour Hand */}
        <div
          className="absolute bg-slate-100 rounded-full origin-bottom shadow-sm"
          style={{
            width: '3.5px',
            height: `${size * 0.26}px`,
            bottom: '50%',
            left: 'calc(50% - 1.75px)',
            transform: `rotate(${hourDeg}deg)`,
            transformOrigin: 'bottom center',
          }}
        />

        {/* Minute Hand */}
        <div
          className="absolute bg-blue-400 rounded-full origin-bottom shadow-sm"
          style={{
            width: '2.5px',
            height: `${size * 0.36}px`,
            bottom: '50%',
            left: 'calc(50% - 1.25px)',
            transform: `rotate(${minDeg}deg)`,
            transformOrigin: 'bottom center',
          }}
        />

        {/* Second Hand */}
        <div
          className="absolute bg-red-500 rounded-full origin-bottom shadow-sm"
          style={{
            width: '1.5px',
            height: `${size * 0.42}px`,
            bottom: '50%',
            left: 'calc(50% - 0.75px)',
            transform: `rotate(${secDeg}deg)`,
            transformOrigin: 'bottom center',
          }}
        />

        {/* Center Pivot Pin */}
        <div className="absolute w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 z-10" />
      </div>
      {cityName && (
        <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{cityName}</span>
      )}
    </div>
  );
};
