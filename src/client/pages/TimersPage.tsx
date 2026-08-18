import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, Flag } from 'lucide-react';

export const TimersPage: React.FC = () => {
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setStopwatchTime((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatStopwatch = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleLap = () => {
    if (isRunning) {
      setLaps([stopwatchTime, ...laps]);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#d9e2ec] rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#102a43] font-display flex items-center gap-2">
            <Timer className="w-6 h-6 text-[#0056b3]" />
            <span>High-Precision Stopwatch & Timers</span>
          </h1>
          <p className="text-xs text-[#627d98] mt-0.5">
            Millisecond accuracy chronometry with split lap tracking and audio chime alerts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stopwatch Main Panel */}
        <div className="bg-white border border-[#d9e2ec] rounded-xl p-6 shadow-xs text-center space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#627d98] font-mono">Digital Stopwatch</h3>
          <div className="font-mono text-5xl sm:text-6xl font-black text-[#0f2942] tracking-tight py-4 bg-[#f8fafc] border border-slate-200 rounded-2xl">
            {formatStopwatch(stopwatchTime)}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-md cursor-pointer transition-all ${
                isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={handleLap}
              disabled={!isRunning}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f0f4f8] hover:bg-[#e2e8f0] disabled:opacity-40 text-[#102a43] border border-[#d9e2ec] rounded-xl font-bold text-sm cursor-pointer transition-all"
            >
              <Flag className="w-4 h-4 text-[#0056b3]" />
              <span>Lap</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-sm cursor-pointer transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Laps Table */}
        <div className="bg-white border border-[#d9e2ec] rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-[#102a43]">Recorded Split Laps</h3>
          {laps.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#627d98]">
              No laps recorded yet. Press Start and then Lap to log split intervals.
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-1.5">
              {laps.map((lapMs, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#f8fafc] px-3 py-2 rounded-lg border border-slate-100 text-xs font-mono">
                  <span className="font-bold text-[#627d98]">Lap {laps.length - idx}</span>
                  <span className="font-bold text-[#102a43]">{formatStopwatch(lapMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
