import React, { useState } from 'react';
import { Calculator, Calendar, ArrowRight } from 'lucide-react';

export const DateCalculatorWidget: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('2026-01-01');
  const [endDate, setEndDate] = useState<string>('2026-12-31');

  const calculateDifference = () => {
    const d1 = new Date(startDate);
    const d2 = new Date(endDate);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;
    return { diffDays, weeks, remainingDays };
  };

  const { diffDays, weeks, remainingDays } = calculateDifference();

  return (
    <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0056b3] flex items-center justify-center">
          <Calculator className="w-4 h-4" />
        </div>
        <h3 className="font-display font-bold text-base text-[#102a43]">Date Duration Calculator</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-[11px] font-bold text-[#627d98] block mb-1">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#d9e2ec] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#102a43] focus:border-[#0056b3] focus:outline-hidden"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold text-[#627d98] block mb-1">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-[#f8fafc] border border-[#d9e2ec] rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-[#102a43] focus:border-[#0056b3] focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-[#f0f4f8] border border-[#d9e2ec] rounded-lg p-3 text-center">
        <div className="text-xs text-[#627d98] font-medium">Result Duration</div>
        <div className="font-mono text-2xl font-black text-[#0f2942] my-0.5">
          {diffDays} Days
        </div>
        <div className="text-[11px] text-[#0056b3] font-semibold">
          Equal to {weeks} weeks and {remainingDays} days
        </div>
      </div>
    </div>
  );
};
