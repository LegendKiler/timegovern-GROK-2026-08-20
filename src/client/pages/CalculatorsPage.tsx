import React from 'react';
import { Calculator, Calendar, Clock, DollarSign } from 'lucide-react';
import { DateCalculatorWidget } from '../components/DateCalculatorWidget';

export const CalculatorsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102a43] font-display flex items-center gap-2">
            <Calculator className="w-6 h-6 text-[#0056b3]" />
            <span>Time, Date & Duration Calculators</span>
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Exact business day calculations, work hour addition, timezone flight time, and duration matrices.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DateCalculatorWidget />

        {/* Business Days Calculator Card */}
        <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-base text-[#102a43]">Business Day Calculator</h3>
          </div>

          <div className="text-xs text-[#627d98] space-y-3">
            <p>Compute working days excluding weekends (Saturday/Sunday) and recognized international public holidays.</p>
            <div className="bg-[#f8fafc] border border-slate-200 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between font-bold text-[#102a43]">
                <span>Standard Working Days / Year (2026):</span>
                <span className="font-mono text-[#0056b3]">261 Days</span>
              </div>
              <div className="flex justify-between text-[11px] text-[#627d98]">
                <span>Total Weekend Days:</span>
                <span className="font-mono">104 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
