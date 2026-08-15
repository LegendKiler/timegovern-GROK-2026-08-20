import React, { useState } from 'react';
import { Calendar as CalendarIcon, Calculator, Clock, Printer, ChevronLeft, ChevronRight, Plus, Minus, Share2, Check, Filter } from 'lucide-react';
import { getPublicHolidaysForCountry } from '../lib/holidayData';
import { calculateDaysBetweenDates, addDurationToDate, DateDiffResult } from '../lib/dateCalculators';
import { PublicHoliday } from '../types';

export const CalendarPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'calendar' | 'between' | 'business' | 'addsub' | 'countdown'>('calendar');

  // Calendar State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'year'>('month');
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('US');

  // Days Between State
  const [startDateStr, setStartDateStr] = useState<string>('2026-01-01');
  const [endDateStr, setEndDateStr] = useState<string>('2026-12-31');
  const [betweenExcludeHolidays, setBetweenExcludeHolidays] = useState<boolean>(true);

  // Add / Subtract State
  const [baseDateStr, setBaseDateStr] = useState<string>('2026-07-26');
  const [addAmount, setAddAmount] = useState<number>(30);
  const [addUnit, setAddUnit] = useState<'days' | 'weeks' | 'months' | 'years' | 'businessDays'>('days');
  const [addDirection, setAddDirection] = useState<'add' | 'subtract'>('add');

  // Countdown creator state
  const [cdTitle, setCdTitle] = useState('New Year 2027');
  const [cdTargetStr, setCdTargetStr] = useState('2027-01-01T00:00');
  const [copiedCd, setCopiedCd] = useState(false);

  // Holidays
  const holidays: PublicHoliday[] = getPublicHolidaysForCountry(selectedCountryCode, selectedYear);

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Days Between Calculation
  const betweenResult: DateDiffResult = calculateDaysBetweenDates(
    new Date(startDateStr),
    new Date(endDateStr),
    selectedCountryCode,
    [0, 6],
    betweenExcludeHolidays
  );

  // Add/Subtract Calculation
  const calculatedTargetDate = addDurationToDate(
    new Date(baseDateStr),
    addDirection === 'add' ? addAmount : -addAmount,
    addUnit,
    [0, 6],
    selectedCountryCode
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              2. Calendars & Date Calculators
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customizable calendars with week numbers, country public holiday databases & workday math engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSubTab('calendar')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'calendar' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Interactive Calendar
            </button>
            <button
              onClick={() => setSubTab('between')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'between' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Days Between Dates
            </button>
            <button
              onClick={() => setSubTab('addsub')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'addsub' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Add/Subtract Duration
            </button>
            <button
              onClick={() => setSubTab('countdown')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'countdown' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Custom Countdown
            </button>
          </div>
        </div>

        {/* ---------------- SUB TAB 1: INTERACTIVE CALENDAR ---------------- */}
        {subTab === 'calendar' && (
          <div className="mt-4 space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedMonth === 0) {
                      setSelectedMonth(11);
                      setSelectedYear(selectedYear - 1);
                    } else {
                      setSelectedMonth(selectedMonth - 1);
                    }
                  }}
                  className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-slate-900 dark:text-white min-w-32 text-center">
                  {new Date(selectedYear, selectedMonth, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
                </span>
                <button
                  onClick={() => {
                    if (selectedMonth === 11) {
                      setSelectedMonth(0);
                      setSelectedYear(selectedYear + 1);
                    } else {
                      setSelectedMonth(selectedMonth + 1);
                    }
                  }}
                  className="p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-700 dark:text-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Country Holiday Selection */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Filter className="w-3.5 h-3.5 text-blue-500" /> Holidays:
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => setSelectedCountryCode(e.target.value)}
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-xs px-2 py-1 text-slate-800 dark:text-slate-100"
                  >
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (GB)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="AU">Australia (AU)</option>
                    <option value="JP">Japan (JP)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="FR">France (FR)</option>
                    <option value="IN">India (IN)</option>
                  </select>
                </div>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 text-xs font-medium rounded flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Layout
                </button>
              </div>
            </div>

            {/* Calendar Grid View */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-900 p-4">
              <div className="grid grid-cols-8 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2 mb-2">
                <span className="text-blue-500">Wk</span>
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="grid grid-cols-8 text-center text-xs gap-y-2">
                {(() => {
                  const firstDay = new Date(selectedYear, selectedMonth, 1);
                  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
                  const startDayOfWeek = firstDay.getDay();

                  const cells = [];
                  let weekNum = Math.ceil(((firstDay.getTime() - new Date(selectedYear, 0, 1).getTime()) / 86400000 + 1) / 7);

                  for (let i = 0; i < startDayOfWeek; i++) {
                    if (i === 0) {
                      cells.push(
                        <div key={`wk-pad`} className="font-mono text-[10px] text-blue-500 font-bold py-2">
                          W{weekNum}
                        </div>
                      );
                    }
                    cells.push(<div key={`empty-${i}`} className="p-2"></div>);
                  }

                  for (let d = 1; d <= daysInMonth; d++) {
                    const cellDate = new Date(selectedYear, selectedMonth, d);
                    const dayOfWeek = cellDate.getDay();

                    if (dayOfWeek === 0 && cells.length % 8 === 0) {
                      weekNum++;
                      cells.push(
                        <div key={`wk-${d}`} className="font-mono text-[10px] text-blue-500 font-bold py-2">
                          W{weekNum}
                        </div>
                      );
                    }

                    const pad = (n: number) => n.toString().padStart(2, '0');
                    const isoStr = `${selectedYear}-${pad(selectedMonth + 1)}-${pad(d)}`;
                    const isHoliday = holidays.find((h) => h.date === isoStr);
                    const isToday =
                      new Date().getFullYear() === selectedYear &&
                      new Date().getMonth() === selectedMonth &&
                      new Date().getDate() === d;

                    cells.push(
                      <div
                        key={`day-${d}`}
                        className={`p-2 rounded border border-transparent transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          isToday ? 'bg-blue-600 text-white font-bold rounded-lg' : ''
                        } ${isHoliday ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700' : ''}`}
                        title={isHoliday ? isHoliday.name : undefined}
                      >
                        <span className="block">{d}</span>
                        {isHoliday && (
                          <span className="block text-[8px] truncate max-w-16 font-semibold mt-0.5">
                            {isHoliday.name}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>

            {/* Public Holiday List for Selected Country */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3">
                {selectedYear} Public Holidays & Observances ({selectedCountryCode})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {holidays.map((h, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-semibold block text-slate-900 dark:text-slate-100">{h.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{h.date}</span>
                    </div>
                    <span className="text-[9px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold px-1.5 py-0.5 rounded">
                      {h.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 2: DAYS BETWEEN DATES ---------------- */}
        {subTab === 'between' && (
          <div className="mt-4 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Calculator className="w-4 h-4 text-blue-600" /> Date Difference & Workday Calculator
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="exHolidays"
                    checked={betweenExcludeHolidays}
                    onChange={(e) => setBetweenExcludeHolidays(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="exHolidays" className="text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                    Exclude Public Holidays ({selectedCountryCode})
                  </label>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Total Calendar Days</span>
                <span className="block text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2 font-mono">
                  {betweenResult.totalDays} Days
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  ({betweenResult.years} years, {betweenResult.months} months, {betweenResult.days} days)
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Net Business / Work Days</span>
                <span className="block text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2 font-mono">
                  {betweenResult.businessDays} Work Days
                </span>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  (Excluding {betweenResult.weekendDaysCount} weekend days & {betweenResult.holidaysCount} holidays)
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Equivalent Duration</span>
                <span className="block text-lg font-bold text-slate-800 dark:text-slate-200 mt-2 font-mono">
                  {betweenResult.totalWeeks} Weeks
                </span>
                <span className="text-xs font-mono text-slate-500 block mt-1">
                  or {betweenResult.totalHours.toLocaleString()} Hours / {betweenResult.totalMinutes.toLocaleString()} Minutes
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 3: ADD/SUBTRACT DURATION ---------------- */}
        {subTab === 'addsub' && (
          <div className="mt-4 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                <Plus className="w-4 h-4 text-blue-600" /> Add or Subtract Duration to Target Date
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Base Date
                  </label>
                  <input
                    type="date"
                    value={baseDateStr}
                    onChange={(e) => setBaseDateStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Action
                  </label>
                  <select
                    value={addDirection}
                    onChange={(e) => setAddDirection(e.target.value as 'add' | 'subtract')}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="add">+ Add</option>
                    <option value="subtract">- Subtract</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={addAmount}
                    onChange={(e) => setAddAmount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Unit
                  </label>
                  <select
                    value={addUnit}
                    onChange={(e) => setAddUnit(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="days">Days</option>
                    <option value="businessDays">Business Work Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Target Output */}
            <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md text-center">
              <span className="text-xs uppercase tracking-wider font-bold opacity-80">Calculated Resulting Date</span>
              <span className="block text-3xl font-extrabold mt-2 font-mono">
                {calculatedTargetDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 4: CUSTOM COUNTDOWN ---------------- */}
        {subTab === 'countdown' && (
          <div className="mt-4 space-y-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-blue-600" /> Shareable Custom Countdown Generator
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Countdown Title
                  </label>
                  <input
                    type="text"
                    value={cdTitle}
                    onChange={(e) => setCdTitle(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Target Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={cdTargetStr}
                    onChange={(e) => setCdTargetStr(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>

            {/* Countdown Preview Ticker */}
            <div className="bg-slate-950 text-white p-8 rounded-xl border border-slate-800 text-center">
              <span className="text-xs uppercase tracking-widest text-blue-400 font-mono font-bold block mb-2">{cdTitle}</span>
              <div className="flex justify-center items-center gap-4 text-3xl sm:text-5xl font-extrabold font-mono text-white">
                <div className="bg-slate-900 px-4 py-3 rounded-lg border border-slate-800">
                  <span>142</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">DAYS</span>
                </div>
                <span>:</span>
                <div className="bg-slate-900 px-4 py-3 rounded-lg border border-slate-800">
                  <span>18</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">HOURS</span>
                </div>
                <span>:</span>
                <div className="bg-slate-900 px-4 py-3 rounded-lg border border-slate-800">
                  <span>42</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">MINS</span>
                </div>
                <span>:</span>
                <div className="bg-slate-900 px-4 py-3 rounded-lg border border-slate-800 text-blue-400">
                  <span>09</span>
                  <span className="block text-[10px] text-slate-400 font-sans font-normal mt-1">SECS</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
