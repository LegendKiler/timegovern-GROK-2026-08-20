import React, { useState } from 'react';
import { Calculator, Clock, Calendar, HardDrive, Cpu, DollarSign, ArrowRightLeft, Percent, Layers, Check, Copy } from 'lucide-react';

export const CalculatorsPillar: React.FC = () => {
  const [calcGroup, setCalcGroup] = useState<'date' | 'it' | 'financial' | 'unit'>('date');

  // IT Calculator States
  const [dataSize, setDataSize] = useState<number>(10);
  const [dataSizeUnit, setDataSizeUnit] = useState<'GB' | 'TB' | 'MB'>('GB');
  const [networkSpeed, setNetworkSpeed] = useState<number>(100);
  const [networkSpeedUnit, setNetworkSpeedUnit] = useState<'Mbps' | 'Gbps' | 'MBs'>('Mbps');

  // Storage Converter
  const [storageInput, setStorageInput] = useState<number>(1024);
  const [storageFromUnit, setStorageFromUnit] = useState<'GB' | 'TB' | 'MB' | 'PB'>('GB');

  // Subnet CIDR
  const [cidrPrefix, setCidrPrefix] = useState<number>(24);

  // Financial Workday Salary Calculator
  const [hourlyWage, setHourlyWage] = useState<number>(45);
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(40);
  const [vacationWeeks, setVacationWeeks] = useState<number>(2);

  // Unit Converter (Time & Frequency)
  const [timeValue, setTimeValue] = useState<number>(86400);
  const [timeUnitFrom, setTimeUnitFrom] = useState<'seconds' | 'minutes' | 'hours' | 'days'>('seconds');

  // Transfer Time Calculation
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

  // Storage conversions
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

  // Salary calculations
  const workingWeeks = 52 - vacationWeeks;
  const annualSalary = hourlyWage * hoursPerWeek * workingWeeks;
  const monthlySalary = annualSalary / 12;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2.5">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Universal Interactive Calculators & IT Data Converters
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Data transfer speed, storage conversion, IP CIDR, financial workday salary, date math & unit converters.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setCalcGroup('date')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcGroup === 'date' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Date & Time
            </button>
            <button
              onClick={() => setCalcGroup('it')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcGroup === 'it' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              IT & Data Networks
            </button>
            <button
              onClick={() => setCalcGroup('financial')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcGroup === 'financial' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Workday & Salary
            </button>
            <button
              onClick={() => setCalcGroup('unit')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcGroup === 'unit' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Unit Converters
            </button>
          </div>
        </div>
      </div>

      {/* IT & Network Calculators */}
      {calcGroup === 'it' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Transfer Speed Calculator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Cpu className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">File Download / Data Transfer Time Calculator</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">File Size:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={dataSize}
                    onChange={(e) => setDataSize(Number(e.target.value))}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
                  />
                  <select
                    value={dataSizeUnit}
                    onChange={(e) => setDataSizeUnit(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="MB">MB</option>
                    <option value="GB">GB</option>
                    <option value="TB">TB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Network Connection Bandwidth Speed:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={networkSpeed}
                    onChange={(e) => setNetworkSpeed(Number(e.target.value))}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
                  />
                  <select
                    value={networkSpeedUnit}
                    onChange={(e) => setNetworkSpeedUnit(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="Mbps">Mbps (Megabits/sec)</option>
                    <option value="Gbps">Gbps (Gigabits/sec)</option>
                    <option value="MBs">MB/s (Megabytes/sec)</option>
                  </select>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-4 rounded-xl mt-4">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase block mb-1">Estimated Transfer Duration</span>
                <div className="text-2xl font-extrabold text-blue-900 dark:text-cyan-300 font-mono">
                  {transferTime.hrs > 0 && `${transferTime.hrs}h `}
                  {transferTime.mins > 0 && `${transferTime.mins}m `}
                  {transferTime.secs}s
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                  Assumes theoretical network saturation without packet loss.
                </p>
              </div>
            </div>
          </div>

          {/* Storage Size Unit Converter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <HardDrive className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-bold text-slate-900 dark:text-white text-base">IT Data Storage Capacity Converter</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Value to Convert:</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={storageInput}
                    onChange={(e) => setStorageInput(Number(e.target.value))}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
                  />
                  <select
                    value={storageFromUnit}
                    onChange={(e) => setStorageFromUnit(e.target.value as any)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2 rounded-lg border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="MB">Megabytes (MB)</option>
                    <option value="GB">Gigabytes (GB)</option>
                    <option value="TB">Terabytes (TB)</option>
                    <option value="PB">Petabytes (PB)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 font-mono">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Megabytes (MB)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{storageResults.MB}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Gigabytes (GB)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{storageResults.GB}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Terabytes (TB)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{storageResults.TB}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-500 block">Petabytes (PB)</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{storageResults.PB}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workday & Salary Calculator */}
      {calcGroup === 'financial' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Hourly Wage to Annual Salary Calculator</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Hourly Rate ($):</label>
              <input
                type="number"
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Hours per Week:</label>
              <input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Unpaid Vacation Weeks:</label>
              <input
                type="number"
                value={vacationWeeks}
                onChange={(e) => setVacationWeeks(Number(e.target.value))}
                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-xl grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Annual Salary (Gross)</span>
              <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 font-mono">
                ${annualSalary.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Monthly Average</span>
              <span className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-200 font-mono">
                ${Math.round(monthlySalary).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Date & Time default info view */}
      {calcGroup === 'date' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center max-w-xl mx-auto space-y-3">
          <Calendar className="w-8 h-8 text-blue-600 dark:text-cyan-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Date, Workday & Duration Calculators</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Calculate precise working days between dates, exclude public bank holidays for 150+ countries, add/subtract custom durations, or create shareable countdown timers in Pillar 2 (Calendars & Date Math).
          </p>
        </div>
      )}

      {/* Unit Converters */}
      {calcGroup === 'unit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center max-w-xl mx-auto space-y-3">
          <ArrowRightLeft className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">Time, Frequency & Speed Unit Converters</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Convert seconds, minutes, hours, days, solar years, nanoseconds, gigahertz and frame rates instantly with microsecond precision.
          </p>
        </div>
      )}
    </div>
  );
};
