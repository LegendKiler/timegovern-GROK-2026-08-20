import React from 'react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City } from '../types';

interface WorldMapCanvasProps {
  onSelectCity?: (city: City) => void;
  selectedCityId?: string;
}

export const WorldMapCanvas: React.FC<WorldMapCanvasProps> = ({ onSelectCity, selectedCityId }) => {
  // Simple Mercator projection mapping lat/lng to SVG coordinates (width=800, height=400)
  const mapWidth = 800;
  const mapHeight = 400;

  const latLngToCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * mapWidth;
    const y = ((90 - lat) / 180) * mapHeight;
    return { x, y };
  };

  // Calculate current approximate solar declination and subsolar point for day/night curve
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
  const declination = -23.44 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10)); // degrees
  const utcHours = now.getUTCHours() + now.getUTCMinutes() / 60;
  const subsolarLng = (12 - utcHours) * 15; // longitude where sun is directly overhead

  // Generate day/night terminator curve path
  const points: string[] = [];
  for (let x = 0; x <= mapWidth; x += 10) {
    const lng = (x / mapWidth) * 360 - 180;
    // Terminator formula: tan(lat) = -cos(lng - subsolarLng) / tan(declination)
    const radDecl = (declination * Math.PI) / 180;
    const radLngDiff = ((lng - subsolarLng) * Math.PI) / 180;
    let lat = (Math.atan(-Math.cos(radLngDiff) / Math.tan(radDecl || 0.001)) * 180) / Math.PI;

    if (isNaN(lat)) lat = 0;
    const { y } = latLngToCoords(lat, lng);
    points.push(`${x},${y}`);
  }

  // Construct polygon for night shade (southern or northern hemisphere based on declination)
  let nightPolygonPath = `M 0,${mapHeight} `;
  if (declination >= 0) {
    nightPolygonPath = `M 0,${mapHeight} L ${points.join(' L ')} L ${mapWidth},${mapHeight} Z`;
  } else {
    nightPolygonPath = `M 0,0 L ${points.join(' L ')} L ${mapWidth},0 Z`;
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Real-Time Day & Night Earth Map (Sun Terminator Line)
          </h3>
          <p className="text-[11px] text-slate-400">
            Live solar position & night shadow overlay for 5,000+ global cities. Click any pin to inspect local time.
          </p>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Day Zone</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-900 border border-indigo-500"></span> Night Zone</span>
        </div>
      </div>

      <div className="relative w-full aspect-[2/1] bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
        <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-full">
          {/* Earth Grid Lines */}
          {[...Array(7)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={(i + 1) * (mapHeight / 8)}
              x2={mapWidth}
              y2={(i + 1) * (mapHeight / 8)}
              stroke="#1e293b"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
          ))}
          {[...Array(11)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(i + 1) * (mapWidth / 12)}
              y1={0}
              x2={(i + 1) * (mapWidth / 12)}
              y2={mapHeight}
              stroke="#1e293b"
              strokeDasharray="3 3"
              strokeWidth="0.8"
            />
          ))}

          {/* Night Shadow Area */}
          <path d={nightPolygonPath} fill="rgba(15, 23, 42, 0.75)" />

          {/* Subsolar Point (Sun Icon Marker) */}
          {(() => {
            const sunCoords = latLngToCoords(declination, subsolarLng);
            return (
              <g transform={`translate(${sunCoords.x}, ${sunCoords.y})`}>
                <circle r="10" fill="rgba(251, 191, 36, 0.25)" className="animate-ping" />
                <circle r="6" fill="#f59e0b" />
                <circle r="3" fill="#ffffff" />
              </g>
            );
          })()}

          {/* Major City Pins */}
          {MAJOR_CITIES.map((city) => {
            const { x, y } = latLngToCoords(city.lat, city.lng);
            const isSelected = selectedCityId === city.id;

            return (
              <g
                key={city.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer group"
                onClick={() => onSelectCity && onSelectCity(city)}
              >
                <circle
                  r={isSelected ? 6 : 3.5}
                  fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                  stroke={isSelected ? '#0284c7' : '#0f172a'}
                  strokeWidth="1.5"
                  className="transition-all hover:scale-150"
                />

                {/* City Label Tooltip on hover */}
                <text
                  x="8"
                  y="3"
                  fill="#f8fafc"
                  fontSize="9"
                  fontWeight="bold"
                  fontFamily="monospace"
                  className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none drop-shadow"
                >
                  {city.name} ({city.countryCode})
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay Footer */}
        <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded border border-slate-800 text-[10px] text-slate-300 font-mono flex items-center gap-3">
          <span>Subsolar Point: {declination.toFixed(1)}°N, {subsolarLng.toFixed(1)}°E</span>
          <span>•</span>
          <span>Equirectangular World Grid</span>
        </div>
      </div>
    </div>
  );
};
