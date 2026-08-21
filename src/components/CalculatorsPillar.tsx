import React, { useState } from 'react';
import {
  Calculator, Clock, Cpu, DollarSign, Wifi, Thermometer, Gauge, Users,
} from 'lucide-react';
import { LeapSecondUtility } from './LeapSecondUtility';
import { Phase1Calculators } from './calculators/Phase1Calculators';
import { PayCalculator } from './calculators/PayCalculator';

export const CalculatorsPillar: React.FC = () => {
  const [calcCategory, setCalcCategory] = useState<'date' | 'leap' | 'it' | 'financial' | 'weather'>('date');

  const [cidrPrefix, setCidrPrefix] = useState(24);
  const [dataSize, setDataSize] = useState(25);
  const [dataSizeUnit, setDataSizeUnit] = useState<'GB' | 'TB' | 'MB'>('GB');
  const [networkSpeed, setNetworkSpeed] = useState(100);
  const [networkSpeedUnit, setNetworkSpeedUnit] = useState<'Mbps' | 'Gbps' | 'MBs'>('Mbps');

  const getSubnetInfo = (prefix: number) => {
    const totalHosts = Math.pow(2, 32 - prefix);
    const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalHosts - 2;
    let mask = '255.255.255.0';
    if (prefix === 8) mask = '255.0.0.0';
    else if (prefix === 16) mask = '255.255.0.0';
    else if (prefix === 24) mask = '255.255.255.0';
    else if (prefix === 28) mask = '255.255.255.240';
    else if (prefix === 30) mask = '255.255.255.252';
    return { totalHosts, usableHosts, mask };
  };
  const subnetInfo = getSubnetInfo(cidrPrefix);

  const calculateTransferTime = () => {
    let sizeInBits = dataSize;
    if (dataSizeUnit === 'MB') sizeInBits *= 1e6 * 8;
    if (dataSizeUnit === 'GB') sizeInBits *= 1e9 * 8;
    if (dataSizeUnit === 'TB') sizeInBits *= 1e12 * 8;
    let speedBps = networkSpeed;
    if (networkSpeedUnit === 'Mbps') speedBps *= 1e6;
    if (networkSpeedUnit === 'Gbps') speedBps *= 1e9;
    if (networkSpeedUnit === 'MBs') speedBps *= 8 * 1e6;
    const totalSeconds = sizeInBits / (speedBps || 1);
    return {
      hrs: Math.floor(totalSeconds / 3600),
      mins: Math.floor((totalSeconds % 3600) / 60),
      secs: Math.round(totalSeconds % 60),
    };
  };
  const transferTime = calculateTransferTime();

  const [meetingAttendees, setMeetingAttendees] = useState(6);
  const [meetingDurationMins, setMeetingDurationMins] = useState(60);
  const [avgHourlySalary, setAvgHourlySalary] = useState(65);
  const meetingCost = (meetingAttendees * avgHourlySalary * (meetingDurationMins / 60)).toFixed(2);

  const [tempInput, setTempInput] = useState(25);
  const [tempUnit, setTempUnit] = useState<'C' | 'F' | 'K'>('C');
  const [pressureInput, setPressureInput] = useState(1013.25);
  const convertTemp = () => {
    let c = tempInput;
    if (tempUnit === 'F') c = (tempInput - 32) * (5 / 9);
    if (tempUnit === 'K') c = tempInput - 273.15;
    return { C: c.toFixed(2), F: (c * (9 / 5) + 32).toFixed(2), K: (c + 273.15).toFixed(2) };
  };
  const tempResults = convertTemp();
  const pressureResults = {
    inHg: (pressureInput * 0.02953).toFixed(2),
    psi: (pressureInput * 0.0145038).toFixed(2),
    mmHg: (pressureInput * 0.750062).toFixed(1),
  };

  const tab = (id: typeof calcCategory, label: string) => (
    <button
      type="button"
      onClick={() => setCalcCategory(id)}
      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-semibold ${
        calcCategory === id
          ? 'bg-blue-600 text-white shadow-xs'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <Calculator className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
              Calculators
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Phase 1 date tools · leap seconds · ICT · AU-default pay · weather units
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            {tab('date', 'Date & Time')}
            {tab('leap', 'Leap Seconds')}
            {tab('it', 'ICT & Network')}
            {tab('financial', 'Salary & Meetings')}
            {tab('weather', 'Weather & Physics')}
          </div>
        </div>

        {calcCategory === 'date' && (
          <div className="pt-6">
            <Phase1Calculators />
          </div>
        )}

        {calcCategory === 'leap' && (
          <div className="pt-6">
            <LeapSecondUtility />
          </div>
        )}

        {calcCategory === 'it' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-500" /> IP Subnet CIDR
              </h2>
              <select
                value={cidrPrefix}
                onChange={(e) => setCidrPrefix(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
              >
                <option value={8}>/8</option>
                <option value={16}>/16</option>
                <option value={24}>/24</option>
                <option value={28}>/28</option>
                <option value={30}>/30</option>
              </select>
              <div className="font-mono space-y-1 p-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <div className="flex justify-between"><span>Mask</span><span className="text-cyan-500">{subnetInfo.mask}</span></div>
                <div className="flex justify-between"><span>Usable hosts</span><span>{subnetInfo.usableHosts.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Wifi className="w-4 h-4 text-purple-500" /> Transfer time
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={dataSize} onChange={(e) => setDataSize(Number(e.target.value))} className="bg-white dark:bg-slate-900 border rounded-lg px-2 py-1.5" />
                <select value={dataSizeUnit} onChange={(e) => setDataSizeUnit(e.target.value as typeof dataSizeUnit)} className="bg-white dark:bg-slate-900 border rounded-lg px-2">
                  <option value="MB">MB</option>
                  <option value="GB">GB</option>
                  <option value="TB">TB</option>
                </select>
                <input type="number" value={networkSpeed} onChange={(e) => setNetworkSpeed(Number(e.target.value))} className="bg-white dark:bg-slate-900 border rounded-lg px-2 py-1.5" />
                <select value={networkSpeedUnit} onChange={(e) => setNetworkSpeedUnit(e.target.value as typeof networkSpeedUnit)} className="bg-white dark:bg-slate-900 border rounded-lg px-2">
                  <option value="Mbps">Mbps</option>
                  <option value="Gbps">Gbps</option>
                  <option value="MBs">MB/s</option>
                </select>
              </div>
              <p className="font-mono text-lg text-purple-600 dark:text-purple-300">
                {transferTime.hrs > 0 && `${transferTime.hrs}h `}
                {transferTime.mins > 0 && `${transferTime.mins}m `}
                {transferTime.secs}s
              </p>
            </div>
          </div>
        )}

        {calcCategory === 'financial' && (
          <div className="pt-6 space-y-6">
            <PayCalculator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border space-y-3">
                <h2 className="font-bold text-sm flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" /> Meeting cost (simple)
                </h2>
                <p className="text-[11px] opacity-70">Attendees × hours × average hourly rate</p>
                <div className="grid grid-cols-3 gap-2">
                  <input type="number" value={meetingAttendees} onChange={(e) => setMeetingAttendees(Number(e.target.value))} className="border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" placeholder="People" />
                  <input type="number" value={meetingDurationMins} onChange={(e) => setMeetingDurationMins(Number(e.target.value))} className="border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" placeholder="Mins" />
                  <input type="number" value={avgHourlySalary} onChange={(e) => setAvgHourlySalary(Number(e.target.value))} className="border rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900" placeholder="$/hr" />
                </div>
                <p className="font-mono text-lg text-blue-600 dark:text-cyan-400">${meetingCost}</p>
              </div>
            </div>
          </div>
        )}

        {calcCategory === 'weather' && (
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border space-y-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-rose-500" /> Temperature
              </h2>
              <div className="flex gap-2">
                <input type="number" value={tempInput} onChange={(e) => setTempInput(Number(e.target.value))} className="flex-1 border rounded-lg px-3 py-2 bg-white dark:bg-slate-900" />
                <select value={tempUnit} onChange={(e) => setTempUnit(e.target.value as typeof tempUnit)} className="border rounded-lg px-2 bg-white dark:bg-slate-900">
                  <option value="C">°C</option>
                  <option value="F">°F</option>
                  <option value="K">K</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-center">
                <div>{tempResults.C}°C</div>
                <div>{tempResults.F}°F</div>
                <div>{tempResults.K} K</div>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border space-y-3">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <Gauge className="w-4 h-4 text-sky-500" /> Pressure (hPa)
              </h2>
              <input type="number" value={pressureInput} onChange={(e) => setPressureInput(Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 bg-white dark:bg-slate-900" />
              <div className="grid grid-cols-3 gap-2 font-mono text-center text-[11px]">
                <div>{pressureResults.inHg} inHg</div>
                <div>{pressureResults.psi} PSI</div>
                <div>{pressureResults.mmHg} mmHg</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
