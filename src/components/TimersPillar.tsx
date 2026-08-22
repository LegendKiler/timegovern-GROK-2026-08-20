import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Timer as TimerIcon, AlarmClock, Play, Pause, RotateCcw, Plus, Trash2, Volume2, Bell, Flag } from 'lucide-react';
import { AlarmItem, LapItem, TimerItem } from '../types';
import { audioSynth } from '../lib/audioSynth';

/** Format ms as HH:MM:SS.cs */
function formatSw(ms: number) {
  const cs = Math.floor((ms % 1000) / 10);
  const totalSec = Math.floor(ms / 1000);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function formatSec(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

export const TimersPillar: React.FC = () => {
  const [subTab, setSubTab] = useState<'alarm' | 'stopwatch' | 'timer'>('alarm');

  const [alarms, setAlarms] = useState<AlarmItem[]>([
    { id: '1', timeStr: '07:00', label: 'Morning Wake Up', enabled: true, repeatDays: [1, 2, 3, 4, 5], soundPreset: 'classic' },
    { id: '2', timeStr: '08:30', label: 'Team Standup', enabled: false, repeatDays: [1, 2, 3, 4, 5], soundPreset: 'chime' },
  ]);
  const [newAlarmTime, setNewAlarmTime] = useState('08:00');
  const [newAlarmLabel, setNewAlarmLabel] = useState('New Alarm');
  const [newAlarmPreset, setNewAlarmPreset] = useState<'classic' | 'digital' | 'chime' | 'marimba'>('classic');

  // Stopwatch — performance.now based (resists setInterval drift)
  const [swDisplayMs, setSwDisplayMs] = useState(0);
  const [swIsRunning, setSwIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapItem[]>([]);
  const swStartMark = useRef<number | null>(null);
  const swAccumulated = useRef(0);

  // Countdown — deadline based (endAt timestamps)
  const [timers, setTimers] = useState<
    (TimerItem & { endAtMs?: number | null })[]
  >([
    { id: 't1', title: 'Pomodoro Focus Session', durationSeconds: 1500, remainingSeconds: 1500, isRunning: false, soundPreset: 'classic', endAtMs: null },
    { id: 't2', title: 'Quick Break', durationSeconds: 300, remainingSeconds: 300, isRunning: false, soundPreset: 'chime', endAtMs: null },
  ]);

  // Stopwatch RAF / interval display
  useEffect(() => {
    if (!swIsRunning) return;
    const id = window.setInterval(() => {
      if (swStartMark.current == null) return;
      const elapsed = swAccumulated.current + (performance.now() - swStartMark.current);
      setSwDisplayMs(elapsed);
    }, 16);
    return () => clearInterval(id);
  }, [swIsRunning]);

  // Countdown: recompute remaining from endAt each second
  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || !t.endAtMs) return t;
          const rem = Math.max(0, Math.ceil((t.endAtMs - now) / 1000));
          if (rem <= 0) {
            const preset = (t.soundPreset === 'bell' ? 'classic' : t.soundPreset) as
              | 'classic'
              | 'chime'
              | 'digital'
              | 'marimba';
            try {
              audioSynth.playAlarmSound(preset);
            } catch {
              /* ignore */
            }
            return { ...t, remainingSeconds: 0, isRunning: false, endAtMs: null };
          }
          return { ...t, remainingSeconds: rem };
        })
      );
    }, 250);
    return () => clearInterval(id);
  }, []);

  const handleAddAlarm = () => {
    setAlarms([
      ...alarms,
      {
        id: Date.now().toString(),
        timeStr: newAlarmTime,
        label: newAlarmLabel,
        enabled: true,
        repeatDays: [1, 2, 3, 4, 5],
        soundPreset: newAlarmPreset,
      },
    ]);
  };

  const handleToggleAlarm = (id: string) => {
    setAlarms(alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)));
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(alarms.filter((a) => a.id !== id));
  };

  const startStopwatch = () => {
    swStartMark.current = performance.now();
    setSwIsRunning(true);
  };

  const pauseStopwatch = () => {
    if (swStartMark.current != null) {
      swAccumulated.current += performance.now() - swStartMark.current;
      swStartMark.current = null;
    }
    setSwIsRunning(false);
    setSwDisplayMs(swAccumulated.current);
  };

  const handleResetStopwatch = () => {
    swStartMark.current = null;
    swAccumulated.current = 0;
    setSwIsRunning(false);
    setSwDisplayMs(0);
    setLaps([]);
  };

  const handleLap = () => {
    const ms =
      swStartMark.current != null
        ? swAccumulated.current + (performance.now() - swStartMark.current)
        : swAccumulated.current;
    setLaps((prev) => [
      ...prev,
      { id: Date.now().toString(), totalMs: ms, lapMs: prev.length ? ms - prev[prev.length - 1].totalMs : ms },
    ]);
  };

  const toggleTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.isRunning) {
          // pause: freeze remaining
          const rem = t.endAtMs ? Math.max(0, Math.ceil((t.endAtMs - Date.now()) / 1000)) : t.remainingSeconds;
          return { ...t, isRunning: false, remainingSeconds: rem, endAtMs: null };
        }
        if (t.remainingSeconds <= 0) return t;
        return { ...t, isRunning: true, endAtMs: Date.now() + t.remainingSeconds * 1000 };
      })
    );
  };

  const resetTimer = (id: string) => {
    setTimers((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, isRunning: false, remainingSeconds: t.durationSeconds, endAtMs: null }
          : t
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TimerIcon className="w-5 h-5 text-blue-600" />
              Alarms, Stopwatch & Timers
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Deadline-based countdowns and high-resolution stopwatch — runs in your browser (optional UTC sync later for
              alarms).
            </p>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSubTab('alarm')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                subTab === 'alarm' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Online Alarm Clock
            </button>
            <button
              type="button"
              onClick={() => setSubTab('stopwatch')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                subTab === 'stopwatch' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Stopwatch
            </button>
            <button
              type="button"
              onClick={() => setSubTab('timer')}
              className={`px-3 py-1.5 rounded-md cursor-pointer ${
                subTab === 'timer' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Countdown Timer
            </button>
          </div>
        </div>

        {subTab === 'alarm' && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Time</label>
                <input
                  type="time"
                  value={newAlarmTime}
                  onChange={(e) => setNewAlarmTime(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Label</label>
                <input
                  value={newAlarmLabel}
                  onChange={(e) => setNewAlarmLabel(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500">Sound</label>
                <select
                  value={newAlarmPreset}
                  onChange={(e) => setNewAlarmPreset(e.target.value as typeof newAlarmPreset)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-1.5 text-xs"
                >
                  <option value="classic">Classic</option>
                  <option value="digital">Digital</option>
                  <option value="chime">Chime</option>
                  <option value="marimba">Marimba</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={handleAddAlarm}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded text-xs flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add alarm
                </button>
              </div>
            </div>

            <ul className="space-y-2">
              {alarms.map((a) => (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center gap-3">
                    <AlarmClock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-mono font-bold text-lg">{a.timeStr}</p>
                      <p className="text-xs text-slate-500">{a.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          audioSynth.playAlarmSound(a.soundPreset as 'classic' | 'chime' | 'digital' | 'marimba');
                        } catch {
                          /* */
                        }
                      }}
                      className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-xs flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" /> Test
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleAlarm(a.id)}
                      className={`px-2 py-1 rounded text-xs font-bold ${a.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {a.enabled ? 'On' : 'Off'}
                    </button>
                    <button type="button" onClick={() => handleDeleteAlarm(a.id)} className="p-1.5 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-400">
              Alarms fire while this tab is open. For closed-tab alerts, browser notifications + optional Worker are a later
              phase.
            </p>
          </div>
        )}

        {subTab === 'stopwatch' && (
          <div className="mt-6 text-center space-y-4">
            <div className="font-mono text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
              {formatSw(swDisplayMs)}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {!swIsRunning ? (
                <button
                  type="button"
                  onClick={startStopwatch}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"
                >
                  <Play className="w-4 h-4" /> Start
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={pauseStopwatch}
                    className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-amber-600 hover:bg-amber-500 flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" /> Pause
                  </button>
                  <button
                    type="button"
                    onClick={handleLap}
                    className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" /> Lap
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={handleResetStopwatch}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
            {laps.length > 0 && (
              <ul className="max-w-md mx-auto text-left text-xs space-y-1 border-t border-slate-200 dark:border-slate-800 pt-3">
                {laps.map((lap, i) => (
                  <li key={lap.id} className="flex justify-between font-mono">
                    <span>Lap {i + 1}</span>
                    <span>{formatSw(lap.lapMs)}</span>
                    <span className="text-slate-400">{formatSw(lap.totalMs)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {subTab === 'timer' && (
          <div className="mt-4 space-y-3">
            {timers.map((timer) => (
              <div
                key={timer.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{timer.title}</p>
                  <p className="font-mono text-2xl font-black">{formatSec(timer.remainingSeconds)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleTimer(timer.id)}
                    className={`px-4 py-1.5 rounded text-xs font-bold text-white flex items-center gap-1 ${
                      timer.isRunning ? 'bg-amber-600' : 'bg-emerald-600'
                    }`}
                  >
                    {timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    {timer.isRunning ? 'Pause' : 'Start'}
                  </button>
                  <button
                    type="button"
                    onClick={() => resetTimer(timer.id)}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
