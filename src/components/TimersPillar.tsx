import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon, AlarmClock, Play, Pause, RotateCcw, Plus, Trash2, Volume2, Bell, Check, Flag } from 'lucide-react';
import { AlarmItem, LapItem, TimerItem } from '../types';
import { audioSynth } from '../lib/audioSynth';

export const TimersPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'alarm' | 'stopwatch' | 'timer'>('alarm');

  // Alarm Clock State
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: '1', timeStr: '07:00', label: 'Morning Wake Up', enabled: true, repeatDays: [1, 2, 3, 4, 5], soundPreset: 'classic' },
    { id: '2', timeStr: '08:30', label: 'Team Standup', enabled: false, repeatDays: [1, 2, 3, 4, 5], soundPreset: 'chime' }
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('New Alarm');
  const [newAlarmPreset, setNewAlarmPreset] = useState<'classic' | 'digital' | 'chime' | 'marimba'>('classic');

  // Stopwatch State
  const [swTimeMs, setSwTimeMs] = useState<number>(0);
  const [swIsRunning, setSwIsRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<LapItem[]>([]);

  // Countdown Timer State
  const [timers, setTimers] = useState<TimerItem[]>([
    { id: 't1', title: 'Pomodoro Focus Session', durationSeconds: 1500, remainingSeconds: 1500, isRunning: false, soundPreset: 'classic' },
    { id: 't2', title: 'Quick Break', durationSeconds: 300, remainingSeconds: 300, isRunning: false, soundPreset: 'chime' }
  ]);

  // Stopwatch Effect
  useEffect(() => {
    let interval: any = null;
    if (swIsRunning) {
      interval = setInterval(() => {
        setSwTimeMs((prev) => prev + 10);
      }, 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [swIsRunning]);

  // Countdown Timers Effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prevTimers) =>
        prevTimers.map((t) => {
          if (!t.isRunning) return t;
          if (t.remainingSeconds <= 1) {
            audioSynth.playAlarmSound(t.soundPreset);
            return { ...t, remainingSeconds: 0, isRunning: false };
          }
          return { ...t, remainingSeconds: t.remainingSeconds - 1 };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleAddAlarm = () => {
    const item: AlarmItem = {
      id: Date.now().toString(),
      timeStr: newAlarmTime,
      label: newAlarmLabel,
      enabled: true,
      repeatDays: [1, 2, 3, 4, 5],
      soundPreset: newAlarmPreset
    };
    setAlarms([...alarms, item]);
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(
      alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  // Stopwatch Laps
  const handleLap = () => {
    const lapNumber = laps.length + 1;
    const prevTotalMs = laps.length > 0 ? laps[laps.length - 1].totalTimeMs : 0;
    const lapTimeMs = swTimeMs - prevTotalMs;

    setLaps([
      ...laps,
      {
        lapNumber,
        lapTimeMs,
        totalTimeMs: swTimeMs,
        diffFromPrevMs: laps.length > 0 ? lapTimeMs - laps[laps.length - 1].lapTimeMs : 0
      }
    ]);
  };

  const handleResetStopwatch = () => {
    setSwIsRunning(false);
    setSwTimeMs(0);
    setLaps([]);
  };

  const formatMs = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TimerIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              5. Precision Alarms, Stopwatch & Timers
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Online alarm clock with audio synthesis, millisecond stopwatch & multi-timer support.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setSubTab('alarm')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'alarm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Online Alarm Clock
            </button>
            <button
              onClick={() => setSubTab('stopwatch')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'stopwatch' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Stopwatch
            </button>
            <button
              onClick={() => setSubTab('timer')}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                subTab === 'timer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Countdown Timers
            </button>
          </div>
        </div>

        {/* ---------------- SUB TAB 1: ONLINE ALARM CLOCK ---------------- */}
        {subTab === 'alarm' && (
          <div className="mt-4 space-y-6">
            {/* Create Alarm Form */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <Plus className="w-4 h-4 text-blue-600" /> Add New Custom Alarm
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Alarm Time
                  </label>
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Alarm Label
                  </label>
                  <input
                    type="text"
                    value={newAlarmLabel}
                    onChange={(e) => setNewAlarmLabel(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Sound Preset
                  </label>
                  <select
                    value={newAlarmPreset}
                    onChange={(e) => setNewAlarmPreset(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="classic">Classic Beep</option>
                    <option value="chime">Gentle Chime</option>
                    <option value="digital">Digital Pulse</option>
                    <option value="marimba">Marimba Bell</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={handleAddAlarm}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded text-xs transition-colors cursor-pointer"
                  >
                    Set Alarm
                  </button>
                </div>
              </div>
            </div>

            {/* Active Alarms List */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Active & Scheduled Alarms
              </h3>

              {alarms.map((a) => (
                <div
                  key={a.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleAlarm(a.id)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                        a.enabled ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          a.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      ></div>
                    </button>

                    <div>
                      <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white block">
                        {a.timeStr}
                      </span>
                      <span className="text-xs text-slate-500 block">{a.label} ({a.soundPreset} sound)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => audioSynth.playAlarmSound(a.soundPreset)}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs flex items-center gap-1 cursor-pointer"
                      title="Test Audio Sound"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Test
                    </button>
                    <button
                      onClick={() => handleDeleteAlarm(a.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- SUB TAB 2: STOPWATCH ---------------- */}
        {subTab === 'stopwatch' && (
          <div className="mt-4 space-y-6">
            <div className="bg-slate-950 p-8 rounded-xl border border-slate-800 text-center">
              <span className="text-5xl sm:text-7xl font-extrabold font-mono text-blue-400 block mb-6">
                {formatMs(swTimeMs)}
              </span>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setSwIsRunning(!swIsRunning)}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 cursor-pointer shadow-md ${
                    swIsRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {swIsRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {swIsRunning ? 'Pause' : 'Start'}
                </button>

                {swIsRunning && (
                  <button
                    onClick={handleLap}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm text-white flex items-center gap-2 cursor-pointer"
                  >
                    <Flag className="w-4 h-4" /> Record Lap
                  </button>
                )}

                <button
                  onClick={handleResetStopwatch}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>
            </div>

            {/* Lap Table */}
            {laps.length > 0 && (
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Lap #</th>
                      <th className="p-3">Lap Split Time</th>
                      <th className="p-3">Total Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 font-mono">
                    {laps.map((lap) => (
                      <tr key={lap.lapNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-white">Lap {lap.lapNumber}</td>
                        <td className="p-3 text-blue-600 dark:text-blue-400 font-bold">{formatMs(lap.lapTimeMs)}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{formatMs(lap.totalTimeMs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ---------------- SUB TAB 3: COUNTDOWN TIMERS ---------------- */}
        {subTab === 'timer' && (
          <div className="mt-4 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {timers.map((timer) => {
                const progressPct = Math.round((timer.remainingSeconds / timer.durationSeconds) * 100);

                return (
                  <div key={timer.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl text-center space-y-4">
                    <span className="font-bold text-slate-900 dark:text-white text-sm block">{timer.title}</span>

                    <span className="text-4xl font-extrabold font-mono text-blue-600 dark:text-blue-400 block">
                      {formatSeconds(timer.remainingSeconds)}
                    </span>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => {
                          setTimers(
                            timers.map((t) => (t.id === timer.id ? { ...t, isRunning: !t.isRunning } : t))
                          );
                        }}
                        className={`px-4 py-1.5 rounded text-xs font-bold text-white flex items-center gap-1 cursor-pointer ${
                          timer.isRunning ? 'bg-amber-600' : 'bg-emerald-600'
                        }`}
                      >
                        {timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        {timer.isRunning ? 'Pause' : 'Start'}
                      </button>

                      <button
                        onClick={() => {
                          setTimers(
                            timers.map((t) =>
                              t.id === timer.id ? { ...t, remainingSeconds: t.durationSeconds, isRunning: false } : t
                            )
                          );
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Reset
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
