import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Globe, Sun, Moon, Play, Pause, RotateCcw, MapPin, Clock, Plus, ExternalLink, Sparkles, Navigation, Layers } from 'lucide-react';
import { MAJOR_CITIES } from '../lib/citiesData';
import { City } from '../types';
import { getTimezoneOffsetInfo, formatCityDateTime } from '../lib/timezoneUtils';

// Helper: Convert Lat/Lng to 3D Cartesian coordinates on sphere of radius R
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Helper: Convert 3D Cartesian coordinates back to Lat/Lng
function vector3ToLatLng(vec: THREE.Vector3, radius: number): { lat: number; lng: number } {
  const norm = vec.clone().normalize();
  const lat = Math.asin(norm.y) * (180 / Math.PI);
  let lng = Math.atan2(norm.z, -norm.x) * (180 / Math.PI) - 180;
  if (lng < -180) lng += 360;
  if (lng > 180) lng -= 360;
  return { lat, lng };
}

// Create procedural high-res texture for Earth continents & grid lines
function createProceduralEarthTexture(showGrid: boolean = true): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // 1. Ocean Background Gradient (Deep Navy / Royal Blue)
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  oceanGradient.addColorStop(0, '#091322');
  oceanGradient.addColorStop(0.5, '#0e1f38');
  oceanGradient.addColorStop(1, '#081220');
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Helper to map (lat, lng) to canvas pixels
  const toX = (lng: number) => ((lng + 180) / 360) * canvas.width;
  const toY = (lat: number) => ((90 - lat) / 180) * canvas.height;

  // 2. Latitude / Longitude Grid Lines
  if (showGrid) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1.5;

    // Latitudes (-60 to 60)
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = toY(lat);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Equator highlight
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, toY(0));
    ctx.lineTo(canvas.width, toY(0));
    ctx.stroke();

    // Longitudes (-180 to 180)
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
    ctx.lineWidth = 1.5;
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = toX(lng);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  }

  // 3. Render Landmass Polygons (Simplified continental paths)
  ctx.fillStyle = '#1e385b';
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;

  const continents: [number, number][][] = [
    // North America
    [
      [-165, 65], [-140, 70], [-100, 75], [-60, 60], [-55, 45],
      [-75, 35], [-80, 25], [-100, 20], [-115, 30], [-125, 50], [-165, 65]
    ],
    // South America
    [
      [-80, 10], [-60, 10], [-35, -5], [-40, -22], [-55, -40],
      [-70, -55], [-75, -45], [-80, -18], [-80, 10]
    ],
    // Europe
    [
      [-10, 36], [0, 42], [15, 45], [30, 40], [40, 45],
      [30, 60], [15, 65], [5, 60], [-10, 50], [-10, 36]
    ],
    // Africa
    [
      [-18, 35], [10, 37], [32, 31], [43, 12], [51, 10],
      [40, -15], [33, -34], [18, -34], [10, -10], [-15, 12], [-18, 35]
    ],
    // Eurasia / Asia
    [
      [30, 60], [60, 70], [100, 75], [140, 70], [170, 65],
      [140, 50], [120, 30], [105, 10], [80, 10], [65, 25],
      [45, 35], [35, 30], [30, 60]
    ],
    // India
    [
      [68, 24], [88, 22], [80, 8], [72, 18], [68, 24]
    ],
    // Australia
    [
      [114, -22], [130, -12], [142, -10], [153, -28],
      [148, -38], [138, -35], [115, -34], [114, -22]
    ],
    // Japan
    [
      [130, 31], [136, 35], [141, 41], [141, 37], [133, 33], [130, 31]
    ],
    // UK & Ireland
    [
      [-10, 51], [-6, 58], [1, 52], [-5, 50], [-10, 51]
    ],
    // Greenland
    [
      [-55, 60], [-20, 70], [-20, 82], [-60, 82], [-55, 60]
    ]
  ];

  continents.forEach((poly) => {
    ctx.beginPath();
    poly.forEach(([lng, lat], idx) => {
      const x = toX(lng);
      const y = toY(lat);
      if (idx === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  });

  // 4. Glowing City Light Dots
  ctx.fillStyle = '#fef08a';
  MAJOR_CITIES.forEach((city) => {
    const x = toX(city.lng);
    const y = toY(city.lat);
    ctx.beginPath();
    ctx.arc(x, y, city.population > 5000000 ? 5 : 3, 0, Math.PI * 2);
    ctx.fill();

    // Subtle glow halo
    ctx.fillStyle = 'rgba(253, 224, 71, 0.25)';
    ctx.beginPath();
    ctx.arc(x, y, city.population > 5000000 ? 10 : 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
  });

  return new THREE.CanvasTexture(canvas);
}

// Internal 3D Globe Mesh & Interactive Markers Component
interface GlobeMeshProps {
  selectedCity: City | null;
  onSelectCity: (city: City) => void;
  onClickCoordinates: (lat: number, lng: number) => void;
  showGrid: boolean;
  isAutoRotating: boolean;
  dayNightLighting: boolean;
}

const GlobeMesh: React.FC<GlobeMeshProps> = ({
  selectedCity,
  onSelectCity,
  onClickCoordinates,
  showGrid,
  isAutoRotating,
  dayNightLighting
}) => {
  const globeRef = useRef<THREE.Group>(null!);
  const earthMeshRef = useRef<THREE.Mesh>(null!);
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);

  // Generate Earth Texture
  const earthTexture = useMemo(() => {
    return createProceduralEarthTexture(showGrid);
  }, [showGrid]);

  // City 3D Pin Positions
  const cityPins = useMemo(() => {
    return MAJOR_CITIES.map((city) => ({
      city,
      pos: latLngToVector3(city.lat, city.lng, 1.015)
    }));
  }, []);

  // Raycast Click on Globe Mesh to detect lat/lng
  const handleGlobeClick = (e: any) => {
    e.stopPropagation();
    if (e.point) {
      const worldPoint = e.point.clone();
      // Account for globe rotation
      if (globeRef.current) {
        worldPoint.applyMatrix4(globeRef.current.matrixWorld.clone().invert());
      }
      const { lat, lng } = vector3ToLatLng(worldPoint, 1.0);
      onClickCoordinates(lat, lng);
    }
  };

  // Rotate globe slowly if auto-rotate is enabled
  useFrame((_, delta) => {
    if (globeRef.current && isAutoRotating) {
      globeRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={globeRef}>
      {/* 1. Base Earth Sphere */}
      <mesh
        ref={earthMeshRef}
        onClick={handleGlobeClick}
        castShadow
        receiveShadow
      >
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Translucent Atmosphere Halo */}
      <mesh scale={[1.035, 1.035, 1.035]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* 3. Outer Orbiting Ring / Equator Line */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.08, 1.085, 64]} />
        <meshBasicMaterial color="#0284c7" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* 4. Interactive City Pins & Badges */}
      {cityPins.map(({ city, pos }) => {
        const isSelected = selectedCity?.id === city.id;
        const isHovered = hoveredCity?.id === city.id;

        return (
          <group key={city.id} position={pos}>
            {/* Glowing Dot Marker */}
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectCity(city);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                setHoveredCity(city);
                document.body.style.cursor = 'pointer';
              }}
              onPointerOut={(e) => {
                e.stopPropagation();
                setHoveredCity(null);
                document.body.style.cursor = 'auto';
              }}
            >
              <sphereGeometry args={[isSelected ? 0.022 : isHovered ? 0.018 : 0.012, 16, 16]} />
              <meshBasicMaterial
                color={isSelected ? '#f59e0b' : isHovered ? '#38bdf8' : '#30689e'}
              />
            </mesh>

            {/* Hover / Active Html Tooltip Badge */}
            {(isSelected || isHovered) && (
              <Html
                position={[0, 0.03, 0]}
                center
                distanceFactor={3}
                zIndexRange={[100, 0]}
              >
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCity(city);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-lg flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-300 ring-2 ring-amber-400/50 scale-110'
                      : 'bg-slate-900/95 text-cyan-300 border-cyan-500/50 backdrop-blur-md hover:scale-105'
                  }`}
                >
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{city.name}</span>
                  <span className="text-[9px] opacity-80">({city.countryCode})</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
};

// Scene Lights Component
const GlobeLights: React.FC<{ dayNightLighting: boolean }> = ({ dayNightLighting }) => {
  return (
    <>
      <ambientLight intensity={dayNightLighting ? 0.4 : 0.9} />
      <directionalLight
        position={dayNightLighting ? [5, 3, 4] : [2, 2, 5]}
        intensity={dayNightLighting ? 1.8 : 1.2}
        color="#ffffff"
      />
      <pointLight position={[-5, -3, -4]} intensity={0.5} color="#38bdf8" />
    </>
  );
};

interface InteractiveGlobe3DProps {
  onAddCityToWatchlist?: (city: City) => void;
}

export const InteractiveGlobe3D: React.FC<InteractiveGlobe3DProps> = ({ onAddCityToWatchlist }) => {
  const [selectedCity, setSelectedCity] = useState<City>(MAJOR_CITIES.find((c) => c.id === 'lon') || MAJOR_CITIES[0]);
  const [customCoordinates, setCustomCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [dayNightLighting, setDayNightLighting] = useState<boolean>(true);
  const [now, setNow] = useState<Date>(new Date());
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // Live ticking clock
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle click on sphere surface to find closest city or set custom coordinate
  const handleGlobeCoordinateClick = (lat: number, lng: number) => {
    setCustomCoordinates({ lat, lng });

    // Find nearest city within 500km
    let closest: City | null = null;
    let minDistance = Infinity;

    MAJOR_CITIES.forEach((c) => {
      const dLat = c.lat - lat;
      const dLng = c.lng - lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDistance) {
        minDistance = dist;
        closest = c;
      }
    });

    if (closest && minDistance < 15) {
      setSelectedCity(closest);
    }
  };

  // Select quick jump city
  const handleQuickJumpCity = (cityId: string) => {
    const city = MAJOR_CITIES.find((c) => c.id === cityId);
    if (city) {
      setSelectedCity(city);
      setCustomCoordinates(null);
    }
  };

  // Selected city local time calculation
  const offsetInfo = getTimezoneOffsetInfo(now, selectedCity.timezone);
  const timeFormatted = formatCityDateTime(now, selectedCity.timezone);

  // Approx day/night solar status for selected city
  const localHour = parseInt(timeFormatted.timeStr.split(':')[0], 10);
  const isDaytime = localHour >= 6 && localHour < 19;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl text-slate-100 p-4 sm:p-6 space-y-4">
      {/* Globe Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> WebGL 3D Interactive World Clock
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" />
            3D Time Zone & Solar Globe
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Rotate, zoom, and click anywhere on Earth to inspect live time, solar position, and timezone offsets.
          </p>
        </div>

        {/* Quick City Jump Toolbar */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-[11px] text-slate-400 mr-1 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-amber-400" /> Jump:
          </span>
          {[
            { id: 'lon', label: '🇬🇧 London' },
            { id: 'nyc', label: '🇺🇸 New York' },
            { id: 'tyo', label: '🇯🇵 Tokyo' },
            { id: 'dxb', label: '🇦🇪 Dubai' },
            { id: 'syd', label: '🇦🇺 Sydney' },
            { id: 'rio', label: '🇧🇷 Rio' },
            { id: 'cai', label: '🇪🇬 Cairo' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleQuickJumpCity(item.id)}
              className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                selectedCity.id === item.id
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 3D Canvas Area & Floating Live Card */}
      <div className="relative w-full h-[480px] sm:h-[560px] bg-[#040812] rounded-2xl overflow-hidden border border-slate-800 shadow-inner group">
        {/* React Three Fiber Canvas */}
        <Canvas
          camera={{ position: [0, 0, 2.6], fov: 45 }}
          gl={{ antialias: true, alpha: false }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <color attach="background" args={['#040812']} />
          <GlobeLights dayNightLighting={dayNightLighting} />
          <GlobeMesh
            selectedCity={selectedCity}
            onSelectCity={(city) => {
              setSelectedCity(city);
              setCustomCoordinates(null);
            }}
            onClickCoordinates={handleGlobeCoordinateClick}
            showGrid={showGrid}
            isAutoRotating={isAutoRotating}
            dayNightLighting={dayNightLighting}
          />
          <OrbitControls
            enableZoom={true}
            minDistance={1.4}
            maxDistance={4.8}
            rotateSpeed={0.6}
            zoomSpeed={0.8}
            enablePan={false}
          />
        </Canvas>

        {/* Top Floating Control Bar over 3D Canvas */}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/80 p-1.5 rounded-xl shadow-lg text-xs font-semibold">
            <button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                isAutoRotating
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Auto Rotation"
            >
              {isAutoRotating ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 text-slate-400" />}
              <span>{isAutoRotating ? 'Spinning' : 'Paused'}</span>
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                showGrid
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Latitude & Longitude Grid"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Grid Lines</span>
            </button>

            <button
              onClick={() => setDayNightLighting(!dayNightLighting)}
              className={`px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                dayNightLighting
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
              title="Toggle Day/Night Sun Lighting"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Day/Night Light</span>
            </button>
          </div>

          <div className="pointer-events-auto text-[11px] font-mono text-cyan-300 bg-slate-900/80 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-md">
            Drag to Rotate • Scroll to Zoom • Click Pin
          </div>
        </div>

        {/* Selected City Floating Live Time Card Overlay (Bottom Left) */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 p-4 rounded-2xl shadow-2xl text-slate-100 z-10 transition-all">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black text-white font-display">
                  {selectedCity.name}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700 uppercase">
                  {selectedCity.countryCode} • {selectedCity.country}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Lat: {selectedCity.lat.toFixed(2)}° • Lng: {selectedCity.lng.toFixed(2)}° • Pop: {(selectedCity.population / 1000000).toFixed(1)}M
              </p>
            </div>

            <div className={`p-2 rounded-xl border flex items-center gap-1 ${
              isDaytime ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
            }`}>
              {isDaytime ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span className="text-[10px] font-bold">{isDaytime ? 'Daytime' : 'Nighttime'}</span>
            </div>
          </div>

          {/* Time Display */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-3 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                Live Local Time
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono tracking-tight flex items-baseline gap-2">
                <span>{timeFormatted.timeStr}</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5">
                {timeFormatted.dateStr}
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700/50 text-xs font-mono font-bold block mb-1">
                {offsetInfo.offsetFormatted}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {offsetInfo.abbreviation} ({offsetInfo.displayName})
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onAddCityToWatchlist && (
              <button
                onClick={() => {
                  onAddCityToWatchlist(selectedCity);
                  setAddedSuccess(true);
                  setTimeout(() => setAddedSuccess(false), 2500);
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  addedSuccess
                    ? 'bg-emerald-500 text-slate-950 font-extrabold'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{addedSuccess ? 'Added to Watchlist!' : 'Add to Watchlist'}</span>
              </button>
            )}

            {customCoordinates && (
              <div className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-1.5 rounded-lg">
                Clicked Lat {customCoordinates.lat.toFixed(1)}°, Lng {customCoordinates.lng.toFixed(1)}°
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
