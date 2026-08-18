import React, { useState } from 'react';
import { Calendar, Download, Printer, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { DateCalculatorWidget } from '../components/DateCalculatorWidget';

export const CalendarPage: React.FC = () => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate calendar grid for selected month and year
  const getDaysInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return { firstDay, totalDays };
  };

  const { firstDay, totalDays } = getDaysInMonth(currentYear, currentMonth);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102a43] font-display flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#0056b3]" />
            <span>Calendars & Holidays — {currentYear}</span>
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Printable monthly & yearly calendars, religious observances, and leap year calculators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f0f4f8] hover:bg-[#e2e8f0] text-[#102a43] border border-[#d9e2ec] rounded-lg text-xs font-bold transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#0056b3]" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Month Calendar View */}
        <div className="lg:col-span-2 bg-white border border-[#d9e2ec] rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#f0f4f8]">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-[#0f2942] font-display">
                {months[currentMonth]} {currentYear}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear(y => y - 1);
                  } else {
                    setCurrentMonth(m => m - 1);
                  }
                }}
                className="p-1.5 hover:bg-slate-100 rounded-md border border-[#d9e2ec] text-slate-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear(y => y + 1);
                  } else {
                    setCurrentMonth(m => m + 1);
                  }
                }}
                className="p-1.5 hover:bg-slate-100 rounded-md border border-[#d9e2ec] text-slate-700 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid Table */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono">
            {daysOfWeek.map((day) => (
              <div key={day} className="py-2 text-xs font-bold text-[#627d98] bg-[#f8fafc] rounded">
                {day}
              </div>
            ))}

            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="p-3 text-slate-300"></div>
            ))}

            {Array.from({ length: totalDays }, (_, i) => {
              const dayNum = i + 1;
              const isToday = dayNum === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
              return (
                <div
                  key={dayNum}
                  className={`p-3 rounded-lg text-sm font-bold transition-colors ${
                    isToday
                      ? 'bg-[#0056b3] text-white shadow-md'
                      : 'hover:bg-blue-50 text-[#102a43] border border-slate-100'
                  }`}
                >
                  {dayNum}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Widget */}
        <div className="space-y-6">
          <DateCalculatorWidget />
        </div>
      </div>
    </div>
  );
};
