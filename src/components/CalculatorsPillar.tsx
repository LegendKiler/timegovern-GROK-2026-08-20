import React, { useState } from 'react';
import { Calculator, Clock, Calendar, HardDrive, Cpu, DollarSign, ArrowRightLeft, Percent, Layers, Check, Copy, Wifi, Thermometer, Wind, Gauge, Users, Globe, Building, Zap } from 'lucide-react';
import { LeapSecondUtility } from './LeapSecondUtility';

export const CalculatorsPillar: React.FC = () => {
  const [calcCategory, setCalcCategory] = useState<'date' | 'leap' | 'it' | 'financial' | 'weather' | 'unit'>('date');

  // 1. DATE & TIME CALCULATORS
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date(Date.now() + 30 * 86400 * 1000).toISOString().split('T')[0]);
  const [addDaysCount, setAddDaysCount] = useState<number>(45);

  const calculateDateDiff = () => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const weeks = Math.floor(totalDays / 7);
    const remDays = totalDays % 7;
    return { totalDays, totalHours, totalMinutes, weeks, remDays };
  };

  const calculateAddDays = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + addDaysCount);
    return d.toDateString();
  };

  const dateDiff = calculateDateDiff();
  const futureDateStr = calculateAddDays();

  // 2. ICT & NETWORK CALCULATORS
  const [cidrPrefix, setCidrPrefix] = useState<number>(24);
  const [dataSize, setDataSize] = useState<number>(25);
  const [dataSizeUnit, setDataSizeUnit] = useState<'GB' | 'TB' | 'MB'>('GB');
  const [networkSpeed, setNetworkSpeed] = useState<number>(100);
  const [networkSpeedUnit, setNetworkSpeedUnit] = useState<'Mbps' | 'Gbps' | 'MBs'>('Mbps');

  const [storageInput, setStorageInput] = useState<number>(1024);
  const [storageFromUnit, setStorageFromUnit] = useState<'GB' | 'TB' | 'MB' | 'PB'>('GB');

  // Subnet Calculation Logic
  const getSubnetInfo = (prefix: number) => {
    const totalHosts = Math.pow(2, 32 - prefix);
    const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalHosts - 2;
    let mask = '';
    if (prefix === 8) mask = '255.0.0.0';
    else if (prefix === 16) mask = '255.255.0.0';
    else if (prefix === 24) mask = '255.255.255.0';
    else if (prefix === 28) mask = '255.255.255.240';
    else if (prefix === 30) mask = '255.255.255.252';
    else mask = `255.255.255.${256 - Math.pow(2, 32 - prefix)}`;

    return { totalHosts, usableHosts, mask };
  };

  const subnetInfo = getSubnetInfo(cidrPrefix);

  const calculateTransferTime = () => {
    let sizeInBits = dataSize * 8;
    if (dataSizeUnit === 'MB') sizeInBits *= 1e6 * 8;
    if (dataSizeUnit === 'GB') sizeInBits *= 1e9 * 8;
    if (dataSizeUnit === 'TB') sizeInBits *= 1e12 * 8;

    let speedBps = networkSpeed;
    if (networkSpeedUnit === 'Mbps') speedBps *= 1e6;
    if (networkSpeedUnit === 'Gbps') speedBps *= 1e9;
    if (networkSpeedUnit === 'MBs') speedBps *= 8 * 1e6;

    const totalSeconds = sizeInBits / (speedBps || 1);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.round(totalSeconds % 60);

    return { totalSeconds, hrs, mins, secs };
  };

  const transferTime = calculateTransferTime();

  const convertStorage = () => {
    let bytes = storageInput;
    if (storageFromUnit === 'MB') bytes *= 1024 * 1024;
    if (storageFromUnit === 'GB') bytes *= 1024 * 1024 * 1024;
    if (storageFromUnit === 'TB') bytes *= 1024 * 1024 * 1024 * 1024;
    if (storageFromUnit === 'PB') bytes *= 1024 * 1024 * 1024 * 1024 * 1024;

    return {
      MB: (bytes / (1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      GB: (bytes / (1024 * 1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 2 }),
      TB: (bytes / (1024 * 1024 * 1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 4 }),
      PB: (bytes / (1024 * 1024 * 1024 * 1024 * 1024)).toLocaleString(undefined, { maximumFractionDigits: 6 }),
    };
  };

  const storageResults = convertStorage();

  // 3. FINANCIAL & WORKDAY SALARY CALCULATORS
  const [hourlyWage, setHourlyWage] = useState<number>(45);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [vacationWeeks, setVacationWeeks] = useState<number>(2);

  // Meeting Cost Calculator
  const [meetingAttendees, setMeetingAttendees] = useState<number>(6);
  const [meetingDurationMins, setMeetingDurationMins] = useState<number>(60);
  const [avgHourlySalary, setAvgHourlySalary] = useState<number>(65);

  const workingWeeks = 52 - vacationWeeks;
  const annualSalary = hourlyWage * hoursPerWeek * workingWeeks;
  const monthlySalary = annualSalary / 12;

  const meetingCost = (meetingAttendees * avgHourlySalary * (meetingDurationMins / 60)).toFixed(2);

  // 4. WEATHER & PHYSICS CONVERTERS
  const [tempInput, setTempInput] = useState<number>(25);
  const [tempUnit, setTempUnit] = useState<'C' | 'F' | 'K'>('C');

  const [pressureInput, setPressureInput] = useState<number>(1013.25); // hPa

  const convertTemp = () => {
    let c = tempInput;
    if (tempUnit === 'F') c = (tempInput - 32) * (5 / 9);
    if (tempUnit === 'K') c = tempInput - 273.15;

    const f = c * (9 / 5) + 32;
    const k = c + 273.15;

    return {
      C: c.toFixed(2),
      F: f.toFixed(2),
      K: k.toFixed(2),
    };
  };

  const tempResults = convertTemp();

  const convertPressure = () => {
    const inHg = (pressureInput * 0.02953).toFixed(2);
    const psi = (pressureInput * 0.0145038).toFixed(2);
    const mmHg = (pressureInput * 0.750062).toFixed(1);
    return { inHg, psi, mmHg };
  };

  const pressureResults = convertPressure();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Pillar Title */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2.5">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Universal Interactive Calculators & Data Converters
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Live date math, ICT subnet CIDR, download speed, salary, meeting cost, weather physics & unit converters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setCalcCategory('date')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcCategory === 'date' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Date & Time
            </button>
            <button
              onClick={() => setCalcCategory('leap')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                calcCategory === 'leap' ? 'bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 font-bold shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Leap Seconds & TAI</span>
            </button>
            <button
              onClick={() => setCalcCategory('it')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcCategory === 'it' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ICT & Network
            </button>
            <button
              onClick={() => setCalcCategory('financial')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcCategory === 'financial' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Salary & Meetings
            </button>
            <button
              onClick={() => setCalcCategory('weather')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcCategory === 'weather' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Weather & Physics
            </button>
          </div>
        </div>

        {/* Category Views */}

        {/* 1. DATE & TIME MATH */}
        {calcCategory === 'date' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Duration Between Dates */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                Duration & Time Between Two Dates
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-xl space-y-2 text-blue-900 dark:text-blue-100">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Total Calendar Duration:</span>
                  <span className="text-blue-600 dark:text-cyan-400 font-mono text-base">{dateDiff.totalDays} Days</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  Equivalent to {dateDiff.weeks} weeks + {dateDiff.remDays} days ({dateDiff.totalHours.toLocaleString()} hours / {dateDiff.totalMinutes.toLocaleString()} minutes).
                </p>
              </div>
            </div>

            {/* Add / Subtract Days */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" />
                Add Days to Date Calculator
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Base Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Days to Add (+)</label>
                  <input
                    type="number"
                    value={addDaysCount}
                    onChange={(e) => setAddDaysCount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl">
                  <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Resulting Future Date:</span>
                  <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-display block mt-1">
                    {futureDateStr}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1b. LEAP SECONDS & TAI-UTC TIME SCALES */}
        {calcCategory === 'leap' && (
          <div className="pt-6">
            <LeapSecondUtility />
          </div>
        )}

        {/* 2. ICT & NETWORK DATA CONVERTERS */}
        {calcCategory === 'it' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* IP Subnet CIDR Calculator */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-500" />
                IP Subnet CIDR Calculator
              </h2>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">CIDR Prefix (e.g. /24)</label>
                <select
                  value={cidrPrefix}
                  onChange={(e) => setCidrPrefix(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                >
                  <option value={8}>/8 (Class A - 16,777,214 Hosts)</option>
                  <option value={16}>/16 (Class B - 65,534 Hosts)</option>
                  <option value={24}>/24 (Class C - 254 Hosts)</option>
                  <option value={28}>/28 (14 Usable Hosts)</option>
                  <option value={30}>/30 (2 Usable Point-to-Point Hosts)</option>
                </select>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subnet Mask:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{subnetInfo.mask}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Usable IPv4 Hosts:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{subnetInfo.usableHosts.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Addresses:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{subnetInfo.totalHosts.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Network Download Speed Estimator */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Wifi className="w-4 h-4 text-purple-500" />
                Data Transfer & Download Speed Calculator
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">File Size</label>

                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={dataSize}
                      onChange={(e) => setDataSize(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                    />
                    <select
                      value={dataSizeUnit}
                      onChange={(e: any) => setDataSizeUnit(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1 text-slate-900 dark:text-slate-100"
                    >
                      <option value="MB">MB</option>
                      <option value="GB">GB</option>
                      <option value="TB">TB</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Network Speed</label>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      value={networkSpeed}
                      onChange={(e) => setNetworkSpeed(Number(e.target.value))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                    />
                    <select
                      value={networkSpeedUnit}
                      onChange={(e: any) => setNetworkSpeedUnit(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-1 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Mbps">Mbps</option>
                      <option value="Gbps">Gbps</option>
                      <option value="MBs">MB/s</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 rounded-xl">
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Estimated Transfer Time:</span>
                <span className="text-lg font-bold text-purple-700 dark:text-purple-300 font-mono block mt-1">
                  {transferTime.hrs > 0 && `${transferTime.hrs}h `}
                  {transferTime.mins > 0 && `${transferTime.mins}m `}
                  {transferTime.secs}s
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. FINANCIAL SALARY & MEETING COST */}
        {calcCategory === 'financial' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Hourly Rate to Annual Salary */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                Hourly Wage to Annual Salary Calculator
              </h2>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={hourlyWage}
                    onChange={(e) => setHourlyWage(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Hrs / Week</label>
                  <input
                    type="number"
                    value={hoursPerWeek}
                    onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Vacation Wks</label>
                  <input
                    type="number"
                    value={vacationWeeks}
                    onChange={(e) => setVacationWeeks(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-xl grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-bold block">Annual Salary (Gross)</span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">${annualSalary.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-800 dark:text-emerald-300 uppercase tracking-wider font-bold block">Monthly Average</span>
                  <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 font-mono">${Math.round(monthlySalary).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Meeting Cost Calculator */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                Enterprise Meeting Cost Calculator
              </h2>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Attendees</label>
                  <input
                    type="number"
                    value={meetingAttendees}
                    onChange={(e) => setMeetingAttendees(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={meetingDurationMins}
                    onChange={(e) => setMeetingDurationMins(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Avg Rate ($/hr)</label>
                  <input
                    type="number"
                    value={avgHourlySalary}
                    onChange={(e) => setAvgHourlySalary(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 rounded-xl">
                <span className="text-slate-600 dark:text-slate-400 text-[11px] block">Estimated Meeting Expense:</span>
                <span className="text-xl font-bold text-blue-700 dark:text-cyan-400 font-mono block mt-1">
                  ${meetingCost} AUD / USD
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. WEATHER & PHYSICS CONVERTERS */}
        {calcCategory === 'weather' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Temperature Converter */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-500" />
                Temperature Physics Converter
              </h2>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={tempInput}
                  onChange={(e) => setTempInput(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
                <select
                  value={tempUnit}
                  onChange={(e: any) => setTempUnit(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-bold"
                >
                  <option value="C">°C Celsius</option>
                  <option value="F">°F Fahrenheit</option>
                  <option value="K">Kelvin</option>
                </select>
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-3 gap-2 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Celsius</span>
                  <span className="font-bold text-blue-600 dark:text-cyan-400">{tempResults.C}°C</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Fahrenheit</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{tempResults.F}°F</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Kelvin</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{tempResults.K} K</span>
                </div>
              </div>
            </div>

            {/* Barometric Pressure Converter */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-500" />
                Barometric Air Pressure Converter
              </h2>

              <div>
                <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">Pressure in hPa / mbar</label>
                <input
                  type="number"
                  value={pressureInput}
                  onChange={(e) => setPressureInput(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>

              <div className="p-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl grid grid-cols-3 gap-2 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Inches Hg</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{pressureResults.inHg} inHg</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">PSI</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">{pressureResults.psi} PSI</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">mmHg</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{pressureResults.mmHg} mmHg</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
