import React, { useState, useEffect } from 'react';
import { Activity, Users, Globe, Flame, Cpu, Zap, DollarSign, Clock, ShieldAlert, BarChart3 } from 'lucide-react';
import { AdBanner } from './AdBanner';

export const WorldometersPillar: React.FC = () => {
  const [time, setTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 100); // 10Hz ticker for smooth millisecond updates
    return () => clearInterval(interval);
  }, []);

  // Time calculations
  const nowMs = time.getTime();
  const startOfDay = new Date(time.getFullYear(), time.getMonth(), time.getDate()).getTime();
  const startOfYear = new Date(time.getFullYear(), 0, 1).getTime();
  const endOfYear = new Date(time.getFullYear() + 1, 0, 1).getTime();

  const secondsToday = (nowMs - startOfDay) / 1000;
  const yearFraction = (nowMs - startOfYear) / (endOfYear - startOfYear);
  const yearPercentage = (yearFraction * 100).toFixed(6);

  // Worldometers Millisecond Live Ticker Math
  // World Population ~8,192,500,000 (Birth rate ~4.3/sec, Death rate ~1.9/sec, Net ~2.4/sec)
  const basePop = 8192500000;
  const netRatePerSec = 2.413;
  const birthRatePerSec = 4.312;
  const deathRatePerSec = 1.899;

  const currentPopulation = Math.floor(basePop + secondsToday * netRatePerSec);
  const birthsToday = Math.floor(secondsToday * birthRatePerSec);
  const deathsToday = Math.floor(secondsToday * deathRatePerSec);

  // Digital Infrastructure
  const emailsToday = Math.floor(secondsToday * 3850000); // ~3.85 million emails per sec
  const googleSearchesToday = Math.floor(secondsToday * 115000); // ~115k searches per sec
  const gbDataTransferred = Math.floor(secondsToday * 185000); // GB per sec

  // Energy & Environment
  const solarEnergyMwh = Math.floor(secondsToday * 173000); // MWh today
  const co2TonsToday = Math.floor(secondsToday * 1150); // Tons CO2 per sec
  const forestHectaresLostYear = Math.floor((secondsToday + (nowMs - startOfYear) / 1000) * 0.38);

  // Global Time Economy
  const workHoursToday = Math.floor(secondsToday * 145000); // Work hours completed today
  const lostMeetingDollarValue = Math.floor(secondsToday * 82000); // USD lost to inefficient meetings

  // Swatch Internet Time (.beats)
  // UTC+1 based, 1 beat = 86.4 seconds
  const utcPlus1Ms = nowMs + 3600000;
  const utcPlus1SecondsOfDay = ((utcPlus1Ms % 86400000) / 1000);
  const swatchBeats = (utcPlus1SecondsOfDay / 86.4).toFixed(2);

  // Julian Day Number
  const julianDay = (nowMs / 86400000 + 2440587.5).toFixed(5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400">
                LIVE MILLISECOND GLOBAL TICKER ENGINE
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Worldometers Real-Time Temporal & Global Statistics
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Live algorithmic counter models tracking population growth, digital bandwidth, planetary energy consumption, and temporal precision benchmarks.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-xl font-mono text-xs flex flex-col gap-1 shrink-0">
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">UNIX EPOCH:</span>
              <span className="text-emerald-400 font-bold">{Math.floor(nowMs / 1000)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">SWATCH TIME:</span>
              <span className="text-amber-400 font-bold">@{swatchBeats} .beats</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-400">JULIAN DAY:</span>
              <span className="text-blue-400 font-bold">{julianDay}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Tickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Card 1: World Population */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-400" /> World Population
            </span>
            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
              +2.4 / sec
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono text-white tracking-tight my-2">
            {currentPopulation.toLocaleString()}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Births Today</span>
              <span className="text-emerald-400 font-bold">+{birthsToday.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Deaths Today</span>
              <span className="text-rose-400 font-bold">-{deathsToday.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 2: 2026 Year Progression */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" /> 2026 Temporal Progress
            </span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded font-mono">
              ORBITAL TRACK
            </span>
          </div>

          <div className="text-3xl font-extrabold font-mono text-white tracking-tight my-2">
            {yearPercentage}%
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 my-2">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${yearPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
            <span>Elapsed Today: {Math.floor(secondsToday).toLocaleString()}s</span>
            <span>Rem. Days: {Math.floor((endOfYear - nowMs) / 86400000)}d</span>
          </div>
        </div>

        {/* Card 3: Digital & Web Traffic */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-cyan-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" /> Global Internet Activity Today
            </span>
            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded font-mono">
              REAL-TIME
            </span>
          </div>

          <div className="text-2xl font-extrabold font-mono text-white tracking-tight my-2">
            {emailsToday.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">Emails Sent</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Google Searches Today</span>
              <span className="text-amber-400 font-bold">{googleSearchesToday.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Web Data Moved</span>
              <span className="text-cyan-400 font-bold">{gbDataTransferred.toLocaleString()} GB</span>
            </div>
          </div>
        </div>

        {/* Card 4: Energy & Solar Irradiation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" /> Planetary Solar Flux Today
            </span>
            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono">
              SOLAR CONSTANT
            </span>
          </div>

          <div className="text-2xl font-extrabold font-mono text-white tracking-tight my-2">
            {solarEnergyMwh.toLocaleString()} <span className="text-xs text-amber-400 font-sans font-normal">MWh Hit Earth</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">CO2 Emissions Today</span>
              <span className="text-rose-400 font-bold">{co2TonsToday.toLocaleString()} Tons</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Forest Lost (2026)</span>
              <span className="text-amber-400 font-bold">{forestHectaresLostYear.toLocaleString()} Ha</span>
            </div>
          </div>
        </div>

        {/* Card 5: Time Economy & Work Hours */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Global Work Time Economy
            </span>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono">
              COMMERCE
            </span>
          </div>

          <div className="text-2xl font-extrabold font-mono text-white tracking-tight my-2">
            {workHoursToday.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">Work Hours Done</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Time Cost of Inefficient Meetings</span>
              <span className="text-rose-400 font-bold">${lostMeetingDollarValue.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Active Workforce</span>
              <span className="text-emerald-400 font-bold">~3.52 Billion</span>
            </div>
          </div>
        </div>

        {/* Card 6: Astronomical Benchmarks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-blue-400" /> Celestial Speed & Rotation
            </span>
            <span className="text-[10px] bg-blue-950 text-blue-300 border border-blue-800 px-2 py-0.5 rounded font-mono">
              ASTRODYNAMICS
            </span>
          </div>

          <div className="text-2xl font-extrabold font-mono text-white tracking-tight my-2">
            {(secondsToday * 29.78).toFixed(0)} <span className="text-xs text-slate-400 font-sans font-normal">km Earth Traveled in Space</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block">Orbital Velocity</span>
              <span className="text-blue-300 font-bold">29.78 km/sec</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block">Equatorial Spin</span>
              <span className="text-indigo-300 font-bold">1,670 km/h</span>
            </div>
          </div>
        </div>
      </div>

      <AdBanner type="in-feed" />
    </div>
  );
};
